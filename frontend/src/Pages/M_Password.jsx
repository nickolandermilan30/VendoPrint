import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const M_Password = ({ closeModal }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (password === 'admin123') {
      closeModal();
      navigate('/settings'); // Redirect to Admin page
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-30 backdrop-blur-sm z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold text-[#31304D] mb-4">Enter Password</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31304D]"
          placeholder="Enter your password"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <div className="mt-4 flex justify-end">
          <button
            className="px-4 py-2 bg-[#31304D] text-white rounded-lg hover:bg-opacity-80"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default M_Password;
