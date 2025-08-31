import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { HiOutlineUserGroup, HiCurrencyDollar } from "react-icons/hi2";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { FaCediSign } from "react-icons/fa6";
import { MdArrowUpward } from "react-icons/md";
import CalendarIcon from "../../assets/icons/calendarIcon.png";
import BarChart from "../Components/BarChart";
import LatestInvoice from "../Components/LatestInvoice";

const DashBoard = () => {
  const navigate = useNavigate();  
  const [learners, setLearners] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tracks, setTracks] = useState([]);
  
  // Card data array
  const statsCards = [
    {
      icon: HiOutlineUserGroup,
      iconTextColor: "text-green-600",
      title: "Total Learners",
      value: learners.length.toLocaleString(),
      metric: "12%",
      metricText: "vs last month",
      metricColor: "text-green-500",
    },
    {
      icon: FaCediSign,
      iconTextColor: "text-orange-600",
      title: "Revenues",
      value: `${invoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0).toLocaleString()}`,
      metric: "12%",
      metricText: "vs last month",
      metricColor: "text-green-500",
    },
    {
      icon: LiaFileInvoiceSolid,
      iconTextColor: "text-blue-600",
      title: "Invoices",
      value: invoices.length.toLocaleString(),
      metric: "2%",
      metricText: "vs last month",
      metricColor: "text-green-500",
    },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [learnersRes, invoicesRes, tracksRes] = await Promise.all([
          axios.get("http://localhost:5000/api/learners"),
          axios.get("http://localhost:5000/api/invoices"),
          axios.get("http://localhost:5000/api/tracks"),
        ]);

        setLearners(learnersRes.data);
        setInvoices(invoicesRes.data);
        setTracks(tracksRes.data);
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
      }
    };

    fetchDashboardData();
  }, []);

  // Function to handle "See More" click
  const handleSeeMoreClick = () => {
    navigate("/admin/tracks"); // Navigate to tracks page
  };

  return (
    <>
      {/* Stats Cards Section */}
      <h4 className="mt-10 text-[24px] font-semibold">Welcome admin</h4>
      <p className="text-gray-400 text-[18px] font-normal mt-">
        Track Activity,trends, and popular destination in real time
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

              <p className="text-[14px] font-medium text-gray-500 my-2">
                <MdArrowUpward
                  className="inline w-4 h-4 mr-1"
                  style={{ color: "#12B76A" }}
                />
                {card.metric && (
                  <span className={`${card.metricColor}`}>
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
          {/* Fixed "See More" button */}
          <button
            onClick={handleSeeMoreClick}
            className="text-[16px] font-medium text-blue-600 hover:text-blue-800 justify-self-end flex items-center"
          >
            See more<span className="ml-1">→</span> {/* Using arrow instead of dash */}
          </button>
        </div>

    <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-4 gap-4">
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
        {/* Fixed price display */}
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

        {/* Tags */}
        <div className="mt-2 flex flex-wrap">
          {Array.isArray(track.program) &&
            track.program.slice(0, 3).map((tech, index) => {
              const label = typeof tech === "string" ? tech : tech.label;
              const bgColor = tech.bgColor || "#E0F2FE";
              const textColor = tech.textColor || "#1E3A8A";
              return (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded-full mr-1 mb-1"
                  style={{
                    backgroundColor: bgColor,
                    color: textColor,
                  }}
                >
                  {label}
                </span>
              );
            })}
          {track.program && track.program.length > 3 && (
            <span className="text-xs text-gray-500 px-1">
              +{track.program.length - 3} more
            </span>
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

export default DashBoard;