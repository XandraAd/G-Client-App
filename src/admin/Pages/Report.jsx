import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import {
  HiOutlineUserGroup,
  
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineRefresh
} from "react-icons/hi";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { FiAward, FiStar } from "react-icons/fi";
import StatCard from "../Components/report/ReportStatCard";
import ReportChart from "../Components/report/ReportCharts";
import RecentActivity from "../Components/report/ActivityTable";
import FilterPanel from "../Components/report/CourseInsights";
import SkeletonLoader from "../Components/SkeletonLoader";
import PieChart from "../Components/report/PieChart";
import LatestInvoice from "../Components/LatestInvoice";
import TopCourses from "../Components/report/TopCourses";
import { FaCediSign } from "react-icons/fa6";



// Constants
const INITIAL_FILTERS = { 
  month: "all", 
  course: "all", 
  status: "all" 
};

// Loading skeleton component
const ReportLoadingSkeleton = () => (
  <div className="px-6 py-8 space-y-6">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <SkeletonLoader width="200px" height="32px" />
      <SkeletonLoader width="300px" height="40px" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonLoader key={index} height="120px" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SkeletonLoader height="400px" />
      <SkeletonLoader height="400px" />
    </div>
  </div>
);

// Unauthorized access component
const UnauthorizedView = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
    <div className="text-6xl mb-4">🚫</div>
    <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
    <p className="text-gray-600 max-w-md">
      You don't have permission to view this page. Please contact an administrator if you believe this is an error.
    </p>
  </div>
);

// Stat cards configuration
const statCardsMeta = [
  {
    icon: HiOutlineUserGroup,
    iconBgColor: "bg-green-100",
    iconTextColor: "text-green-600",
    title: "Total Learners",
    valueKey: "totalLearners",
    changeKey: "learnerChange",
    valueFormatter: (val) => val?.toLocaleString() ?? "0",
  },
  {
    icon: FaCediSign,
    iconBgColor: "bg-orange-100",
    iconTextColor: "text-orange-600",
    title: "Revenue",
    valueKey: "totalRevenue",
    changeKey: "revenueChange",
    valueFormatter: (val) => `$${val ? val.toLocaleString() : "0"}`,
  },
  {
    icon: LiaFileInvoiceSolid,
    iconBgColor: "bg-blue-100",
    iconTextColor: "text-blue-600",
    title: "Invoices",
    valueKey: "totalInvoices",
    changeKey: "invoiceChange",
    valueFormatter: (val) => val?.toLocaleString() ?? "0",
  },
  {
    icon: FiAward,
    iconBgColor: "bg-purple-100",
    iconTextColor: "text-purple-600",
    title: "Total Courses Published",
    valueKey: "totalCourses",
    changeKey: "courseChange",
    valueFormatter: (val) => val?.toLocaleString() ?? "0",
  },
  {
    icon: HiOutlineUserGroup,
    iconBgColor: "bg-yellow-100",
    iconTextColor: "text-yellow-600",
    title: "New Enrollments",
    valueKey: "newEnrollments",
    changeKey: "enrollmentChange",
    valueFormatter: (val) => val?.toLocaleString() ?? "0",
  },
  {
    icon: FiStar,
    iconBgColor: "bg-pink-100",
    iconTextColor: "text-pink-600",
    title: "Average Rating",
    valueKey: "averageRating",
    changeKey: "ratingChange",
    valueFormatter: (val) => `${val?.toFixed ? val.toFixed(1) : "0"}/5`,
  }
];

const getMetricProps = (stats, changeKey) => {
  const change = stats?.[changeKey];
  const isPositive = change >= 0;
  return {
    metric: change != null ? `${Math.abs(change)}%` : "0%",
    metricText: isPositive ? "Increase" : "Decrease",
    metricColor: isPositive ? "text-green-500" : "text-red-500",
    trendIcon: isPositive ? HiOutlineTrendingUp : HiOutlineTrendingDown,
  };
};

const useStatCardsConfig = (stats) => {
  return useMemo(() =>
    statCardsMeta.map(meta => ({
      icon: meta.icon,
      iconBgColor: meta.iconBgColor,
      iconTextColor: meta.iconTextColor,
      title: meta.title,
      value: meta.valueFormatter(stats?.[meta.valueKey]),
      ...getMetricProps(stats, meta.changeKey)
    })),
    [stats]
  );
};

// Stat cards component
const StatCards = ({ stats, loading }) => {
  const cardsConfig = useStatCardsConfig(stats);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {cardsConfig.map((card) => (
        <StatCard key={card.title} {...card} loading={loading} />
      ))}
    </div>
  );
};


