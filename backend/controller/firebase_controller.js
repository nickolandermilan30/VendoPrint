import { db, realtimeDb, storage } from "../firebase/firebase-config.js";
import { ref, set, get, child } from "firebase/database";
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";

// Add data to Realtime Database
export const addData = async (req, res) => {
  try {
    // Log the incoming request body
    console.log('Incoming request body:', req.body);

    const { filename, fileContent } = req.body;

    // Validate request data
    if (!filename || !fileContent) {
      console.error('Missing filename or file content:', { filename, fileContent });
      return res.status(400).json({ error: 'Filename and file content are required!' });
    }

    const timestamp = Date.now();
    const newRef = ref(realtimeDb, `files/${timestamp}`);

    // Log the data being set to Realtime Database
    console.log('Setting data in Realtime Database:', { filename, fileContent });

    // Save to Realtime Database
    await set(newRef, { filename, fileContent });

    // Success response
    console.log('File uploaded successfully!');
    res.status(200).json({ success: true, message: 'File uploaded successfully!' });
  } catch (error) {
    // Log any errors
    console.error('Error in addData function:', error.message);
    res.status(500).json({ error: error.message });
  }
};



// Get data from Realtime Database
export const getData = async (req, res) => {
  try {
    const dbRef = ref(realtimeDb, 'files'); 
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      res.status(200).json(snapshot.val()); 
    } else {
      res.status(404).json({ message: 'No files found!' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Upload file to Firebase Storage
export const uploadFile = async (req, res) => {
  try {
    const { file, filename } = req.body; 
    if (!file || !filename) {
      return res.status(400).json({ error: "Missing file or filename" });
    }

    const buffer = Buffer.from(file, "base64");
    const fileRef = storageRef(storage, `uploads/${filename}`);

    await uploadBytes(fileRef, buffer);
    const fileUrl = await getDownloadURL(fileRef);

    const fileMetadataRef = ref(realtimeDb, `files/${Date.now()}`);
    await set(fileMetadataRef, { filename, url: fileUrl }); 

    res.status(200).json({ success: true, url: fileUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
