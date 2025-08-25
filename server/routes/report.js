// backend/routes/report.js
import express from "express";
import admin from "firebase-admin";

const db = admin.firestore();
const router = express.Router();

/**
 * GET /api/admin/reports
 * Returns a summary of courses: total count + per-category distribution
 */
router.get("/", async (req, res) => {
  try {
    console.log("📊 Fetching courses report from Firestore...");

    const snapshot = await db.collection("courses").get();
    console.log("Snapshot size:", snapshot.size);

    if (snapshot.empty) {
      return res.json({
        success: true,
        totalCourses: 0,
        categoryPerformance: []
      });
    }

    // Extract course data
    const courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    const totalCourses = courses.length;

    // Count courses per category
    const categoryCounts = {};
    courses.forEach(course => {
      const category = course.category || "Uncategorized";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    // Convert to array format
    const categoryPerformance = Object.entries(categoryCounts).map(
      ([category, count]) => ({
        category,
        courses: count
      })
    );

    res.json({
      success: true,
      totalCourses,
      categoryPerformance
    });

  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch report data",
      details: error.message
    });
  }
});

export default router;



