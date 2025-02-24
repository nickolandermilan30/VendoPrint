import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Layout from "./components/usb/Layout";
import Printer from "./components/Printer"; 
import Xerox from "./Pages/Xerox"; 
import Settings from "./Pages/Admin"; 
import Usb from "./Pages/Usb"; 

const App = () => {
  return (
    <Router>
      <Routes>
   
        <Route path="/" element={<Navigate to="/printer" replace />} />
        <Route path="/" element={<Layout />}>
          <Route path="/printer" element={<Printer />} />
          <Route path="/xerox" element={<Xerox />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/usb" element={<Usb />} />
          {/* <Route path="/files" element={<Files />} />  */}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;