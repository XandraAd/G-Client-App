import React, { useState, useCallback } from "react";
import axios from "axios";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../utils/cropImage";

const AddTracks = ({setTracks, refreshTracks }) => {
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
  <div className="flex items-center justify-center min-h-screen p-4">
    {showCropModal && (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-[1000] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md md:max-w-lg lg:max-w-xl relative">
          <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px]">
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
          <div className="mt-4 flex flex-col sm:flex-row justify-between gap-2">
            <button
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 flex-1 sm:flex-none"
              onClick={() => {
                setShowCropModal(false);
                setImageSrc(null);
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex-1 sm:flex-none"
              onClick={handleCropSave}
            >
              Save Crop
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl h-auto max-h-[90vh] bg-white rounded-lg shadow-lg overflow-hidden relative">
      <div className="h-full overflow-y-auto p-4 sm:p-6">
      

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Add new Track</h2>
          
          <div className="grid grid-cols-1 gap-4 md:gap-5">
            <label className="block">
              <span className="text-sm text-gray-700 font-medium mb-1 block">Track Name</span>
              <input
                type="text"
                name="trackName"
                placeholder="Track name"
                value={addNewTracks.trackName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </label>

            <div className="grid grid-cols-1  gap-4 md:gap-5">
              <label className="block">
                <span className="text-sm text-gray-700 font-medium mb-1 block">Price</span>
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={addNewTracks.price}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </label>
              
              <label className="block">
                <span className="text-sm text-gray-700 font-medium mb-1 block">Duration (weeks)</span>
                <input
                  type="number"
                  name="duration"
                  placeholder="Duration"
                  value={addNewTracks.duration}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm text-gray-700 font-medium mb-1 block">Instructor</span>
              <input
                type="text"
                name="instructor"
                placeholder="Instructor"
                value={addNewTracks.instructor}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-700 font-medium mb-1 block">Picture</span>
              <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {previewImage && (
                <div className="mt-3">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-32 w-full object-cover rounded-md border border-gray-200"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">Image preview</p>
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
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                required
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mt-2"
          >
            Create Track
          </button>

          {message && (
            <p className={`text-sm mt-3 p-2 rounded-md text-center ${
              message.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  </div>
);
};

export default AddTracks;