// Header component
const ReportHeader = ({ lastUpdated, loading, onRefresh, filters, setFilters }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
      {lastUpdated && (
        <p className="text-sm text-gray-500 mt-1">
          Last updated: {lastUpdated.toLocaleTimeString()} • {lastUpdated.toLocaleDateString()}
        </p>
      )}
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <HiOutlineRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        Refresh Data
      </button>
      <FilterPanel filters={filters} setFilters={setFilters} />
    </div>
  </div>
);

const Report = () => {
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const auth = getAuth();
  const db = getFirestore();

  // Check admin authorization
  const checkAdminAuthorization = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setAuthorized(false);
      setAuthLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const isAdmin = userDoc.exists() && userData?.isAdmin === true;
      setAuthorized(isAdmin);
      
      if (!isAdmin) {
        console.warn("Unauthorized access attempt by user:", user.uid);
      }
    } catch (error) {
      console.error("Error checking admin role:", error);
      setAuthorized(false);
    } finally {
      setAuthLoading(false);
    }
  }, [auth, db]);

  // Fetch dashboard data including invoices
  const fetchDashboardData = useCallback(async () => {
    if (!authorized) return;

    try {
      setLoading(true);
      const [learnersRes, invoicesRes, tracksRes, reportRes] = await Promise.all([
        axios.get("/api/learners"),
        axios.get("/api/invoices"),
        axios.get("/api/tracks"),
        axios.get("/api/report", { params: filters })
      ]);

      console.log("📊 Dashboard data loaded:", {
        learners: learnersRes.data.length,
        invoices: invoicesRes.data.length,
        tracks: tracksRes.data.length,
        report: !!reportRes.data
      });

      // Set all data
      setInvoices(invoicesRes.data);
      setTracks(tracksRes.data);
      setStats(reportRes.data || {});
      setLastUpdated(new Date());

    } catch (err) {
      console.error("Dashboard data fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [authorized, filters]);

  // Refresh data function
  const refreshData = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Debug effect
  useEffect(() => {
    console.log("🔍 Current Data State:", {
      invoicesCount: invoices.length,
      tracksCount: tracks.length,
      stats: stats,
      authorized: authorized,
      loading: loading
    });
  }, [invoices, tracks, stats, authorized, loading]);


  // In your Report component, add this debug effect
useEffect(() => {
  console.log("🔍 DEBUG - Top Courses Data:", {
    topCourses: stats?.topCourses,
    hasTopCourses: !!stats?.topCourses,
    topCoursesLength: stats?.topCourses?.length,
    sampleTopCourse: stats?.topCourses?.[0],
    stats: stats
  });
}, [stats]);

// Add this useEffect in your Report component
useEffect(() => {
  console.log("🔍 DEBUG - Stats Data:", {
    stats: stats,
    hasStats: !!stats,
    statKeys: stats ? Object.keys(stats) : [],
    sampleValues: stats ? {
      totalLearners: stats.totalLearners,
      totalRevenue: stats.totalRevenue,
      totalInvoices: stats.totalInvoices,
      totalCourses: stats.totalCourses,
      newEnrollments: stats.newEnrollments,
      averageRating: stats.averageRating
    } : 'No stats'
  });
}, [stats]);

  // Initial load effects
  useEffect(() => {
    checkAdminAuthorization();
  }, [checkAdminAuthorization]);

  useEffect(() => {
    if (authorized) {
      fetchDashboardData();
    }
  }, [authorized, fetchDashboardData]);

  // Handle filter changes
  useEffect(() => {
    if (authorized) {
      const timeoutId = setTimeout(() => {
        fetchDashboardData();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [filters, authorized, fetchDashboardData]);

  // Early returns for different states
  if (authLoading) {
    return <ReportLoadingSkeleton />;
  }

  if (!authorized) {
    return <UnauthorizedView />;
  }

  return (
    <div className="px-6 py-8">
      <ReportHeader 
        lastUpdated={lastUpdated} 
        loading={loading} 
        onRefresh={refreshData}
        filters={filters}
        setFilters={setFilters}
      />

      <StatCards stats={stats} loading={loading} />

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ReportChart
            data={stats?.chartData || []}
            loading={loading}
            title="Performance Overview"
            description="Key metrics trend over time including learners, revenue, and course completions"
          />
        </div>
        
        {/* Revenue Trends Chart - Uses invoices data */}
     
        <PieChart invoices={invoices} loading={loading} />
       <TopCourses tracks={tracks} invoices={invoices}   getMetricProps={getMetricProps} />
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 gap-6">
      <LatestInvoice invoices={invoices} loading={loading} />
        <RecentActivity 
          activities={stats?.recentActivities || []} 
          loading={loading} 
        />
      </div>
    </div>
  );
};

export default Report;