import express from "express";
import { db } from "../firebase-admin.js";

const router = express.Router();

// Helper: parse Firestore timestamp to JS Date
const parseDate = (value) => {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  if (value instanceof Date) return value;
  return new Date(value);
};

router.get("/", async (req, res) => {
  try {
    // 1️⃣ Fetch users
    const usersSnap = await db.collection("users").get();
    const users = usersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: parseDate(doc.data().createdAt)
    }));

    // 2️⃣ Fetch invoices (only successful/paid ones)
    const invoicesSnap = await db.collection("invoices").get();
    const invoices = invoicesSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        amount: typeof data.amount === "number" ? data.amount : parseFloat(data.amount || 0),
        createdAt: parseDate(data.createdAt),
      };
    });

    // 3️⃣ Collect learner IDs who have made payment
    const payingLearners = new Set(
      invoices
        .filter(inv => inv.status === "paid" || inv.status === "completed")
        .map(inv => inv.userId || inv.learnerId)
    );

    // 4️⃣ Count only learners with a payment
    const totalLearners = users.filter(
      u => !u.isAdmin && payingLearners.has(u.id)
    ).length;

    // 5️⃣ Monthly learners chart
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const currentYear = new Date().getFullYear();
    const chartData = months.map((month, idx) => {
      const learnersThisMonth = users.filter(u => {
        if (u.isAdmin) return false;
        if (!payingLearners.has(u.id)) return false;
        const date = u.createdAt;
        return date && date.getFullYear() === currentYear && date.getMonth() === idx;
      }).length;

      return { month, learners: learnersThisMonth };
    });

    // 6️⃣ Calculate total revenue
    const totalRevenue = invoices.reduce((sum, i) => sum + (i.amount || 0), 0);

    // 7️⃣ Add revenue to monthly chart data
    chartData.forEach(cd => {
      const monthIdx = months.indexOf(cd.month);
      const revenueThisMonth = invoices
        .filter(inv => inv.createdAt && inv.createdAt.getMonth() === monthIdx && inv.createdAt.getFullYear() === currentYear)
        .reduce((sum, inv) => sum + inv.amount, 0);
      cd.revenue = revenueThisMonth;
    });

    // 8️⃣ Fetch enrollments to count course enrollments
    const enrollmentsSnap = await db.collection("invoices").where("status", "==", "completed").get();
    const enrollments = enrollmentsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: parseDate(data.createdAt),
      };
    });

    // Count enrollments per course
    const courseEnrollmentCount = {};
    enrollments.forEach(enrollment => {
      if (enrollment.courseId) {
        courseEnrollmentCount[enrollment.courseId] = (courseEnrollmentCount[enrollment.courseId] || 0) + 1;
      }
    });

    // 9️⃣ Top courses
    const coursesSnap = await db.collection("courses").get();
    const courses = coursesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const topCourses = courses
      .map(c => ({
        id: c.id,
        name: c.title || "Untitled Course",
        enrollments: courseEnrollmentCount[c.id] || 0
      }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);

    // 🔟 Recent activities - combine enrollments and invoices
    const recentEnrollments = enrollments
      .filter(e => e.createdAt)
      .map(e => ({
        id: e.id,
        type: "enrollment",
        user: e.learnerName || e.userId || e.learnerId,
        track: e.trackTitle || e.courseTitle || e.courseId,
        course: e.courseId,
        date: parseDate(e.createdAt),
        action: `Enrolled in ${e.trackTitle || e.courseTitle || "a course"}`
      }));
    
    const recentInvoices = invoices
      .filter(inv => inv.createdAt)
      .map(inv => ({
        id: inv.id,
        type: "invoice",
        user: inv.learnerName || inv.userId || inv.learnerId,
        track: inv.items?.[0]?.title || "Unknown Track",
        amount: inv.amount,
        date: parseDate(inv.createdAt),
        action: `Purchased ${inv.items?.[0]?.title || "a track"}`
      }));

    // Combine and sort activities
    const allActivities = [...recentEnrollments, ...recentInvoices]
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);

    // 1️⃣1️⃣ Average rating - get from course reviews if available
    let totalRating = 0;
    let ratingCount = 0;
    
    // Try to get reviews if they exist in your database
    try {
      const reviewsSnap = await db.collection("reviews").get();
      const reviews = reviewsSnap.docs.map(doc => doc.data());
      
      reviews.forEach(review => {
        if (review.rating) {
          totalRating += review.rating;
          ratingCount++;
        }
      });
    } catch (error) {
      console.error("Error fetching reviews collection:", error);
      console.log("No reviews collection found, using course ratings");
      // Fallback to course ratings if they exist
      courses.forEach(course => {
        if (course.rating) {
          totalRating += course.rating;
          ratingCount++;
        }
      });
    }
    
    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

    // 1️⃣2️⃣ Calculate completions for chart
    try {
      const completionsSnap = await db.collection("completions").get();
      const completions = completionsSnap.docs.map(doc => ({
        ...doc.data(),
        completedAt: parseDate(doc.data().completedAt)
      }));
      
      // Add completions to chart data
      chartData.forEach(cd => {
        const monthIdx = months.indexOf(cd.month);
        const completionsThisMonth = completions
          .filter(c => c.completedAt && c.completedAt.getMonth() === monthIdx && c.completedAt.getFullYear() === currentYear)
          .length;
        cd.completions = completionsThisMonth;
      });
    } catch {
      console.log("No completions collection found");
      // Add zero completions if collection doesn't exist
      chartData.forEach(cd => {
        cd.completions = 0;
      });
    }

    // 1️⃣3️⃣ Calculate new enrollments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newEnrollments = enrollments.filter(e => {
      return e.createdAt && e.createdAt > thirtyDaysAgo;
    }).length;

    res.status(200).json({
      totalLearners,
      chartData,
      totalRevenue,
      topCourses,
      recentActivities: allActivities,
      totalCourses: courses.length,
      totalInvoices: invoices.length,
      averageRating: Number(averageRating.toFixed(1)),
      newEnrollments
    });

  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;