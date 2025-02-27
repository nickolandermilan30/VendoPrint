import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPrint } from "react-icons/fa";

import CustomPage from "../components/bluetooth/customized_page";
import DocumentPreview from "../components/bluetooth/document_preview";
import SmartPriceToggle from "../components/bluetooth/smart_price";
import PrinterList from "../components/bluetooth/printerList";
import PageOrientation from "../components/bluetooth/page_orientation";
import SelectColor from "../components/bluetooth/select_color";
import PageSize from "../components/bluetooth/page_size";
import Copies from "../components/bluetooth/copies";

import { realtimeDb, storage } from "../../../backend/firebase/firebase-config";
import { getDatabase, ref as dbRef, push,get, update } from "firebase/database";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { PDFDocument } from "pdf-lib";
import mammoth from "mammoth";

import { getPageIndicesToPrint } from "../utils/pageRanges";

const BTUpload = () => {
  const navigate = useNavigate();

  // ----------------------------
  // 1) Bluetooth states
  // ----------------------------
  const [isBluetoothSupported, setIsBluetoothSupported] = useState(true);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [bluetoothDevice, setBluetoothDevice] = useState(null);
  

  // ----------------------------
  // 2) File states
  // ----------------------------
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [fileToUpload, setFileToUpload] = useState(null);

  // ----------------------------
  // 3) Print settings states
  // ----------------------------
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [copies, setCopies] = useState(1);
  const [selectedSize, setSelectedSize] = useState("Letter 8.5 x 11");
  const [isColor, setIsColor] = useState(false);
  const [orientation, setOrientation] = useState("Portrait");
  const [selectedPageOption, setSelectedPageOption] = useState("All");
  const [customPageRange, setCustomPageRange] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [isSmartPriceEnabled, setIsSmartPriceEnabled] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);


  let [availableCoins, setAvailableCoins] = useState(0);
  
  
    useEffect(() => {
      const fetchAvailableCoins = async () => {
        const coinRef = dbRef(realtimeDb, "coinCount");
        try {
          const snapshot = await get(coinRef);
          if (snapshot.exists()) {
            setAvailableCoins(snapshot.val());
          } else {
            console.error("Error retrieving available coins.");
          }
        } catch (error) {
          console.error("Error fetching available coins:", error);
        }
      };
    
      fetchAvailableCoins();
    }, []);

  // ----------------------------
  // Check if Bluetooth is supported by the browser
  // ----------------------------
  useEffect(() => {
    if (!("bluetooth" in navigator)) {
      setIsBluetoothSupported(false);
    }
  }, []);

  // ----------------------------
  // 4) Bluetooth connect logic
  // ----------------------------
  const handleBluetoothConnect = async () => {
    if (!isBluetoothSupported) return;
  
    try {
      console.log("Requesting Bluetooth device...");
  
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true, // Allows any Bluetooth device
        optionalServices: ["battery_service"], // Optional service
      });
  
      console.log(`Found device: ${device.name}`);
  
      // Connect to GATT Server
      const server = await device.gatt.connect();
      console.log("Connected to GATT Server!");
  
      // Save connection state
      setBluetoothDevice(device);
      setIsBluetoothConnected(true);
  
      alert(`Connected to Bluetooth device: ${device.name}`);
    } catch (error) {
      console.error("Bluetooth connection failed:", error);
      alert("Failed to connect to Bluetooth device. Please try again.");
    }
  };

  // ----------------------------
  // 5) File Upload Handling
  // ----------------------------
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert("No file selected!");
      return;
    }
    setFileToUpload(file);


    if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const pdfData = new Uint8Array(e.target.result);
        const pdfDoc = await PDFDocument.load(pdfData);
        const totalPageCount = pdfDoc.getPageCount();
        setTotalPages(totalPageCount);
      };
      reader.readAsArrayBuffer(file);
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        try {
          const result = await mammoth.extractRawText({ arrayBuffer });
          const textLength = result.value.length;

          const estimatedPages = Math.ceil(textLength / 1000);
          setTotalPages(estimatedPages);
        } catch (error) {
          console.error("Error reading docx file:", error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {

      setTotalPages(1);
    }

    // Actually upload to Firebase
    uploadFileToFirebase(file);
  };

  const uploadFileToFirebase = async (file) => {
    if (!file) {
      alert("No file selected for upload!");
      return;
    }
    const storageRef = ref(storage, `uploads/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        console.log(
          `Upload progress: ${
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          }%`
        );
      },
      (error) => {
        console.error("Upload failed", error);
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setFilePreviewUrl(url);
          console.log("File available at:", url);
          alert("File uploaded successfully!");
        } catch (error) {
          console.error("Error getting download URL:", error);
        }
      }
    );
  };

  // ----------------------------
  // 6) Print Handler
  // ----------------------------
  const handlePrint = async () => {
    setIsLoading(true);
    if (!filePreviewUrl) {
      alert("No file uploaded! Please upload a file before printing.");
      return;
    }
    if (!selectedPrinter) {
      alert("No printer selected! Please choose a printer first.");
      return;
    }

      // Fetch current available coins from Firebase
    const coinRef = dbRef(realtimeDb, "coinCount");
    try {
      const snapshot = await get(coinRef);
      if (snapshot.exists()) {
        setAvailableCoins = snapshot.val();
      } else {
        alert("Error retrieving available coins.");
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error fetching available coins:", error);
      alert("Error fetching available coins.");
      setIsLoading(false);
      return;
    }
  
    // Check if availableCoins is enough to print
    if (availableCoins < calculatedPrice) {
      alert("Not enough coins to proceed with printing.");
      setIsLoading(false);
      return;
    }
  
    let finalFileUrlToPrint = filePreviewUrl;

    try {
      if (fileToUpload?.type === "application/pdf") {
        const existingPdfBytes = await fetch(filePreviewUrl).then((res) =>
          res.arrayBuffer()
        );
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
  
        const indicesToKeep = getPageIndicesToPrint({
          totalPages,
          selectedPageOption,
          customPageRange,
        });
  
        if (indicesToKeep.length === 0) {
          alert("No pages selected based on your page option!");
          return;
        }
  
        const newPdfDoc = await PDFDocument.create();
        const copiedPages = await newPdfDoc.copyPages(pdfDoc, indicesToKeep);
  
        copiedPages.forEach((page) => {
          if (orientation === "Landscape") {
            page.setRotation(degrees(90)); // Rotate page if landscape
          }
          newPdfDoc.addPage(page);
        });
  
        const newPdfBytes = await newPdfDoc.save();
        const newPdfBlob = new Blob([newPdfBytes], { type: "application/pdf" });
  
        const timeStamp = Date.now();
        const newPdfName = `processed-${timeStamp}.pdf`;
        const storageRef2 = ref(storage, `uploads/${newPdfName}`);
  
        await uploadBytesResumable(storageRef2, newPdfBlob);
        const newUrl = await getDownloadURL(storageRef2);
        finalFileUrlToPrint = newUrl;
      } 
  
      else if (
        fileToUpload?.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const arrayBuffer = await fetch(filePreviewUrl).then((res) =>
          res.arrayBuffer()
        );
        const pdfDoc = await PDFDocument.create();
        const extractedText = await mammoth.extractRawText({ arrayBuffer });
  
        const page = pdfDoc.addPage([612, 792]); // Default Letter size
        const { width, height } = page.getSize();
  
        if (orientation === "Landscape") {
          page.setRotation(degrees(90));
        }
  
        page.drawText(extractedText.value, {
          x: 50,
          y: height - 50,
          size: 12,
        });

 
        const newPdfBytes = await newPdfDoc.save();

        const newPdfBlob = new Blob([newPdfBytes], { type: "application/pdf" });


        const timeStamp = Date.now();
        const newPdfName = `partial-pages-${timeStamp}.pdf`;
        const storageRef2 = ref(storage, `uploads/${newPdfName}`);

        await uploadBytesResumable(storageRef2, newPdfBlob);

        const newUrl = await getDownloadURL(storageRef2);
        finalFileUrlToPrint = newUrl
      } 

      else {
      
        if (selectedPageOption !== "All") {
          alert("Partial page selection is only supported for PDF right now.");
        }
      }

 
      const printJobsRef = dbRef(realtimeDb, "files");
      await push(printJobsRef, {
        fileName: fileToUpload?.name,
        fileUrl: finalFileUrlToPrint, 
        printerName: selectedPrinter,
        copies: copies,
        paperSize: selectedSize,
        isColor: isColor,
        orientation: orientation,
        pageOption: selectedPageOption,
        customPageRange: customPageRange,
        totalPages: totalPages,
        finalPrice:  calculatedPrice,
        timestamp: new Date().toISOString(),
        status: status
      });

      const updatedCoins = availableCoins - calculatedPrice;
      await update(coinRef, { availableCoins: updatedCoins });
      alert("Print job sent successfully. Coins deducted.");

      try {
        const response = await axios.post("http://localhost:5000/api/print", {
          printerName: selectedPrinter,
          fileUrl: finalFileUrlToPrint,
          copies: copies,
        });

        if (response.data.success) {
          alert("Print job sent to the printer!");
        } else {
          alert("Failed to send print job to the printer.");
        }
      } catch (err) {
        console.error("Print job error:", err);
      }

    } catch (error) {
      console.error("Error preparing the print job:", error);
      alert("Failed to prepare print job. Please try again.");
    } finally{
      setIsLoading(false);
    }
  };

  // ----------------------------
  // 7) Conditional Rendering
  // ----------------------------
  // If Bluetooth not supported
  if (!isBluetoothSupported) {
    return (
      <div className="p-4">
        <button
          className="w-10 h-10 bg-gray-200 text-[#31304D] flex items-center justify-center rounded-lg border-2 border-[#31304D] mr-4 mb-4"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft className="text-2xl text-[#31304D]" />
        </button>
        <h2 className="text-3xl font-bold text-red-600">
          Bluetooth is not supported on this browser.
        </h2>
      </div>
    );
  }

 
  // If Bluetooth is supported, but not yet connected
  if (!isBluetoothConnected) {
    return (
      <div className="p-4 flex flex-col items-center justify-center">
        <button
          className="w-10 h-10 bg-gray-200 text-[#31304D] flex items-center justify-center rounded-lg border-2 border-[#31304D] mr-4 self-start"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft className="text-2xl text-[#31304D]" />
        </button>
        <div className="mt-10 flex flex-col border px-13 py-13 rounded-2xl items-center">
          <h2 className="text-3xl font-bold text-[#31304D] mb-6">
            Connect a Bluetooth Device
          </h2>
          <button
            onClick={handleBluetoothConnect}
            className="px-6 py-3 bg-gray-600 text-white text-xl font-bold rounded-lg"
          >
            Connect via Bluetooth
          </button>
        </div>
      </div>
    );
  }

  // If connected, show the regular upload + print UI
  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold text-[#31304D] mb-6 text-center lg:text-left">
        Kiosk Vendo Printer (Bluetooth Connected)
      </h1>

      {/* Main Box Container */}
      <div className="flex flex-col w-full h-full bg-gray-200 rounded-lg shadow-md border-4 border-[#31304D] p-6 space-x-4 relative">
        {/* Top Section */}
        <div className="flex w-full space-x-6">
          {/* Left Side */}
          <div className="w-1/2 flex flex-col">
            <div className="flex items-center">
              <button
                className="w-10 h-10 bg-gray-200 text-[#31304D] flex items-center justify-center rounded-lg border-2 border-[#31304D] mr-4"
                onClick={() => navigate(-1)}
              >
                <FaArrowLeft className="text-2xl text-[#31304D]" />
              </button>
              <p className="text-3xl font-bold text-[#31304D]">
                Upload Your Files
              </p>
            </div>

            {/* Printer List */}
            <PrinterList
              selectedPrinter={selectedPrinter}
              setSelectedPrinter={setSelectedPrinter}
            />

            {/* File Upload */}
            <p className="mt-4 text-3xl font-bold text-[#31304D]">Choose File</p>
            <input
              type="file"
              onChange={handleFileSelect}
              className="mt-4 w-full border-2 border-[#31304D] p-2"
            />

            {/* Page Settings */}
            <div className="mt-6 space-y-4">
              <Copies copies={copies} setCopies={setCopies} />
              <PageSize
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
              />
              <CustomPage
                selectedPageOption={selectedPageOption}
                setSelectedPageOption={setSelectedPageOption}
                customPageRange={customPageRange}
                setCustomPageRange={setCustomPageRange}
                totalPages={totalPages}
              />
              <SelectColor isColor={isColor} setIsColor={setIsColor} />
              <PageOrientation
                orientation={orientation}
                setOrientation={setOrientation}
              />


              <p className="mt-6 font-bold text-gray-700 text-2xl">
              Inserted coins: {availableCoins}
              </p>

              <SmartPriceToggle
                paperSize={selectedSize}
                isColor={isColor}
                copies={copies}
                totalPages={totalPages}
                setTotalPages={setTotalPages}
                isSmartPriceEnabled={isSmartPriceEnabled}
                setIsSmartPriceEnabled={setIsSmartPriceEnabled}
                calculatedPrice={calculatedPrice}
                setCalculatedPrice={setCalculatedPrice}
                selectedPageOption={selectedPageOption}
                setSelectedPageOption={setSelectedPageOption}
                customPageRange={customPageRange}
                setCustomPageRange={setCustomPageRange}
              />
            </div>
          </div>

          {/* Right Side - File Preview */}
          <div className="w-full">
            <DocumentPreview
              fileUrl={filePreviewUrl}
              fileName={fileToUpload?.name}
            />
          </div>
        </div>


        <div className="flex flex-col items-center mt-auto pt-6">
          <button
            onClick={handlePrint}
            className="w-40 py-3 bg-[#31304D] text-white text-lg font-bold rounded-lg mt-6 flex items-center justify-center"
          >
            Print <FaPrint className="ml-2 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BTUpload;
