// routes/courses.js

import express from "express";
import { db } from "../firebase-admin.js";
import { cloudinary } from "../utils/cloudinary.js";

const router = express.Router();

// GET all courses
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("courses").get();
    const courses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
});

// GET single course
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = db.collection("courses").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// POST new course
router.post("/", async (req, res) => {
  try {
    const newCourse = req.body;

    if (!newCourse.title || !newCourse.track || !newCourse.description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Upload image to Cloudinary if needed
    if (newCourse.bgImg?.startsWith("data:image/")) {
      const uploadResponse = await cloudinary.uploader.upload(newCourse.bgImg, {
        folder: "courses",
      });
      newCourse.bgImg = uploadResponse.secure_url;
    }

    // 🧠 1. Add course to "courses" collection
    const docRef = await db.collection("courses").add(newCourse);

    // 🧠 2. Update matching track's program (if it doesn't already have the tool)
    const trackId = newCourse.track.id;
    const toolToAdd = newCourse.program || [];

    if (toolToAdd.length > 0) {
      const trackRef = db.collection("tracks").doc(trackId);
      const trackDoc = await trackRef.get();

      if (trackDoc.exists) {
        const trackData = trackDoc.data();
        const currentProgram = trackData.program || [];

        // Avoid duplicates by comparing labels
        const updatedProgram = [
          ...currentProgram,
          ...toolToAdd.filter(
            (newTool) =>
              !currentProgram.some(
                (existing) =>
                  (existing.label || existing) === (newTool.label || newTool)
              )
          ),
        ];

        await trackRef.update({ program: updatedProgram });
      }
    }

    res.status(201).json({ id: docRef.id, ...newCourse });
  } catch (error) {
    console.error("❌ Error adding course:", error.message);
    res.status(500).json({ message: "Error adding course", error: error.message });
  }
});


// UPDATE a course
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updatedCourse = req.body;

  try {
    const docRef = db.collection("courses").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Handle Cloudinary update if new image is base64
    if (updatedCourse.bgImg?.startsWith("data:image/")) {
      const uploadResponse = await cloudinary.uploader.upload(updatedCourse.bgImg, {
        folder: "courses",
      });
      updatedCourse.bgImg = uploadResponse.secure_url;
    }

    await docRef.update(updatedCourse);
    res.status(200).json({ id, ...updatedCourse });
  } catch (error) {
    console.error("❌ Error updating course:", error);
    res.status(500).json({ message: "Failed to update course", error: error.message });
  }
});


// DELETE a course
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = db.collection("courses").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Course not found" });
    }

    await docRef.delete();
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting course:", error);
    res.status(500).json({ message: "Failed to delete course", error: error.message });
  }
});



export default router;
