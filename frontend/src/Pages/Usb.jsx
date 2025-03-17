import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPrint} from "react-icons/fa";
import { ezlogo } from "../assets/Icons";

import CustomPage from "../components/usb/customized_page";
import DocumentPreview from "../components/usb/document_preview";
import SmartPriceToggle from "../components/usb/smart_price";
import PrinterList from "../components/usb/printerList";
import PageOrientation from "../components/usb/page_orientation";
import SelectColor from "../components/usb/select_color";
import PageSize from "../components/usb/page_size";
import Copies from "../components/usb/copies";

import { realtimeDb, storage } from "../../firebase/firebase_config";
import { getDatabase, ref as dbRef, push, get, update } from "firebase/database";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { PDFDocument } from "pdf-lib";
import { degrees } from "pdf-lib";
import mammoth from "mammoth";

import { getPageIndicesToPrint } from "../utils/pageRanges";


const Usb = () => {
  const navigate = useNavigate();

  // File states
 

  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [fileToUpload, setFileToUpload] = useState(null);

  // Print settings states
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
      const coinRef = dbRef(realtimeDb, "coinCount/availableCoins");
      
      // Listen for real-time updates
      const unsubscribe = onValue(coinRef, (snapshot) => {
        if (snapshot.exists()) {
          setAvailableCoins(snapshot.val());
        } else {
          console.error("Error retrieving available coins.");
        }
      }, (error) => {
        console.error("Error fetching available coins:", error);
      });
      
      // Cleanup function to unsubscribe when component unmounts
      return () => unsubscribe();
    }, []);


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
    } 

    else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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

  

  const handlePrint = async () => {
    setIsLoading(true);

    if (!filePreviewUrl) {
        alert("No file uploaded! Please upload a file before printing.");
        setIsLoading(false);
        return;
    }

    if (!selectedPrinter) {
        alert("No printer selected! Please choose a printer first.");
        setIsLoading(false);
        return;
    }

    // Fetch current available coins from Firebase
    const coinRef = dbRef(realtimeDb, "coinCount");
    let currentCoins = 0;

    try {
        const snapshot = await get(coinRef);
        if (snapshot.exists()) {
            currentCoins = snapshot.val().availableCoins;
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

    // Check if user has enough coins
    while (currentCoins < calculatedPrice) {
        const addCoins = prompt(`Not enough coins! You need ${calculatedPrice - currentCoins} more coins. Insert coins:`);
        
        if (addCoins === null || isNaN(addCoins) || Number(addCoins) <= 0) {
            alert("Invalid coin input. Printing cancelled.");
            setIsLoading(false);
            return;
        }

        currentCoins += Number(addCoins);

        // Update Firebase with new coin balance
        await update(coinRef, { availableCoins: currentCoins });

        alert(`You have inserted ${addCoins} coins. Current balance: ${currentCoins}`);
    }

    let finalFileUrlToPrint = filePreviewUrl;

    try {
        if (fileToUpload?.type === "application/pdf") {
            const existingPdfBytes = await fetch(filePreviewUrl).then(res => res.arrayBuffer());
            const pdfDoc = await PDFDocument.load(existingPdfBytes);

            const indicesToKeep = getPageIndicesToPrint({
                totalPages,
                selectedPageOption,
                customPageRange,
            });

            if (indicesToKeep.length === 0) {
                alert("No pages selected based on your page option!");
                setIsLoading(false);
                return;
            }

            const newPdfDoc = await PDFDocument.create();
            const copiedPages = await newPdfDoc.copyPages(pdfDoc, indicesToKeep);

            copiedPages.forEach((page) => {
                if (orientation === "Landscape") {
                    page.setRotation(degrees(90));
                }
                newPdfDoc.addPage(page);
            });

            const newPdfBytes = await newPdfDoc.save();
            const newPdfBlob = new Blob([newPdfBytes], { type: "application/pdf" });

            const timeStamp = Date.now();
            const newPdfName = `processed-${timeStamp}.pdf`;
            const storageRef2 = ref(storage, `uploads/${newPdfName}`);

            await uploadBytesResumable(storageRef2, newPdfBlob);
            finalFileUrlToPrint = await getDownloadURL(storageRef2);
        } else if (fileToUpload?.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            const arrayBuffer = await fetch(filePreviewUrl).then(res => res.arrayBuffer());
            const extractedText = await mammoth.extractRawText({ arrayBuffer });

            const newPdfDoc = await PDFDocument.create();
            const page = newPdfDoc.addPage([612, 792]); // Default Letter size
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
            const newPdfName = `converted-${timeStamp}.pdf`;
            const storageRef2 = ref(storage, `uploads/${newPdfName}`);

            await uploadBytesResumable(storageRef2, newPdfBlob);
            finalFileUrlToPrint = await getDownloadURL(storageRef2);
        } else {
            if (selectedPageOption !== "All") {
                alert("Partial page selection is only supported for PDF right now.");
            }
        }

        // Submit print job to Firebase
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
            finalPrice: calculatedPrice,
            timestamp: new Date().toISOString(),
            status: "Pending"
        });

        // Send print job request
        const response = await axios.post("http://localhost:5000/api/print", {
          printerName: selectedPrinter,
          fileUrl: finalFileUrlToPrint,
          copies: copies,
        });

        if (!response.data.success) {
            throw new Error("Failed to send print job to the printer.");
        }

        // Deduct coins after successful print job submission
        const updatedCoins = currentCoins - calculatedPrice;
        await update(coinRef, { availableCoins: updatedCoins });

        alert("Print job sent successfully. Coins deducted.");
    } catch (error) {
        console.error("Error preparing the print job:", error);
        alert("Failed to prepare print job. Please try again.");
    } finally {
        setIsLoading(false);
    }
};


  return (
    <div className="p-4">
      <div className="flex items-center space-x-4 mb-6">
        <img src={ezlogo} alt="EZ Logo" className="w-16 h-16" />
        <h1 className="text-4xl font-bold text-[#31304D]">
          Kiosk Vendo Printer
        </h1>
      </div>

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
              <p className="text-3xl font-bold text-[#31304D]">USB</p>
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
                filePreviewUrl = {filePreviewUrl}
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

     {/* Bottom Section (Print Button) */}
     <div className="flex flex-col items-center mt-auto pt-6">
      {isLoading ? (
        <button
          disabled
          className="w-40 py-3 bg-[#31304D] text-white text-lg font-bold rounded-lg mt-6 flex items-center justify-center"
        >
          <i className="fa fa-spinner fa-spin mr-2"></i>
          Printing...
        </button>
      ) : !selectedPrinter ? (
        <button
          onClick={() => alert("Please select an available printer before printing.")}
          className="w-40 py-3 bg-[#31304D] text-white text-lg font-bold rounded-lg mt-6 flex items-center justify-center"
        >
          Select Printer
        </button>
      ) : (
        <button
          onClick={handlePrint}
          className="w-40 py-3 bg-[#31304D] text-white text-lg font-bold rounded-lg mt-6 flex items-center justify-center"
        >
          Print <FaPrint className="ml-2 text-white" />
        </button>
      )}
    </div>
      </div>
    </div>
  );
};

export default Usb;