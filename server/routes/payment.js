import express from "express";
import axios from "axios";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

const router = express.Router();
const db = getFirestore();

// Check for Paystack secret key at the top level
if (!process.env.PAYSTACK_SECRET_KEY) {
  console.error("❌ Paystack secret key is missing!");
  console.error("Please set PAYSTACK_SECRET_KEY environment variable");
}

// Add middleware to log all requests
router.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * Helper to format amounts
 */
function formatAmount(amount, currency) {
  const numericAmount =
    typeof amount === "number" ? amount : parseFloat(amount || 0);
  if (currency === "GHS") {
    return `GHS ${numericAmount.toFixed(2)}`;
  } else if (currency === "USD") {
    return `$${numericAmount.toFixed(2)}`;
  }
  return `${numericAmount.toFixed(2)} ${currency}`;
}

/**
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  const hasPaystackKey = !!process.env.PAYSTACK_SECRET_KEY;
  res.json({
    status: "ok",
    paystack_configured: hasPaystackKey,
    timestamp: new Date().toISOString()
  });
});

/**
 * Test Paystack connection
 */
router.get("/test-paystack", async (req, res) => {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ error: "Paystack key missing" });
  }
  
  try {
    const testRes = await axios.get("https://api.paystack.co/bank", {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    res.json({ success: true, banksCount: testRes.data.data.length });
  } catch (error) {
    console.error("Paystack test failed:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Paystack test failed", 
      details: error.response?.data 
    });
  }
});

/**
 * Initialize Payment
 */
router.post("/initialize", async (req, res) => {
  const { email, amount, reference, userId, cartItems, learnerName } = req.body;

  // Log the incoming request for debugging
  console.log("Initialize request received:", {
    email,
    amount,
    reference,
    userId,
    cartItemsCount: cartItems?.length || 0,
    learnerName
  });

  // Check if Paystack secret key is available
  if (!process.env.PAYSTACK_SECRET_KEY) {
    console.error("Paystack secret key missing in initialize route");
    return res.status(500).json({ 
      success: false, 
      error: "Server configuration error: Paystack secret key missing" 
    });
  }

  try {
    const paystackRes = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Paystack requires pesewas
        currency: "GHS",
        reference,
        callback_url: "http://localhost:5173/payment-success",
        metadata: {
          userId,
          learnerName,
          cartItems: JSON.stringify(cartItems || [])
        }
      },
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
        timeout: 10000 // 10 second timeout
      }
    );

    console.log("Paystack initialization response:", paystackRes.data);

    // Save pending record in Firestore
    const paymentData = {
      userId,
      learnerName,
      email,
      amount,
      currency: "GHS",
      status: "pending",
      cartItems: cartItems || [],
      reference,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("payments").doc(reference).set(paymentData);

    console.log("Payment record saved to Firestore:", reference);

    res.json({
      success: true,
      authUrl: paystackRes.data.data.authorization_url,
      reference,
    });
  } catch (err) {
    console.error("Initialize error:", err.response?.data || err.message);
    console.error("Error details:", err.stack);
    
    res.status(500).json({ 
      success: false, 
      error: err.message,
      details: err.response?.data 
    });
  }
});

/**
 * Verify Payment
 */
router.get("/verify/:reference", async (req, res) => {
  const { reference } = req.params;

  console.log("Verifying payment reference:", reference);

  // Check if Paystack secret key is available
  if (!process.env.PAYSTACK_SECRET_KEY) {
    console.error("Paystack secret key missing in verify route");
    return res.status(500).json({ 
      success: false, 
      error: "Server configuration error: Paystack secret key missing" 
    });
  }

  try {
    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
        timeout: 10000
      }
    );

    console.log("Paystack verification response:", paystackRes.data);

    const verification = paystackRes.data;

    if (verification.status && verification.data.status === "success") {
      const payData = verification.data;
      const amountGHS = payData.amount / 100;

      // Update payment record
      await db.collection("payments").doc(reference).update({
        status: "completed",
        paidAt: new Date(payData.paid_at),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        paystackReference: payData.reference,
        channel: payData.channel
      });

      // Fetch original paymentData
      const snap = await db.collection("payments").doc(reference).get();
      const paymentData = snap.exists ? snap.data() : {};

      // Create invoice data
      const invoiceData = {
        ...paymentData,
        amount: amountGHS,
        currency: "GHS",
        reference,
        status: "paid",
        paidAt: new Date(payData.paid_at),
        createdAt: paymentData.createdAt || new Date(),
        updatedAt: new Date(),
        paystackResponse: {
          channel: payData.channel,
          authorization: payData.authorization,
          customer: payData.customer,
          reference: payData.reference
        },
      };

      // Save invoice in collection
      await db.collection("invoices").doc(reference).set(invoiceData);
      console.log("Invoice saved:", reference);

      // Update user's document (not learners collection)
      if (paymentData.userId) {
        const userRef = db.collection("users").doc(paymentData.userId);

        await userRef.set(
          {
            invoices: admin.firestore.FieldValue.arrayUnion(reference),
            pendingPayments: admin.firestore.FieldValue.arrayRemove(reference),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        console.log("User document updated:", paymentData.userId);
      }

      return res.json({
        success: true,
        message: "✅ Payment verified & invoice created",
        data: invoiceData,
      });
    } else {
      console.log("Payment not successful:", verification);
      return res.status(400).json({ 
        success: false, 
        message: "⚠️ Payment not successful",
        data: verification 
      });
    }
  } catch (err) {
    console.error("Verify error:", err.response?.data || err.message);
    console.error("Error stack:", err.stack);
    
    res.status(500).json({ 
      success: false, 
      error: err.message,
      details: err.response?.data 
    });
  }
});

/**
 * Debug route to check stored data
 */
router.get("/debug-data", async (req, res) => {
  try {
    const invoiceSnapshot = await db.collection("invoices").limit(5).get();
    const invoices = invoiceSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const paymentSnapshot = await db.collection("payments").limit(5).get();
    const payments = paymentSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const userSnapshot = await db.collection("users").limit(5).get();
    const users = userSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ 
      invoices, 
      payments,
      users, 
      message: "Current Firestore data structure",
      counts: {
        invoices: invoiceSnapshot.size,
        payments: paymentSnapshot.size,
        users: userSnapshot.size
      }
    });
  } catch (error) {
    console.error("Debug data error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get payment status
 */
router.get("/status/:reference", async (req, res) => {
  const { reference } = req.params;
  
  try {
    const paymentDoc = await db.collection("payments").doc(reference).get();
    
    if (!paymentDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: "Payment not found" 
      });
    }
    
    const paymentData = paymentDoc.data();
    res.json({ 
      success: true, 
      data: paymentData 
    });
  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;