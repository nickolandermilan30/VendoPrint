import React, { useState, useEffect } from "react";

const SmartPriceToggle = ({ paperSize, isColor, copies, totalPages }) => {
  const [isSmartPriceEnabled, setIsSmartPriceEnabled] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(1); 

  
  const calculatePrice = () => {
    let basePrice = 1; 
    if (paperSize === "A4") basePrice += 3;
    if (paperSize === "Letter") basePrice += 2;
    if (paperSize === "Legal") basePrice += 4;
    if (isColor) basePrice += 5; 
    basePrice += Math.min(totalPages * 0.5, 5);
    basePrice += Math.min(copies * 0.3, 3); 
    return Math.min(Math.round(basePrice), 15); 
  };

  // Update price when toggle or settings change
  useEffect(() => {
    if (isSmartPriceEnabled) {
      setCalculatedPrice(calculatePrice());
    }
  }, [isSmartPriceEnabled, paperSize, isColor, copies, totalPages]);

  return (
    <div className="mt-8 flex items-center space-x-4 w-full">
      <h1 className="font-bold text-gray-700 text-2xl">Smart Price:</h1>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isSmartPriceEnabled}
          onChange={() => setIsSmartPriceEnabled(!isSmartPriceEnabled)}
        />
        <div className="w-14 h-7 bg-gray-300 rounded-full peer-checked:bg-[#31304D] peer-checked:border-gray-500 transition-all relative">
          <div
            className={`w-6 h-6 bg-white rounded-full absolute left-1 top-1 transition-transform ${
              isSmartPriceEnabled ? "translate-x-7" : ""
            }`}
          ></div>
        </div>
      </label>
      {isSmartPriceEnabled && (
        <span className="text-lg font-bold text-green-600">₱{calculatedPrice}</span>
      )}
    </div>
  );
};

export default SmartPriceToggle;
