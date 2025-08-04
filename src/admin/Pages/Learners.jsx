import React, { useState, useEffect } from "react";
import axios from "axios";
import { CiSearch } from "react-icons/ci";
import AddLearner from "../Components/forms/AddLearners"; // ✅ Use correct form
import ReactModal from "react-modal";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";

const Learners = () => {
  const [query, setQuery] = useState("");
  const [filteredLearners, setFilteredLearners] = useState([]);
  const [learners, setLearners] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredLearners.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const paginatedLearners = filteredLearners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchLearners = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/learners");
      const sorted = res.data.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setLearners(sorted);
      setFilteredLearners(sorted);
    } catch (error) {
      console.error("Failed to fetch learners:", error);
    }
  };

  useEffect(() => {
    fetchLearners();
  }, []);

  const handleChange = (e) => {
    const searchQuery = e.target.value.trim().toLowerCase();
    setQuery(searchQuery);

    const result = learners.filter((learner) => {
      return (
        learner.learnerName?.toLowerCase().includes(searchQuery) ||
        learner.email?.toLowerCase().includes(searchQuery)
      );
    });

    setFilteredLearners(result);
  };

  const handleEdit = (learner) => {
    setSelectedLearner(learner);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (learnerId) => {
    try {
      await axios.delete(`http://localhost:5000/api/learners/${learnerId}`);
      const updated = learners.filter((l) => l.id !== learnerId);
      setLearners(updated);
      setFilteredLearners(updated);
    } catch (error) {
      console.error("Failed to delete learner:", error);
    }
  };

  return (
    <>
      <h4 className="mt-10 text-[24px] font-semibold">Manage Learners</h4>
      <p className="text-gray-400 text-[18px] font-normal">
        Filter, sort, and access detailed Learner Profile
      </p>

      <div className="flex items-center justify-between gap-2 my-4">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#01589A] text-white h-10 w-[30%] rounded-xl capitalize text-[16px] font-semibold leading-[20px]"
        >
          + Add Learner
        </button>

        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search learner..."
          className="border border-gray-300 pl-6 md:pl-[60px] lg:pl-12 py-2 rounded-lg w-1/2 max-w-md"
        />
        <CiSearch className="absolute left-[190px] md:left-[400px] lg:left-[650px] xl:left-[430px] top-[15.2rem] md:top-[13.5rem] lg:top-[11.5rem] transform -translate-y-1/2 text-gray-400 text-lg" />
      </div>

      {/* Add Learner Modal */}
      <ReactModal
        isOpen={isAddModalOpen}
        onRequestClose={() => setIsAddModalOpen(false)}
        className="rounded-lg p-6 w-full max-w-md mx-auto mt-20 outline-none relative"
        contentLabel="Add Learner"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <AddLearner onClose={() => setIsAddModalOpen(false)} refreshLearners={fetchLearners} />
      </ReactModal>

      {/* Edit Learner Modal */}
      <ReactModal
        isOpen={isEditModalOpen}
        onRequestClose={() => {
          setIsEditModalOpen(false);
          setSelectedLearner(null);
        }}
        className="rounded-lg p-6 w-full max-w-md mx-auto mt-20 outline-none relative"
        contentLabel="Edit Learner"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <AddLearner
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedLearner(null);
          }}
          refreshLearners={fetchLearners}
          existingLearner={selectedLearner}
          isEditing={true}
        />
      </ReactModal>

      {/* Learners Table */}
      <section className="py-6 min-h-full mb-10">
        <div className="grid grid-cols-6 text-sm font-medium text-gray-600 mb-2 px-4">
          <p>Learner</p>
          <p className="text-center">Email</p>
          <p className="text-center">Date Joined</p>
          <p className="text-center">Amount</p>
          <p className="text-center">Gender</p>
          <p className="text-center"></p>
        </div>

        {filteredLearners.length === 0 ? (
          <p className="text-gray-500 mt-6 text-center">No matching learners found.</p>
        ) : (
          <div className="space-y-4">
            {paginatedLearners.map((learner) => (
              <div
                key={learner.id}
                className="grid grid-cols-6 items-center px-4 py-3 shadow-sm rounded-lg bg-white hover:shadow-md transition"
              >
                <div className="text-gray-800 font-semibold">{learner.learnerName}</div>
                <div className="text-center text-sm text-gray-600">{learner.email}</div>
                <div className="text-center text-sm text-gray-500">
                  {learner.joinDate ? new Date(learner.joinDate).toLocaleDateString() : "—"}
                </div>
                <div className="text-center text-sm text-gray-700">${learner.amount || "—"}</div>
                <div className="text-center text-sm text-gray-600">{learner.gender || "—"}</div>
                <div className="flex justify-center gap-2">
                  <FiEdit2
                    className="text-green-700 text-[20px] p-1 rounded-full hover:bg-green-100 cursor-pointer"
                    onClick={() => handleEdit(learner)}
                  />
                  <MdDeleteOutline
                    className="text-red-600 text-[20px] p-1 rounded-full hover:bg-red-100 cursor-pointer"
                    onClick={() => handleDelete(learner.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 border">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md border ${
                currentPage === 1
                  ? "text-gray-400 border-gray-300 cursor-not-allowed"
                  : "text-blue-600 border-blue-500 hover:bg-blue-50"
              }`}
            >
              ← Prev
            </button>

            {[...Array(totalPages)].map((_, idx) => {
              const page = idx + 1;
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
              className={`px-3 py-1 rounded-md border ${
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
    </>
  );
};

export default Learners;
