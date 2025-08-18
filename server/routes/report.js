import express from "express";
import admin from "firebase-admin";

const db = admin.firestore();
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    console.log("Fetching courses from Firestore...");

    // Get all courses
    const snapshot = await db.collection("courses").get();
    console.log("Snapshot size:", snapshot.size);

    if (snapshot.empty) {
      return res.json({
        totalCourses: 0,
        categoryPerformance: []
      });
    }

    const courses = snapshot.docs.map(doc => doc.data());
    const totalCourses = courses.length;

    // Count courses per category
    const categoryCounts = {};
    courses.forEach(course => {
      const category = course.category || "Uncategorized";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const categoryPerformance = Object.entries(categoryCounts).map(
      ([category, count]) => ({
        category,
        courses: count
      })
    );

    res.json({
      totalCourses,
      categoryPerformance
    });

  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch report data",
      details: error.message
    });
  }
});

export default router;


