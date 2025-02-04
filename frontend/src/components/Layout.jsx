import React from "react";
import Sidebar from "../Pages/Home"; // Import the Sidebar
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex">
      <Sidebar /> {/* Sidebar always visible */}
      <div className="flex-1 p-4">
        <Outlet /> {/* This will load Printer, Xerox, or Settings dynamically */}
      </div>
    </div>
  );
};

export default Layout;
