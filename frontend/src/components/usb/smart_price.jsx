import React, { useEffect } from "react";

function SmartPriceLabel({
  isColor,
  copies,
  totalPages,
  calculatedPrice,
  setCalculatedPrice,
  customPageRange,
  selectedPageOption
}) {
  useEffect(() => {

    const pricePerPage = isColor ? 7.75 : 14.75;
    const oddPagesCount = Math.ceil(totalPages / 2);  
    const evenPagesCount = Math.floor(totalPages / 2);


  let pagesToPrint = totalPages;

  if (selectedPageOption === "Odd") {
     pagesToPrint = oddPagesCount;
    } else if (selectedPageOption === "Even") {
      pagesToPrint = evenPagesCount;
   } else if (selectedPageOption === "Custom" && customPageRange) {

     const customPages = customPageRange
       .split(",")
       .flatMap((range) => {
        if (range.includes("-")) {
          const [start, end] = range.split("-").map(Number);
          return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        } else {
      return [parseInt(range, 10)];
    }
 });

console.log("Custom Pages:", customPages);

 pagesToPrint = customPages.length;
 } else if (selectedPageOption === "All") {
 
 pagesToPrint = totalPages;
}


  const totalCost = pricePerPage * copies * pagesToPrint;

  

    setCalculatedPrice(totalCost);
  }, [isColor, copies, totalPages, setCalculatedPrice,customPageRange, selectedPageOption]);

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
