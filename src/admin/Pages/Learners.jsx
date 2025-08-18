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

  // Fetch ONLY enrolled learners
  const fetchLearners = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("http://localhost:5000/api/learners", { params: { enrolled: 1 } });
      setLearners(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch learners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearners();
  }, []);

  // Search (name/email)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return learners;
    return learners.filter((l) =>
      (l.learnerName || "").toLowerCase().includes(q) || (l.email || "").toLowerCase().includes(q)
    );
  }, [query, learners]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  useEffect(() => {
    // If search shrinks the list, make sure current page stays valid
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

      {loading && <p className="text-gray-500">Loading enrolled learners…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <section className="py-6 min-h-full mb-10">
          <div className="grid grid-cols-6 text-sm font-medium text-gray-600 mb-2 px-4">
            <p>Learners</p>
            <p className="text-center">Courses</p>
            <p className="text-center">Date Joined</p>
            <p className="text-center">Amount</p>
            <p className="text-center">Gender</p>
            <p className="text-center"></p>
          </div>

          {filtered.length === 0 ? (
            <p className="text-gray-500 mt-6 text-center">No enrolled learners found.</p>
          ) : (
            <div className="space-y-4">
              {paginated.map((l) => (
                <div key={l.id} className="grid grid-cols-6 items-center px-4 py-3 shadow-sm rounded-lg bg-white hover:shadow-md transition">
                  <div className="text-gray-800 font-semibold truncate">{l.learnerName || "—"}</div>
                  <div className="text-center text-sm text-gray-600">
                    {Array.isArray(l.courses) ? `${l.courses.length} course${l.courses.length === 1 ? "" : "s"}` : "—"}
                  </div>
                  <div className="text-center text-sm text-gray-500">
                    {l.dateJoined ? new Date(l.dateJoined).toLocaleDateString() : (l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "—")}
                  </div>
                  <div className="text-center text-sm text-gray-700">{typeof l.amount === "number" ? `$${l.amount.toFixed(2)}` : "—"}</div>
                  <div className="text-center text-sm text-gray-600">{l.gender || "—"}</div>
                  <div className="flex justify-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100" title="View">
                      <MdOutlineRemoveRedEye />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="flex justify-between items-center mt-6 shadow-sm border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 text-sm font-medium border-r border-gray-300 ${
                  currentPage === 1 ? "text-gray-400 cursor-not-allowed bg-gray-100" : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-sm font-medium border-r border-gray-300 ${
                      currentPage === page ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 text-sm font-medium ${
                  currentPage === totalPages ? "text-gray-400 cursor-not-allowed bg-gray-100" : "text-blue-600 hover:bg-blue-50"
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