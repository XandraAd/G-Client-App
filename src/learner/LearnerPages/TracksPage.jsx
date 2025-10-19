import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import axios from "axios";

import { FaCediSign, FaStar, FaRegStar } from "react-icons/fa6";

const TracksPage = () => {
  const [query, setQuery] = useState("");
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({}); // Store ratings by track ID



// Fetch tracks from your API endpoint
const fetchTracks = async () => {
  try {
    setLoading(true);

    const res = await axios.get("/api/tracks");

    console.log("📥 Tracks fetched:", res.data);
    setTracks(res.data);
    setFilteredTracks(res.data);
    fetchRatingsForTracks(res.data);
  } catch (error) {
    console.error("Failed to load tracks:", error);
  } finally {
    setLoading(false);
  }
};


  // Fetch ratings for all tracks
  const fetchRatingsForTracks = async (tracksData) => {
    try {
      const ratingsData = {};
      
      // Fetch ratings for each track
      for (const track of tracksData) {
        try {
          const res = await axios.get(`/api/tracks/${track.id}/reviews`);
          const reviews = res.data;
          
          if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
            const averageRating = totalRating / reviews.length;
            ratingsData[track.id] = {
              average: averageRating,
              count: reviews.length
            };
          } else {
            ratingsData[track.id] = {
              average: 0,
              count: 0
            };
          }
        } catch (error) {
          console.error(`Failed to fetch reviews for track ${track.id}:`, error);
          ratingsData[track.id] = {
            average: 0,
            count: 0
          };
        }
      }
      
      setRatings(ratingsData);
    } catch (error) {
      console.error("Failed to fetch ratings:", error);
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
      (track.instructor && track.instructor.toLowerCase().includes(searchTrack)) ||
      (Array.isArray(track.program) && 
        track.program.some((tech) =>
          typeof tech === "string"
            ? tech.toLowerCase().includes(searchTrack)
            : tech.label?.toLowerCase().includes(searchTrack)
        )
      )
    );
  });

  setFilteredTracks(result);
};

  // Function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-500" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-500" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-500" />);
      }
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Page Header */}
      <div className="h-[175px] bg-blue-700 flex items-center justify-center px-4">
        <h1 className="text-white font-bold text-[24px]">Tracks</h1>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className=" mt-4 p-4 md:p-6 relative">
          <div className="relative max-w-2xl mx-auto">
            <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              id="search-tracks"
              placeholder="Search by track name, technology, or instructor...."
              value={query}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg pl-12 pr-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Top Tracks Title */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Top Tracks</h2>
         
        </div>

        {/* Tracks Grid */}
        {filteredTracks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTracks.map((track) => {
              const trackRating = ratings[track.id] || { average: 0, count: 0 };
              
              return (
                <Link 
                  key={track.id} 
                  to={`/tracks/${track.id}`} 
                  className="block transform transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full hover:shadow-lg border border-gray-100">
                    {/* Track Image */}
                    <div
                      className="relative w-full h-48 bg-no-repeat bg-cover bg-center"
                      style={{ backgroundImage: `url(${track.bgImg})` }}
                    >
                     
                    </div>

                    {/* Track Details */}
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                        {track.title}
                      </h3>
                      
                     
                      
                      <p className="mt-2 text-sm text-gray-600 mb-3 line-clamp-3 flex-grow">
                        {track.description}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center justify-between mt-auto mb-3">
                        <div className="flex items-center">
                          <div className="flex">
                            {renderStars(trackRating.average)}
                          </div>
                          <span className="text-sm text-gray-500 ml-1">
                            ({trackRating.average.toFixed(1)})
                          </span>
                        </div>
                     <div className=" bg-white px-3 py-1  flex items-center">
                      <p>Price:</p>                  <FaCediSign className="text-blue-600 mr-1" />
                                        <span className="text-sm font-medium">
                                          {Number(track.value).toLocaleString()}
                                        </span>
                                      </div>
                      </div>
                    </div>

                    {/* Preview Button */}
                    <div className="p-4 border-t border-gray-100">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200">
                        Preview Track
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* No results message */
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No tracks found</h3>
            <p className="text-gray-500">
              We couldn't find any tracks matching "{query}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TracksPage;