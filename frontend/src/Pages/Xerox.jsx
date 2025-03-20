import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPrint } from 'react-icons/fa';
import { ezlogo } from '../assets/Icons';

// import DocumentPreview from "../components/xerox/document_preview";
import PrinterList from "../components/xerox/printerList";
import Copies from "../components/xerox/copies";
import SmartPriceToggle from "../components/xerox/smart_price";

import { realtimeDb } from '../../firebase/firebase_config';
import { getDatabase, ref as dbRef, get } from "firebase/database";
import axios from "axios";

const Xerox = () => {
  const navigate = useNavigate();

  // File at Printer states
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [copies, setCopies] = useState(1);
  const [isSmartPriceEnabled, setIsSmartPriceEnabled] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [availableCoins, setAvailableCoins] = useState(0);

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
    if (!selectedPrinter) {
      alert("No printer selected! Please choose a printer first.");
      setIsLoading(false);
      return;
    }

    try {
     
      const response = await axios.post("http://localhost:5000/api/xerox", {
        printerName: selectedPrinter,
        responseType: "blob",
      });

      // Create a URL for the scanned file and allow the user to download it
      const scannedFileUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = scannedFileUrl;
      link.download = "scanned_document.png";
      link.click();

      alert("Scanning complete! File downloaded.");

    } catch (err) {
      console.error("Xerox job error:", err);
      alert("Failed to send Xerox job.");
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
              <p className="text-3xl font-bold text-[#31304D]">Xerox</p>
            </div>

            {/* Printer List */}
            <PrinterList
              selectedPrinter={selectedPrinter}
              setSelectedPrinter={setSelectedPrinter}
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
                totalPages={totalPages}
                setCalculatedPrice={setCalculatedPrice}
                filePreviewUrl={filePreviewUrl}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section (Xerox Button) */}
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
