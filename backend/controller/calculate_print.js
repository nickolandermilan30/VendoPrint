export const calculatePrintPrice = (req, res) => {
  try {
    const { isColor, copies } = req.body;

    // Base price for single copy
    const basePrice = isColor ? 14.50 : 6.75;

    // Multiply by copies
    const finalPrice = basePrice * copies;

    return res.json({ success: true, price: parseFloat(finalPrice.toFixed(2)) });
  } catch (error) {
    console.error("Error calculating price:", error);
    res.status(500).json({ success: false, message: "Error calculating price" });
  }
};
