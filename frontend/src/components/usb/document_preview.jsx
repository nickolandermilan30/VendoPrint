import React from "react";

const DocumentPreview = ({ fileUrl, fileName }) => {
  const fileExtension = fileName?.split(".").pop().toLowerCase();
  const googleDocsViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 w-full">
      <h2 className="text-xl font-bold mb-4 text-[#31304D]">{fileName || "Document Preview"}</h2>

      {/* Document Viewer Container */}
      <div className="w-full h-full overflow-y-auto flex justify-center rounded-lg shadow-md p-4">
        {["jpg", "jpeg", "png", "gif"].includes(fileExtension) ? (
          <img src={fileUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
        ) : fileExtension === "pdf" ? (
          <iframe src={fileUrl} className="w-full h-full" title="PDF Preview"></iframe>
        ) : ["docx", "xlsx", "pptx"].includes(fileExtension) ? (
          <iframe src={googleDocsViewerUrl} className="w-full h-full" title="Office Document Preview"></iframe>
        ) : (
          <p className="text-gray-500">Preview not available for this file type</p>
        )}
      </div>
    </div>
  );
};

export default DocumentPreview;
