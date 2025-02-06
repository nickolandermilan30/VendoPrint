import { db, realtimeDb, storage } from "../firebase/firebase-config.js";
import { ref, set, get, child } from "firebase/database";
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";

// Add data to Realtime Database
export const addData = async (req, res) => {
  try {
    const newRef = ref(realtimeDb, `users/${Date.now()}`);
    await set(newRef, req.body);
    res.status(200).json({ success: true, message: "Data added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get data from Realtime Database
export const getData = async (req, res) => {
  try {
    const dbRef = ref(realtimeDb);
    const snapshot = await get(child(dbRef, "users"));
    if (snapshot.exists()) {
      res.status(200).json(snapshot.val());
    } else {
      res.status(404).json({ message: "No data found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload file to Firebase Storage
export const uploadFile = async (req, res) => {
  try {
    const { file, filename } = req.body; // Expect base64 file and filename
    if (!file || !filename) {
      return res.status(400).json({ error: "Missing file or filename" });
    }

    const buffer = Buffer.from(file, "base64");
    const fileRef = storageRef(storage, `uploads/${filename}`);

    await uploadBytes(fileRef, buffer);
    const fileUrl = await getDownloadURL(fileRef);

    res.status(200).json({ success: true, url: fileUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
