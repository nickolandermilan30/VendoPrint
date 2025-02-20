import pdfToPrinter from "pdf-to-printer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { exec } from "child_process";
import axios from "axios";


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
