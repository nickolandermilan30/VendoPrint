import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Layout from "./components/Layout"; // Layout with Sidebar
import Printer from "./Pages/Printer"; // Printer page
import Xerox from "./Pages/Xerox"; // Xerox page
import Settings from "./Pages/Admin"; // Settings page
import Usb from "./Pages/Usb"; // USB page

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
          <Route path="/usb" element={<Usb />} /> {/* New USB route */}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
