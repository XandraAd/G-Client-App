import React, { useState, useEffect } from "react";
import axios from "axios";
import { courseIconMap } from "../../utils/iconOptions";

const AddCourses = ({ onClose, refreshTracks, existingCourse, isEditing }) => {
  const [trackOptions, setTrackOptions] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(existingCourse?.track?.id || "");
  const [courseInput, setCourseInput] = useState({
    courseTitle: existingCourse?.title || "",
    description: existingCourse?.description || "",
    bgImg: existingCourse?.bgImg || "",
  });
  const [suggestedIcons, setSuggestedIcons] = useState([]);
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/tracks");
        setTrackOptions(res.data);
      } catch (err) {
        console.error("Failed to load tracks", err);
      }
    };
    fetchTracks();
  }, []);

  useEffect(() => {
    const icons = getRelevantIcons(courseInput.courseTitle);
    setSuggestedIcons(icons);
  }, [courseInput.courseTitle]);

  useEffect(() => {
    if (courseInput.bgImg) {
      setImagePreview(courseInput.bgImg);
    }
  }, [courseInput.bgImg]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getRelevantIcons = (title) => {
    const lowerTitle = title.toLowerCase();
    return Object.values(courseIconMap)
      .flat()
      .filter((tool) =>
        lowerTitle.includes(tool.label.toLowerCase()) ||
        lowerTitle.includes(tool.value.toLowerCase())
      );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage("❌ Image size must be less than 5MB");
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage("❌ Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCourseInput((prev) => ({ ...prev, bgImg: reader.result }));
      setMessage("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const autoIcons = getRelevantIcons(courseInput.courseTitle);
    const selectedTrackObj = trackOptions.find((t) => t.id === selectedTrack);

    if (!selectedTrackObj) {
      setMessage("❌ Please select a track");
      return;
    }

    const coursePayload = {
      title: courseInput.courseTitle,
      description: courseInput.description,
      bgImg: courseInput.bgImg || "",
      track: {
        id: selectedTrackObj.id,
        title: selectedTrackObj.title,
      },
      program: autoIcons,
      timestamp: new Date().toISOString(),
    };

    try {
      if (isEditing && existingCourse?.id) {
        await axios.put(`http://localhost:5000/api/courses/${existingCourse.id}`, coursePayload);
        setMessage("✅ Course updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/courses", coursePayload);
        setMessage("✅ Course added successfully!");
      }

      setTimeout(() => {
        refreshTracks?.();
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Error saving course:", err);
      setMessage("❌ Failed to save course. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? "Edit Course" : "Add New Course"}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <form id="course-form" onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm text-gray-700 font-medium mb-1 block">Course Title</span>
              <input
                type="text"
                name="courseTitle"
                placeholder="e.g. React for Beginners"
                value={courseInput.courseTitle}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-700 font-medium mb-1 block">Description</span>
              <textarea
                name="description"
                value={courseInput.description}
                onChange={handleChange}
                placeholder="Brief course description"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-700 font-medium mb-1 block">Course Image</span>
              
              {suggestedIcons.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Suggested icons:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedIcons.map((icon) => (
                      <button
                        type="button"
                        key={icon.value}
                        onClick={() => {
                          setCourseInput((prev) => ({
                            ...prev,
                            bgImg: icon.iconUrl,
                          }));
                          setImagePreview(icon.iconUrl);
                        }}
                        className={`p-1 border-2 rounded-lg transition-all ${
                          courseInput.bgImg === icon.iconUrl
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <img
                          src={icon.iconUrl}
                          alt={icon.label}
                          className="w-12 h-12 object-contain"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Or upload your own image:</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {imagePreview && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Course preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300 shadow-sm"
                  />
                </div>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Select Track</span>
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a track</option>
                {trackOptions.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.title}
                  </option>
                ))}
              </select>
            </label>

            {message && (
              <div className={`p-3 rounded-md text-center text-sm ${
                message.includes("✅") 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {message}
              </div>
            )}
          </form>
        </div>

        {/* Fixed Footer with Buttons */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              form="course-form"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex-1 font-medium"
            >
              {isEditing ? "Update Course" : "Create Course"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-400 transition-colors flex-1 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCourses;