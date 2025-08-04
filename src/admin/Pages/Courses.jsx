import React, { useState, useEffect } from "react";
import axios from "axios";
import { CiSearch } from "react-icons/ci";
import AddCourses from "../Components/forms/AddCourses";
import ReactModal from "react-modal";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";

const Courses = () => {
  const [query, setQuery] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Pagination
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/courses");
      const sorted = res.data.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setCourses(sorted);
      setFilteredCourses(sorted);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const searchCourse = e.target.value.trim().toLowerCase();
    setQuery(searchCourse);

    const result = courses.filter((course) => {
      return (
        course.title.toLowerCase().includes(searchCourse) ||
        course.program?.some((tech) =>
          typeof tech === "string"
            ? tech.toLowerCase().includes(searchCourse)
            : tech.label?.toLowerCase().includes(searchCourse)
        )
      );
    });

    setFilteredCourses(result);
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (courseId) => {
    try {
      await axios.delete(`http://localhost:5000/api/courses/${courseId}`);
      const updated = courses.filter((course) => course.id !== courseId);
      setCourses(updated);
      setFilteredCourses(updated);
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };

  return (
    <>
      <h4 className="mt-10 text-[24px] font-semibold">Manage Courses</h4>
      <p className="text-gray-400 text-[18px] font-normal">
        Filter, sort, and access detailed courses
      </p>

      <div className="flex items-center justify-between gap-2 my-4">
        <CiSearch className="absolute left-[17px] lg:left-[250px] xl:left-[430px] top-[13.5rem] lg:top-[11.5rem] transform -translate-y-1/2 text-gray-400 text-lg" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search courses..."
          className="border border-gray-300 pl-6 lg:pl-12 py-2 rounded-lg w-1/2 max-w-md"
        />
        <button
          onClick={() => setIsAddCourseModalOpen(true)}
          className="bg-[#01589A] text-white h-10 w-[30%] rounded-xl capitalize text-[16px] font-semibold leading-[20px]"
        >
          + Add Course
        </button>
      </div>

      <ReactModal
        isOpen={isAddCourseModalOpen}
        onRequestClose={() => setIsAddCourseModalOpen(false)}
        className="rounded-lg p-6 w-full max-w-md mx-auto  outline-none relative h-[70%] border"
        contentLabel="Add New Course"
        overlayClassName="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 border"
      >
        <AddCourses
          onClose={() => setIsAddCourseModalOpen(false)}
          setCourses={setCourses}
          refreshTracks={fetchCourses}
        />
      </ReactModal>

      <ReactModal
        isOpen={isEditModalOpen}
        onRequestClose={() => {
          setIsEditModalOpen(false);
          setSelectedCourse(null);
        }}
        className="rounded-lg p-6 w-full max-w-md mx-auto mt-20 outline-none relative"
        contentLabel="Edit Course"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <AddCourses
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCourse(null);
          }}
          refreshTracks={fetchCourses}
          existingCourse={selectedCourse}
          isEditing={true}
        />
      </ReactModal>

      <section className="py-6 min-h-full mb-10">
        <div className=" grid grid-cols-4 text-sm font-medium text-gray-600 mb-2 px-4">
          <p>Courses</p>
          <p className="text-center">Track</p>
          <p className="text-center">Date Joined</p>
          <p className="text-center"></p>
        </div>

        {filteredCourses.length === 0 ? (
          <p className="text-gray-500 mt-6 text-center">
            No matching courses found.
          </p>
        ) : (
          <div className="space-y-4">
            {paginatedCourses.map((course) => (
              <div
                key={course.id}
                className="grid grid-cols-4 items-center px-4 py-3 shadow-sm rounded-lg bg-white hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={course.bgImg}
                    alt={course.title}
                    className="w-10 h-10 rounded-md object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {course.title}
                    </p>
                  
                  </div>
                </div>
                <div className="text-center capitalize text-sm text-gray-700 font-medium">
                  {course.track?.title || "—"}
                </div>
                <div className="text-center text-sm text-gray-500">
                  {course.timestamp
                    ? new Date(course.timestamp).toLocaleDateString()
                    : "—"}
                </div>
                <div className="flex justify-center gap-2">
                  <FiEdit2
                    className="text-green-700 text-[24px] p-1 rounded-full hover:bg-green-100 cursor-pointer"
                    onClick={() => handleEdit(course)}
                  />
                  <MdDeleteOutline
                    className="text-red-600 text-[24px] p-1 rounded-full hover:bg-red-100 cursor-pointer"
                    onClick={() => handleDelete(course.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 border">
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
    </>
  );
};

export default Courses;

