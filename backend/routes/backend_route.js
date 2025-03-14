// BackendRoutes.js
import express from 'express';
import { addData, getData } from '../controller/firebase_controller.js';
// I-import natin ang mga handler na bagong pangalan
import { getPrintersHandler, printFileHandler } from '../printer/printer_controller.js';

const BackendRoutes = express.Router();

// Firebase Routes
BackendRoutes.post('/add-data', addData);
BackendRoutes.get('/get-files', getData);

// Printer Routes
BackendRoutes.get('/printers', getPrintersHandler);
BackendRoutes.post('/print', printFileHandler);

export default BackendRoutes;
