import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft,FaPrint, FaSpinner } from 'react-icons/fa';
import M_small_price from './M_small_price';
import { Worker, Viewer } from '@react-pdf-viewer/core'; 
import '@react-pdf-viewer/core/lib/styles/index.css'; 
import mammoth from "mammoth"; 
import axios from "axios";


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

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/usb-files")
      .then((response) => {
        setFiles(response.data); 
      })
      .catch((error) => console.error("Error fetching USB files:", error));
  }, []);
  
  

  const uploadFileToRealtimeDatabase = async (file) => {
    if (!file) {
      alert("No file selected for upload!");
      return;
    }
  
    setUploading(true);
  
    try {
      const response = await fetch("http://localhost:5000/api/add-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file.filename,
          fileContent: file.fileContent, 
        }),
      });
  
      const data = await response.json();
      setUploading(false);
  
      if (data.success) {
        alert("File uploaded successfully!");
        fetchFilesFromRealtimeDatabase(); 
      } else {
        alert("File upload failed!");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploading(false);
    }
  };
  
  
  
  

  const handleFileSelect = (file) => {
    if (!file) {
      alert("File not found!");
      return;
    }
  
    setSelectedFile(file.filename); 
    setFileToUpload(file); 
    handlePreview(file.fileContent, file.filename); 
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
  
  const handlePreview = (fileContent, fileName) => {
    console.log("Previewing file:", { fileName, fileContent }); 
  
    setLoading(true);
    const fileExtension = fileName.split(".").pop().toLowerCase();
  
    if (fileExtension === "pdf") {
      const blob = new Blob([Uint8Array.from(atob(fileContent), (c) => c.charCodeAt(0))], {
        type: "application/pdf",
      });
      const fileUrl = URL.createObjectURL(blob);
      setFileType("pdf");
      setFilePreviewUrl(fileUrl);
    } else if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
      setFileType("image");
      setFilePreviewUrl(`data:image/${fileExtension};base64,${fileContent}`);
    } else if (fileExtension === "txt") {
      setFileType("txt");
      setFileContent(atob(fileContent));
    } else if (fileExtension === "docx") {
      const arrayBuffer = Uint8Array.from(atob(fileContent), (c) => c.charCodeAt(0)).buffer;
      mammoth
        .extractRawText({ arrayBuffer })
        .then((result) => setFileContent(result.value))
        .finally(() => setLoading(false));
    } else {
      setFileType(null);
      alert("Unsupported file type.");
    }
  
    setLoading(false);
  };
  
  
  
      const [files, setFiles] = useState([]);
      const [selectedFile, setSelectedFile] = useState("");
      const [fileType, setFileType] = useState(null); 
      const [fileContent, setFileContent] = useState(""); 
      const [filePreviewUrl, setFilePreviewUrl] = useState('');
      const [loading, setLoading] = useState(false); 
      const [uploading, setUploading] = useState(false); 
      const [fileToUpload, setFileToUpload] = useState(null); 

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
            <div className="mt-4 w-64 h-32 bg-white border-2 border-[#31304D] rounded-lg p-2 overflow-y-auto">
            <ul className="text-[#31304D] overflow-y-auto">
              {files.length > 0 ? (
                files.map((file, index) => (
                  <li
                    key={index}
                    className={`cursor-pointer p-2 ${selectedFile === file.filename ? "bg-gray-300" : ""}`}
                    onClick={() => {
                      setSelectedFile(file.filename); // Highlight the selected file
                      handlePreview(file.fileContent, file.filename); // Trigger preview
                    }}
                  >
                    {file.filename}
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No files found.</p>
              )}
            </ul>



            </div>
            <div className="mt-4">

            <button
            onClick={() => {
              if (fileToUpload) {
                uploadFileToRealtimeDatabase(fileToUpload);
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
                  −
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

     {/* File Preview Section */}
     <div className="w-1/2 bg-white border-2 border-[#31304D] rounded-lg p-6 flex flex-col">
          <h2 className="text-3xl font-bold text-[#31304D] mb-4">File Preview</h2>
          <div className="flex-1 overflow-y-auto">
            {uploading && (
              <div className="flex items-center justify-center">
                <FaSpinner className="animate-spin text-[#31304D] text-3xl" />
                <p className="ml-4 text-lg text-[#31304D]">Uploading...</p>
              </div>
            )}
            {loading && (
              <div className="flex items-center justify-center">
                <FaSpinner className="animate-spin text-[#31304D] text-3xl" />
                <p className="ml-4 text-lg text-[#31304D]">Loading preview...</p>
              </div>
            )}
            {fileType === 'pdf' && filePreviewUrl && (
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.14.305/build/pdf.worker.min.js">
                <Viewer fileUrl={filePreviewUrl} />
              </Worker>
            )}
            {fileType === 'image' && filePreviewUrl && (
              <img src={filePreviewUrl} alt="Selected File" className="w-full h-auto rounded-lg" />
            )}
            {fileType === 'txt' && <pre className="whitespace-pre-wrap">{fileContent}</pre>}
            {fileType === 'docx' && <div dangerouslySetInnerHTML={{ __html: fileContent }} />}
            {!fileType && !selectedFile && (
              <p className="text-lg text-[#31304D]">Select a file to preview it here.</p>
            )}
          </div>
          <button className="w-full px-6 py-3 bg-[#31304D] text-white text-lg font-bold rounded-lg mt-4 flex items-center justify-center">
            Print <FaPrint className="ml-2 text-white" />
          </button>
        </div>
      </div>

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
