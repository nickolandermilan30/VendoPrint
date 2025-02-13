import express from "express";
import { addData, getData, uploadFile } from "../controller/firebase_controller.js";
import UsbList from "../controller/usd_drives_controller.js";
import upload from "../cloudinarry/multer_cloudinarry.js";

const BackendRoutes = express.Router();
// Firebase Route
BackendRoutes.post("/add-data", addData);
BackendRoutes.get("/get-files", getData);
BackendRoutes.post("/upload", upload.single("file"), uploadFile); //Cloudinarry

//USB Drive
BackendRoutes.get("/usb-files", UsbList);
export default BackendRoutes;
