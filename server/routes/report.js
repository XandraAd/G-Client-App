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

// Helper: Calculate percentage change
const calculateChange = (current, previous) => {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0 && current > 0) return 100;
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
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

    // 2️⃣ Fetch ALL invoices first
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

    console.log("📊 ALL Invoices:", {
      total: invoices.length,
      byStatus: invoices.reduce((acc, inv) => {
        acc[inv.status] = (acc[inv.status] || 0) + 1;
        return acc;
      }, {})
    });

    // 3️⃣ Get paid/successful invoices for revenue and enrollments
    const paidInvoices = invoices.filter(inv => 
      inv.status === "paid" || 
      inv.status === "completed" || 
      inv.status === "success" ||
      (inv.amount > 0 && inv.status !== "failed" && inv.status !== "cancelled")
    );

    console.log("💰 Paid Invoices:", paidInvoices.length);

    // 4️⃣ Collect learner IDs who have made payment
    const payingLearners = new Set(
      paidInvoices.map(inv => inv.userId || inv.learnerId).filter(Boolean)
    );

    console.log("👥 Paying Learners:", payingLearners.size);

    // 5️⃣ Count only learners with a payment
    const totalLearners = users.filter(
      u => !u.isAdmin && payingLearners.has(u.id)
    ).length;

    console.log("🎯 Total Learners with payment:", totalLearners);

    // 6️⃣ Calculate previous period data for change comparisons
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Previous month data
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Calculate metrics for current period (this month)
    const currentMonthLearners = users.filter(u => {
      if (u.isAdmin) return false;
      if (!payingLearners.has(u.id)) return false;
      const date = u.createdAt;
      return date && date.getFullYear() === currentYear && date.getMonth() === currentMonth;
    }).length;

    const currentMonthRevenue = paidInvoices
      .filter(inv => inv.createdAt && inv.createdAt.getMonth() === currentMonth && inv.createdAt.getFullYear() === currentYear)
      .reduce((sum, inv) => sum + inv.amount, 0);

    const currentMonthInvoices = paidInvoices
      .filter(inv => inv.createdAt && inv.createdAt.getMonth() === currentMonth && inv.createdAt.getFullYear() === currentYear)
      .length;

    // Calculate metrics for previous period (last month)
    const previousMonthLearners = users.filter(u => {
      if (u.isAdmin) return false;
      if (!payingLearners.has(u.id)) return false;
      const date = u.createdAt;
      return date && date.getFullYear() === previousYear && date.getMonth() === previousMonth;
    }).length;

    const previousMonthRevenue = paidInvoices
      .filter(inv => inv.createdAt && inv.createdAt.getMonth() === previousMonth && inv.createdAt.getFullYear() === previousYear)
      .reduce((sum, inv) => sum + inv.amount, 0);

    const previousMonthInvoices = paidInvoices
      .filter(inv => inv.createdAt && inv.createdAt.getMonth() === previousMonth && inv.createdAt.getFullYear() === previousYear)
      .length;

    // 7️⃣ Calculate percentage changes
    const learnerChange = calculateChange(currentMonthLearners, previousMonthLearners);
    const revenueChange = calculateChange(currentMonthRevenue, previousMonthRevenue);
    const invoiceChange = calculateChange(currentMonthInvoices, previousMonthInvoices);

    // 8️⃣ Monthly learners chart
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const chartData = months.map((month, idx) => {
      const learnersThisMonth = users.filter(u => {
        if (u.isAdmin) return false;
        if (!payingLearners.has(u.id)) return false;
        const date = u.createdAt;
        return date && date.getFullYear() === currentYear && date.getMonth() === idx;
      }).length;

      return { month, learners: learnersThisMonth };
    });

    // 9️⃣ Calculate total revenue from paid invoices only
    const totalRevenue = paidInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);

    // 🔟 Add revenue to monthly chart data
    chartData.forEach(cd => {
      const monthIdx = months.indexOf(cd.month);
      const revenueThisMonth = paidInvoices
        .filter(inv => inv.createdAt && inv.createdAt.getMonth() === monthIdx && inv.createdAt.getFullYear() === currentYear)
        .reduce((sum, inv) => sum + inv.amount, 0);
      cd.revenue = revenueThisMonth;
    });

    // 1️⃣1️⃣ Count enrollments from paid invoices (each paid invoice = 1 enrollment)
    const enrollments = paidInvoices;

    console.log("🎓 Enrollments from paid invoices:", enrollments.length);

    // Count enrollments per course
    const courseEnrollmentCount = {};
    enrollments.forEach(enrollment => {
      const courseId = enrollment.courseId || enrollment.trackId || enrollment.items?.[0]?.trackId;
      if (courseId) {
        courseEnrollmentCount[courseId] = (courseEnrollmentCount[courseId] || 0) + 1;
      }
    });

    console.log("📚 Course Enrollment Count:", courseEnrollmentCount);

    // 1️⃣2️⃣ Top courses
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

    console.log("🏆 Top Courses:", topCourses);

    // 1️⃣3️⃣ Calculate enrollment changes
    const currentMonthEnrollments = enrollments
      .filter(e => e.createdAt && e.createdAt.getMonth() === currentMonth && e.createdAt.getFullYear() === currentYear)
      .length;

    const previousMonthEnrollments = enrollments
      .filter(e => e.createdAt && e.createdAt.getMonth() === previousMonth && e.createdAt.getFullYear() === previousYear)
      .length;

    const enrollmentChange = calculateChange(currentMonthEnrollments, previousMonthEnrollments);

    console.log("📈 Enrollment Changes:", {
      currentMonth: currentMonthEnrollments,
      previousMonth: previousMonthEnrollments,
      change: enrollmentChange
    });

    // 1️⃣4️⃣ Course count change
    const currentMonthCourses = courses.filter(c => {
      const date = parseDate(c.createdAt);
      return date && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    const previousMonthCourses = courses.filter(c => {
      const date = parseDate(c.createdAt);
      return date && date.getMonth() === previousMonth && date.getFullYear() === previousYear;
    }).length;

    const courseChange = calculateChange(currentMonthCourses, previousMonthCourses);

    // 1️⃣5️⃣ Recent activities - use paid invoices as activities
    const recentActivities = paidInvoices
      .filter(inv => inv.createdAt)
      .map(inv => ({
        id: inv.id,
        type: "enrollment",
        user: inv.learnerName || inv.userName || inv.userId || inv.learnerId,
        track: inv.items?.[0]?.title || inv.trackTitle || "Unknown Track",
        amount: inv.amount,
        date: parseDate(inv.createdAt),
        action: `Enrolled in ${inv.items?.[0]?.title || inv.trackTitle || "a course"}`
      }))
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);

    // 1️⃣6️⃣ Average rating - get from course reviews if available
    let totalRating = 0;
    let ratingCount = 0;
    
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
      console.log("No reviews collection found, using course ratings");
      courses.forEach(course => {
        if (course.rating) {
          totalRating += course.rating;
          ratingCount++;
        }
      });
    }
    
    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

    // 1️⃣7️⃣ Rating change
    let currentMonthRating = 0;
    let currentMonthRatingCount = 0;
    let previousMonthRating = 0;
    let previousMonthRatingCount = 0;

    try {
      const reviewsSnap = await db.collection("reviews").get();
      const reviews = reviewsSnap.docs.map(doc => ({
        ...doc.data(),
        createdAt: parseDate(doc.data().createdAt)
      }));

      reviews.forEach(review => {
        if (review.rating && review.createdAt) {
          if (review.createdAt.getMonth() === currentMonth && review.createdAt.getFullYear() === currentYear) {
            currentMonthRating += review.rating;
            currentMonthRatingCount++;
          } else if (review.createdAt.getMonth() === previousMonth && review.createdAt.getFullYear() === previousYear) {
            previousMonthRating += review.rating;
            previousMonthRatingCount++;
          }
        }
      });
    } catch (error) {
      console.log("No reviews available for rating change calculation");
    }

    const currentMonthAvgRating = currentMonthRatingCount > 0 ? currentMonthRating / currentMonthRatingCount : 0;
    const previousMonthAvgRating = previousMonthRatingCount > 0 ? previousMonthRating / previousMonthRatingCount : 0;
    const ratingChange = calculateChange(currentMonthAvgRating, previousMonthAvgRating);

    // 1️⃣8️⃣ Calculate completions for chart
    try {
      const completionsSnap = await db.collection("completions").get();
      const completions = completionsSnap.docs.map(doc => ({
        ...doc.data(),
        completedAt: parseDate(doc.data().completedAt)
      }));
      
      chartData.forEach(cd => {
        const monthIdx = months.indexOf(cd.month);
        const completionsThisMonth = completions
          .filter(c => c.completedAt && c.completedAt.getMonth() === monthIdx && c.completedAt.getFullYear() === currentYear)
          .length;
        cd.completions = completionsThisMonth;
      });
    } catch {
      console.log("No completions collection found");
      chartData.forEach(cd => {
        cd.completions = 0;
      });
    }

    // 1️⃣9️⃣ Calculate new enrollments (last 30 days) - use paid invoices
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newEnrollments = enrollments.filter(e => {
      return e.createdAt && e.createdAt > thirtyDaysAgo;
    }).length;

    console.log("🆕 New Enrollments (last 30 days):", newEnrollments);

    // 2️⃣0️⃣ Final debug output
    console.log("🎯 FINAL METRICS:", {
      totalLearners,
      totalRevenue,
      totalInvoices: paidInvoices.length,
      totalCourses: courses.length,
      newEnrollments,
      averageRating: Number(averageRating.toFixed(1)),
      learnerChange: Number(learnerChange.toFixed(1)),
      revenueChange: Number(revenueChange.toFixed(1)),
      invoiceChange: Number(invoiceChange.toFixed(1)),
      courseChange: Number(courseChange.toFixed(1)),
      enrollmentChange: Number(enrollmentChange.toFixed(1)),
      ratingChange: Number(ratingChange.toFixed(1))
    });

    // 2️⃣1️⃣ Send response
    res.status(200).json({
      totalLearners,
      totalRevenue,
      totalInvoices: paidInvoices.length,
      totalCourses: courses.length,
      newEnrollments,
      averageRating: Number(averageRating.toFixed(1)),
      learnerChange: Number(learnerChange.toFixed(1)),
      revenueChange: Number(revenueChange.toFixed(1)),
      invoiceChange: Number(invoiceChange.toFixed(1)),
      courseChange: Number(courseChange.toFixed(1)),
      enrollmentChange: Number(enrollmentChange.toFixed(1)),
      ratingChange: Number(ratingChange.toFixed(1)),
      chartData,
      topCourses,
      recentActivities,
    });

  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;