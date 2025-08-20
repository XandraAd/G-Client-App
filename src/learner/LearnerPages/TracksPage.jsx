import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CalendarIcon from "../../assets/icons/calendarIcon.png";
import { CiSearch } from "react-icons/ci";
import axios from "axios";
import { FaCediSign } from "react-icons/fa6";

const TracksPage = () => {
  const [query, setQuery] = useState("");
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [tracks, setTracks] = useState([]);

  // Fetch tracks
  const fetchTracks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tracks");
      setTracks(res.data);
      setFilteredTracks(res.data);
    } catch (error) {
      console.error("Failed to fetch tracks:", error);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  // Handle search
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
    <div className="mb-4">
      {/* Page Header */}
      <div className="h-[100px] bg-blue-700 flex items-center justify-center px-4">
        <h1 className="text-white font-bold text-[20px]">Tracks</h1>
      </div>

      {/* Search */}
      <div className="relative m-4 md:p-8 lg:px-20">
        <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        <input
          type="text"
          id="search-tracks"
          placeholder="Search Tracks..."
          value={query}
          onChange={handleChange}
          className="mt-1 my-4 w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2"
        />
      </div>

      {/* Top Tracks Title */}
      <div className="my-4 px-4">
        <h2 className="text-xl font-semibold">Top Tracks</h2>
      </div>

      {/* Tracks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 place-items-center">
        {filteredTracks.map((track) => (
          <Link key={track.id} to={`/tracks/${track.id}`} className="block w-full max-w-sm">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
              
              {/* Track Image */}
              <div
                className="relative w-full aspect-[4/3] bg-no-repeat bg-cover"
                style={{ backgroundImage: `url(${track.bgImg})` }}
              >
                <p className="absolute top-2 right-2 text-xs px-2 py-1 bg-white rounded shadow">
                  <FaCediSign className="inline mr-1" />{Number(track.value).toLocaleString()}
                </p>
              </div>

              {/* Track Details */}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold mb-1 line-clamp-2">{track.title}</h3>
                <p className="text-xs text-gray-600 italic mb-2">by {track.instructor}</p>
                <p className="text-sm text-gray-500 mb-3 line-clamp-3 flex-grow">
                  {track.description}
                </p>

                {/* Duration */}
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <img src={CalendarIcon} alt="calendar" className="w-4 h-4" />
                  <p className="ml-2">{track.duration}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-auto">
                  {Array.isArray(track.program) &&
                    track.program.map((tech) => {
                      const label = typeof tech === "string" ? tech : tech.label;
                      const bgColor = tech.bgColor || "#E0F2FE";
                      const textColor = tech.textColor || "#1E3A8A";
                      return (
                        <span
                          key={label}
                          style={{ backgroundColor: bgColor, color: textColor }}
                          className="text-[10px] px-2 py-1 rounded-full"
                        >
                          {label}
                        </span>
                      );
                    })}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* No results message */}
      {filteredTracks.length === 0 && (
        <p className="text-center text-gray-500 mt-4">
          No tracks found for "{query}"
        </p>
      )}
    </div>
  );
};

export default TracksPage;
