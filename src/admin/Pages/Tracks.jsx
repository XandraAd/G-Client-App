import React, { useState ,useEffect} from "react";
import axios from "axios"
import { Link } from "react-router-dom";

import CalendarIcon from "../../assets/icons/calendarIcon.png";
import { CiSearch } from "react-icons/ci";
import AddTracks from "../Components/forms/AddTrack"
import ReactModal from 'react-modal';

// Image imports for mapping string names to real images
import bgUi from "../../assets/icons/bgUi.png";
import bgSoftware from "../../assets/icons/bgSoftware.png";
import bgCloud from "../../assets/icons/bgCloud.png";
import bgData from "../../assets/icons/bgData.png";

const imageMap = {
  bgUi,
  bgSoftware,
  bgCloud,
  bgData,
};




const Tracks = () => {
  const [query, setQuery] = useState("");
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [tracks, setTracks] = useState([]);
   const [isAddTrackModalOpen, setIsAddTrackModalOpen] = useState(false);


  
  
  // 🔁 1. Define fetchTracks OUTSIDE useEffect
  const fetchTracks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tracks");
      setTracks(res.data);
      setFilteredTracks(res.data);
    } catch (error) {
      console.error("Failed to fetch tracks:", error);
    }
  };

  // 2️⃣ Call it inside useEffect on mount
  useEffect(() => {
    fetchTracks();
  }, []);


 
 const handleChange = (e) => {
  const searchTrack = e.target.value.trim().toLowerCase();
  setQuery(searchTrack);

  const result = tracks.filter((track) => {
    return (
      track.title.toLowerCase().includes(searchTrack) ||
      track.program.some((tech) =>
        typeof tech === "string"
          ? tech.toLowerCase().includes(searchTrack)
          : tech.label?.toLowerCase().includes(searchTrack)
      )
    );
  });

  setFilteredTracks(result);
};





  
 

  return (
    <>
      <h4 className="mt-10 text-[24px] font-semibold">Manage Tracks</h4>
      <p className="text-gray-400 text-[18px] font-normal">Filter, sort, and access detailed tracks</p>

      <div className="flex items-center justify-between gap-2 my-4">
        <CiSearch className="absolute left-[17px] lg:left-[250px] xl:left-[430px] top-[13.5rem] lg:top-[11.5rem] transform -translate-y-1/2 text-gray-400 text-lg" />
        <input
          type="text"
          value={query}
          
          onChange={handleChange}
          placeholder="Search tracks..."
          className=" border border-gray-300 pl-6 lg:pl-12 py-2 rounded-lg w-1/2 max-w-md"
        />
        <button 
        onClick={() => setIsAddTrackModalOpen(true)}
        className="bg-[#01589A] text-white h-10 w-[30%] rounded-xl capitalize text-[16px] font-semibold leading-[20px]">
          + Add Track
        </button>
      </div>
        <ReactModal
        isOpen={isAddTrackModalOpen}
        onRequestClose={() => setIsAddTrackModalOpen(false)}
         className="rounded-lg  p-6 w-full max-w-md  mx-auto mt-20 outline-none relative  "
         contentLabel="Add New Track"
        overlayClassName="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50  "
      >
        <AddTracks 
         onClose={() => setIsAddTrackModalOpen(false)}
        setTracks={setTracks}
         refreshTracks={fetchTracks}/>
      </ReactModal>

      <section className="py-2 min-h-full lg:min-h-[300px] mb-6  ">
        <h4 className="text-[20px] font-semibold text-gray-900 mb-2">Tracks</h4>

        <div className="my-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-16">
          {filteredTracks.map((track) => {
            const bgImgKey = track.bgImg?.replace(".png", "");
            const bgImg = imageMap[bgImgKey] || track.bgImg;
          return (
            <Link key={track.id} to={`${track.id}`}>

            <div key={track.id} className="lg:w-[200px] rounded-xl shadow-lg flex  flex-col justify-between relative overflow-hidden  h-[300px]">
              <div
                className="rounded-t-md w-[256px] h-[400px] bg-no-repeat bg-cover min-w-full"
                style={{ backgroundImage: `url(${bgImg})` }}
              >
                <p className="text-xs mt-2 px-2 py-1 bg-white rounded absolute right-2">
                  ${Number(track.value).toLocaleString()}
                </p>
              </div>

              <div className="relative z-10 text-black px-2 pb-3 h-[200px]">
                <h3 className="mt-2 text-[18px] font-semibold">{track.title}</h3>
                <p className="text-sm text-gray-500 overflow-hidden line-clamp-3">{track.description}</p>
                <div className="flex items-center mt-2 text-gray-500 font-normal text-[14px]">
                  <img src={CalendarIcon} alt="calendar" className="w-4 h-4" />
                  <p className="ml-2">{track.duration}</p>
                </div>

                <div className="mt-2">
                  {track.program.map((tech) => {
                    const label = typeof tech === "string" ? tech : tech.label;
                    const bgColor = tech.bgColor || "#E0F2FE";
                    const textColor = tech.textColor || "#1E3A8A";
                    return (
                      <span
                        key={tech.label}
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
            </Link>
          )})}
        </div>

        {filteredTracks.length === 0 && (
          <p className="text-gray-500 mt-8 text-center">No matching tracks found.</p>
        )}
      </section>

     
    </>
  );
};

export default Tracks;

