// import pdfToPrinter from "pdf-to-printer";
// import path from "path";
// import fs from "fs";
// import { v4 as uuidv4 } from "uuid";
// import { exec } from "child_process";
// import axios from 'axios';

// const { getPrinters, print } = pdfToPrinter; 

// export const fetchPrinters = async (req, res) => {
//   try {
//     const printers = await getPrinters();
//     console.log("Printers returned:", printers);
//     res.json({ success: true, printers });
//   } catch (error) {
//     console.error("Error fetching printers:", error);
//     res.status(500).json({ success: false, message: "Failed to fetch printers", error: error.message });
//   }
// };


// const checkPrinterStatus = (printerName) => {
//   return new Promise((resolve, reject) => {
//     exec(`wmic printer where name="${printerName}" get PrinterStatus`, (error, stdout, stderr) => {
//       if (error) {
//         return reject(new Error("Failed to retrieve printer status"));
//       }
//       const status = stdout.trim().split("\n")[1]?.trim();
//       resolve(status === "3"); 
//     });
//   });
// };


// export const printFile = async (req, res) => {
//   const { printerName, fileUrl } = req.body;
//   const fileName = `${uuidv4()}.pdf`;
//   const documentsDir = path.join(process.cwd(), "documents");
//   const filePath = path.join(documentsDir, fileName);

//   try {
    
//     if (!fs.existsSync(documentsDir)) {
//       fs.mkdirSync(documentsDir, { recursive: true });
//     }


//     const response = await axios.get(fileUrl, { responseType: "stream" });
//     const writer = fs.createWriteStream(filePath);
//     response.data.pipe(writer);

//     writer.on("finish", async () => {
//       try {
     
//         const printers = await getPrinters();
//         const printerNames = printers.map((printer) => printer.name);

//         if (!printerNames.includes(printerName)) {
//           throw new Error("Printer not found");
//         }


//         const isOnline = await checkPrinterStatus(printerName);
//         if (!isOnline) {
//           throw new Error("Printer is offline");
//         }

//         await print(filePath, { printer: printerName });

//         fs.unlinkSync(filePath);

//         res.json({ success: true, message: "Print job sent successfully" });
//       } catch (error) {
//         console.error("Error during print job:", error);
//         res.status(500).json({ success: false, message: error.message });
//       }
//     });

//     writer.on("error", (err) => {
//       console.error("Error writing file:", err);
//       res.status(500).json({ success: false, message: err.message });
//     });
//   } catch (error) {
//     console.error("Error during file download:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


import pdfToPrinter from "pdf-to-printer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { exec } from "child_process";
import axios from "axios";

const { getPrinters, print } = pdfToPrinter; 

// Function para kunin ang listahan ng mga printers
export const fetchPrinters = async (req, res) => {
  try {
    const printers = await getPrinters();
    console.log("Printers returned:", printers);
    res.json({ success: true, printers });
  } catch (error) {
    console.error("Error fetching printers:", error);
    res.status(500).json({ success: false, message: "Failed to fetch printers", error: error.message });
  }
};

// Function para i-check ang printer status gamit ang WMIC
const checkPrinterStatus = (printerName) => {
  return new Promise((resolve, reject) => {
    exec(`wmic printer where name="${printerName}" get PrinterStatus`, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error("Failed to retrieve printer status"));
      }
      // I-filter ang output para tanggalin ang mga blangkong linya
      const lines = stdout.trim().split("\n").filter(line => line.trim() !== "");
      if (lines.length < 2) {
        return resolve(false);
      }
      // Ang ikalawang linya ay inaasahan na may status
      const status = lines[1].trim();
      resolve(status === "3");
    });
  });
};

// Promise wrapper para i-download ang file gamit ang axios stream
const downloadFile = (url, filePath) => {
  return new Promise((resolve, reject) => {
    axios.get(url, { responseType: "stream" })
      .then(response => {
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        writer.on("finish", () => resolve());
        writer.on("error", (err) => reject(err));
      })
      .catch(err => reject(err));
  });
};

// Function para i-download ang file, i-check ang printer, at i-print ang file
export const printFile = async (req, res) => {
  const { printerName, fileUrl } = req.body;
  const fileName = `${uuidv4()}.pdf`;
  const documentsDir = path.join(process.cwd(), "documents");
  const filePath = path.join(documentsDir, fileName);

  try {
    // Siguraduhing mayroong documents directory
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
    }

    // Kunin muna ang mga printer at i-verify kung available ang target printer
    const printers = await getPrinters();
    const printerNames = printers.map(printer => printer.name);
    if (!printerNames.includes(printerName)) {
      return res.status(404).json({ success: false, message: "Printer not found" });
    }

    // I-check ang status ng printer bago mag-download ng file
    const isOnline = await checkPrinterStatus(printerName);
    if (!isOnline) {
      return res.status(400).json({ success: false, message: "Printer is offline" });
    }

    // I-download ang file
    await downloadFile(fileUrl, filePath);

    // I-print ang file
    await print(filePath, { printer: printerName });

    // Tanggalin ang file pagkatapos mag-print
    fs.unlinkSync(filePath);

    res.json({ success: true, message: "Print job sent successfully" });
  } catch (error) {
    console.error("Error during printFile operation:", error);
    // Siguraduhing tatanggalin ang file kung merong error at naka-save na ito
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
