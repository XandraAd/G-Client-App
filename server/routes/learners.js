import express from "express";
import { v4 as uuidv4 } from "uuid";
import admin from "firebase-admin";

const db = admin.firestore();
const router = express.Router();

/**
 * GET /api/learners
 * Optional filter: ?enrolled=1  → only learners with one or more courses
 */
router.get("/", async (req, res) => {
  try {
    const enrolledOnly = ["1", "true", "yes"].includes(String(req.query.enrolled || "").toLowerCase());

    const snapshot = await db.collection("learners").get();
    if (snapshot.empty) return res.status(200).json([]);

    const learners = snapshot.docs.map((doc) => {
      const data = doc.data();
      // Normalize a few fields
      const courseIds = Array.isArray(data.courses) ? data.courses : (data.courses ? [data.courses] : []);
      return {
        id: doc.id,
        ...data,
        courses: courseIds,
        courseCount: courseIds.length,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null),
        dateJoined: data.dateJoined || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString().split("T")[0] : null),
      };
    });

    const filtered = enrolledOnly ? learners.filter((l) => (l.courseCount || 0) > 0) : learners;

    // Sort newest first using createdAt fallback to dateJoined
    filtered.sort((a, b) => {
      const aTime = a.createdAt ? +a.createdAt : (a.dateJoined ? +new Date(a.dateJoined) : 0);
      const bTime = b.createdAt ? +b.createdAt : (b.dateJoined ? +new Date(b.dateJoined) : 0);
      return bTime - aTime;
    });

    res.status(200).json(filtered);
  } catch (error) {
    console.error("Error fetching learners:", error);
    res.status(500).json({ message: "Failed to fetch learners", error: error.message });
  }
});

/**
 * POST /api/learners/register
 * Accepts: { learnerName, email, courses: string[] | string, gender }
 */
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
      courses: courseIds,                 // always an array
      courseCount: courseIds.length,      // handy for display
      enrolled: courseIds.length > 0,     // quick flag
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

export default router;