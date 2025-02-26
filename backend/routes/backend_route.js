import express from "express";
import { addData, getData } from "../controller/firebase_controller.js";
import UsbList from "../controller/usd_drives_controller.js";
// import upload from "../cloudinarry/multer_cloudinarry.js";
import { fetchPrinters, printFile } from "../printer/printer_controller.js";


const BackendRoutes = express.Router();
// Firebase Route
BackendRoutes.post("/add-data", addData);
BackendRoutes.get("/get-files", getData);
// BackendRoutes.post("/upload", upload.single("file"), uploadFile); 
//Printer
BackendRoutes.get("/printers", fetchPrinters);
BackendRoutes.post("/print", printFile);
//USB Drive
BackendRoutes.get("/usb-files", UsbList);
export default BackendRoutes;
