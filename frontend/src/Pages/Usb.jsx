import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPrint } from "react-icons/fa";
import M_small_price from "./M_small_price";
import DocumentPreview from "../components/document_preview";
import SmartPriceToggle from "../components/smart_price";
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


  

  const uploadFileToCloudinary = async () => {
    if (!fileToUpload) {
        alert("No file selected for upload!");
        return;
    }

    setUploading(true);

    
    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("upload_preset", "VendoPrint"); 

    try {
        const response = await fetch("https://api.cloudinary.com/v1_1/dxgepee4v/upload", {
            method: "POST",
            body: formData
        });
            const data = await response.json();
            setUploading(false);

            if (data.secure_url) {
              alert("File uploaded successfully!");
              console.log("Cloudinary URL:", data.secure_url);
          } else {
              alert("File upload failed!");
          }
        } catch (error) {
            console.error("Error uploading file:", error);
            setUploading(false);
        
    };

    reader.readAsDataURL(fileToUpload); 
};




  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert("No file selected!");
      return;
  }

  setSelectedFile(file.name); 
  setFileToUpload(file); 
  handlePreview(file, file.name); 
};

  
  
  const fetchFilesFromRealtimeDatabase = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/get-files');
      const data = await response.json();
      setFiles(Object.values(data)); 
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };
  
  const handlePreview = (file, fileName) => {
    if (!fileName) {
        console.error("Error: fileName is undefined or invalid");
        return;
    }

    console.log("Previewing file:", { fileName });

    setLoading(true);
    const fileExtension = fileName.split(".").pop().toLowerCase();

    if (fileExtension === "pdf") {
        const blob = new Blob([file], { type: "application/pdf" });
        const fileUrl = URL.createObjectURL(blob);
        setFileType("pdf");
        setFilePreviewUrl(fileUrl);
    } else if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
        const fileReader = new FileReader();
        fileReader.onload = () => setFilePreviewUrl(fileReader.result);
        fileReader.readAsDataURL(file);
        setFileType("image");
    } else if (fileExtension === "txt") {
        const fileReader = new FileReader();
        fileReader.onload = () => setFileContent(fileReader.result);
        fileReader.readAsText(file);
        setFileType("txt");
    } else if (fileExtension === "docx") {
        const fileReader = new FileReader();
        fileReader.onload = async (event) => {
            const arrayBuffer = event.target.result;
            const result = await  mammoth.convertToHtml({ arrayBuffer });
            setFileContent(result.value);
        };
        fileReader.readAsArrayBuffer(file);
        setFileType("docx");
    } else {
        setFileType(null);
        alert("Unsupported file type.");
    }

    setLoading(false);
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
                uploadFileToCloudinary(fileToUpload);
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
        <DocumentPreview file={fileToUpload} />

      </div>

      {/* Print Button */}
      <button className="w-full px-6 py-3 bg-[#31304D] text-white text-lg font-bold rounded-lg mt-4 flex items-center justify-center">
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
