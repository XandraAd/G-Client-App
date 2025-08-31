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
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchLearners = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("http://localhost:5000/api/learners");
      if (Array.isArray(res.data)) {
        setLearners(res.data);
      } else {
        setLearners([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch learners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearners();
  }, []);

  const enrolledLearners = useMemo(() => {
    if (learners.length > 0 && learners[0].hasPayments !== undefined) {
      return learners.filter((learner) => learner.hasPayments);
    } else {
      return learners.filter(
        (learner) =>
          learner.enrolled === true ||
          learner.enrolled === "true" ||
          (Array.isArray(learner.courses) && learner.courses.length > 0) ||
          learner.status === "Enrolled"
      );
    }
  }, [learners]);

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
    return `$${numericAmount.toFixed(2)}`;
  };

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
  }, [filtered, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of the list for better mobile experience
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h4 className="mt-4 text-xl font-semibold md:mt-6 md:text-2xl">Manage Learners</h4>
      <p className="text-gray-400 text-base font-normal md:text-lg">
        Filter, sort, and access detailed learner profiles
      </p>

      {/* Search */}
      <div className="relative my-4 w-full max-w-md">
        <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search learner by name or email..."
          className="border border-gray-300 pl-10 pr-4 py-2 rounded-lg w-full"
        />
      </div>

      {loading && <p className="text-gray-500">Loading learners…</p>}
      {error && (
        <p className="text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
      )}

      {!loading && !error && (
        <section className="py-4 min-h-full mb-6 md:py-6 md:mb-10">
          {/* Table headers - hidden on mobile, shown on larger screens */}
          <div className="hidden sm:grid sm:grid-cols-6 text-sm font-medium text-gray-600 mb-2 px-2 md:px-4">
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
            <div className="space-y-3 md:space-y-4">
              {paginated.map((l) => (
                <div
                  key={l.id || l._id || `${l.email}-${l.learnerName}`}
                  className="grid grid-cols-1 gap-3 p-4 shadow-sm rounded-lg bg-white hover:shadow-md transition sm:grid-cols-6 sm:gap-0 sm:items-center sm:px-2 sm:py-3 md:px-4"
                >
                  {/* Mobile view label-value pairs */}
                  <div className="sm:hidden grid grid-cols-2 gap-2">
                    <p className="font-medium text-gray-600">Learner:</p>
                    <p className="text-gray-800 font-semibold truncate">{l.learnerName || l.name || l.fullName || "—"}</p>
                    
                    <p className="font-medium text-gray-600">Courses:</p>
                    <p className="text-gray-600">
                      {l.tracks && l.tracks.length > 0
                        ? l.tracks[0].name
                        : l.courses && l.courses.length > 0
                        ? l.courses[0].name || l.courses[0]
                        : "No courses"}
                    </p>
                    
                    <p className="font-medium text-gray-600">Date Joined:</p>
                    <p className="text-gray-500">
                      {l.dateJoined || l.createdAt
                        ? new Date(l.dateJoined || l.createdAt).toLocaleDateString()
                        : "—"}
                    </p>
                    
                    <p className="font-medium text-gray-600">Amount:</p>
                    <p className="text-gray-700">{formatCurrency(l.amount, l.currency)}</p>
                    
                    <p className="font-medium text-gray-600">Gender:</p>
                    <p className="text-gray-600">{l.gender || "—"}</p>
                    
                    <p className="font-medium text-gray-600">Actions:</p>
                    <div className="flex">
                      <button
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="View details"
                        onClick={() => {
                          setSelectedLearner(l);
                          setShowModal(true);
                        }}
                      >
                        <MdOutlineRemoveRedEye className="text-gray-600 hover:text-blue-600" />
                      </button>
                    </div>
                  </div>

                  {/* Desktop view */}
                  <div className="hidden sm:block text-gray-800 font-semibold truncate">
                    {l.learnerName || l.name || l.fullName || "—"}
                  </div>
                  <div className="hidden sm:block text-center text-sm text-gray-600 truncate px-1">
                    {l.tracks && l.tracks.length > 0
                      ? l.tracks[0].name
                      : l.courses && l.courses.length > 0
                      ? l.courses[0].name || l.courses[0]
                      : "No courses"}
                  </div>
                  <div className="hidden sm:block text-center text-sm text-gray-500">
                    {l.dateJoined || l.createdAt
                      ? new Date(l.dateJoined || l.createdAt).toLocaleDateString()
                      : "—"}
                  </div>
                  <div className="hidden sm:block text-center text-sm text-gray-700">
                    {formatCurrency(l.amount, l.currency)}
                  </div>
                  <div className="hidden sm:block text-center text-sm text-gray-600">
                    {l.gender || "—"}
                  </div>
                  <div className="hidden sm:flex sm:justify-center">
                    <button
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="View details"
                      onClick={() => {
                        setSelectedLearner(l);
                        setShowModal(true);
                      }}
                    >
                      <MdOutlineRemoveRedEye className="text-gray-600 hover:text-blue-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-3 py-1 rounded-md border ${
                  currentPage === 1
                    ? "text-gray-400 border-gray-300 cursor-not-allowed"
                    : "text-blue-600 border-blue-500 hover:bg-blue-50"
                }`}
              >
                ← Prev
              </button>

              {[...Array(totalPages)].map((_, idx) => {
                const page = idx + 1;
                // Show limited page numbers on mobile
                if (typeof window !== 'undefined' && window.innerWidth < 640 && 
                    Math.abs(page - currentPage) > 1 && 
                    page !== 1 && 
                    page !== totalPages) {
                  if (Math.abs(page - currentPage) === 2) {
                    return <span key={page} className="px-1">...</span>;
                  }
                  return null;
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md text-sm font-medium border ${
                      currentPage === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "text-gray-600 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-3 py-1 rounded-md border ${
                  currentPage === totalPages
                    ? "text-gray-400 border-gray-300 cursor-not-allowed"
                    : "text-blue-600 border-blue-500 hover:bg-blue-50"
                }`}
              >
                Next →
              </button>
            </div>
          )}
        </section>
      )}

      {/* Modal */}
      {showModal && selectedLearner && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10"
            >
              ✖
            </button>

            {/* Profile image */}
            <div className="flex flex-col items-center pt-6 pb-4 px-6">
              <img
                src={selectedLearner.avatar || "/default-avatar.png"}
                alt={selectedLearner.learnerName || selectedLearner.name || "Learner"}
                className="w-24 h-24 rounded-full object-cover mb-4"
              />
              <h2 className="text-xl font-semibold text-gray-800 text-center">
                {selectedLearner.learnerName || selectedLearner.name || selectedLearner.fullName || "—"}
              </h2>
              <p className="text-gray-500 text-sm text-center">{selectedLearner.email || "—"}</p>
            </div>

            {/* Details */}
            <div className="px-6 pb-6 space-y-3 text-gray-700">
              <p>
                <span className="font-medium">Program:</span>{" "}
                {selectedLearner.tracks?.map((t) => t.name).join(", ") ||
                  selectedLearner.courses?.join(", ") ||
                  "—"}
              </p>
              <p>
                <span className="font-medium">Gender:</span>{" "}
                {selectedLearner.gender || "—"}
              </p>
              <p>
                <span className="font-medium">Contact:</span>{" "}
                {selectedLearner.phone || "—"}
              </p>
              <p>
                <span className="font-medium">Location:</span>{" "}
                {selectedLearner.location || "—"}
              </p>
              <p>
                <span className="font-medium">Amount Paid:</span>{" "}
                {formatCurrency(selectedLearner.amount, selectedLearner.currency)}
              </p>
              <p>
                <span className="font-medium">Bio:</span>{" "}
                {selectedLearner.bio || "—"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Learners;