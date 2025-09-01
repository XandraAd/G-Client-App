import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { FaCediSign } from "react-icons/fa6";
import CalendarIcon from "../../../public/assets/icons/calendarIcon.png";
import { db } from "../../admin/Config/Firebase.js";

// More vibrant and distinct colors
const PROGRAM_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#F9A826", "#6C5CE7", 
  "#00B894", "#FD79A8", "#FDCB6E", "#00CEC9", "#546DE5",
  "#E17055", "#0984E3", "#D63031", "#00B894", "#E84393",
  "#FDCB6E", "#636E72", "#74B9FF", "#A29BFE", "#DFE6E9",
  "#FF9FF3", "#FEA47F", "#F97F51", "#B33771", "#3B3B98",
  "#58B19F", "#BDC581", "#2C3A47", "#82589F", "#D6A2E8"
];

const LearnerTracks = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const tracksRef = collection(db, "tracks");
        const snapshot = await getDocs(tracksRef);
        const tracksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTracks(tracksData);
      } catch (error) {
        console.error("Failed to load tracks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Our Solution
        </h2>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
          Explore our comprehensive learning paths designed to help you master
          new skills.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {tracks.slice(0, 4).map((track) => {
          const bgImgKey = track.bgImg?.replace(".png", "");

          return (
            <Link 
              key={track.id} 
              to={`/tracks/${track.id}`}
              className="block transform transition-transform duration-300 hover:scale-105"
            >
              <div className="w-full h-full rounded-xl shadow-md hover:shadow-xl flex flex-col overflow-hidden bg-white border border-gray-100">
                {/* Track Image */}
                <div
                  className="w-full h-48 bg-no-repeat bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${bgImgKey})` }}
                >
                  <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-sm flex items-center">
                    <FaCediSign className="text-blue-600 mr-1" />
                    <span className="text-sm font-medium">
                      {Number(track.value).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Track Details */}
                <div className="flex-1 p-4 flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 h-14">
                    {track.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-3">
                    {track.description}
                  </p>

                  <div className="flex items-center mb-4 text-gray-500">
                    <img
                      src={CalendarIcon}
                      alt="calendar"
                      className="w-4 h-4"
                    />
                    <span className="ml-2 text-sm">{track.duration}</span>
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

export default LearnerTracks;