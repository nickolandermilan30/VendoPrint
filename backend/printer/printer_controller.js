import pdfToPrinter from "pdf-to-printer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { exec } from "child_process";


const { getPrinters, print } = pdfToPrinter; 

export const fetchPrinters = async (req, res) => {
  try {
    const printers = await getPrinters();
    res.json({ success: true, printers });
  } catch (error) {
    console.error("Error fetching printers:", error);
    res.status(500).json({ success: false, message: "Failed to fetch printers", error: error.message });
  }
};


const checkPrinterStatus = (printerName) => {
  return new Promise((resolve, reject) => {
    exec(`wmic printer where name="${printerName}" get PrinterStatus`, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error("Failed to retrieve printer status"));
      }
      const status = stdout.trim().split("\n")[1]?.trim();
      resolve(status === "3"); 
    });
  });
};


export const printFile = async (req, res) => {
  const { printerName, fileUrl } = req.body;
  const fileName = `${uuidv4()}.pdf`;
  const documentsDir = path.join(process.cwd(), "documents");
  const filePath = path.join(documentsDir, fileName);

  try {
    
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
    }


    const response = await axios.get(fileUrl, { responseType: "stream" });
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", async () => {
      try {
     
        const printers = await getPrinters();
        const printerNames = printers.map((printer) => printer.name);

        if (!printerNames.includes(printerName)) {
          throw new Error("Printer not found");
        }


        const isOnline = await checkPrinterStatus(printerName);
        if (!isOnline) {
          throw new Error("Printer is offline");
        }

        await print(filePath, { printer: printerName });

        fs.unlinkSync(filePath);

        res.json({ success: true, message: "Print job sent successfully" });
      } catch (error) {
        console.error("Error during print job:", error);
        res.status(500).json({ success: false, message: error.message });
      }
    });

    writer.on("error", (err) => {
      console.error("Error writing file:", err);
      res.status(500).json({ success: false, message: err.message });
    });
  } catch (error) {
    console.error("Error during file download:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// import { exec } from "child_process";
// import path from "path";
// import fs from "fs";
// import { v4 as uuidv4 } from "uuid";
// import axios from "axios";
// import ipp from "ipp"; 

// const SUPPORTED_FORMATS = ["pdf", "docx", "jpg", "jpeg", "png"];

// // Fetch available printers dynamically
// export const fetchPrinters = async (req, res) => {
//   console.log("Fetching available printers...");

//   try {
//     exec("wmic printer get name", (error, stdout, stderr) => {
//       if (error || stderr) {
//         console.error("Error fetching printers:", error || stderr);
//         return res.status(500).json({ success: false, message: "Failed to fetch printers" });
//       }

//       const printers = stdout.split("\n").slice(1).filter(Boolean).map((line) => line.trim());
//       console.log("Printers found:", printers);
//       res.json({ success: true, printers });
//     });
//   } catch (error) {
//     console.error("Error fetching printers:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Convert DOCX to PDF (LibreOffice needed)
// const convertDocxToPdf = async (inputPath, outputPath) => {
//   return new Promise((resolve, reject) => {
//     const command = process.platform === "win32"
//       ? `"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --convert-to pdf "${inputPath}" --outdir "${path.dirname(outputPath)}"`
//       : `libreoffice --headless --convert-to pdf "${inputPath}" --outdir "${path.dirname(outputPath)}"`;

//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         console.error("Error converting DOCX to PDF:", stderr);
//         return reject(new Error("Failed to convert DOCX to PDF"));
//       }
//       resolve(outputPath);
//     });
//   });
// };

// // Print a file using IPP for network compatibility
// export const printFile = async (req, res) => {
//   const { printerUrl, fileUrl } = req.body;
//   const ext = path.extname(fileUrl).toLowerCase().replace(".", "");

//   if (!SUPPORTED_FORMATS.includes(ext)) {
//     return res.status(400).json({ success: false, message: `Unsupported file type: ${ext}` });
//   }

//   const fileName = `${uuidv4()}.${ext}`;
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
//         let printFilePath = filePath;

//         if (ext === "docx") {
//           const pdfPath = filePath.replace(".docx", ".pdf");
//           await convertDocxToPdf(filePath, pdfPath);
//           printFilePath = pdfPath;
//         }

//         const printer = ipp.Printer(printerUrl);
//         const data = fs.readFileSync(printFilePath);

//         const msg = {
//           "operation-attributes-tag": {
//             "requesting-user-name": "User",
//             "job-name": fileName,
//             "document-format": "application/pdf",
//           },
//           data,
//         };

//         printer.execute("Print-Job", msg, (err, response) => {
//           if (err) {
//             console.error("Error printing file:", err);
//             return res.status(500).json({ success: false, message: "Failed to print file", error: err.message });
//           }

//           console.log("Print job sent successfully", response);
//           fs.unlinkSync(printFilePath);
//           res.json({ success: true, message: "Print job sent successfully" });
//         });
//       } catch (error) {
//         console.error("Error during print job:", error);
//         res.status(500).json({ success: false, message: error.message });
//       }
//     });

//     writer.on("error", (err) => {
//       console.error("Error writing file:", err);
//       res.status(500).json({ success: false, message: "File write error", error: err.message });
//     });
//   } catch (error) {
//     console.error("Error during file download:", error);
//     res.status(500).json({ success: false, message: "File download error", error: error.message });
//   }
// };
