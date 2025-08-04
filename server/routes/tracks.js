//express routes

import express from "express"

import {Track} from "../models/Tracks.js"
import {db}  from "../firebase-admin.js";

import { cloudinary } from "../utils/cloudinary.js"; 


const router = express.Router();



// GET all tracks
router.get('/', async (req, res) => {
  try {
    const snapshot = await Track.get();
    const tracks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.status(200).json(tracks);
  } catch (error) {
    console.error("Error fetching tracks:", error);
    res.status(500).json({ message: "Failed to fetch tracks" });
  }
});



// GET a single track by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = db.collection("tracks").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Track not found" });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching track:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// ✅ DELETE a track
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.collection("tracks").doc(id).delete();
    res.status(200).json({ message: "Track deleted successfully" });
  } catch (error) {
    console.error("Error deleting track:", error);
    res.status(500).json({ message: "Failed to delete track" });
  }
});



// ✅ UPDATE a track
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    await db.collection("tracks").doc(id).update(updatedData);
    res.status(200).json({ message: "Track updated successfully" });
  } catch (error) {
    console.error("Error updating track:", error);
    res.status(500).json({ message: "Failed to update track" });
  }
});





// POST add new track
router.post('/', async (req, res) => {
  try {
    console.log("📦 Incoming track data:", JSON.stringify(req.body, null, 2));
    console.log("✅ Firebase bucket:", process.env.FIREBASE_STORAGE_BUCKET);


    const newTrack = req.body;

    if (!newTrack.title || !newTrack.value || !newTrack.duration || !newTrack.instructor || !newTrack.description) {
      console.error("❌ Missing required fields");
      return res.status(400).json({ message: 'Missing required fields' });
    }

if (newTrack.bgImg?.startsWith("data:image/")) {
  console.log("📤 Uploading to Cloudinary...");
  console.log("🔐 Cloudinary API Key:", process.env.CLOUDINARY_API_KEY); // 🔍 
  const uploadResponse = await cloudinary.uploader.upload(newTrack.bgImg, {
    folder: "tracks",
  });

  newTrack.bgImg = uploadResponse.secure_url;
}


   // ✅ Save to Firestore
    const docRef = await db.collection("tracks").add(newTrack);
    res.status(201).json({ id: docRef.id, ...newTrack });

  } catch (error) {
    console.error("❌ Error adding track:", error.message, error.stack);
    res.status(500).json({ message: 'Error adding track', error: error.message });
  }
});



export default router