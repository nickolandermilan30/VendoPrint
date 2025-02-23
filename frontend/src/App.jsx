import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Layout from "./components/usb/Layout";
import Printer from "./Pages/Printer"; 
import Xerox from "./Pages/Xerox"; 
import Settings from "./Pages/Admin"; 
import Usb from "./Pages/Usb"; 
import QRUpload from "./Pages/Qr_Files";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Redirect root path "/" to "/printer" */}
        <Route path="/" element={<Navigate to="/printer" replace />} />

        {/* Wrap all routes in Layout for consistent sidebar */}
        <Route path="/" element={<Layout />}>
          <Route path="/printer" element={<Printer />} />
          <Route path="/xerox" element={<Xerox />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/usb" element={<Usb />} /> 
          <Route path ="/qr-upload" element = {<QRUpload />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;