import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from "dotenv"
import { db, Timestamp } from "../firebase-admin.js"; // Consolidated imports


dotenv.config();
const router = express.Router();

// ======================
// 1. Email Configuration
// ======================
const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true, // Enable connection pooling
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Startup check
transporter.verify()
  .then(() => console.log('✅ Email server ready'))
  .catch(err => console.error('❌ Email config error:', err));

// ======================
// 2. OTP Core Functions
// ======================
const OTP_COLLECTION = "otp-verifications";
const OTP_EXPIRY_MIN = 5;

const generateOTP = () => Math.floor(10000 + Math.random() * 90000).toString();

const saveOTP = async (email, otp) => {
  await db.collection(OTP_COLLECTION).doc(email).set({
    otp,
    verified: false,
    expiresAt: Timestamp.fromDate(new Date(Date.now() + OTP_EXPIRY_MIN * 60 * 1000)),
    createdAt: Timestamp.now()
  });
};

// ======================
// 3. Routes send otp
// ======================
router.post("/send-otp", async (req, res) => {
   
  
     console.log("Received /send-otp request:", req.body);
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    try{
const otp = generateOTP();
   await Promise.all([
      transporter.sendMail({
        from: `"Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Verification Code",
        html: `This is your OTP code, <b>${otp}</b>. (expires in ${OTP_EXPIRY_MIN} minutes)`
      }),
      saveOTP(email, otp)
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error("OTP Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
    
    
    

    // Parallel execution
 

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log("📨 Verifying OTP for:", email, "with code:", otp);

    const docRef = db.collection(OTP_COLLECTION).doc(email);
    const doc = await docRef.get();

    if (!doc.exists){
      console.log("❌ OTP document not found for:", email);
      return res.status(404).json({ error: "OTP not found" });}
    
    const data = doc.data();
    const now = Timestamp.now();
     console.log("🧾 OTP data in DB:", data);

    if (data.verified) return res.status(400).json({ error: "Already verified" });
    if (data.otp !== otp) return res.status(401).json({ error: "Invalid OTP" });
    if (now > data.expiresAt) return res.status(410).json({ error: "OTP expired" });

    // ✅ 1. Mark OTP doc as verified
    await docRef.update({ verified: true });

    // ✅ 2. Update user's emailVerified field in Firestore
    const usersRef = db.collection("users");
    const userSnapshot = await usersRef.where("email", "==", email).get();

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      await userDoc.ref.update({ emailVerified: true });
      console.log(`✅ Updated emailVerified to true for user: ${email}`);
    } else {
      console.warn(`⚠️ User not found in users collection for email: ${email}`);
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;