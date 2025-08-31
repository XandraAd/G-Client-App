import React, { useState, useEffect } from "react";
import axios from "axios"
import { Link } from "react-router-dom";
import CalendarIcon from "../../assets/icons/calendarIcon.png";
import { CiSearch } from "react-icons/ci";
import { IoPersonOutline } from "react-icons/io5";
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

// More vibrant and distinct colors
const PROGRAM_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#F9A826", "#6C5CE7", 
  "#00B894", "#FD79A8", "#FDCB6E", "#00CEC9", "#546DE5",
  "#E17055", "#0984E3", "#D63031", "#00B894", "#E84393",
  "#FDCB6E", "#636E72", "#74B9FF", "#A29BFE", "#DFE6E9",
  "#FF9FF3", "#FEA47F", "#F97F51", "#B33771", "#3B3B98",
  "#58B19F", "#BDC581", "#2C3A47", "#82589F", "#D6A2E8"
];

const Tracks = () => {
  const [query, setQuery] = useState("");
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [isAddTrackModalOpen, setIsAddTrackModalOpen] = useState(false);

  // Improved function to get a consistent color for a program tag
  const getProgramColor = (label) => {
    if (!label) return PROGRAM_COLORS[0];
    
    // Create a hash from the entire string for more variety
    let hash = 0;
    for (let i = 0; i < label.length; i++) {
      hash = label.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use absolute value and modulo to get index
    const index = Math.abs(hash) % PROGRAM_COLORS.length;
    return PROGRAM_COLORS[index];
  };

  const fetchTracks = async () => {
    try {
      const res = await axios.get("/api/tracks");
      setTracks(res.data);
      setFilteredTracks(res.data);
    } catch (error) {
      console.error("Failed to fetch tracks:", error);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const handleChange = (e) => {
    const searchTrack = e.target.value.trim().toLowerCase();
    setQuery(searchTrack);

    const result = tracks.filter((track) => {
      return (
        track.title.toLowerCase().includes(searchTrack) ||
        (Array.isArray(track.program) && track.program.some((tech) =>
          typeof tech === "string"
            ? tech.toLowerCase().includes(searchTrack)
            : tech.label?.toLowerCase().includes(searchTrack)
        ))
      );
    });

    setFilteredTracks(result);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h4 className="mt-4 text-xl font-semibold md:mt-6 md:text-2xl">Manage Tracks</h4>
      <p className="text-gray-400 text-base font-normal md:text-lg">
        Filter, sort, and access detailed tracks
      </p>

      <div className="flex flex-col sm:flex-row md:justify-between items-center gap-4 my-4">
        <div className="relative w-full sm:w-1/2">
          <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Search tracks..."
            className="border border-gray-300 pl-10 pr-4 py-2 rounded-lg w-full"
          />
        </div>
        <button 
          onClick={() => setIsAddTrackModalOpen(true)}
          className="bg-[#01589A] text-white py-2 px-4 rounded-xl capitalize text-base font-semibold w-full sm:w-auto"
        >
          + Add Track
        </button>
      </div>

      <ReactModal
        isOpen={isAddTrackModalOpen}
        onRequestClose={() => setIsAddTrackModalOpen(false)}
        className="rounded-lg p-4 w-11/12 max-w-md mx-auto mt-10 outline-none relative sm:p-6"
        contentLabel="Add New Track"
        overlayClassName="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50"
      >
        <AddTracks 
          onClose={() => setIsAddTrackTrackModalOpen(false)}
          setTracks={setTracks}
          refreshTracks={fetchTracks}
        />
      </ReactModal>

      <section className="py-4 min-h-full mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 md:text-xl">Tracks</h4>

        {filteredTracks.length === 0 ? (
          <p className="text-gray-500 mt-8 text-center">No matching tracks found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredTracks.map((track) => {
              const bgImgKey = track.bgImg?.replace(".png", "");
              const bgImg = imageMap[bgImgKey] || track.bgImg;
              
              return (
                <Link key={track.id} to={`${track.id}`}>
                  <div className="rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden h-[380px] md:h-[400px] transition-transform hover:scale-[1.02]">
                    <div
                      className="h-40 bg-no-repeat bg-cover bg-center"
                      style={{ backgroundImage: `url(${bgImg})` }}
                    >
                      <p className="text-xs mt-2 mr-2 px-2 py-1 bg-white rounded absolute top-2 right-2">
                        ${Number(track.value).toLocaleString()}
                      </p>
                    </div>

                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold line-clamp-1">{track.title}</h3>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-3 flex-grow">
                        {track.description}
                      </p>
                      
                      <div className="flex items-center mt-3 text-gray-500 text-sm">
                        <img src={CalendarIcon} alt="calendar" className="w-4 h-4" />
                        <p className="ml-2">{track.duration}</p>
                      </div>
                      
                      <div className="flex items-center mt-2 text-gray-500 text-sm">
                        <IoPersonOutline className="w-4 h-4" /> 
                        <p className="ml-2 line-clamp-1">{track.instructor}</p>
                      </div>

                      {/* Program Tags - Fixed Color Logic */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {Array.isArray(track.program) && track.program.length > 0 ? (
                          <>
                            {track.program.slice(0, 3).map((tech, index) => {
                              const label = typeof tech === "string" ? tech : tech.label;
                              const bgColor = typeof tech === "object" && tech.bgColor 
                                ? tech.bgColor 
                                : getProgramColor(label);
                              const textColor = typeof tech === "object" && tech.textColor 
                                ? tech.textColor 
                                : getTextColorForBackground(bgColor);
                              
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
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

// Helper function to determine text color based on background color
function getTextColorForBackground(backgroundColor) {
  if (!backgroundColor) return '#000000';
  
  // Handle both hex and rgb colors
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
  
  // Calculate brightness (perceived luminance)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
}

export default Tracks;