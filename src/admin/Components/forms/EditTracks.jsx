// admin/Components/forms/EditTrack.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const EditTrack = ({ track, onClose, refresh }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    value: "",
    duration: "",
    instructor: "",
    bgImg: "",
    program: [],
  });

  useEffect(() => {
    if (track) {
      setFormData({ ...track });
    }
  }, [track]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/tracks/${track.id}`, formData);
      refresh(); // reload TrackDetails
      onClose(); // close modal
    } catch (err) {
      console.error("Error updating track:", err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-2xl mx-auto overflow-y-auto max-h-[90vh]">
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Update Track</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          <div className="grid grid-cols-1  gap-4 md:gap-5">
            <label className="block">
              <span className="text-sm text-gray-700 font-medium mb-1 block">Track Name</span>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter track name"
                className="border border-gray-300 rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-700 font-medium mb-1 block">Price</span>
              <input
                name="value"
                type="number"
                value={formData.value}
                onChange={handleChange}
                placeholder="Enter price"
                className="border border-gray-300 rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-700 font-medium mb-1 block">Duration</span>
              <input
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 12 weeks"
                className="border border-gray-300 rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-700 font-medium mb-1 block">Instructor</span>
              <input
                name="instructor"
                value={formData.instructor}
                onChange={handleChange}
                placeholder="Enter instructor name"
                className="border border-gray-300 rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm text-gray-700 font-medium mb-1 block">Background Image URL</span>
            <input
              name="bgImg"
              value={formData.bgImg}
              onChange={handleChange}
              placeholder="Enter image URL"
              className="border border-gray-300 rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.bgImg && (
              <div className="mt-2">
                <img
                  src={formData.bgImg}
                  alt="Preview"
                  className="h-32 w-full object-cover rounded-md border border-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </label>

          <label className="block">
            <span className="text-sm text-gray-700 font-medium mb-1 block">Description</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter track description"
              className="border border-gray-300 rounded w-full p-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </label>

          {/* Program Tags Editor (if needed) */}
          {formData.program && formData.program.length > 0 && (
            <div className="block">
              <span className="text-sm text-gray-700 font-medium mb-1 block">Program Tags</span>
              <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded bg-gray-50">
                {formData.program.map((item, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {typeof item === 'object' ? item.label : item}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Note: Program tags editing might require advanced configuration.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex-1 font-medium"
            >
              Update Track
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-400 transition-colors flex-1 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTrack;