import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path kung saan naka-install ang SumatraPDF (i-adjust kung kinakailangan)
const SUMATRA_PATH = "c:\Users\LENOVO\Downloads\SumatraPDF-3.5.2-64-install.exe";


const getPrintersFromPowerShell = () => {
  return new Promise((resolve, reject) => {
    const command =
      'powershell.exe -NoProfile -Command "Get-Printer | Select-Object -ExpandProperty Name"';
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error getting printers:', error);
        return reject(new Error('Failed to retrieve printers'));
      }
      const printerList = stdout
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      resolve(printerList);
    });
  });
};


export const getPrintersHandler = async (req, res) => {
  try {
    const printerNames = await getPrintersFromPowerShell();

    const printers = printerNames.map((name) => ({ name }));
    res.json({ status: 'success', printers });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
};


 export const printFileWithSumatra = (pdfPath, printerName) => {
  return new Promise((resolve, reject) => {
    let printSettings = isColor ? "" : "-print-settings bw";
    const command = `"${SUMATRA_PATH}" -print-to "${printerName}" ${printSettings} -silent "${pdfPath}"`;    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error printing file:', error);
        return reject(new Error('Failed to print file'));
      }
      resolve(stdout);
    });
  });
};


export const printFileHandler = async (req, res) => {
  try {
    
    const { printerName, fileUrl, isColor } = req.body;
    if (!printerName || !fileUrl) {
      return res.status(400).json({
        status: 'error',
        error: 'Missing printerName or fileUrl in request body.',
      });
    }

    const printers = await getPrintersFromPowerShell();
    if (!printers.includes(printerName)) {
      return res.status(404).json({
        status: 'error',
        error: 'Printer not found',
      });
    }


    const documentsDir = path.join(__dirname, 'documents');
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
    }
    const fileName = `${uuidv4()}.pdf`;
    const filePath = path.join(documentsDir, fileName);

    
    const response = await axios.get(fileUrl, { responseType: 'stream' });
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on('finish', async () => {
      try {
        await printFileWithSumatra(filePath, printerName, isColor);

        fs.unlinkSync(filePath);
        return res.json({
          status: 'success',
          message: 'Print job sent successfully.',
        });
      } catch (error) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return res.status(500).json({ status: 'error', error: error.message });
      }
    });

    writer.on('error', (err) => {
      console.error('Error writing file:', err);
      return res.status(500).json({ status: 'error', error: err.message });
    });
  } catch (error) {
    console.error('Error during print operation:', error);
    return res.status(500).json({ status: 'error', error: error.message });
  }
};
