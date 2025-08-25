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

  // New state for modal
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

      {/* Search */}
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
                <div
                  key={l.id}
                  className="grid grid-cols-6 items-center px-4 py-3 shadow-sm rounded-lg bg-white hover:shadow-md transition"
                >
                  <div className="text-gray-800 font-semibold truncate">
                    {l.learnerName}
                  </div>

                  <div className="text-center text-sm text-gray-600">
                    {l.tracks && l.tracks.length > 0
                      ? l.tracks[0].name
                      : "No tracks"}
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    {l.dateJoined
                      ? new Date(l.dateJoined).toLocaleDateString()
                      : "—"}
                  </div>

                  <div className="text-center text-sm text-gray-700">
                    {formatCurrency(l.amount, l.currency)}
                  </div>

                  <div className="text-center text-sm text-gray-600">
                    {l.gender || "—"}
                  </div>

                  <div className="text-center text-sm flex justify-center">
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
        </section>
      )}

      {/* Modal */}
      {showModal && selectedLearner && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>

            {/* Profile image */}
            <div className="flex flex-col items-center">
              <img
                src={selectedLearner.avatar || "/default-avatar.png"}
                alt={selectedLearner.learnerName}
                className="w-24 h-24 rounded-full object-cover mb-4"
              />
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedLearner.learnerName}
              </h2>
              <p className="text-gray-500 text-sm">{selectedLearner.email}</p>
            </div>

            {/* Details */}
            <div className="mt-6 space-y-3 text-gray-700">
              <p>
                <span className="font-medium">Program:</span>{" "}
                {selectedLearner.tracks?.map((t) => t.name).join(", ") ||
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
    </>
  );
};

export default Learners;
