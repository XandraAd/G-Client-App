import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  HiOutlineUserGroup,
  HiCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineRefresh
} from "react-icons/hi";
import {
  LiaFileInvoiceSolid,

} from "react-icons/lia";
import { FiAward, FiStar } from "react-icons/fi";
import StatCard from "../Components/report/ReportStatCard";
import ReportChart from "../Components/report/ReportCharts";
import RecentActivity from "../Components/report/ActivityTable";
import FilterPanel from "../Components/report/CourseInsights";
import SkeletonLoader from "../Components/SkeletonLoader";
import InvoicePieChart from "../Components/report/PieChart";
import CategoryPerformanceChart from "../Components/report/CategoryPerformanceChart"; // new chart component

// Loading skeleton
const ReportLoadingSkeleton = () => (
  <div className="px-6 py-8">
    <div className="flex justify-between items-center mb-8">
      <SkeletonLoader width="200px" height="32px" />
      <SkeletonLoader width="300px" height="40px" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[1, 2, 3, 4].map((item) => (
        <SkeletonLoader key={item} height="120px" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SkeletonLoader height="400px" />
      <SkeletonLoader height="400px" />
    </div>
  </div>
);

// Stat cards
const StatCards = ({ stats, loading }) => {
  const cards = [
    {
      icon: HiOutlineUserGroup,
      iconBgColor: "bg-green-100",
      iconTextColor: "text-green-600",
      title: "Total Learners",
      value: stats?.totalLearners?.toLocaleString() ?? "0",
      metric: stats?.learnerChange != null ? `${Math.abs(stats.learnerChange)}%` : "0%",
      metricText: stats?.learnerChange >= 0 ? "Increase" : "Decrease",
      metricColor: stats?.learnerChange >= 0 ? "text-green-500" : "text-red-500",
      trendIcon: stats?.learnerChange >= 0 ? HiOutlineTrendingUp : HiOutlineTrendingDown,
    },
    {
      icon: HiCurrencyDollar,
      iconBgColor: "bg-orange-100",
      iconTextColor: "text-orange-600",
      title: "Revenue",
      value: `$${stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : "0"}`,
      metric: stats?.revenueChange != null ? `${Math.abs(stats.revenueChange)}%` : "0%",
      metricText: stats?.revenueChange >= 0 ? "Increase" : "Decrease",
      metricColor: stats?.revenueChange >= 0 ? "text-green-500" : "text-red-500",
      trendIcon: stats?.revenueChange >= 0 ? HiOutlineTrendingUp : HiOutlineTrendingDown,
    },
    {
      icon: LiaFileInvoiceSolid,
      iconBgColor: "bg-blue-100",
      iconTextColor: "text-blue-600",
      title: "Invoices",
      value: stats?.totalInvoices?.toLocaleString() ?? "0",
      metric: stats?.invoiceChange != null ? `${Math.abs(stats.invoiceChange)}%` : "0%",
      metricText: stats?.invoiceChange >= 0 ? "Increase" : "Decrease",
      metricColor: stats?.invoiceChange >= 0 ? "text-green-500" : "text-red-500",
      trendIcon: stats?.invoiceChange >= 0 ? HiOutlineTrendingUp : HiOutlineTrendingDown,
    },
    {
      icon: FiAward,
      iconBgColor: "bg-purple-100",
      iconTextColor: "text-purple-600",
      title: "Total Courses Published",
      value: stats?.totalCourses?.toLocaleString() ?? "0",
      metric: stats?.courseChange != null ? `${Math.abs(stats.courseChange)}%` : "0%",
      metricText: stats?.courseChange >= 0 ? "Increase" : "Decrease",
      metricColor: stats?.courseChange >= 0 ? "text-green-500" : "text-red-500",
      trendIcon: stats?.courseChange >= 0 ? HiOutlineTrendingUp : HiOutlineTrendingDown,
    },
    {
      icon: HiOutlineUserGroup,
      iconBgColor: "bg-yellow-100",
      iconTextColor: "text-yellow-600",
      title: "New Enrollments",
      value: stats?.newEnrollments?.toLocaleString() ?? "0",
      metric: stats?.enrollmentChange != null ? `${Math.abs(stats.enrollmentChange)}%` : "0%",
      metricText: stats?.enrollmentChange >= 0 ? "Increase" : "Decrease",
      metricColor: stats?.enrollmentChange >= 0 ? "text-green-500" : "text-red-500",
      trendIcon: stats?.enrollmentChange >= 0 ? HiOutlineTrendingUp : HiOutlineTrendingDown,
    },
    {
      icon: FiStar,
      iconBgColor: "bg-pink-100",
      iconTextColor: "text-pink-600",
      title: "Average Rating",
      value: `${stats?.averageRating?.toFixed(1) ?? "0"}/5`,
      metric: stats?.ratingChange != null ? `${Math.abs(stats.ratingChange)}%` : "0%",
      metricText: stats?.ratingChange >= 0 ? "Increase" : "Decrease",
      metricColor: stats?.ratingChange >= 0 ? "text-green-500" : "text-red-500",
      trendIcon: stats?.ratingChange >= 0 ? HiOutlineTrendingUp : HiOutlineTrendingDown,
    }
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} loading={loading} />
      ))}
    </div>
  );
};

// Top courses
const TopCourses = ({ topCourses }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
    <h3 className="text-lg font-semibold mb-4">Top Courses</h3>
    <div className="space-y-4">
      {topCourses?.map((course, index) => (
        <div key={course.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-medium">{index + 1}.</span>
            <span className="font-medium">{course.name}</span>
          </div>
          <span className="text-gray-700">{course.enrollments} learners</span>
        </div>
      ))}
    </div>
  </div>
);

const Report = () => {
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    month: "all",
    course: "all",
    status: "all"
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/report", { params: filters });
      setStats(res.data || {});
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching report data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [filters]);

  if (loading && !stats) {
    return <ReportLoadingSkeleton />;
  }

  return (
    <div className="px-6 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Report & Insights</h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()} • {lastUpdated.toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
          <FilterPanel filters={filters} setFilters={setFilters} />
        </div>
      </div>

      <StatCards stats={stats} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ReportChart
            data={stats?.chartData || []}
            loading={loading}
            title="Monthly Performance"
            description="Learners, revenue, and completions over time"
          />
        </div>
        <InvoicePieChart invoices={stats?.invoices || []} />
        <TopCourses topCourses={stats?.topCourses || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CategoryPerformanceChart data={stats?.categoryPerformance || []} />
        <RecentActivity activities={stats?.recentActivities || []} loading={loading} />
      </div>
    </div>
  );
};

export default Report;
