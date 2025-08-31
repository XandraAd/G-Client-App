import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { db, Timestamp } from "../firebase-admin.js";

dotenv.config();

const router = express.Router();

// --- Email (Gmail + App Password recommended) ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

transporter.verify()
  .then(() => console.log("✅ Email server ready"))
  .catch((err) => console.error("❌ Email config error:", err));

// --- OTP helpers ---
const OTP_COLLECTION = "otp-verifications";
const OTP_EXPIRY_MIN = 5;

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const saveOTP = async (email, otp) => {
  await db.collection(OTP_COLLECTION).doc(email).set({
    otp,
    verified: false,
    expiresAt: Timestamp.fromDate(new Date(Date.now() + OTP_EXPIRY_MIN * 60 * 1000)),
    createdAt: Timestamp.now(),
  });
};

// =============== SEND OTP ===============
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const otp = generateOTP();

    await Promise.all([
      transporter.sendMail({
        from: `"No-Reply" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Verification Code",
        html: `Your OTP is <b>${otp}</b>. It expires in ${OTP_EXPIRY_MIN} minutes.`,
      }),
      saveOTP(email, otp),
    ]);

    res.json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error("OTP Error:", error);
    res.status(500).json({ error: "Could not send OTP" });
  }
});

// =============== VERIFY OTP & CREATE USER ===============
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;  // 🔥 no password expected

    const docRef = db.collection(OTP_COLLECTION).doc(email);
    const doc = await docRef.get();

    if (!doc.exists) return res.status(404).json({ error: "OTP not found" });

    const data = doc.data();
    const now = Timestamp.now();

    if (data.verified) return res.status(400).json({ error: "Already verified" });
    if (data.otp !== otp) return res.status(401).json({ error: "Invalid OTP" });
    if (now > data.expiresAt) return res.status(410).json({ error: "OTP expired" });

    // ✅ Mark OTP verified
    await docRef.update({ verified: true });

    // ✅ Lookup existing user in Firebase Auth
    const userRecord = await admin.auth().getUserByEmail(email);

    // ✅ Sync Firestore user record
    const usersRef = db.collection("users").doc(userRecord.uid);
    await usersRef.set({ emailVerified: true }, { merge: true });

    return res.json({ success: true, uid: userRecord.uid });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;
