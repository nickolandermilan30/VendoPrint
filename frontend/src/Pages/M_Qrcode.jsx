import React from 'react';
import qrImage from '../assets/img/scan.png'; 

const M_Qrcode = () => {
  return (
    <div className="flex flex-col items-center">
      <p className="text-lg font-semibold text-[#31304D]">Scan this QR Code to share files</p>
      
      {/* QR Code Image */}
      <div className="w-56 h-56 bg-white flex items-center justify-center mt-4 rounded-lg shadow-lg border-2 border-[#31304D]">
        <img src={qrImage} alt="QR Code" className="w-full h-full object-contain" />
      </div>
    </div>
  );
};

export default M_Qrcode;
