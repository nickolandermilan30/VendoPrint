import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";  
import { realtimeDb,storage} from '../../firebase/firebase_config';
import { ref, onValue,  update } from "firebase/database"
import { deleteObject, listAll, getDownloadURL, ref as storageRef } from "firebase/storage";

import { 
          ezlogo,
          vectorImage1,
          vectorImage2,
          vectorImage3,
          vectorImage4 } from '../assets/Icons';

import { FaTimes, FaFilePdf, FaFileWord, FaFileExcel, FaFileImage} from "react-icons/fa";


import M_Qrcode from './M_Qrcode';
const Printer = () => {

  const navigate = useNavigate();     
  const location = useLocation();
  
  const {
    fileName: uploadedFileName,
    fileUrl: uploadedFileUrl,
    totalPages: uploadedFileTotalPages
  } = location.state || {};


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUsbModalOpen, setIsUsbModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [queue, setQueue] = useState([]);
  

  useEffect(() => {
    console.log("From FileUpload:", uploadedFileName, uploadedFileUrl, uploadedFileTotalPages);
    
    const queueRef = ref(realtimeDb, "uploadedFiles");

    const unsubscribe = onValue(queueRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Raw data from Firebase:", data);

      if (data) {
        const updatedQueue = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        

        console.log("Processed queue:", updatedQueue);
        setQueue(updatedQueue);
      } else {
        setQueue([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchFiles = () => {
      const queueRef = ref(realtimeDb, "uploadedFiles"); // Reference to 'uploadedFiles' in Realtime DB

      onValue(queueRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const filesArray = Object.keys(data).map((key) => ({
            id: key, // Unique Firebase key
            ...data[key], // Spread file data (name, URL, totalPages)
          }));
          setUploadedFiles(filesArray);
        } else {
          setUploadedFiles([]); 
        }
      });
    };

    fetchFiles();
  }, []);
  
  //Function to delete 
  const clearAllFiles = async () => {
    if (!window.confirm("Are you sure you want to clear all files? This action cannot be undone.")) {
      return;
    }
  
    try {
      // Reference to the "uploads" folder in Firebase Storage
      const storageFolderRef = storageRef(storage, "uploads/");
      const result = await listAll(storageFolderRef);
  
      // Delete each file in Firebase Storage
      await Promise.all(
        result.items.map(async (fileRef) => {
          await deleteObject(fileRef);
        })
      );
  
      // Clear files from Realtime Database
      await update(ref(realtimeDb, "files"), {});
  
      // Update state
      setQueue([]);
      setUploadedFiles([]);
  
      console.log("✅ All files deleted successfully!");
    } catch (error) {
      console.error("❌ Error clearing files:", error);
    }
  };
  
  // Function to start printing a file
  const startPrinting = (fileId) => {
    update(ref(realtimeDb, `files/${fileId}`), { status: "Processing" });

    console.log(`🖨️ Printing started for file ID: ${fileId}`);

    setTimeout(() => {
      update(ref(realtimeDb, `files/${fileId}`), { status: "Done" })
        .then(() => console.log(`✅ Printing completed for file ID: ${fileId}`))
        .catch((error) => console.error("Error updating status:", error));
    }, 5000); 
  };

  // Function to determine the file type icon
  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFileWord className="text-blue-600 text-2xl" />;
    const ext = fileName.split(".").pop().toLowerCase();

    if (ext === "pdf") return <FaFilePdf className="text-red-600 text-2xl" />;
    if (["docx", "doc"].includes(ext)) return <FaFileWord className="text-blue-600 text-2xl" />;
    if (["xls", "xlsx"].includes(ext)) return <FaFileExcel className="text-green-600 text-2xl" />;
    if (["jpg", "png", "jpeg"].includes(ext)) return <FaFileImage className="text-yellow-600 text-2xl" />;
    
    return <FaFileWord className="text-gray-600 text-2xl" />;
  };
  
  return (
    <div className="p-4 flex flex-col lg:flex-row items-center lg:items-start h-full min-h-screen">
      <div className="w-full lg:flex-1">
      <div className="flex items-center space-x-4 mb-6">
        <img src={ezlogo} alt="EZ Logo" className="w-16 h-16" />
        <h1 className="text-4xl font-bold text-[#31304D]">
          Kiosk Vendo Printer
        </h1>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Xerox */}
          <Link to="/xerox">
            <div className="flex flex-col items-center cursor-pointer">
              <div className="w-full max-w-xs h-48 bg-gray-100 flex items-center justify-center text-xl font-bold rounded-lg border-4 border-[#31304D] shadow-md">
                <img src={vectorImage1} alt="Xerox" className="w-24 h-24" />
              </div>
              <p className="text-2xl font-bold text-[#31304D] mt-2">Xerox</p>
            </div>
          </Link>

      
          <div 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => navigate('/bt-upload')}
          >
            <div className="w-full max-w-xs h-48 bg-gray-100 flex items-center justify-center text-xl font-bold rounded-lg border-4 border-[#31304D] shadow-md">
              <img src={vectorImage2} alt="Bluetooth" className="w-24 h-24" />
            </div>
            <p className="text-2xl font-bold text-[#31304D] mt-2">Bluetooth</p>
          </div>
       
  
      
            <div className="flex flex-col items-center cursor-pointer" onClick={() => setIsUsbModalOpen(true)}>
              <div className="w-full max-w-xs h-48 bg-gray-100 flex items-center justify-center text-xl font-bold rounded-lg border-4 border-[#31304D] shadow-md">
                <img src={vectorImage3} alt="USB" className="w-24 h-24" />
              </div>
              <p className="text-2xl font-bold text-[#31304D] mt-2">USB</p>
            </div>
          

      
          <div 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="w-full max-w-xs h-48 bg-gray-100 flex items-center justify-center text-xl font-bold rounded-lg border-4 border-[#31304D] shadow-md">
              <img src={vectorImage4} alt="Share files via QR" className="w-24 h-24" />
            </div>
            <p className="text-2xl font-bold text-[#31304D] mt-2">Share files via QR</p>
          </div>
        </div>
      </div>


      <div className="w-full lg:w-80 h-auto lg:h-[90vh] bg-gray-400 mt-6 lg:mt-0 lg:ml-6 rounded-lg shadow-md flex flex-col items-center p-4">
        <h2 className="text-xl font-bold">Printer Queue</h2>
        <div className="flex-1 flex items-center justify-center w-full">
        {queue.length === 0 ? (
            <p>No files in the queue</p>
          ) : (
            <ul className="w-full">
              {queue.map((file) => (
                <li key={file.id} className="p-2 border-b border-gray-300 flex items-center gap-2">
                  {/* File Type Icon */}
                  {getFileIcon(file.name || file.fileName)}

                  <div>
                    <p><strong>Name:</strong> {file.fileName}</p>
                    <p><strong>Status:</strong> {file.status}</p>

                    {file.status === "Pending" && (
                      <button
                        onClick={() => startPrinting(file.id)}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                      >
                        Start Print
                      </button>
                    )}
                  </div>
                </li>
              ))}

            </ul>
          )}
        </div>
        <h2 className="text-xl font-bold">Uploaded Files</h2>
      <div className="flex-1 flex items-center justify-center w-full">
        <div>
          {uploadedFiles.length === 0 ? (
            <p>No uploaded files</p>
          ) : (
            <ul className="w-full">
              {uploadedFiles.map((file) => (
                <li key={file.id} className="p-2 border-b border-gray-300 flex items-center gap-2">
                  {/* File Icon Placeholder (Replace with getFileIcon if you have it) */}
                  <span>📄</span>  

                  <div>
                    <Link
                      to={`/qr?name=${encodeURIComponent(file.fileName)}&url=${encodeURIComponent(file.fileUrl)}&pages=${encodeURIComponent(file.totalPages)}`}
                      className="text-dark text-sm"
                    >
                      <p><strong>Name:</strong> {file.fileName}</p>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Clear All Files Button */}
      <button 
        onClick={clearAllFiles} 
        className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-2xl hover:bg-gray-700"
      >
        Clear Files
      </button>
    </div>

      
      
      {/* Modal for QR */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-30 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 text-center">Share files via QR</h2>
            <M_Qrcode />
            <button 
              className="mt-6 bg-red-500 text-white px-6 py-3 rounded-lg w-3/4 text-center font-bold"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isUsbModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-30 backdrop-blur-sm z-50">
          <div className="bg-white p-16 rounded-lg border-gray shadow-lg max-w-lg w-full flex flex-col items-center relative">
            <button 
              className="absolute top-4 right-4 bg-transparent text-black-700 px-3 py-1 rounded-full"
              onClick={() => navigate('/usb')}>
            
            <FaTimes className="text-2xl" />
            </button>
            <h2 className="text-5xl font-bold mb-4">Guide</h2>
            <p className="mb-4 text-xl font-semibold">Please select file before inserting the coin.</p>
          </div>
        </div>
      )}


     
    </div>
  );
};

export default Printer;
