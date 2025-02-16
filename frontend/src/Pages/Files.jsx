import React, { useState } from "react";

const Files = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert("No file selected! Please choose a file first.");
      return;
    }
    alert(`File "${selectedFile.name}" uploaded successfully!`);
  };

  return (
    <div className="p-4">
      {/* Title Section */}
      <h1 className="text-4xl font-bold text-[#31304D] mb-6 text-center lg:text-left">
        Kiosk Vendo Printer
      </h1>

      {/* Large Box Section */}
      <div className="flex flex-col justify-between w-full h-[600px] bg-gray-200 rounded-lg shadow-md border-4 border-[#31304D] p-6">
        
        {/* Selected File Display (Above Buttons) */}
        <div className="flex items-center justify-center h-90 bg-white border-2 border-[#31304D] rounded-lg p-6 shadow-md">
          {selectedFile ? (
            <p className="text-2xl font-bold text-[#31304D] break-words text-center w-full">
              {selectedFile.name}
            </p>
          ) : (
            <p className="text-2xl font-bold text-[#31304D]">No file chosen</p>
          )}
        </div>

        {/* Bottom - Buttons */}
        <div className="flex flex-col space-y-4">
          {/* Choose File Button */}
          <input
            type="file"
            id="fileInput"
            className="hidden"
            onChange={handleFileSelect}
          />
          <label
            htmlFor="fileInput"
            className="px-6 py-3 bg-[#31304D] text-white text-lg font-bold rounded-lg cursor-pointer shadow-md text-center"
          >
            Choose File
          </label>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            className="px-6 py-3 bg-green-600 text-white text-lg font-bold rounded-lg shadow-md text-center"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default Files;
