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
 <form
  onSubmit={handleSubmit}
  className="bg-white lg:m-24 min-w-[50%] md:w-full h-[70vh] lg:h-[40vh] xl:h-[60vh] rounded-xl shadow-lg flex flex-col gap-2 justify-between relative top-1 overflow-hidden"
>
  <h2 className="text-xl font-semibold px-4 pt-4">Update Track</h2>

  <label className="block px-4">
    <span className="text-sm text-gray-700 font-medium mb-1 block">Track Name</span>
    <input
      name="title"
      value={formData.title}
      onChange={handleChange}
      placeholder="Enter track name"
      className="border rounded w-full p-2"
    />
  </label>

 

  <label className="block px-4">
    <span className="text-sm text-gray-700 font-medium mb-1 block">Price</span>
    <input
      name="value"
      value={formData.value}
      onChange={handleChange}
      placeholder="Enter price"
      className="border rounded w-full p-2"
    />
  </label>

  <label className="block px-4">
    <span className="text-sm text-gray-700 font-medium mb-1 block">Duration</span>
    <input
      name="duration"
      value={formData.duration}
      onChange={handleChange}
      placeholder="Enter duration"
      className="border rounded w-full p-2"
    />
  </label>

  <label className="block px-4">
    <span className="text-sm text-gray-700 font-medium mb-1 block">Instructor</span>
    <input
      name="instructor"
      value={formData.instructor}
      onChange={handleChange}
      placeholder="Enter instructor"
      className="border rounded w-full p-2"
    />
  </label>

  <label className="block px-4">
    <span className="text-sm text-gray-700 font-medium mb-1 block">Picture</span>
    <input
      name="bgImg"
      value={formData.bgImg}
      onChange={handleChange}
      placeholder="Enter background image URL"
      className="border rounded w-full p-2"
    />
  </label>

   <label className="block px-4">
    <span className="text-sm text-gray-700 font-medium mb-1 block">Description</span>
    <textarea
      name="description"
      value={formData.description}
      onChange={handleChange}
      placeholder="Enter description"
      className="border rounded w-full p-2"
    />
  </label>

  <div className="px-4 pb-4">
    <button
      type="submit"
      className="bg-blue-600 text-white px-4 py-2 rounded w-full"
    >
      Create Track
    </button>
  </div>
</form>

  );
};

export default EditTrack;
