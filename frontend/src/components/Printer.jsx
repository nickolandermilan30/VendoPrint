import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";  
import { realtimeDb } from '../../../backend/firebase/firebase-config'; 
import { ref, onValue, remove, update } from "firebase/database"
import vectorImage1 from '../assets/Icons/Vector 1.png'; 
import vectorImage2 from '../assets/Icons/Vector 2.png'; 
import vectorImage3 from '../assets/Icons/Vector 3.png'; 
import vectorImage4 from '../assets/Icons/Vector 4.png'; 
import M_Qrcode from './M_Qrcode';

const Printer = () => {
  const navigate = useNavigate();            
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const queueRef = ref(realtimeDb, "files");
    const unsubscribe = onValue(queueRef, (snapshot) => {
      const data = snapshot.val();
      console.log("🔥 Data fetched from Firebase:", data);

      if (data) {
        const updatedQueue = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));


        updatedQueue.forEach((file) => {
          if (file.status === "Done") {
            console.log(`✅ Removing file: ${file.name} (ID: ${file.id})`);
            remove(ref(realtimeDb, `files/${file.id}`));
          }
        });

       
        setQueue(updatedQueue.filter(file => file.status !== "Done"));
      } else {
        setQueue([]);
      }
    });

    return () => unsubscribe();
  }, []);

  
  const startPrinting = (fileId) => {
    update(ref(realtimeDb, `files/${fileId}`), { status: "Processing" });

    setTimeout(() => {
      update(ref(realtimeDb, `files/${fileId}`), { status: "Done" });
    }, 5000);
  };

  return (
    <div className="p-4 flex flex-col lg:flex-row items-center lg:items-start h-full min-h-screen">
      <div className="w-full lg:flex-1">
        <h1 className="text-4xl font-bold text-[#31304D] mb-6 text-center lg:text-left">
          Kiosk Vendo Printer
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Xerox */}
          <Link to="/xerox">
            <div className="flex flex-col items-center cursor-pointer">
              <div className="w-full max-w-xs h-48 bg-gray-100 flex items-center justify-center text-xl font-bold rounded-lg border-4 border-[#31304D] shadow-md">
                <img src={vectorImage1} alt="Xerox" className="w-24 h-24" />
              </div>
              <p className="text-2xl font-bold text-[#31304D] mt-2">Xerox</p>
            </div>
          </Link>

         
          <div 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => navigate('/bt-upload')}
          >
            <div className="w-full max-w-xs h-48 bg-gray-100 flex items-center justify-center text-xl font-bold rounded-lg border-4 border-[#31304D] shadow-md">
              <img src={vectorImage2} alt="Bluetooth" className="w-24 h-24" />
            </div>
            <p className="text-2xl font-bold text-[#31304D] mt-2">Bluetooth</p>
          </div>

  
          <Link to="/usb">
            <div className="flex flex-col items-center cursor-pointer">
              <div className="w-full max-w-xs h-48 bg-gray-100 flex items-center justify-center text-xl font-bold rounded-lg border-4 border-[#31304D] shadow-md">
                <img src={vectorImage3} alt="USB" className="w-24 h-24" />
              </div>
              <p className="text-2xl font-bold text-[#31304D] mt-2">USB</p>
            </div>
          </Link>

      
          <div 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="w-full max-w-xs h-48 bg-gray-100 flex items-center justify-center text-xl font-bold rounded-lg border-4 border-[#31304D] shadow-md">
              <img src={vectorImage4} alt="Share files via QR" className="w-24 h-24" />
            </div>
            <p className="text-2xl font-bold text-[#31304D] mt-2">Share files via QR</p>
          </div>
        </div>
      </div>


      <div className="w-full lg:w-64 h-auto lg:h-[90vh] bg-gray-400 mt-6 lg:mt-0 lg:ml-6 rounded-lg shadow-md flex flex-col items-center p-4">
        <h2 className="text-xl font-bold">Printer Queue</h2>
        <div className="flex-1 flex items-center justify-center w-full">
          {queue.length === 0 ? (
            <p>No files in the queue</p>
          ) : (
            <ul>
              {queue.map((file) => (
                <li key={file.id}>
                  <strong>{file.name}</strong> - {file.status}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal for QR */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-30 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 text-center">Share files via QR</h2>
            <M_Qrcode />
            <button 
              className="mt-6 bg-red-500 text-white px-6 py-3 rounded-lg w-3/4 text-center font-bold"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Printer;
