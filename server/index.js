import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import admin from "firebase-admin";
import dotenv from "dotenv";
import { getFirestore } from "firebase-admin/firestore";
import { deployFirestoreRules } from "./firebase-admin.js";


// Routes
import otpRoutes from "./routes/otp.js";
import tracksRouter from "./routes/tracks.js";
import coursesRouter from "./routes/courses.js";
import invoicesRouter from "./routes/invoices.js";
import learnersRouter from "./routes/learners.js";
import reportRouter from "./routes/report.js";
import cartRouter from "./routes/cart.js"
import paymentRouter from "./routes/payment.js"


// Initialize environment variables
dotenv.config();

deployFirestoreRules().catch(console.error);

// Firebase Admin Initialization
function initializeFirebase() {
  try {
    if (!admin.apps.length) {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      };

      // Validate service account
      if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error("Missing Firebase service account configuration");
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });

      console.log("🔥 Firebase Admin initialized successfully");
    }
    return getFirestore();
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error);
    process.exit(1);
  }
}

// Initialize Firebase and get db instance
const db = initializeFirebase();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || "http://localhost:5173", 
  credentials: true 
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use("/api/auth", otpRoutes);
app.use("/api/tracks", tracksRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/learners", learnersRouter);
app.use("/api/report", reportRouter);
app.use("/api/cart",cartRouter)
app.use("/api/payment",paymentRouter)


// Health Check
app.get("/", (req, res) => {
  res.json({ 
    status: "running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    firebase: {
      project: process.env.FIREBASE_PROJECT_ID,
      initialized: admin.apps.length > 0
    }
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("⚠️ Server error:", err.stack);
  res.status(500).json({ 
    error: "Internal Server Error",
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`
    🚀 Server running in ${process.env.NODE_ENV || "development"} mode
    🔗 URL: http://localhost:${PORT}
    📅 ${new Date().toLocaleString()}
    🔥 Firebase ${admin.apps.length > 0 ? 'initialized' : 'not initialized'}
  `);
});

// Export for testing
export { app, db };