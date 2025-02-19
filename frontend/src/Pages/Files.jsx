import React, { useState } from "react";

const Files = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [copies, setCopies] = useState(1);
  const [size, setSize] = useState("Letter 8.5 x 11 (Short)");
  const [pages, setPages] = useState("All");
  const [color, setColor] = useState("Color");
  const [orientation, setOrientation] = useState("Portrait");

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
    <div className="p-4 flex flex-col lg:flex-row gap-4">
      {/* Left Section - File Upload */}
      <div className="w-full lg:w-1/3 bg-gray-200 p-6 rounded-lg shadow-md border-[6px] border-[#31304D]">
        <h2 className="text-2xl font-extrabold mb-4">Choose File</h2>
        <input type="file" onChange={handleFileSelect} className="mb-4 w-full bg-white border-[2px] rounded p-2" />
        <button 
          onClick={handleUpload} 
          className="w-full bg-[#31304D] text-white py-2 rounded-lg shadow-md hover:bg-[#23203A] font-bold"
        >
          Upload
        </button>
        <div className="mt-4 flex items-center">
          <p className="text-xl font-bold mr-2">Copies:</p>
          <button 
            onClick={() => setCopies(Math.max(1, copies - 1))} 
            className="px-3 py-1 bg-gray-400 text-white rounded-lg font-bold"
          >
            -
          </button>
          <input 
            type="number" 
            min="1" 
            value={copies} 
            readOnly 
            className="w-12 mx-2 text-center border-[2px] rounded p-1 bg-white"
          />
          <button 
            onClick={() => setCopies(copies + 1)} 
            className="px-3 py-1 bg-gray-400 text-white rounded-lg font-bold"
          >
            +
          </button>
        </div>
        <div className="mt-2">
          <p className="text-xl font-bold">Size:</p>
          <select 
            value={size} 
            onChange={(e) => setSize(e.target.value)} 
            className="w-full border-[2px] rounded p-2 bg-white appearance-none"
          >
            <option value="A4 8.3 x 11.7 (A4)">A4 8.3 x 11.7 (A4)</option>
            <option value="Letter 8.5 x 11 (Short)">Letter 8.5 x 11 (Short)</option>
          </select>
        </div>
        <div className="mt-2">
          <p className="text-xl font-bold">Pages:</p>
          <select 
            value={pages} 
            onChange={(e) => setPages(e.target.value)} 
            className="w-full border-[2px] rounded p-2 bg-white appearance-none"
          >
            <option value="All">All</option>
            <option value="Odd pages only">Odd pages only</option>
            <option value="Even pages only">Even pages only</option>
            <option value="Custom">Custom</option>
          </select>
        </div>
        <div className="mt-2">
          <p className="text-xl font-bold">Color:</p>
          <select 
            value={color} 
            onChange={(e) => setColor(e.target.value)} 
            className="w-full border-[2px] rounded p-2 bg-white appearance-none"
          >
            <option value="Color">Color</option>
            <option value="Black and White">Black and White</option>
          </select>
        </div>
        <div className="mt-2">
          <p className="text-xl font-bold">Orientation:</p>
          <select 
            value={orientation} 
            onChange={(e) => setOrientation(e.target.value)} 
            className="w-full border-[2px] rounded p-2 bg-white appearance-none"
          >
            <option value="Portrait">Portrait</option>
            <option value="Landscape">Landscape</option>
          </select>
        </div>
        <div className="mt-4 flex gap-4">
          <button className="w-1/2 bg-blue-600 text-white py-2 rounded-lg shadow-md font-bold hover:bg-blue-700">Smart Price</button>
          <button className="w-1/2 bg-green-600 text-white py-2 rounded-lg shadow-md font-bold hover:bg-green-700">Print</button>
        </div>
      </div>

      {/* Right Section - Preview */}
      <div className="w-full lg:w-2/3 bg-gray-200 p-6 rounded-lg shadow-md border-[6px] border-[#31304D] flex items-center justify-center">
        <div className="w-full h-[400px] flex items-center justify-center border-[3px] border-gray-400">
          <p className="text-gray-500 text-3xl font-extrabold">Preview not available for this file type</p>
        </div>
      </div>
    </div>
  );
};

export default Files;
