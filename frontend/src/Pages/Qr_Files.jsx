import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPrint } from "react-icons/fa";
import { ezlogo } from "../assets/Icons";

import CustomPage from "../components/qr/customized_page";
import DocumentPreview from "../components/qr/document_preview";
import SmartPriceToggle from "../components/qr/smart_price";
import PrinterList from "../components/qr/printerList";
import PageOrientation from "../components/qr/page_orientation";
import SelectColor from "../components/qr/select_color";
import PageSize from "../components/qr/page_size";
import Copies from "../components/qr/copies";

import { realtimeDb, storage } from "../../firebase/firebase_config";
import { getDatabase, ref as dbRef, push,get, update } from "firebase/database";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { PDFDocument } from "pdf-lib";
import mammoth from "mammoth";

import { useLocation } from "react-router-dom";

import { getPageIndicesToPrint } from "../utils/pageRanges";

const QRUpload = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const fileName = queryParams.get("name");
  const fileUrl = queryParams.get("url");
  const pagesParam = queryParams.get("pages");
  // File states
 
  // Print settings states
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [copies, setCopies] = useState(1);
  const [selectedSize, setSelectedSize] = useState("Letter 8.5 x 11");
  const [isColor, setIsColor] = useState(false);
  const [orientation, setOrientation] = useState("Portrait");
  const [selectedPageOption, setSelectedPageOption] = useState("All");
  const [customPageRange, setCustomPageRange] = useState("");



  const [totalPages, setTotalPages] = useState(() => {
    return pagesParam ? parseInt(pagesParam) : 1;
  });
  
  const [isSmartPriceEnabled, setIsSmartPriceEnabled] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  let [availableCoins, setAvailableCoins] = useState(0);


  
    useEffect(() => {
      const fetchAvailableCoins = async () => {
        const coinRef = dbRef(realtimeDb, "coinCount/availableCoins");
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
              orientation: orientation,
              paperSize: selectedSize,
              pageOption: selectedPageOption,
              customPageRange: customPageRange,
              isColor: isColor ? "Color" : "Black and White"
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
              <p className="text-3xl font-bold text-[#31304D]">Upload Your Files</p>
            </div>

            {/* Printer List */}
            <PrinterList
              selectedPrinter={selectedPrinter}
              setSelectedPrinter={setSelectedPrinter}
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
                isSmartPriceEnabled={isSmartPriceEnabled}
                setIsSmartPriceEnabled={setIsSmartPriceEnabled}
                calculatedPrice={calculatedPrice}
                setCalculatedPrice={setCalculatedPrice}
                selectedPageOption={selectedPageOption}
                setSelectedPageOption={setSelectedPageOption}
                customPageRange={customPageRange}
                setCustomPageRange={setCustomPageRange}
                filePreviewUrl={fileUrl}
              />
            </div>
          </div>

          {/* Right Side - File Preview */}
          <div className="w-full">
            <DocumentPreview
              fileUrl={fileUrl}
              fileName={fileName}
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

export default QRUpload;
