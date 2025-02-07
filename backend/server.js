import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import BackendRoutes from "./routes/backend_route.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for frontend requests

// Use Firebase routes
app.use("/api", BackendRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Firebase-integrated server");
});

const PORT = process.env.VITE_PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${VITE_PORT}`);
});
