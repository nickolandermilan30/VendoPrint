import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPrint } from 'react-icons/fa';


import DocumentPreview from "../components/xerox/document_preview";
import PrinterList from "../components/xerox/printerList";
import Copies from "../components/xerox/copies";
import SmartPriceToggle from "../components/xerox/smart_price";


import { realtimeDb, storage } from "../../../backend/firebase/firebase-config";
import { getDatabase, ref as dbRef, push,get, update } from "firebase/database";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { PDFDocument } from "pdf-lib";
import mammoth from "mammoth";

import { getPageIndicesToPrint } from "../utils/pageRanges"; // <-- Import your utility


const Xerox = () => {
  const navigate = useNavigate();

  // File states
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [fileToUpload, setFileToUpload] = useState(null);

   // Print settings states
    const [selectedPrinter, setSelectedPrinter] = useState("");
    const [copies, setCopies] = useState(1);
    const [isSmartPriceEnabled, setIsSmartPriceEnabled] = useState(false);
    const [calculatedPrice, setCalculatedPrice] = useState(0);
  
   
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
   let [availableCoins, setAvailableCoins] = useState(0);
    
      useEffect(() => {
         const fetchAvailableCoins = async () => {
           const coinRef = dbRef(realtimeDb, "coins/Monday/insertedCoins");
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
        return;
      }
      if (!selectedPrinter) {
        alert("No printer selected! Please choose a printer first.");
        return;
      }

       
             // Fetch current available coins from Firebase
           const coinRef = dbRef(realtimeDb, "coins/Monday/insertedCoins");
           try {
             const snapshot = await get(coinRef);
             if (snapshot.exists()) {
               availableCoins = snapshot.val();
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
            newPdfDoc.addPage(page);
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
          isColor: isColor,
          finalPrice:calculatedPrice,
          timestamp: new Date().toISOString(),
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

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold text-[#31304D] mb-6 text-center lg:text-left">
        Kiosk Vendo Printer
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
              <p className="text-3xl font-bold text-[#31304D]">Xerox</p>
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

              <p className="mt-6 font-bold text-gray-700 text-2xl">
              Inserted coins: {availableCoins}
              </p>

              <SmartPriceToggle
                
                copies={copies}
                isSmartPriceEnabled={isSmartPriceEnabled}
                setIsSmartPriceEnabled={setIsSmartPriceEnabled}
                calculatedPrice={calculatedPrice}
                totalPages ={totalPages}
                setCalculatedPrice={setCalculatedPrice}
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
              Processing...
            </button>
          ) : (
            <button
              onClick={handlePrint}
              className="w-40 py-3 bg-[#31304D] text-white text-lg font-bold rounded-lg mt-6 flex items-center justify-center"
            >
              Xerox <FaPrint className="ml-2 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Xerox;
