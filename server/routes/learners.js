// learner.js - UPDATED TO STORE AND RETRIEVE LEARNER IMAGES
import express from "express";
import { v4 as uuidv4 } from "uuid";
import admin from "firebase-admin";
import { db } from "../firebase-admin.js";
import crypto from "crypto";

const router = express.Router();

// Helper function to extract user name
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

// Helper function to extract profile image from user data
const extractProfileImage = (userData) => {
  const imageSources = [
    userData.photoURL,
    userData.photoUrl,
    userData.avatar,
    userData.profilePicture,
    userData.profileImage,
    userData.image,
    userData.picture,
    userData.avatarUrl,
    userData.profilePhoto
  ];
  
  return imageSources.find(src => 
    src && typeof src === 'string' && src.trim() !== ''
  ) || null;
};

// Generate initials from name
const getInitials = (name) => {
  if (!name || name === "Unknown Learner") return "U";
  
  const names = name.split(' ');
  let initials = names[0].substring(0, 1).toUpperCase();
  
  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  
  return initials;
};

// Generate a consistent color based on user ID or name
const generateColor = (seed) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
    '#F9E79F', '#ABEBC6', '#AED6F1', '#FAD7A0', '#D2B4DE'
  ];
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Generate avatar URL using UI Avatars service
const generateAvatarUrl = (name, seed, size = 200) => {
  const initials = getInitials(name);
  const color = generateColor(seed).replace('#', '');
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color}&color=fff&size=${size}&bold=true&font-size=0.5`;
};

// NEW: Store generated avatar in user document
const storeAvatarInUserDocument = async (userId, avatarUrl) => {
  try {
    await db.collection("users").doc(userId).update({
      photoURL: avatarUrl,
      avatar: avatarUrl,
      profilePicture: avatarUrl,
      lastAvatarUpdate: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✅ Stored avatar for user ${userId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to store avatar for user ${userId}:`, error);
    return false;
  }
};

// NEW: Check if user needs avatar update (older than 30 days or never set)
const needsAvatarUpdate = (userData) => {
  const hasAvatar = !!(userData.photoURL || userData.avatar || userData.profilePicture);
  const lastUpdate = userData.lastAvatarUpdate;
  
  if (!hasAvatar) return true;
  if (!lastUpdate) return true;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const lastUpdateDate = lastUpdate.toDate ? lastUpdate.toDate() : new Date(lastUpdate);
  
  return lastUpdateDate < thirtyDaysAgo;
};

// get all learners - UPDATED TO STORE AND RETRIEVE AVATARS
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    if (snapshot.empty) return res.status(200).json([]);

    const allLearners = await Promise.all(snapshot.docs.map(async (doc) => {
      try {
        const data = doc.data();
        const userId = doc.id;
        
        // Get user name
        const learnerName = extractUserName(data);
        
        // Check for existing profile image
        const existingProfileImage = extractProfileImage(data);
        
        let finalAvatarUrl = existingProfileImage;
        
        // Generate and store avatar if needed
        if (!existingProfileImage || needsAvatarUpdate(data)) {
          const generatedAvatarUrl = generateAvatarUrl(learnerName, userId);
          finalAvatarUrl = generatedAvatarUrl;
          
          // Store the avatar in user document (async - don't wait for completion)
          storeAvatarInUserDocument(userId, generatedAvatarUrl).catch(console.error);
        }
        
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
            
            if (paymentData.trackId || paymentData.courseId || paymentData.productId) {
              allTracks.push({
                id: paymentData.trackId || paymentData.courseId || paymentData.productId,
                name: paymentData.trackName || paymentData.courseName || paymentData.productName || "Unknown Track",
                price: paymentData.amount || paymentData.price || 0,
                description: paymentData.description || ""
              });
            }
            
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
            
            if (allTracks.length === 0 && (paymentData.amount || paymentData.price)) {
              allTracks.push({
                id: `payment-${paymentDoc.id}`,
                name: paymentData.description || "Paid Course",
                price: paymentData.amount || paymentData.price || 0,
                description: "Course purchased via payment"
              });
            }
            
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
        
        return {
          id: doc.id,
          learnerName,
          email: data.email || "",
          // PROFILE IMAGES - now stored in database
          photoURL: finalAvatarUrl,
          avatar: finalAvatarUrl,
          profilePicture: finalAvatarUrl,
          image: finalAvatarUrl,
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

    // Filter out null values and keep only enrolled learners
    const validLearners = allLearners.filter(l => l !== null && l.enrolled);
    
    res.status(200).json(validLearners);
  } catch (error) {
    console.error("Failed to fetch learners:", error);
    res.status(500).json({ message: "Failed to fetch learners", error: error.message });
  }
});

// NEW: Endpoint to manually update avatars for all users
router.post("/update-all-avatars", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    let updatedCount = 0;
    
    const updatePromises = snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const learnerName = extractUserName(data);
      const avatarUrl = generateAvatarUrl(learnerName, doc.id);
      
      await storeAvatarInUserDocument(doc.id, avatarUrl);
      updatedCount++;
    });
    
    await Promise.all(updatePromises);
    
    res.json({
      message: `Successfully updated avatars for ${updatedCount} users`,
      updatedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;