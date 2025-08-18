import React, { useEffect, useState } from "react";
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
  const [selectedIcon, setSelectedIcon] = useState(existingCourse?.bgImg || "");
  const [message, setMessage] = useState("");

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



  const handleSubmit = async (e) => {
    e.preventDefault();
    const autoIcons = getRelevantIcons(courseInput.courseTitle);
    const selectedTrackObj = trackOptions.find((t) => t.id === selectedTrack);

    if (!selectedTrackObj) {
      setMessage("❌ Selected track not found.");
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
        setMessage("✅ Course updated!");
      } else {
        await axios.post("http://localhost:5000/api/courses", coursePayload);
        setMessage("✅ Course added!");
      }

      refreshTracks?.();
      onClose();
    } catch (err) {
      console.error("Error saving course:", err);
      setMessage("❌ Failed to save course");
    }
  };

  return (
    <div className="w-full max-w-md h-[90vh] border bg-white rounded-lg shadow-lg overflow-hidden relative">
      <div className="h-full overflow-y-auto p-6  border">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">×</button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {isEditing ? "Edit Course" : "Add New Course"}
          </h2>

          <label className="block">
            <span className="text-sm text-gray-700 font-medium mb-1 block">Course Title</span>
            <input
              type="text"
              name="courseTitle"
              placeholder="e.g. React for Beginners"
              value={courseInput.courseTitle}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-md"
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
              className="w-full px-3 py-2 border border-gray-200 rounded-md"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700 font-medium mb-1 block">Choose an Image</span>

            {suggestedIcons.length > 0 && (
              <div className="flex gap-3 flex-wrap mb-2">
                {suggestedIcons.map((icon) => (
          <button
            type="button"
            key={icon.value}
            onClick={() => {
              setSelectedIcon(icon.iconUrl);
              setCourseInput((prev) => ({
                ...prev,
                bgImg: icon.iconUrl,
              }));
            }}
            className={`p-0 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400 rounded`}
            aria-label={`Select ${icon.label} image`}
          >
            <img
              src={icon.iconUrl}
              alt={icon.label}
              className={`w-16 h-16 object-contain rounded cursor-pointer border ${
                courseInput.bgImg === icon.iconUrl
                  ? "border-blue-500 ring-2 ring-blue-400"
                  : "border-gray-300"
              }`}
            />
          </button>
                ))}
              </div>
            )}
              {/* Custom image upload */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseInput((prev) => ({ ...prev, bgImg: reader.result }));
        setSelectedIcon(""); // clear icon selection
      };
      reader.readAsDataURL(file);
    }}
              className="block w-full text-sm text-gray-500"
            />

            {courseInput.bgImg && (
    <div className="mt-2">
      <span className="text-xs text-gray-400">Selected Image:</span>
      <img
        src={courseInput.bgImg}
        alt="Selected"
        className="mt-1 w-24 h-24 object-cover rounded shadow"
      />
    </div>
  )}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Select Track</span>
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
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

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {isEditing ? "Update Course" : "Create Course"}
          </button>

          {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default AddCourses;
