import React, { useState, useCallback } from "react";
import axios from "axios";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../utils/cropImage";

const AddTracks = ({ onClose, setTracks, refreshTracks }) => {
  const [addNewTracks, setAddNewTracks] = useState({
    trackName: "",
    price: "",
    duration: "",
    instructor: "",
    description: "",
  });

  const [tools, setTools] = useState([]);
  

  const [imageSrc, setImageSrc] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [message, setMessage] = useState("");

 



  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddNewTracks((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

const handleCropSave = async () => {
  try {
    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64data = reader.result;
      console.log("✅ Converted base64 image:", base64data); // <--- this should start with data:image/jpeg;base64
      setPreviewImage(base64data);
      setShowCropModal(false);
    };

    reader.readAsDataURL(croppedBlob);
  } catch (err) {
    console.error("Cropping failed:", err);
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();

  const newTrack = {
  title: addNewTracks.trackName.trim(),
  value: Number(addNewTracks.price), // ✅ Force number
  duration: `${addNewTracks.duration} weeks`,
  instructor: addNewTracks.instructor.trim(),
  description: addNewTracks.description.trim(),
  bgImg: previewImage || "", // ✅ Always a string
  program: tools.map(tool => ({
    label: tool.label,
    bgColor: tool.bgColor,
    textColor: tool.textColor,
  }))
};
  console.log("🚀 Payload being sent:", newTrack);

    try {
      const res = await axios.post("http://localhost:5000/api/tracks", newTrack);
      await refreshTracks();
      setTracks((prev) => [...prev, res.data]);
      setAddNewTracks({
        trackName: "",
        price: "",
        duration: "",
        instructor: "",
        description: "",
      });
      console.log("🚀 Payload being sent:", newTrack);

      setTools([]);
    
      setPreviewImage(null);
      setMessage("Track added successfully!");
      onClose();
    } catch (error) {
      console.error("Error adding track:", error);
       console.log("🧠 Backend error response:", error.response?.data);
      alert("Failed to add track.");
    }
  };

  return (
    <div className="flex items-center justify-center h-[500px]">
      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[1000] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-4 w-[90%] md:w-[400px] relative">
             <div className="relative w-full h-[300px] md:h-[350px]">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
            </div>
            <div className="mt-4 flex justify-between">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => {
                  setShowCropModal(false);
                  setImageSrc(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleCropSave}
              >
                Save Crop
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md h-[90vh] bg-white rounded-lg shadow-lg overflow-hidden relative">
  <div className="h-full overflow-y-auto p-6">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>

        <form onSubmit={handleSubmit} className="space-y-4 h-[750px]">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Add new Track</h2>
  <label className="block">
    <span className="text-sm text-gray-700 font-medium mb-1 block">Track Name</span>
          <input
            type="text"
            name="trackName"
            placeholder="Track name"
            value={addNewTracks.trackName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-md"
          />
          </label>
 

  <label className="block">
    <span className="text-sm text-gray-700 font-medium mb-1 block">Price</span>
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={addNewTracks.price}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-md"
          />
          </label>
  <label className="block">
    <span className="text-sm text-gray-700 font-medium mb-1 block">Duration</span>
          <input
            type="number"
            name="duration"
            placeholder="Duration (weeks)"
            value={addNewTracks.duration}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-md"
          />
          </label>
  <label className="block">
    <span className="text-sm text-gray-700 font-medium mb-1 block">Instructor</span>
          <input
            type="text"
            name="instructor"
            placeholder="Instructor"
            value={addNewTracks.instructor}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-md"
          />
          </label>
         

         
 <label className="block">
    <span className="text-sm text-gray-700 font-medium mb-1 block">Picture</span>
        
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />

          {previewImage && (
            <div className="mt-2">
              <img
                src={previewImage}
                alt="Preview"
                className="h-32 w-full object-cover rounded-md border border-gray-200"
              />
            </div>
          )}
          </label>

           <label className="block">
    <span className="text-sm text-gray-700 font-medium mb-1 block">Description</span>
          <textarea
            name="description"
            placeholder="Description"
            value={addNewTracks.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md"
            rows="3"
            required
          />
          </label>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Track
          </button>

          {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
        </form>
      </div>
      </div>
    </div>
  );
};

export default AddTracks;

