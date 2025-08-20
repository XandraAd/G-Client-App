//learner.js

import express from "express";
import { v4 as uuidv4 } from "uuid";
import admin from "firebase-admin";
import { db } from "../firebase-admin.js";

const router = express.Router();

// In your learners.js backend route
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    if (snapshot.empty) return res.status(200).json([]);

    const learners = await Promise.all(snapshot.docs.map(async (doc) => {
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
      
      // Extract track IDs from payments
      let trackIds = [];
      let totalAmount = 0;
      
      paymentsSnapshot.forEach(paymentDoc => {
        const paymentData = paymentDoc.data();
        
        // Get track IDs from various possible fields
        if (Array.isArray(paymentData.courses)) {
          trackIds = [...trackIds, ...paymentData.courses];
        }
        if (Array.isArray(paymentData.items)) {
          const itemTrackIds = paymentData.items
            .map(item => item.id || item.trackId || item.courseId)
            .filter(Boolean);
          trackIds = [...trackIds, ...itemTrackIds];
        }
        if (paymentData.trackId) {
          trackIds.push(paymentData.trackId);
        }
        if (paymentData.courseId) {
          trackIds.push(paymentData.courseId);
        }
        
        if (paymentData.amount) {
          totalAmount += parseFloat(paymentData.amount);
        }
      });
      
      // Remove duplicate track IDs
      const uniqueTrackIds = [...new Set(trackIds.filter(Boolean))];
      
      // Get track names from the tracks collection
     // In your backend route
// Get track names from the tracks collection
const tracksWithNames = await Promise.all(
  uniqueTrackIds.map(async (trackId) => {
    try {
      const trackDoc = await db.collection("tracks").doc(trackId).get();
      if (trackDoc.exists) {
        const trackData = trackDoc.data();
        return {
          id: trackId,
          name: trackData.title || trackData.name || trackData.trackName || "Unknown Track",
          price: trackData.price || trackData.amount || trackData.value || 0
        };
      }
      return {
        id: trackId,
        name: "Unknown Track",
        price: 0
      };
    } catch (error) {
      console.error(`Error fetching track ${trackId}:`, error);
      return {
        id: trackId,
        name: "Unknown Track",
        price: 0
      };
    }
  })
);
      
      return {
        id: doc.id,
        learnerName: data.learnerName || data.name || data.fullName || data.displayName || "Unknown Learner",
        email: data.email || "",
        tracks: tracksWithNames,
        trackCount: tracksWithNames.length,
        enrolled: true,
        amount: totalAmount || data.amount || 0,
        currency: data.currency || "USD",
        gender: data.gender || "",
        dateJoined: data.dateJoined || data.joinedDate || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString().split("T")[0] : null),
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
        phone: data.phone || "",
        location: data.location || "",
        status: "Enrolled",
        paymentCount: paymentsSnapshot.size
      };
    }));

    // Filter out null values and return only paying learners
    const payingLearners = learners.filter(l => l !== null);
    
    res.status(200).json(payingLearners);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch learners", error: error.message });
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
      gender: gender || null,
      status: courseIds.length > 0 ? "Enrolled" : "Pending",
      dateJoined: new Date().toISOString().split("T")[0],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("learners").doc(newId).set(newDoc);
    res.status(201).json({ message: "Learner registered successfully", learner: newDoc });
  } catch (error) {
    console.error("Error registering learner:", error);
    res.status(500).json({ message: "Failed to register learner", error: error.message });
  }
});

// Add this to your learners.js backend
router.get("/debug", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      // Add Firestore timestamp conversion
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : null
    }));
    
    res.json({
      totalUsers: users.length,
      usersWithCourses: users.filter(u => {
        const courses = Array.isArray(u.courses) ? u.courses : [];
        const enrolledCourses = Array.isArray(u.enrolledCourses) ? u.enrolledCourses : [];
        return courses.length > 0 || enrolledCourses.length > 0;
      }).length,
      sampleUsers: users.slice(0, 3) // First 3 users for inspection
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;