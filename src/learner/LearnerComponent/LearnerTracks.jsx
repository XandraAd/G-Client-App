import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
//import { IoPersonOutline } from "react-icons/io5";

import { FaCediSign } from "react-icons/fa6";
import CalendarIcon from "../../assets/icons/calendarIcon.png";
import { db } from "../../admin/Config/Firebase.js";

const LearnerTracks = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

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
    return <p>Loading tracks...</p>;
  }

  return (
    <div className="w-full lg:w-[800px] mx-auto px-2 sm:px-4 lg:px-0  mb-12">
      <div className="text-center m-12">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Our Solution
        </h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Explore our comprehensive learning paths designed to help you master
          new skills.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 ">
        {tracks.slice(0, 4).map((track) => {
          const bgImgKey = track.bgImg?.replace(".png", "");

          return (
            <Link key={track.id} to={`/tracks/${track.id}`}>
              <div className="w-full md:w-[300px] lg:w-[200px] h-[490px] rounded-xl  shadow-lg flex flex-col justify-between relative overflow-hidden ">
                {/* Track Image */}
                <div
                  className="rounded-t-md w-full h-[400px] bg-no-repeat bg-cover "
                  style={{ backgroundImage: `url(${bgImgKey})` }}
                >
                  <p className="text-xs mt-2 px-2 py-1 bg-white rounded absolute right-5">
                     <FaCediSign className="inline mr-1" />{Number(track.value).toLocaleString()}
                  </p>
                </div>

                {/* Track Details */}
                <div className="relative z-10 text-black px-2  h-[200px] ">
                  <h3 className="mt-2 text-[18px] font-semibold h-[50px] ">
                    {track.title}
                  </h3>
                  <p className="text-sm text-gray-500 overflow-hidden line-clamp-3 h-[100px]">
                    {track.description}
                  </p>

                  <div className="flex items-center mt-2 text-gray-500 font-normal text-[14px]">
                    <img
                      src={CalendarIcon}
                      alt="calendar"
                      className="w-4 h-4"
                    />
                    <p className="ml-2">{track.duration}</p>
                  </div>

                  {/* Tags */}

                  <div className="mt-2">
                    {Array.isArray(track.program) &&
                      track.program.map((tech) => {
                        const label =
                          typeof tech === "string" ? tech : tech.label;
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
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default LearnerTracks;
