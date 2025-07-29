// index.js (your Express server entry point)
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import otpRoutes from "./routes/otp.js"; 
import tracksRouter from "./routes/tracks.js"  // your OTP handler
//import { db } from "./firebase-admin.js";// Firestore config
import dotenv from "dotenv" 
//import nodemailer from "nodemailer"

dotenv.config()
const app = express();
const PORT = 5000;


// ✅ CORS: Allow requests from React app
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));


//API Routes
app.use("/api/auth", otpRoutes);
app.use('/api/tracks', tracksRouter);

// Health check
app.get("/", (req, res) => {
  res.send("🚀 Backend running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
