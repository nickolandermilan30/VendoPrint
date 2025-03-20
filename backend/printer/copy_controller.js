
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';


import { printFileWithSumatra } from './printer_controller.js'; 


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const scanWithWIA = (outputPath) => {
  return new Promise((resolve, reject) => {
    const powershellScript = `
      $deviceManager = New-Object -ComObject WIA.DeviceManager
      $device = $deviceManager.DeviceInfos | Where-Object { $_.Type -eq 1 } | ForEach-Object { $_.Connect() }

      if ($device -ne $null) {
        $item = $device.Items[1]
        $image = $item.Transfer("{B96B3CAB-0728-11D3-9D7B-0000F81EF32E}")
        $image.SaveFile("${outputPath}")
      } else {
        Write-Error "No WIA scanner device found."
        exit 1
      }
    `;
    const command = `powershell.exe -NoProfile -Command "${powershellScript}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error scanning file:', stderr);
        return reject(new Error('Failed to scan file. Ensure scanner is powered on and WIA-compatible.'));
      }
      resolve(stdout);
    });
  });
};


export const copyHandler = async (req, res) => {
  try {
   
    const { printerName } = req.body;
    if (!printerName) {
      return res.status(400).json({ status: 'error', message: 'Missing printerName in request body.' });
    }
  
    
    const scansDir = path.join(__dirname, 'scans');
    if (!fs.existsSync(scansDir)) {
      fs.mkdirSync(scansDir, { recursive: true });
    }

    const fileName = `${uuidv4()}.bmp`
    const outputPath = path.join(scansDir, fileName);

    await scanWithWIA(outputPath);

 
    await printFileWithSumatra(outputPath, printerName);


    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    return res.json({
      status: 'success',
      message: 'Copy operation completed (scan + print).',
    });
  } catch (error) {
    console.error('Error during copy operation:', error);
    return res.status(500).json({ status: 'error', error: error.message });
  }
};
