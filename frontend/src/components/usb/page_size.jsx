import React, { useState } from "react";

const PageSize = ({ selectedSize, setSelectedSize }) => {
  // If you have custom width/height logic, you can track them here or pass them from parent as well.
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");

  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  return (
    <div className="flex flex-col space-y-4 mt-6">
      <div className="flex items-center space-x-4">
        <p className="text-2xl font-bold text-[#31304D]">Size:</p>
        <select
          className="w-72 p-2 border-2 border-[#31304D] rounded-lg text-lg font-bold text-[#31304D]"
          value={selectedSize}
          onChange={(e) => handleSizeChange(e.target.value)}
        >
          <option>Letter 8.5 x 11</option>
          <option>A4 8.3 x 11.7</option>
          <option>Legal 8.5 x 14</option>
          <option>Executive 7.25 x 10.5</option>
          <option>Tabloid 11 x 17</option>
          <option>Statement 5.5 x 8.5</option>
          <option>B5 6.9 x 9.8</option>
          <option>Custom</option>
        </select>
      </div>

      {selectedSize === "Custom" && (
        <div className="flex space-x-4">
          <div className="flex flex-col">
            <label className="text-lg font-semibold text-[#31304D]">Width (inches):</label>
            <input
              type="number"
              step="0.1"
              value={customWidth}
              onChange={(e) => {
                setCustomWidth(e.target.value);
                // Handle how you store the custom size in parent if needed
              }}
              className="w-32 p-2 border-2 border-[#31304D] rounded-lg text-lg font-bold text-[#31304D]"
              placeholder="Width"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-lg font-semibold text-[#31304D]">Height (inches):</label>
            <input
              type="number"
              step="0.1"
              value={customHeight}
              onChange={(e) => {
                setCustomHeight(e.target.value);
                // Handle how you store the custom size in parent if needed
              }}
              className="w-32 p-2 border-2 border-[#31304D] rounded-lg text-lg font-bold text-[#31304D]"
              placeholder="Height"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PageSize;
