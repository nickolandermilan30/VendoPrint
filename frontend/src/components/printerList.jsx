import React, { useEffect, useState } from "react";
import axios from 'axios';

const PrinterList = () => {
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const detectPrinters = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if in Electron environment
        if (typeof window.electron !== 'undefined' && window.electron.printerApi) {
          console.log('Detecting printers...');
          const printerList = await window.electron.printerApi.getPrinters();
          console.log('Detected printers:', printerList);

          setPrinters(printerList);

          if (printerList.length > 0 && !selectedPrinter) {
            setSelectedPrinter(printerList[0].name);
          }
        } else {
          // Fallback to axios API for printers
          console.log('Not in Electron environment');
          axios.get('http://localhost:5173/printers')
            .then(response => {
              setPrinters(response.data);
              if (response.data.length > 0 && !selectedPrinter) {
                setSelectedPrinter(response.data[0].name);
              }
            })
            .catch(error => {
              console.error('Error fetching printers:', error);
              setError('Failed to detect printers. Please check your connection.');
            });
        }
      } catch (error) {
        console.error('Printer detection failed:', error);
        setError('Failed to detect printers. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    detectPrinters();
  }, []); // Empty dependency array to avoid infinite loop

  return (
   <div>
      {isLoading ? (
        <p>Detecting printers...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="flex items-center mt-6 relative">
          <p className="text-2xl font-bold text-[#31304D] mr-4">Distination</p>
          <select
            value={selectedPrinter}
            onChange={(e) => setSelectedPrinter(e.target.value)}
            className="w-64 p-2 border-2 border-[#31304D] rounded-lg text-lg font-bold text-[#31304D]"
          >
            <option value="">Select a printer...</option>
            {Array.isArray(printers) && printers.length > 0 ? (
              printers.map((printer, index) => (
                <option key={index} value={printer.name}>
                  {printer.name} {printer.isDefault ? '(Default)' : ''}
                </option>
              ))
            ) : (
              <option value="">No printers available</option> // Fallback message
            )}

          </select>
        
        </div>
      )}
    </div>
  );
};

export default PrinterList;
