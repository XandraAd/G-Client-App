import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { CiSearch } from "react-icons/ci";
import { MdOutlineRemoveRedEye } from "react-icons/md";

const itemsPerPage = 5;

const Learners = () => {
  const [query, setQuery] = useState("");
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLearners = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("http://localhost:5000/api/learners");

      console.log("API Response:", res.data); // Debug log

      console.log("Paying learners count:", res.data.length);

      if (Array.isArray(res.data)) {
        setLearners(res.data);
        // Log sample learner to see structure
        if (res.data.length > 0) {
          console.log("Sample learner:", res.data[0]);
        }
      } else {
        setLearners([]);
        console.error("Unexpected API response format:", res.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch learners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearners();
  }, []);

  // Get enrolled learners (filter on frontend if backend doesn't support it)
  const enrolledLearners = useMemo(() => {
    return learners.filter(
      (learner) =>
        learner.enrolled === true ||
        learner.enrolled === "true" ||
        (Array.isArray(learner.courses) && learner.courses.length > 0) ||
        learner.status === "Enrolled"
    );
  }, [learners]);

  // Format currency based on stored currency type
  const formatCurrency = (amount, currency) => {
    if (amount == null) return "—";
    const numericAmount =
      typeof amount === "number" ? amount : parseFloat(amount);
    if (isNaN(numericAmount)) return "—";

    if (currency === "GHS") {
      return `GHS ${numericAmount.toFixed(2)}`;
    } else if (currency === "USD") {
      return `$${numericAmount.toFixed(2)}`;
    }
    // Default to USD if currency not specified
    return `$${numericAmount.toFixed(2)}`;
  };

  // Search (name/email)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return enrolledLearners;
    return enrolledLearners.filter(
      (l) =>
        (l.learnerName || l.name || l.fullName || "")
          .toLowerCase()
          .includes(q) || (l.email || "").toLowerCase().includes(q)
    );
  }, [query, enrolledLearners]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  return (
    <>
      <h4 className="mt-10 text-[24px] font-semibold">Manage Learners</h4>
      <p className="text-gray-400 text-[18px] font-normal">
        Filter, sort, and access detailed learner profiles
      </p>

      <div className="relative my-4 w-full max-w-md">
        <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search learner by name or email..."
          className="border border-gray-300 pl-10 py-2 rounded-lg w-full"
        />
      </div>

      {loading && <p className="text-gray-500">Loading learners…</p>}
      {error && (
        <p className="text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
      )}

      {!loading && !error && (
        <section className="py-6 min-h-full mb-10">
          <div className="grid grid-cols-6 text-sm font-medium text-gray-600 mb-2 px-4">
            <p>Learners</p>
            <p className="text-center">Courses</p>
            <p className="text-center">Date Joined</p>
            <p className="text-center">Amount</p>
            <p className="text-center">Gender</p>
            <p className="text-center">Actions</p>
          </div>

          {filtered.length === 0 ? (
            <p className="text-gray-500 mt-6 text-center">
              {enrolledLearners.length === 0
                ? "No enrolled learners found."
                : "No learners match your search."}
            </p>
          ) : (
          

<div className="space-y-4">
  {paginated.map((l) => (
    <div key={l.id} className="grid grid-cols-7 items-center px-4 py-3 shadow-sm rounded-lg bg-white hover:shadow-md transition">
      <div className="text-gray-800 font-semibold truncate">
        {l.learnerName}
      </div>
      
      {/* Show track names with tooltip */}
      <div className="text-center text-sm text-gray-600 relative group">
        {l.tracks && l.tracks.length > 0 ? (
          <>
            <div className="truncate max-w-[120px] mx-auto">
              {l.tracks[0].name}
              {l.tracks.length > 1 && ` +${l.tracks.length - 1}`}
            </div>
            
            {/* Tooltip with all track names */}
            {l.tracks.length > 1 && (
              <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-xs rounded py-2 px-3 whitespace-nowrap">
                  <div className="font-semibold mb-1">Enrolled Tracks:</div>
                  {l.tracks.map((track, index) => (
                    <div key={track.id || index}>• {track.name}</div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : l.trackCount > 0 ? (
          `${l.trackCount} track${l.trackCount === 1 ? "" : "s"}`
        ) : l.paymentCount > 0 ? (
          `${l.paymentCount} payment${l.paymentCount === 1 ? "" : "s"}`
        ) : (
          "No tracks"
        )}
      </div>
      
      <div className="text-center text-sm text-gray-500">
        {l.dateJoined ? new Date(l.dateJoined).toLocaleDateString() : "—"}
      </div>
      
      <div className="text-center text-sm text-gray-700">
        {formatCurrency(l.amount, l.currency)}
      </div>
      
      <div className="text-center text-sm text-gray-600">
        {l.gender || "—"}
      </div>
      
      <div className="text-center text-sm">
        <span className={`px-2 py-1 rounded-full text-xs ${
          l.enrolled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}>
          {l.status}
        </span>
      </div>
      
      <div className="flex justify-center gap-2">
        <button 
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors" 
          title="View details"
          onClick={() => console.log("View learner details:", l)}
        >
          <MdOutlineRemoveRedEye className="text-gray-600 hover:text-blue-600" />
        </button>
      </div>
    </div>
  ))}
</div>
          )}

          {/* Pagination */}
          {filtered.length > itemsPerPage && (
            <div className="flex justify-between items-center mt-6 border border-gray-300 rounded-md overflow-hidden bg-white">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm font-medium border-r border-gray-300 ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed bg-gray-100"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                ← Previous
              </button>

              <div className="flex-1 text-center py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-sm font-medium border-l border-gray-300 ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed bg-gray-100"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                Next →
              </button>
            </div>
          )}
        </section>
      )}
    </>
  );
};

export default Learners;
