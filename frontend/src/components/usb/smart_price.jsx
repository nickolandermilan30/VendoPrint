import React, { useEffect } from "react";

function SmartPriceLabel({
  isColor,
  copies,
  totalPages,
  calculatedPrice,
  setCalculatedPrice,
}) {
  useEffect(() => {

    const pricePerPage = isColor ? 10 : 5;

  
    const totalCost = totalPages * copies * pricePerPage;

    setCalculatedPrice(totalCost);
  }, [isColor, copies, totalPages, setCalculatedPrice]);

  return (
    <div className="mt-8 flex items-center space-x-4 w-full">
      <h1 className="font-bold text-gray-700 text-2xl">Smart Price:</h1>
      <span className="text-lg font-bold text-green-600">
        ₱{calculatedPrice.toFixed(2)}
      </span>
    </div>
  );
}

export default SmartPriceLabel;
