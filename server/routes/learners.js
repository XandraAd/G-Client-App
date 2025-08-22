// learner.js
import express from "express";
import { v4 as uuidv4 } from "uuid";
import admin from "firebase-admin";
import { db } from "../firebase-admin.js";

const router = express.Router();

// Helper function to extract user name from various field possibilities
const extractUserName = (userData) => {
  if (userData.firstName && userData.lastName) {
    return `${userData.firstName} ${userData.lastName}`;
  }
  if (userData.firstName) return userData.firstName;
  if (userData.name) return userData.name;
  if (userData.displayName) return userData.displayName;
  if (userData.learnerName) return userData.learnerName;
  if (userData.fullName) return userData.fullName;
  
  return "Unknown Learner";
};

// get all learners
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    if (snapshot.empty) return res.status(200).json([]);

    const learners = await Promise.all(snapshot.docs.map(async (doc) => {
      try {
        const data = doc.data();
        
        // Check if user has made payments
        const paymentsSnapshot = await db.collection("payments")
          .where("userId", "==", doc.id)
          .where("status", "in", ["completed", "paid", "success", "pending"])
          .get();
        
        const hasPayments = !paymentsSnapshot.empty;
        
        if (!hasPayments) {
          return null; // Skip users without payments
        }
        
        // Extract track data from payments
        let allTracks = [];
        let totalAmount = 0;
        
        for (const paymentDoc of paymentsSnapshot.docs) {
          const paymentData = paymentDoc.data();
          
          // Get track data from cartItems (modern format)
          if (Array.isArray(paymentData.cartItems)) {
            paymentData.cartItems.forEach(item => {
              const trackId = item.id || item.trackId || item.courseId;
              if (trackId) {
                allTracks.push({
                  id: trackId,
                  name: item.name || item.title || item.trackName || "Unknown Track",
                  price: item.price || item.amount || 0,
                  description: item.description || "",
                  image: item.image || item.thumbnail || ""
                });
              }
            });
          }

          // Check for items array (alternative field name)
          if (Array.isArray(paymentData.items)) {
            paymentData.items.forEach(item => {
              const trackId = item.id || item.trackId || item.courseId;
              if (trackId) {
                allTracks.push({
                  id: trackId,
                  name: item.name || item.title || item.trackName || "Unknown Track",
                  price: item.price || item.amount || 0,
                  description: item.description || "",
                  image: item.image || item.thumbnail || ""
                });
              }
            });
          }
          
          // Check for metadata (common in payment systems)
          const metadata = paymentData.metadata || {};
          const stringMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
          
          if (stringMetadata.trackId || stringMetadata.courseId) {
            allTracks.push({
              id: stringMetadata.trackId || stringMetadata.courseId,
              name: stringMetadata.trackName || stringMetadata.courseName || "Unknown Track",
              price: paymentData.amount || 0,
              description: stringMetadata.description || ""
            });
          }
          
          // Check for direct track/course fields
          if (paymentData.trackId) {
            allTracks.push({
              id: paymentData.trackId,
              name: paymentData.trackName || "Unknown Track",
              price: paymentData.amount || 0
            });
          }
          
          if (paymentData.courseId) {
            allTracks.push({
              id: paymentData.courseId,
              name: paymentData.courseName || "Unknown Track",
              price: paymentData.amount || 0
            });
          }
          
          // Fallback: if no track data found but payment exists, create a generic track
          if (allTracks.length === 0 && paymentData.amount) {
            allTracks.push({
              id: `payment-${paymentDoc.id}`,
              name: "Paid Course",
              price: paymentData.amount || 0,
              description: "Course purchased via payment"
            });
          }
          
          if (paymentData.amount) {
            totalAmount += parseFloat(paymentData.amount);
          }
        }
        
        // Remove duplicate tracks by ID
        const uniqueTracksMap = new Map();
        allTracks.forEach(track => {
          if (!uniqueTracksMap.has(track.id)) {
            uniqueTracksMap.set(track.id, track);
          }
        });
        
        const uniqueTracks = Array.from(uniqueTracksMap.values());
        
        // Get user data with better fallbacks
        const learnerName = extractUserName(data);
        
        return {
          id: doc.id,
          learnerName,
          email: data.email || "",
          tracks: uniqueTracks,
          trackCount: uniqueTracks.length,
          enrolled: uniqueTracks.length > 0,
          amount: totalAmount,
          currency: data.currency || "GHS",
          gender: data.gender || "Not specified",
          dateJoined: data.dateJoined || data.joinedDate || 
                    (data.createdAt?.toDate ? data.createdAt.toDate().toISOString().split("T")[0] : new Date().toISOString().split("T")[0]),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          phone: data.phone || data.phoneNumber || "Not provided",
          location: data.location || data.country || data.city || "Not specified",
          status: uniqueTracks.length > 0 ? "Enrolled" : "Pending",
          paymentCount: paymentsSnapshot.size
        };
      } catch (error) {
        console.error(`Error processing user ${doc.id}:`, error);
        return null;
      }
    }));

    // Filter out null values and return only paying learners
    const payingLearners = learners.filter(l => l !== null);
    
    res.status(200).json(payingLearners);
  } catch (error) {
    console.error("Failed to fetch learners:", error);
    res.status(500).json({ message: "Failed to fetch learners", error: error.message });
  }
});

// NEW: Debug endpoint to see payment data structure
router.get("/debug-payments/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const paymentsSnapshot = await db.collection("payments")
      .where("userId", "==", userId)
      .get();
    
    const payments = paymentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : null
    }));
    
    res.json({
      userId,
      paymentCount: payments.length,
      payments: payments.map(p => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        cartItems: p.cartItems,
        items: p.items,
        trackId: p.trackId,
        courseId: p.courseId,
        metadata: p.metadata,
        // Include all fields for debugging
        allFields: Object.keys(p).filter(key => !['createdAt'].includes(key))
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NEW: Get user profile data to see available fields
router.get("/debug-user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userDoc = await db.collection("users").doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const userData = userDoc.data();
    
    res.json({
      userId,
      exists: userDoc.exists,
      data: userData,
      fields: Object.keys(userData),
      createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { learnerName, email, courses, gender } = req.body;
    if (!learnerName || !email) {
      return res.status(400).json({ message: "Name and Email are required" });
    }

    const courseIds = Array.isArray(courses) ? courses : (courses ? [courses] : []);
    const newId = uuidv4();
    const newDoc = {
      id: newId,
      learnerName,
      email,
      courses: courseIds,
      courseCount: courseIds.length,
      enrolled: courseIds.length > 0,
      amount: 0,
      gender: gender || "Not specified",
      status: courseIds.length > 0 ? "Enrolled" : "Pending",
      dateJoined: new Date().toISOString().split("T")[0],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      phone: "Not provided",
      location: "Not specified"
    };

    await db.collection("learners").doc(newId).set(newDoc);
    res.status(201).json({ message: "Learner registered successfully", learner: newDoc });
  } catch (error) {
    console.error("Error registering learner:", error);
    res.status(500).json({ message: "Failed to register learner", error: error.message });
  }
});

export default router;