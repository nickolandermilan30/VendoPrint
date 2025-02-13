import React, { useState, useEffect } from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import axios from "axios";



const DocumentPreview = ({ file }) => {
  const [filePreviewUrl, setFilePreviewUrl] = useState("");

  useEffect(() => {
    console.log("useEffect triggered with file:", file);
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    console.log("Generated file URL:", fileUrl);
    setFilePreviewUrl(fileUrl);

    // Upload file to backend
    const uploadFile = async () => {
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
          const response = await axios.post("http://localhost:5000/api/add-data", {
            filename: file.name,
            fileContent: reader.result.split(",")[1],
          });
          console.log("File uploaded:", response.data);
        };
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    };

    uploadFile();
  }, [file]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 w-full">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-lg p-4 flex flex-col items-center">
        {/* If No File is Uploaded */}
        {!filePreviewUrl && (
          <div className="w-full max-w-3xl h-96 flex items-center justify-center border border-gray-300 rounded-lg shadow-md bg-gray-50">
            <p className="text-gray-500 text-lg">No file selected. Please upload a file.</p>
          </div>
        )}

        {/* Document Viewer with Scrollable Container */}
        {filePreviewUrl && (
          <div className="w-full h-[80vh] overflow-y-auto flex justify-center border border-gray-300 rounded-lg shadow-md p-4">
            <DocViewer
              documents={[{ uri: filePreviewUrl, fileName: file.name }]}
              pluginRenderers={DocViewerRenderers}
              config={{
                header: { disableHeader: false },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentPreview;











