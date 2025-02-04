import express from 'express';
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.get("/", (req,res) => {
res.send("Welcome to the server");
})
app.listen(5000, () => {
    console.log("server started at http://localhost:5000");
});