import React, { useState } from "react";
import TracksCards from "../Components/TracksCard";
import CalendarIcon from "../../assets/icons/calendarIcon.png";
import { CiSearch } from "react-icons/ci";

const Tracks = () => {
  const [query, setQuery] = useState("");
  const [filteredTracks, setFilteredTracks] = useState(TracksCards);

  const handleChange = (e) => {
    const searchTrack = e.target.value.trim().toLowerCase();
    setQuery(searchTrack);

    const result = TracksCards.filter((track) => {
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
        <CiSearch className="absolute left-[40px]  top-[ 30px] transform -translate-y-1/2 text-gray-400 text-lg" />
        <input
          type="text"
          value={query}
          
          onChange={handleChange}
          placeholder="Search tracks..."
          className=" border border-gray-300 px-4 py-2 rounded-lg w-1/2 max-w-md"
        />
        <button className="bg-[#01589A] text-white h-10 w-[30%] rounded-xl capitalize text-[16px] font-semibold leading-[20px]">
          + Add Track
        </button>
      </div>

      <section className="py-2 min-h-full lg:min-h-[300px] mb-6">
        <h4 className="text-[20px] font-semibold text-gray-900 mb-2">Tracks</h4>

        <div className="my-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTracks.map((track) => (
            <div key={track.title} className="rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden">
              <div
                className="rounded-t-md w-[256px] h-[180px] bg-no-repeat bg-cover min-w-full"
                style={{ backgroundImage: `url(${track.bgImg})` }}
              >
                <p className="text-xs mt-2 px-2 py-1 bg-white rounded absolute right-2">
                  ${Number(track.value).toLocaleString()}
                </p>
              </div>

              <div className="relative z-10 text-black px-2 pb-3">
                <h3 className="mt-2 text-[18px] font-semibold">{track.title}</h3>
                <div className="flex items-center mt-2 text-gray-500 font-normal text-[14px]">
                  <img src={CalendarIcon} alt="calendar" className="w-4 h-4" />
                  <p className="ml-2">{track.duration}</p>
                </div>

                <div className="mt-2">
                  {track.program.map((tech, i) => {
                    const label = typeof tech === "string" ? tech : tech.label;
                    const bgColor = tech.bgColor || "#E0F2FE";
                    const textColor = tech.textColor || "#1E3A8A";
                    return (
                      <span
                        key={i}
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

        {filteredTracks.length === 0 && (
          <p className="text-gray-500 mt-8 text-center">No matching tracks found.</p>
        )}
      </section>
    </>
  );
};

export default Tracks;

