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
import { realtimeDb,storage } from "../../../backend/firebase/firebase-config";
import PrinterList from "../components/printerList";
const Usb = () => {
  const navigate = useNavigate();
  const [copies, setCopies] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPageDropdownOpen, setIsPageDropdownOpen] = useState(false);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [isOrientationDropdownOpen, setIsOrientationDropdownOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("Letter 8.5 x 11 (Short)");
  const [selectedPageOption, setSelectedPageOption] = useState("All");
  const [selectedColorOption, setSelectedColorOption] = useState("Color");
  const [selectedOrientationOption, setSelectedOrientationOption] = useState("Portrait");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const increaseCopies = () => setCopies(prev => prev + 1);
  const decreaseCopies = () => setCopies(prev => (prev > 1 ? prev - 1 : 1));


  const [selectedFile, setSelectedFile] = useState("");
  const [fileType, setFileType] = useState(null); 
  const [fileContent, setFileContent] = useState(""); 
  const [filePreviewUrl, setFilePreviewUrl] = useState('');
  const [loading, setLoading] = useState(false); 
  const [uploading, setUploading] = useState(false); 
  const [fileToUpload, setFileToUpload] = useState(null); 
  const [downloadURL, setDownloadURL] = useState("");
  const [files, setFiles] = useState([]);

 

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

    setUploading(true);
    const storageRef = ref(storage, `uploads/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef,file);
    
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        console.log(`Upload progress: ${(snapshot.bytesTransferred / snapshot.totalBytes) * 100}%`);
      },
      (error) => {
        console.error("Upload failed", error);
        setUploading(false);
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setFilePreviewUrl(url);
          console.log("File available at:", url);
        

          // Now push data to Firebase Realtime Database
        
    
      alert("File uploaded and saved successfully!");
      
    } catch (error) {
      console.error("Error getting download URL or saving data:", error);
  }
  setUploading(false)
}

);

};

// Uploading data file copies and ect. in firebase

const handlePrint = async () => {
  if (!filePreviewUrl) {
      alert("No file uploaded! Please upload a file before printing.");
      return;
  }

  try {
      // Reference to Firebase Realtime Database 
      const printJobsRef = dbRef(realtimeDb, "files");

      // Push print job data to Firebase
          await push(printJobsRef, {
          fileName: fileToUpload?.name,
          fileUrl: filePreviewUrl,
          copies: copies,
          paperSize: selectedSize,
          colorOption: selectedColorOption,
          pageOption: selectedPageOption,
          orientation: selectedOrientationOption,
          timestamp: new Date().toISOString(),
      });

      // Simulate printing 
      window.print();
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

      <div className="flex w-full h-full bg-gray-200 rounded-lg shadow-md border-4 border-[#31304D] p-6 space-x-4">
        {/* Left Side - File Upload and Settings */}
        <div className="w-1/2">
          <div>
            <div className="flex items-center">
              <button
                className="w-10 h-10 bg-gray-200 text-[#31304D] flex items-center justify-center rounded-lg border-2 border-[#31304D] mr-4"
                onClick={() => navigate(-1)}
              >
                <FaArrowLeft className="text-2xl text-[#31304D]" />
              </button>
              <p className="text-3xl font-bold text-[#31304D]">USB</p>
            </div>

            <p className="mt-4 text-3xl font-bold text-[#31304D]">Choose File</p>
            <input type="file" onChange={handleFileSelect} className="mt-4 w-full border-2 border-[#31304D] p-2" />
            <div className="mt-4">

            <button
            onClick={() => {
              if (fileToUpload) {
                
              } else {
                alert('No file selected! Please choose a file first.');
              }
            }}
            className="mt-4 w-full px-6 py-3 bg-[#31304D] text-white text-lg font-bold rounded-lg shadow-md"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
              </div>
          
            <div className="flex items-center mt-6">
              <p className="text-2xl font-bold text-[#31304D] mr-4">Copies:</p>
              <div className="flex items-center space-x-4">
                <button
                  className="w-8 h-8 bg-gray-200 text-[#31304D] flex items-center justify-center rounded-lg border-2 border-[#31304D] text-2xl"
                  onClick={decreaseCopies}
                >
                  -
                </button>
                <div className="w-14 h-10 flex items-center justify-center bg-gray-200 border-2 border-[#31304D] rounded-lg">
                  <span className="text-3xl font-bold text-[#31304D]">{copies}</span>
                </div>
                <button
                  className="w-8 h-8 bg-gray-200 text-[#31304D] flex items-center justify-center rounded-lg border-2 border-[#31304D] text-2xl"
                  onClick={increaseCopies}
                >
                  +
                </button>
              </div>
            </div>

            {/* Size Dropdown */}
            <div className="flex items-center mt-6 relative">
              <p className="text-2xl font-bold text-[#31304D] mr-4">Size:</p>
              <select
                className="w-64 p-2 border-2 border-[#31304D] rounded-lg text-lg font-bold text-[#31304D]"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option>Letter 8.5 x 11 (Short)</option>
                <option>A4 8.3 x 11.7 (A4)</option>
              </select>
            </div>

            {/* Pages Dropdown */}
            <div className="flex items-center mt-6 relative">
              <p className="text-2xl font-bold text-[#31304D] mr-4">Pages:</p>
              <select
                className="w-64 p-2 border-2 border-[#31304D] rounded-lg text-lg font-bold text-[#31304D]"
                value={selectedPageOption}
                onChange={(e) => setSelectedPageOption(e.target.value)}
              >
                <option>All</option>
                <option>Odd pages only</option>
                <option>Even pages only</option>
                <option>Custom</option>
              </select>
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
             {/* List of available printer*/}
              <div>
                <PrinterList/>
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

        {/* Right Side - File Preview */}
        <DocumentPreview fileUrl={filePreviewUrl} fileName={fileToUpload?.name} />

      </div>

      {/* Print Button */}
      <button onClick={handlePrint} className="w-full px-6 py-3 bg-[#31304D] text-white text-lg font-bold rounded-lg mt-4 flex items-center justify-center">
        Print <FaPrint className="ml-2 text-white" />
      </button>

      {/* Smart Price Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-end items-center bg-opacity-30 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 h-full relative">
            <button className="absolute top-2 right-2 text-[#31304D] text-2xl" onClick={() => setIsModalOpen(false)}>×</button>
            <M_small_price />
          </div>
        </div>
      )}
    </div>
  );
};

export default Usb;
