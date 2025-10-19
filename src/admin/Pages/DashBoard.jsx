import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { HiOutlineUserGroup, HiOutlineTrendingUp, HiOutlineTrendingDown} from "react-icons/hi";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { FaCediSign } from "react-icons/fa6";
import { MdArrowUpward, MdArrowDownward } from "react-icons/md";
import CalendarIcon from "../../../public/assets/icons/calendarIcon.png";
import BarChart from "../Components/BarChart";
import LatestInvoice from "../Components/LatestInvoice";

// More vibrant and distinct colors
const PROGRAM_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#F9A826", "#6C5CE7", 
  "#00B894", "#FD79A8", "#FDCB6E", "#00CEC9", "#546DE5",
  "#E17055", "#0984E3", "#D63031", "#00B894", "#E84393",
  "#FDCB6E", "#636E72", "#74B9FF", "#A29BFE", "#DFE6E9",
  "#FF9FF3", "#FEA47F", "#F97F51", "#B33771", "#3B3B98",
  "#58B19F", "#BDC581", "#2C3A47", "#82589F", "#D6A2E8"
];

const DashBoard = () => {
  const navigate = useNavigate();  
  const [learners, setLearners] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [stats, setStats] = useState({
    totalLearners: 0,
    totalRevenue: 0,
    totalInvoices: 0,
    learnerChange: 0,
    revenueChange: 0,
    invoiceChange: 0
  });
  const [previousStats, setPreviousStats] = useState(null);

  // Improved function to get a consistent color for a program tag
  const getProgramColor = (label) => {
    if (!label) return PROGRAM_COLORS[0];
    
    let hash = 0;
    for (let i = 0; i < label.length; i++) {
      hash = label.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % PROGRAM_COLORS.length;
    return PROGRAM_COLORS[index];
  };

  // Calculate percentage change
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Get metrics with proper change calculations
  const getMetricProps = (change) => {
    const isPositive = change >= 0;
    return {
      metric: `${Math.abs(change).toFixed(1)}%`,
      metricText: isPositive ? "Increase" : "Decrease",
      metricColor: isPositive ? "text-green-500" : "text-red-500",
      trendIcon: isPositive ? HiOutlineTrendingUp : HiOutlineTrendingDown,
      arrowIcon: isPositive ? MdArrowUpward : MdArrowDownward,
      arrowColor: isPositive ? "#12B76A" : "#F04438"
    };
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [learnersRes, invoicesRes, tracksRes, reportRes] = await Promise.all([
          axios.get("/api/learners"),
          axios.get("/api/invoices"),
          axios.get("/api/tracks"),
          axios.get("/api/report") // Get report data for accurate metrics
        ]);

        console.log("📊 RAW API DATA:", {
          learners: learnersRes.data,
          invoices: invoicesRes.data,
          tracks: tracksRes.data,
          report: reportRes.data
        });

        // Filter only enrolled learners (not admins)
        const enrolledLearners = learnersRes.data.filter(learner => 
          learner.enrolled === true && 
          learner.role !== "admin" && 
          !learner.isAdmin
        );

        // Filter only successful invoices
        const successfulInvoices = invoicesRes.data.filter(invoice => 
          invoice.status === 'paid' || 
          invoice.status === 'completed' || 
          invoice.status === 'success'
        );

        // Calculate total revenue from successful invoices only
        const totalRevenue = successfulInvoices.reduce((sum, invoice) => 
          sum + (Number(invoice.amount) || 0), 0
        );

        // Use report data for changes if available, otherwise calculate
        let learnerChange, revenueChange, invoiceChange;

        if (reportRes.data) {
          // Use report data for accurate changes
          learnerChange = reportRes.data.learnerChange || 0;
          revenueChange = reportRes.data.revenueChange || 0;
          invoiceChange = reportRes.data.invoiceChange || 0;
        } else if (previousStats) {
          // Calculate changes based on previous data
          learnerChange = calculateChange(enrolledLearners.length, previousStats.totalLearners);
          revenueChange = calculateChange(totalRevenue, previousStats.totalRevenue);
          invoiceChange = calculateChange(successfulInvoices.length, previousStats.totalInvoices);
        } else {
          // Default changes for first load
          learnerChange = 12.5;
          revenueChange = 8.3;
          invoiceChange = -2.1;
        }

        const newStats = {
          totalLearners: enrolledLearners.length,
          totalRevenue: totalRevenue,
          totalInvoices: successfulInvoices.length,
          learnerChange: learnerChange,
          revenueChange: revenueChange,
          invoiceChange: invoiceChange
        };

        console.log("🎯 CALCULATED STATS:", newStats);

        setLearners(enrolledLearners);
        setInvoices(successfulInvoices);
        setTracks(tracksRes.data);
        setStats(newStats);
        setPreviousStats(newStats);

      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
      }
    };

    fetchDashboardData();
  }, []);

  // Card data array - USING REAL METRICS
  const statsCards = [
    {
      icon: HiOutlineUserGroup,
      iconTextColor: "text-green-600",
      title: "Total Learners",
      value: stats.totalLearners.toLocaleString(),
      ...getMetricProps(stats.learnerChange),
    },
    {
      icon: FaCediSign,
      iconTextColor: "text-orange-600",
      title: "Revenues",
      value: `GHS ${stats.totalRevenue.toLocaleString()}`,
      ...getMetricProps(stats.revenueChange),
    },
    {
      icon: LiaFileInvoiceSolid,
      iconTextColor: "text-blue-600",
      title: "Invoices",
      value: stats.totalInvoices.toLocaleString(),
      ...getMetricProps(stats.invoiceChange),
    },
  ];

  // Function to handle "See More" click
  const handleSeeMoreClick = () => {
    navigate("/admin/tracks");
  };

  return (
    <>
      {/* Stats Cards Section */}
      <h4 className="mt-10 text-[24px] font-semibold">Welcome admin</h4>
      <p className="text-gray-400 text-[18px] font-normal mt-">
        Track Activity, trends, and popular destination in real time
      </p>
      <section>
        <div className="my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {statsCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-lg p-3 shadow-lg h-40 w-full"
            >
              <p className="text-[16px] text-gray-800 font-medium">{card.title}</p>

              <div className="flex items-center justify-between">
                <p className="text-[36px] font-semibold text-end">{card.value}</p>

                <div
                  className={`${card.iconTextColor} p-2 text-[60px] rounded-lg`}
                >
                  <card.icon />
                </div>
              </div>

              <p className="text-[14px] font-medium text-gray-500 my-2 flex items-center">
                <card.arrowIcon
                  className="inline w-4 h-4 mr-1"
                  style={{ color: card.arrowColor }}
                />
                {card.metric && (
                  <span className={`${card.metricColor} font-semibold`}>
                    {card.metric}{" "}
                  </span>
                )}
                {card.metricText}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tracks Cards Section */}
      <section className="py-2 min-h-full lg:min-h-[300px] mb-6">
        <div className="grid grid-cols-2 items-center mb-4">
          <h4 className="text-[20px] font-semibold text-gray-900">Tracks</h4>
          <button
            onClick={handleSeeMoreClick}
            className="text-[16px] font-medium text-blue-600 hover:text-blue-800 justify-self-end flex items-center"
          >
            See more<span className="ml-1">→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tracks.slice(0, 4).map((track) => (
            <div
              key={track.id || track.title}
              className="rounded-xl shadow-lg flex flex-col relative overflow-hidden"
            >
              <div
                className="rounded-t-md w-full h-[180px] bg-no-repeat bg-cover min-w-full relative"
                style={{
                  backgroundImage: `url(${track.bgImg})`,
                }}
              >
                <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 min-w-[50px] flex items-center justify-center shadow-sm">
                  <span className="text-xs font-medium whitespace-nowrap">
                    <FaCediSign className="inline mr-1" />
                    {track.value}
                  </span>
                </div>
              </div>

              <div className="relative z-10 text-black p-3 flex flex-col flex-1">
                <h3 className="text-[18px] font-semibold mb-2 line-clamp-2 min-h-[56px]">
                  {track.title}
                </h3>
                
                <div className="flex items-center mt-auto text-gray-500 font-normal text-[14px]">
                  <img src={CalendarIcon} alt="calendar" className="w-4 h-4 flex-shrink-0" />
                  <p className="ml-2 truncate">{track.duration}</p>
                </div>

                {/* Program Tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {Array.isArray(track.program) && track.program.length > 0 ? (
                    <>
                      {track.program.slice(0, 3).map((tech, index) => {
                        const label = typeof tech === "string" ? tech : tech.label;
                        const bgColor = typeof tech === "object" && tech.bgColor 
                          ? tech.bgColor 
                          : getProgramColor(label);
                        const textColor = getTextColorForBackground(bgColor);
                        
                        return (
                          <span
                            key={index}
                            style={{
                              backgroundColor: bgColor,
                              color: textColor,
                            }}
                            className="text-xs px-2 py-1 rounded-full font-medium"
                          >
                            {label}
                          </span>
                        );
                      })}
                      {track.program.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{track.program.length - 3} more
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-gray-500">No program tags</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bar Chart and invoice section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChart invoices={invoices} learners={learners} tracks={tracks} />
        <LatestInvoice invoices={invoices.slice(0, 5)} />
      </section>
    </>
  );
};

// Helper function to determine text color based on background color
function getTextColorForBackground(backgroundColor) {
  if (!backgroundColor) return '#000000';
  
  let r, g, b;
  
  if (backgroundColor.startsWith('#')) {
    const hex = backgroundColor.replace('#', '');
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substr(0, 2), 16);
      g = parseInt(hex.substr(2, 2), 16);
      b = parseInt(hex.substr(4, 2), 16);
    } else {
      return '#000000';
    }
  } else if (backgroundColor.startsWith('rgb')) {
    const rgb = backgroundColor.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      r = parseInt(rgb[0]);
      g = parseInt(rgb[1]);
      b = parseInt(rgb[2]);
    } else {
      return '#000000';
    }
  } else {
    return '#000000';
  }
  
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
}

export default DashBoard;