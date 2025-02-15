import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPrint } from "react-icons/fa";
import M_small_price from "./M_small_price";
import DocumentPreview from "../components/document_preview";
import SmartPriceToggle from "../components/smart_price";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as dbRef, push } from "firebase/database";
import { realtimeDb,storage } from "../../../backend/firebase/firebase-config";
import mammoth from "mammoth";
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

 

// Upload file to Firebase Storage and save link to Realtime Database
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


const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (!file) {
    alert("No file selected!");
    return;
}

setFileToUpload(file);
uploadFileToFirebase(file); 
};

  
  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold text-[#31304D] mb-6 text-center lg:text-left">
        Kiosk Vendo Printer
      </h1>
      
      <div className="flex w-full h-full bg-gray-200 rounded-lg shadow-md border-4 border-[#31304D] p-6 space-x-4">
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

            <div className="flex items-center mt-6 relative">
              <p className="text-2xl font-bold text-[#31304D] mr-4">Size:</p>
              <div className="relative w-64">
                <div 
                  className="flex items-center justify-between bg-white border-2 border-[#31304D] rounded-lg text-[#31304D] text-lg font-bold p-2 cursor-pointer"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span>{selectedSize}</span>
                </div>
                {isDropdownOpen && (
                  <div className="absolute left-0 w-full bg-gray-100 border-2 border-[#31304D] rounded-lg mt-2 shadow-md z-10">
                    <div 
                      className="p-2 cursor-pointer hover:bg-gray-300 text-[#31304D] font-bold"
                      onClick={() => {
                        setSelectedSize("Letter 8.5 x 11 (Short)");
                        setIsDropdownOpen(false);
                      }}
                    >
                      Letter 8.5 x 11 (Short)
                    </div>
                    <div 
                      className="p-2 cursor-pointer hover:bg-gray-300 text-[#31304D] font-bold"
                      onClick={() => {
                        setSelectedSize("A4 8.3 x 11.7 (A4)");
                        setIsDropdownOpen(false);
                      }}
                    >
                      A4 8.3 x 11.7 (A4)
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center mt-6 relative">
              <p className="text-2xl font-bold text-[#31304D] mr-4">Pages:</p>
              <div className="relative w-64">
                <div 
                  className="flex items-center justify-between bg-white border-2 border-[#31304D] rounded-lg text-[#31304D] text-lg font-bold p-2 cursor-pointer"
                  onClick={() => setIsPageDropdownOpen(!isPageDropdownOpen)}
                >
                  <span>{selectedPageOption}</span>
                </div>
                {isPageDropdownOpen && (
                  <div className="absolute left-0 top-full w-full bg-gray-100 border-2 border-[#31304D] rounded-lg mt-2 shadow-md z-10">
                    <div className="p-2 cursor-pointer hover:bg-gray-300 text-[#31304D] font-bold" onClick={() => { setSelectedPageOption("All"); setIsPageDropdownOpen(false); }}>All</div>
                    <div className="p-2 cursor-pointer hover:bg-gray-300 text-[#31304D] font-bold" onClick={() => { setSelectedPageOption("Odd pages only"); setIsPageDropdownOpen(false); }}>Odd pages only</div>
                    <div className="p-2 cursor-pointer hover:bg-gray-300 text-[#31304D] font-bold" onClick={() => { setSelectedPageOption("Even pages only"); setIsPageDropdownOpen(false); }}>Even pages only</div>
                    <div className="p-2 cursor-pointer hover:bg-gray-300 text-[#31304D] font-bold" onClick={() => { setSelectedPageOption("Custom"); setIsPageDropdownOpen(false); }}>Custom</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center mt-6 relative">
              <p className="text-2xl font-bold text-[#31304D] mr-4">Color:</p>
              <div className="relative w-64">
                <div 
                  className="flex items-center justify-between bg-white border-2 border-[#31304D] rounded-lg text-[#31304D] text-lg font-bold p-2 cursor-pointer"
                  onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
                >
                  <span>{selectedColorOption}</span>
                </div>
                {isColorDropdownOpen && (
                  <div className="absolute left-0 w-full bg-gray-100 border-2 border-[#31304D] rounded-lg mt-2 shadow-md z-10">
                    <div className="p-2 cursor-pointer hover:bg-gray-300 text-[#31304D] font-bold" onClick={() => { setSelectedColorOption("Color"); setIsColorDropdownOpen(false); }}>Color</div>
                    <div className="p-2 cursor-pointer hover:bg-gray-300 text-[#31304D] font-bold" onClick={() => { setSelectedColorOption("Black and White"); setIsColorDropdownOpen(false); }}>Black and White</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center mt-6 relative">
              <p className="text-2xl font-bold text-[#31304D] mr-4">Orientation:</p>
              <div className="relative w-64">
                <div 
                  className="flex items-center justify-between bg-white border-2 border-[#31304D] rounded-lg text-[#31304D] text-lg font-bold p-2 cursor-pointer"
                  onClick={() => setIsOrientationDropdownOpen(!isOrientationDropdownOpen)}
                >
                  <span>{selectedOrientationOption}</span>
                </div>
                {isOrientationDropdownOpen && (
                  <div className="absolute left-0 w-full bg-gray-100 border-2 border-[#31304D] rounded-lg mt-2 shadow-md z-10">
                    <div className="p-2 cursor-pointer hover:bg-gray-300 text-[#31304D] font-bold" onClick={() => { setSelectedOrientationOption("Portrait"); setIsOrientationDropdownOpen(false); }}>Portrait</div>
                    <div className="p-2 cursor-pointer hover:bg-gray-300 text-[#31304D] font-bold" onClick={() => { setSelectedOrientationOption("Landscape"); setIsOrientationDropdownOpen(false); }}>Landscape</div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4">
            <button 
              className="w-full px-6 py-3 bg-[#31304D] text-white text-lg font-bold rounded-lg shadow-md"
              onClick={() => setIsModalOpen(true)}
            >
              Smart Price
            </button>
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

      {isModalOpen && (
        <div className="fixed inset-0 flex justify-end items-center  bg-opacity-30 backdrop-blur-sm">
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
