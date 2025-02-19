export const calculatePrintPrice = (req, res) => {
  try {
    const { isColor, copies, totalPages, selectedPageOption, customPageRange } = req.body;

    // Base price per page
    const basePrice = isColor ? 14.50 : 6.75;

    // Determine the number of pages to print
    let pagesToPrint = totalPages;

    if (selectedPageOption === "Odd") {
      pagesToPrint = Math.ceil(totalPages / 2); // Approximate count of odd pages
    } else if (selectedPageOption === "Even") {
      pagesToPrint = Math.floor(totalPages / 2); // Approximate count of even pages
    } else if (selectedPageOption === "Custom" && customPageRange) {
      // Parse custom page range (e.g., "1-3,5,7-9")
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

      pagesToPrint = customPages.length;
    }

    // Calculate final price
    const finalPrice = basePrice * copies * pagesToPrint;

    return res.json({ success: true, price: parseFloat(finalPrice.toFixed(2)) });
  } catch (error) {
    console.error("Error calculating price:", error);
    res.status(500).json({ success: false, message: "Error calculating price" });
  }
};
