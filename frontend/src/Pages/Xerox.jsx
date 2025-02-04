import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const Xerox = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [copies, setCopies] = useState(1); // State for copy count
  const [selectedSize, setSelectedSize] = useState("Letter"); // State for selected size
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown open/close

  // Function to increase copies
  const increaseCopies = () => setCopies(prev => prev + 1);

  // Function to decrease copies, ensuring it doesn't go below 1
  const decreaseCopies = () => setCopies(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="p-4">
      {/* Title */}
      <h1 className="text-4xl font-bold text-[#31304D] mb-6 text-center lg:text-left">
        Kiosk Vendo Printer
      </h1>

      {/* Large, Taller Box with Top-Left Text & Back Button */}
      <div className="w-full h-[500px] bg-gray-200 rounded-lg shadow-md border-4 border-[#31304D] flex flex-col justify-between p-6">
        {/* Top Section: Back Button & Xerox Text */}
        <div>
          <div className="flex items-center">
            {/* Back Button */}
            <button 
              className="w-10 h-10 bg-gray-200 text-[#31304D] flex items-center justify-center rounded-lg border-2 border-[#31304D] mr-4"
              onClick={() => navigate(-1)} // Navigate back
            >
              <FaArrowLeft className="text-2xl text-[#31304D]" /> {/* Colored Icon */}
            </button>

            {/* Xerox Text */}
            <p className="text-3xl font-bold text-[#31304D]">Xerox</p>
          </div>

          {/* Copies Counter Section */}
          <div className="flex items-center mt-10">
            {/* Copies Text */}
            <p className="text-2xl font-bold text-[#31304D] mr-4">Copies:</p>

            {/* Counter Box */}
            <div className="flex items-center space-x-4">
              {/* Minus Button */}
              <button
                className="w-8 h-8 bg-gray-200 text-[#31304D] flex items-center justify-center rounded-lg border-2 border-[#31304D] text-2xl"
                onClick={decreaseCopies}
              >
                −
              </button>

              {/* Number Display Inside Box */}
              <div className="w-14 h-10 flex items-center justify-center bg-gray-200 border-2 border-[#31304D] rounded-lg">
                <span className="text-3xl font-bold text-[#31304D]">{copies}</span>
              </div>

              {/* Plus Button */}
              <button
                className="w-8 h-8 bg-gray-200 text-[#31304D] flex items-center justify-center rounded-lg border-2 border-[#31304D] text-2xl"
                onClick={increaseCopies}
              >
                +
              </button>
            </div>
          </div>

          {/* Size Dropdown Section */}
          <div className="flex items-center mt-6 relative">
            {/* Size Text */}
            <p className="text-2xl font-bold text-[#31304D] mr-4">Size:</p>

            {/* Dropdown Box */}
            <div className="relative w-70">
              <div 
                className="flex items-center justify-between bg-white border-2 border-[#31304D] rounded-lg text-[#31304D] text-lg font-bold p-2 cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle dropdown
              >
                <span>{selectedSize === "Letter" ? "Letter 8.5 x 11 (Short)" : "A4 8.3 x 11.7 (A4)"}</span>
                {isDropdownOpen ? (
                  <FaChevronUp className="text-lg text-[#31304D] ml-2" />
                ) : (
                  <FaChevronDown className="text-lg text-[#31304D] ml-2" />
                )}
              </div>
              {/* Dropdown Options */}
              {isDropdownOpen && (
                <div className="absolute left-0 w-full bg-gray-100 border-2 border-[#31304D] rounded-lg mt-2 shadow-md z-10">
                  <div 
                    className="p-2 cursor-pointer hover:bg-gray-300 text-[#31304D] font-bold"
                    onClick={() => {
                      setSelectedSize("Letter");
                      setIsDropdownOpen(false);
                    }}
                  >
                    Letter 8.5 x 11 (Short)
                  </div>
                  <div 
                    className="p-2 cursor-pointer hover:bg-gray-300 text-[#31304D] font-bold"
                    onClick={() => {
                      setSelectedSize("A4");
                      setIsDropdownOpen(false);
                    }}
                  >
                    A4 8.3 x 11.7 (A4)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="mt-10">
          <button 
            className="w-40 h-12 bg-[#31304D] text-white text-xl font-bold rounded-lg hover:bg-gray-900 transition"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Xerox;
