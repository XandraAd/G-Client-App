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
import cartRouter from "./routes/cart.js";
import paymentRouter from "./routes/payment.js";

// Load environment variables
dotenv.config();

// Deploy Firestore rules
deployFirestoreRules().catch(console.error);

// Firebase Admin Initialization
function initializeFirebase() {
  try {
    if (!admin.apps.length) {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      };

      if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error("Missing Firebase service account configuration");
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });

      console.log("🔥 Firebase Admin initialized successfully");
    }
    return getFirestore();
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error);
    process.exit(1);
  }
}

const db = initializeFirebase();

// Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://g-client-app.vercel.app" // your Vercel frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));


// Middleware to verify Firebase ID token
const verifyToken = async (req, res, next) => {
  try{
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const idToken = authHeader.split(" ")[1];

  
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

// ✅ Route to check role (frontend calls this after login)
app.get("/api/admin/check-role", verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User record not found" });
    }

    const userData = userDoc.data();
    const isAdmin = userData.isAdmin === true;

    res.json({ isAdmin });
  } catch (error) {
    console.error("Role check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Example admin-only route
app.get("/api/admin/reports", verifyToken, async (req, res) => {
  if (!req.user.admin) {
    return res.status(403).json({ error: "Admins only" });
  }

  // Example data – replace with Firestore query if needed
  const reports = [
    { id: 1, title: "Track Progress Report", date: new Date().toISOString() },
    { id: 2, title: "Course Enrollment Report", date: new Date().toISOString() },
  ];

  res.json(reports);
});

// API Routes
app.use("/api/auth", otpRoutes);
app.use("/api/tracks", tracksRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/learners", learnersRouter);
app.use("/api/report", reportRouter);
app.use("/api/cart", cartRouter);
app.use("/api/payment", paymentRouter);

// Health Check
app.get("/", (req, res) => {
  res.json({
    status: "running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    firebase: {
      project: process.env.FIREBASE_PROJECT_ID,
      initialized: admin.apps.length > 0,
    },
  });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error("⚠️ Server error:", err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start Server
// Keep your existing app.listen for local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`
      🚀 Server running in ${process.env.NODE_ENV || "development"} mode
      🔗 URL: http://localhost:${PORT}
      📅 ${new Date().toLocaleString()}
      🔥 Firebase ${admin.apps.length > 0 ? 'initialized' : 'not initialized'}
    `);
  });
}

// ✅ Export for Vercel
export default app;
export { db };

