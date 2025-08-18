import React,{useEffect,useState} from "react"
import axios from "axios"
import { HiOutlineUserGroup, HiCurrencyDollar } from "react-icons/hi2";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { MdArrowUpward } from "react-icons/md";

import CalendarIcon from "../../assets/icons/calendarIcon.png"
import BarChart from "../Components/BarChart"
import LatestInvoice from "../Components/LatestInvoice";

const DashBoard = () => {
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
      icon: HiCurrencyDollar,
      iconTextColor: "text-orange-600",
      title: "Revenues",
      value: `$${invoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0).toLocaleString()}`,
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
                  className={`$ ${card.iconTextColor}   p-2 text-[60px]  rounded-lg `}
                >
                  <card.icon />
                </div>
              </div>

              <p className="text-[14px] font-medium  text-gray-500 my-2">
                <MdArrowUpward className="inline w-4 h-4 mr-1 t"  style={{ color: "#12B76A" }} />
                {card.metric && (
                  <span className={`${card.metricColor} `}>
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
      <section className="py-2   min-h-full lg:min-h-[300px] mb-6 ">
        <h4 className="text[20px] font-semibold text-gray-900">Tracks</h4>
     
        <div className="my-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4  ">
          {tracks.slice(0,4).map((track) => (
            <div
              key={track.title}
              className=" rounded-xl shadow-lg flex flex-col justify-evenly lg:w-[190px] xl:w-[240px] relative overflow-hidden "
            >
               
              <div
                className="rounded-t-md w-[256px] h-[180px] bg-no-repeat bg-cover min-w-full "
                style={{
                  backgroundImage: `url(${track.bgImg})`,
                }}
              >
                <p className="text-xs mt-2 w-[20px]h-[20px] bg-white rounded absolute right-2">${track.value}</p>
              </div>
             

              <div className="relative z-10 text-black">
                
                <h3 className="mt-2 px-2 text-[18px] font-semibold  w-56">{track.title}</h3>
              <div className="flex items-center mt-2 mx-2 text-gray-500 font-normal text-[14px] xl:mb-2">
                   <img src={CalendarIcon} alt="calendar" className="w-4 h-4" />
                  <p className="ml-2">
                      {track.duration}
                    </p>
              </div>
                 



                {/* Tags */}
<div className="mt-2">
  {Array.isArray(track.program) &&
    track.program.map((tech) => {
      const label = typeof tech === "string" ? tech : tech.label;
      const bgColor = tech.bgColor || "#E0F2FE";
      const textColor = tech.textColor || "#1E3A8A";
      return (
        <span
          key={label}
          style={{
            backgroundColor: bgColor,
            color: textColor,
            fontSize: "10px",
            padding: "4px 8px",
            borderRadius: "9999px",
            marginRight: "6px",
            display: "inline-block",
            marginBottom: "10px",
            marginInlineStart: "4px",
          }}
        >
          {label}
        </span>
      );
    })}
</div>

              </div>
            </div>
          ))}
        </div>
      </section>
       {/* Bar Chart and invoice  section*/}
         <section className=" grid grid-cols-1 md:grid-cols-2 gap-4">
      
     <BarChart invoices={invoices} learners={learners} tracks={tracks} />
<LatestInvoice invoices={invoices.slice(0, 5)} />

    </section>
    </>
  );
};

export default DashBoard;
