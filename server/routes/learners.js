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


// get all learners - UPDATED TRACK EXTRACTION
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    if (snapshot.empty) return res.status(200).json([]);

    const allLearners = await Promise.all(snapshot.docs.map(async (doc) => {
      try {
        const data = doc.data();
        
        // Check if user has made payments
        const paymentsSnapshot = await db.collection("payments")
          .where("userId", "==", doc.id)
          .where("status", "in", ["completed", "paid", "success", "pending", "succeeded"])
          .get();
        
        const hasPayments = !paymentsSnapshot.empty;

        // Extract track data from payments
        let allTracks = [];
        let totalAmount = 0;
        
        if (hasPayments) {
          for (const paymentDoc of paymentsSnapshot.docs) {
            const paymentData = paymentDoc.data();
            
            // DEBUG: Log payment data to see structure
            console.log(`Payment data for user ${doc.id}:`, paymentData);
            
            // Method 1: Check for cartItems (most common)
            if (Array.isArray(paymentData.cartItems)) {
              paymentData.cartItems.forEach(item => {
                const trackId = item.id || item.trackId || item.courseId || item.productId;
                if (trackId) {
                  allTracks.push({
                    id: trackId,
                    name: item.name || item.title || item.trackName || item.productName || "Unknown Track",
                    price: item.price || item.amount || item.value || 0,
                    description: item.description || "",
                    image: item.image || item.thumbnail || item.imageUrl || ""
                  });
                }
              });
            }

            // Method 2: Check for items array
            if (Array.isArray(paymentData.items)) {
              paymentData.items.forEach(item => {
                const trackId = item.id || item.trackId || item.courseId || item.productId;
                if (trackId) {
                  allTracks.push({
                    id: trackId,
                    name: item.name || item.title || item.trackName || item.productName || "Unknown Track",
                    price: item.price || item.amount || item.value || 0,
                    description: item.description || "",
                    image: item.image || item.thumbnail || item.imageUrl || ""
                  });
                }
              });
            }
            
            // Method 3: Check for single item fields (common in some payment systems)
            if (paymentData.trackId || paymentData.courseId || paymentData.productId) {
              allTracks.push({
                id: paymentData.trackId || paymentData.courseId || paymentData.productId,
                name: paymentData.trackName || paymentData.courseName || paymentData.productName || "Unknown Track",
                price: paymentData.amount || paymentData.price || 0,
                description: paymentData.description || ""
              });
            }
            
            // Method 4: Check metadata field (common in Stripe and other payment processors)
            if (paymentData.metadata) {
              let metadata = paymentData.metadata;
              if (typeof metadata === 'string') {
                try {
                  metadata = JSON.parse(metadata);
                } catch (e) {
                  console.log('Could not parse metadata string:', metadata);
                }
              }
              
              if (metadata.trackId || metadata.courseId || metadata.productId) {
                allTracks.push({
                  id: metadata.trackId || metadata.courseId || metadata.productId,
                  name: metadata.trackName || metadata.courseName || metadata.productName || "Unknown Track",
                  price: paymentData.amount || 0,
                  description: metadata.description || ""
                });
              }
            }
            
            // Method 5: If no track data found but payment exists, create generic entry
            if (allTracks.length === 0 && (paymentData.amount || paymentData.price)) {
              allTracks.push({
                id: `payment-${paymentDoc.id}`,
                name: paymentData.description || "Paid Course",
                price: paymentData.amount || paymentData.price || 0,
                description: "Course purchased via payment"
              });
            }
            
            // Add to total amount
            if (paymentData.amount) {
              totalAmount += parseFloat(paymentData.amount);
            } else if (paymentData.price) {
              totalAmount += parseFloat(paymentData.price);
            }
          }
        }
        
        // Remove duplicate tracks by ID
        const uniqueTracksMap = new Map();
        allTracks.forEach(track => {
          if (track.id && !uniqueTracksMap.has(track.id)) {
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
          enrolled: hasPayments,
          amount: totalAmount,
          currency: data.currency || "GHS",
          gender: data.gender || "Not specified",
          dateJoined: data.dateJoined || data.joinedDate || 
                    (data.createdAt?.toDate ? data.createdAt.toDate().toISOString().split("T")[0] : new Date().toISOString().split("T")[0]),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          phone: data.phone || data.phoneNumber || "Not provided",
          location: data.location || data.country || data.city || "Not specified",
          status: hasPayments ? "Enrolled" : "Not Enrolled",
          paymentCount: paymentsSnapshot.size,
          hasPayments: hasPayments
        };
      } catch (error) {
        console.error(`Error processing user ${doc.id}:`, error);
        return null;
      }
    }));

    // Filter out null values
   // Keep only users who are actually learners and have enrolled
const validLearners = allLearners.filter(l => l !== null && l.enrolled);

res.status(200).json(validLearners);

    
    // DEBUG: Log the final learners data
    console.log("Final learners data:", validLearners);
    
    res.status(200).json(validLearners);
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
        learnerName:p.learnerName,
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