import express from "express";
import { addData, getData, uploadFile } from "../controller/controller.js";

const BackendRoutes = express.Router();

router.post("/add-data", addData);
router.get("/get-data", getData);
router.post("/upload", uploadFile);

export default BackendRoutes;
