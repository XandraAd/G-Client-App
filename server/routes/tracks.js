//express routes
import express from "express";
import { Track } from "../models/Tracks.js";
import { db } from "../firebase-admin.js";
import { cloudinary } from "../utils/cloudinary.js";



const router = express.Router();

// GET all tracks
router.get("/", async (req, res) => {
  try {
    const snapshot = await Track.get();
    const tracks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(tracks);
  } catch (error) {
    console.error("Error fetching tracks:", error);
    res.status(500).json({ message: "Failed to fetch tracks" });
  }
});

// GET a single track by ID
// GET single track by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection("tracks").doc(id).get();
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
router.post("/", async (req, res) => {
  try {
    console.log("📦 Incoming track data:", JSON.stringify(req.body, null, 2));

    const newTrack = {
      title: req.body.title,
      value: req.body.value,         // number of courses
      duration: req.body.duration,   // e.g., "12 weeks"
      instructor: req.body.instructor,
      description: req.body.description,
      bgImg: req.body.bgImg || "",
      price: Number(req.body.price) || 0,    // 💲 fallback to 0
      students: req.body.students || 0, // enrolled count fallback to 0
      reviews: req.body.reviews || 0,   // review count fallback to 0
      learn: req.body.learn || [],   // array of "what you'll learn"
      createdAt: new Date().toISOString()
    };

    // Upload image to Cloudinary if it's a base64 image
    if (newTrack.bgImg?.startsWith("data:image/")) {
      const uploadResponse = await cloudinary.uploader.upload(newTrack.bgImg, {
        folder: "tracks",
      });
      newTrack.bgImg = uploadResponse.secure_url;
    }

    // Save to Firestore
    const docRef = await db.collection("tracks").add(newTrack);
    res.status(201).json({ id: docRef.id, ...newTrack });

  } catch (error) {
    console.error("❌ Error adding track:", error.message);
    res.status(500).json({ message: "Error adding track", error: error.message });
  }
});


export default router;
