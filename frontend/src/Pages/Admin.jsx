import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import M_Password from './M_Password'; // Import the modal component

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Admin = () => {
  const [showModal, setShowModal] = useState(true); 

  // Data for the Line Chart (Daily Coins)
  const lineData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        label: 'Daily Coins',
        data: [50, 75, 100, 80, 120, 150, 130],
        borderColor: '#31304D',
        backgroundColor: 'rgba(49, 48, 77, 0.2)',
        pointBackgroundColor: '#31304D',
        pointBorderColor: '#31304D',
      },
    ],
  };

  // Data for the Bar Chart (Daily Print)
  const barData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        label: 'Daily Print',
        data: [30, 60, 90, 70, 110, 140, 120],
        backgroundColor: '#31304D',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          borderDash: [5, 5],
        },
      },
    },
  };

  return (
    <div className="p-4 flex flex-col items-center lg:items-start w-full">
      {/* Show modal if showModal is true */}
      {showModal && <M_Password closeModal={() => setShowModal(false)} />}

      <h1 className="text-4xl font-bold text-[#31304D] mb-6 text-center lg:text-left">
        Admin
      </h1>

      {/* Container for the Boxes */}
      <div className="flex flex-col lg:flex-row w-full gap-6">
        {/* Left Box - Daily Coins with Line Graph */}
        <div className="bg-white shadow-lg rounded-2xl p-6 w-full lg:w-1/2 h-auto border-4 border-[#31304D]">
          <h2 className="text-2xl font-semibold text-[#31304D] text-center mb-4">Daily Coins</h2>
          <div className="w-full h-60">
            <Line data={lineData} options={options} />
          </div>
        </div>

        {/* Right Box - Daily Print with Bar Graph */}
        <div className="bg-white shadow-lg rounded-2xl p-6 w-full lg:w-1/2 h-auto border-4 border-[#31304D]">
          <h2 className="text-2xl font-semibold text-[#31304D] text-center mb-4">Daily Print</h2>
          <div className="w-full h-60">
            <Bar data={barData} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
