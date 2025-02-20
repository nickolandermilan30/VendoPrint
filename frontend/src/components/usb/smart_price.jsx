import React, { useEffect, useState } from "react";
import axios from "axios";

const SmartPriceToggle = ({
  paperSize,
  isColor,
  copies,
  totalPages,
  isSmartPriceEnabled,
  setIsSmartPriceEnabled,
  calculatedPrice,
  setCalculatedPrice,
  selectedPageOption,
  customPageRange
}) => {
  const [error, setError] = useState(null);

  // Function to fetch price from backend
  const fetchPrice = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/calculate-price", {
        paperSize,
        isColor,
        copies,
        totalPages,
        selectedPageOption,
        customPageRange
      });

      if (response.data.success) {
        setCalculatedPrice(response.data.price);
      } else {
        setError("Failed to calculate price");
      }
    } catch (err) {
      console.error("Error fetching price:", err);
      setError("Error fetching price");
    }
  };

  useEffect(() => {
    if (isSmartPriceEnabled) {
      fetchPrice();
    } else {
      // If toggle is off, maybe reset the price or do nothing
      setCalculatedPrice(0);
    }
    // eslint-disable-next-line
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
        <span className="text-lg font-bold text-green-600">
          ₱{calculatedPrice}
        </span>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default SmartPriceToggle;
