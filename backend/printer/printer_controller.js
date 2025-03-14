import pkg from 'pdf-to-printer';
const { getPrinters: pdfGetPrinters, print: pdfPrint } = pkg;
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import axios from 'axios';
import { fileURLToPath } from 'url';

// Workaround para makuha ang __dirname sa ESM:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Kunin ang listahan ng printers gamit ang pdf-to-printer.
 * (Ipinangalan ko itong getPrintersHandler para iwas name collision.)
 */
export const getPrintersHandler = async (req, res) => {
  try {
    const printers = await pdfGetPrinters();
    res.json({ status: 'success', printers });
  } catch (error) {
    console.error('Error fetching printers:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
};

/**
 * I-check kung online ang printer gamit ang wmic (posibleng magka-issue sa mas bagong Windows).
 */
const checkPrinterStatus = (printerName) => {
  return new Promise((resolve, reject) => {
    exec(
      `wmic printer where name="${printerName}" get PrinterStatus`,
      (error, stdout, stderr) => {
        if (error) {
          return reject(new Error('Failed to retrieve printer status'));
        }
        // Hatiin ang output at i-check kung "3" ang status
        const lines = stdout.trim().split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) {
          // Kapag walang sapat na linya, assume offline
          return resolve(false);
        }
        const status = lines[1].trim();
        resolve(status === '3'); // "3" = online
      }
    );
  });
};

/**
 * I-download ang PDF mula sa fileUrl, i-check ang printer, at i-print.
 * (Ipinangalan ko itong printFileHandler para iwas name collision.)
 */
export const printFileHandler = async (req, res) => {
  try {
    const { printerName, fileUrl } = req.body;
    if (!printerName || !fileUrl) {
      return res.status(400).json({
        status: 'error',
        error: 'Missing printerName or fileUrl in request body.'
      });
    }

    // Path kung saan itatabi ang PDF temporarily
    const documentsDir = path.join(__dirname, 'documents');
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
    }
    const fileName = `${uuidv4()}.pdf`;
    const filePath = path.join(documentsDir, fileName);

    // 1. I-download ang file
    const response = await axios.get(fileUrl, { responseType: 'stream' });
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    // Kapag tapos na ang pag-sulat, saka tayo magpi-print
    writer.on('finish', async () => {
      try {
        // 2. Kunin ang list of printers
        const printers = await pdfGetPrinters();
        const printerNames = printers.map(p => p.name);

        if (!printerNames.includes(printerName)) {
          throw new Error('Printer not found');
        }

        // 3. I-check kung online ang printer
        const isOnline = await checkPrinterStatus(printerName);
        if (!isOnline) {
          throw new Error('Printer is offline');
        }

        // 4. I-print ang PDF
        await pdfPrint(filePath, { printer: printerName });

        // 5. Burahin ang PDF pagkatapos
        fs.unlinkSync(filePath);

        return res.json({ status: 'success', message: 'Print job sent successfully.' });
      } catch (error) {
        console.error('Error during print job:', error);
        // Kung may error, subukang i-delete ang file kung nandoon pa
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return res.status(500).json({ status: 'error', error: error.message });
      }
    });

    // Error handling kung may problema sa pag-sulat ng file
    writer.on('error', (err) => {
      console.error('Error writing file:', err);
      return res.status(500).json({ status: 'error', error: err.message });
    });

  } catch (error) {
    console.error('Error during file download or setup:', error);
    return res.status(500).json({ status: 'error', error: error.message });
  }
};
