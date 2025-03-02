import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebase/firebase_config";
import { PDFDocument } from "pdf-lib";
import mammoth from "mammoth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const FileUpload = () => {
  const [fileToUpload, setFileToUpload] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

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
        try {
          const pdfData = new Uint8Array(e.target.result);
          const pdfDoc = await PDFDocument.load(pdfData);
          setTotalPages(pdfDoc.getPageCount());
        } catch (error) {
          console.error("Error processing PDF:", error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
          setTotalPages(Math.ceil(result.value.length / 1000));
        } catch (error) {
          console.error("Error reading docx file:", error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setTotalPages(1);
    }
  };


  const uploadFileToFirebase = async () => {
    if (!fileToUpload) {
      alert("No file selected for upload!");
      return;
    }
  
    setIsUploading(true); 
    const storageRef = ref(storage, `uploads/${fileToUpload.name}`);
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload);
  
    uploadTask.on(
      "state_changed",
      null,
      (error) => {
        console.error("Upload failed:", error);
        setIsUploading(false);
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at:", url);
          setIsUploading(false);
  
     
          navigate("/printer", { state: { fileName: fileToUpload.name, fileUrl: url } });
        } catch (error) {
          console.error("Error getting download URL:", error);
          setIsUploading(false);
        }
      }
    );
  };
  

  return (
    <div className="min-h-screen flex items-center   justify-center text-white">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg w-96 text-center">
        <h2 className="text-lg font-semibold mb-4">Upload Your File</h2>
        <label className="block w-full p-4 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer hover:border-gray-400">
          <input type="file" className="hidden" onChange={handleFileSelect} />
          <p className="text-gray-300">Click or drag a file here to upload</p>
        </label>

        {fileToUpload && (
          <div className="mt-4 text-gray-400">
            <p className="text-sm">Selected file:</p>
            <p className="font-medium">{fileToUpload.name}</p>
            <p className="text-sm">Estimated Pages: {totalPages}</p>
          </div>
        )}

            <button
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full transition flex justify-center items-center"
              onClick={uploadFileToFirebase}
              disabled={isUploading}
            >
              Upload
              {isUploading && <FontAwesomeIcon icon={faSpinner} spin className="ml-2" />}
            </button>



        {filePreviewUrl && (
          <div className="mt-4">
            <p className="text-sm text-gray-400">File URL:</p>
            <a href={filePreviewUrl} className="text-blue-400 break-words" target="_blank" rel="noopener noreferrer">
              {filePreviewUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
