import React, { useState, useEffect } from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";

import axios from "axios";

const DocumentPreview = ({ fileUrl, fileName }) => {
 
const fileExtension = fileName?.split(".").pop().toLowerCase();
const docs = [{ uri: fileUrl }];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 w-full">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-lg p-4 flex flex-col items-center">
       
        {/* Document Viewer with Scrollable Container */}
        
              <div className="w-full h-[80vh] overflow-y-auto flex justify-center border border-gray-300 rounded-lg shadow-md p-4">
                  {["jpg", "jpeg", "png", "gif"].includes(fileExtension) ? (
            <img src={fileUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
          ) : fileExtension === "pdf" ? (
            <iframe src={fileUrl} className="w-full h-full" title="PDF Preview"></iframe>
          ) : fileExtension === "docx" ? (
            <iframe src={fileUrl} className="w-full h-full" title="Text Preview"></iframe>
          ) : (
            <p className="text-gray-500">Preview not available for this file type</p>
          )}
          </div>
        
      </div>
    </div>
  );
};

export default DocumentPreview;











