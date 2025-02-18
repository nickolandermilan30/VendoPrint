import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPrint } from "react-icons/fa";

import CustomPage from "../components/usb/customized_page";
import DocumentPreview from "../components/usb/document_preview";
import SmartPriceToggle from "../components/usb/smart_price";
import PrinterList from "../components/usb/printerList";
import PageOrientation from "../components/usb/page_orientation";
import SelectColor from "../components/usb/select_color";
import PageSize from "../components/usb/page_size";
import Copies from "../components/usb/copies";

import { getDatabase, ref as dbRef, push } from "firebase/database";
import { realtimeDb, storage } from "../../../backend/firebase/firebase-config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import axios from "axios";

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

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert("No file selected!");
      return;
    }
    setFileToUpload(file);
    uploadFileToFirebase(file);
  };

  // Upload file to Firebase Storage
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

  // Handle "Print" button
  const handlePrint = async () => {
    if (!filePreviewUrl) {
      alert("No file uploaded! Please upload a file before printing.");
      return;
    }
    if (!selectedPrinter) {
      alert("No printer selected! Please choose a printer first.");
      return;
    }

    // 1) Save data to Firebase (realtimeDb)
    try {
      const printJobsRef = dbRef(realtimeDb, "files");
      await push(printJobsRef, {
        fileName: fileToUpload?.name,
        fileUrl: filePreviewUrl,
        printerName: selectedPrinter,
        copies: copies,
        paperSize: selectedSize,
        isColor: isColor,
        orientation: orientation,
        pageOption: selectedPageOption,
        customPageRange: customPageRange,
        totalPages: totalPages,
        isSmartPriceEnabled: isSmartPriceEnabled,
        finalPrice: isSmartPriceEnabled ? calculatedPrice : 0,
        timestamp: new Date().toISOString(),
      });

  
      try {
        const response = await axios.post("http://localhost:5000/api/print", {
          printerName: selectedPrinter,
          fileUrl: filePreviewUrl,
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

      // 3) Optionally print from the browser (window.print):
      // window.print();
    } catch (error) {
      console.error("Error inserting print job data:", error);
      alert("Failed to add print job. Please try again.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold text-[#31304D] mb-6 text-center lg:text-left">
        Kiosk Vendo Printer
      </h1>

      {/* Main Box Container */}
      <div className="flex flex-col w-full h-full bg-gray-200 rounded-lg shadow-md border-4 border-[#31304D] p-6 space-x-4 relative">
        {/* Top Section (Left and Right Side) */}
        <div className="flex w-full space-x-6">
          {/* Left Side - File Upload and Settings */}
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
              />
              <SelectColor isColor={isColor} setIsColor={setIsColor} />
              <PageOrientation
                orientation={orientation}
                setOrientation={setOrientation}
              />

              <SmartPriceToggle
                paperSize={selectedSize}
                isColor={isColor}
                copies={copies}
                totalPages={totalPages}
                isSmartPriceEnabled={isSmartPriceEnabled}
                setIsSmartPriceEnabled={setIsSmartPriceEnabled}
                calculatedPrice={calculatedPrice}
                setCalculatedPrice={setCalculatedPrice}
              />
            </div>

 



            {/* Color Dropdown */}
            <div className="flex items-center mt-6 relative">
              <p className="text-2xl font-bold text-[#31304D] mr-4">Color:</p>
              <select
                className="w-64 p-2 border-2 border-[#31304D] rounded-lg text-lg font-bold text-[#31304D]"
                value={selectedColorOption}
                onChange={(e) => setSelectedColorOption(e.target.value)}
              >
                <option>Color</option>
                <option>Black and White</option>
              </select>
            </div>

            {/* Orientation Dropdown */}
            <div className="flex items-center mt-6 relative">
              <p className="text-2xl font-bold text-[#31304D] mr-4">Orientation:</p>
              <select
                className="w-64 p-2 border-2 border-[#31304D] rounded-lg text-lg font-bold text-[#31304D]"
                value={selectedOrientationOption}
                onChange={(e) => setSelectedOrientationOption(e.target.value)}
              >
                <option>Portrait</option>
                <option>Landscape</option>
              </select>
            </div>

            {/* Smart Price Button */}
            <div>
            <SmartPriceToggle/>
            </div>
          </div>
        </div>

        {/* Bottom Section (Print Button) */}
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

export default Usb;
