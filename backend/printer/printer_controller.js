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
    exec(
      `powershell "Get-Printer -Name '${printerName}' | Select-Object PrinterStatus"`,
      (error, stdout, stderr) => {
        if (error) {
          return reject(new Error(`Failed to retrieve printer status: ${stderr || error.message}`));
        }

        const status = stdout.trim().split("\n")[1]?.trim();
        if (!status) {
          return reject(new Error("Could not determine printer status"));
        }

        const statusCodes = {
          "3": "Online",
          "4": "Paused",
          "5": "Error",
          "6": "Offline",
          "7": "Not Available",
          "9": "Paper Jam",
          "10": "Paper Out",
          "11": "Manual Feed",
          "12": "Paper Problem",
          "13": "Offline",
          "16": "No Toner",
        };

        const statusMessage = statusCodes[status] || "Unknown Status";
        resolve({ isOnline: status === "3", statusMessage });
      }
    );
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

        // 🔍 Check Printer Status
        const { isOnline, statusMessage } = await checkPrinterStatus(printerName);
        if (!isOnline) {
          throw new Error(`Printer is not available: ${statusMessage}`);
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
