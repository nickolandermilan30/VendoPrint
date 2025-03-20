import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import util from 'util';
import { fileURLToPath } from 'url';

const execPromise = util.promisify(exec);

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Retrieves all printer names via PowerShell.
 */
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

/**
 * Prints a file using SumatraPDF.
 */
export const printFileWithSumatra = async (filePath, printerName, isColor) => {
  // Build the command; if isColor is false, add a monochrome flag.
  let command = `"C:\\Program Files\\SumatraPDF\\SumatraPDF.exe" -print-to "${printerName}"`;
  if (isColor === false) {
    command += ' -print-settings "monochrome"';
  }
  // Add the file path
  command += ` "${filePath}"`;

  try {
    const { stdout, stderr } = await execPromise(command);
    if (stderr) {
      throw new Error(stderr);
    }
    return stdout;
  } catch (error) {
    console.error('Error printing file with Sumatra:', error);
    throw error;
  }
};

/**
 * Endpoint: POST /api/print
 * Body: { printerName, fileUrl, isColor }
 */
export const printFileHandler = async (req, res) => {
  let filePath = '';
  try {
    const { printerName, fileUrl, isColor } = req.body;
    if (!printerName || !fileUrl) {
      return res.status(400).json({
        status: 'error',
        error: 'Missing printerName or fileUrl in request body.',
      });
    }

    // 1) Verify the printer
    const printers = await getPrintersFromPowerShell();
    if (!printers.includes(printerName)) {
      return res.status(404).json({
        status: 'error',
        error: 'Printer not found',
      });
    }

    // 2) Prepare local temp folder for storing the downloaded file
    const documentsDir = path.join(__dirname, 'documents');
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
    }
    const fileName = `${uuidv4()}.pdf`;
    filePath = path.join(documentsDir, fileName);

    // 3) Download the file from the given URL
    //    Make sure fileUrl is exactly what getDownloadURL() returned
    const response = await axios.get(fileUrl, { responseType: 'stream' });
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    // 4) Wait until the file is fully written
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // 5) Print the file
    await printFileWithSumatra(filePath, printerName, isColor);

    // 6) Cleanup
    fs.unlinkSync(filePath);

    return res.json({
      status: 'success',
      message: 'Print job sent successfully.',
      success: true, // <--- Return a success flag for your frontend
    });
  } catch (error) {
    // Cleanup if something goes wrong
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.error('Error during print operation:', error);
    return res.status(500).json({ status: 'error', error: error.message });
  }
};
