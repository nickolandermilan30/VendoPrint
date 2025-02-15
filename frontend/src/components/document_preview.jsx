import React, { useState, useEffect } from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";

import axios from "axios";

const DocumentPreview = ({ fileUrl, fileName}) => {
  if (!fileUrl) {
    return <p className="text-gray-500">No preview available</p>;
  }

  const fileExtension = fileName?.split(".").pop().toLowerCase();



  return (
    <div className="border p-4 rounded-lg shadow-md bg-white w-full h-64 flex items-center justify-center">
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
  );
};

export default DocumentPreview;











