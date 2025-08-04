import React, { useState, useEffect } from "react";
import { getAuth, updateProfile, updatePassword } from "firebase/auth";
import { useAuth } from "../../contexts/authContext/index"; // adjust path


import { useNavigate } from "react-router-dom";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const AdminProfileUpdate = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();
  const db = getFirestore();
  const { refreshUser } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [file, setFile] = useState(null);

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Populate user data
  useEffect(() => {
    if (user) {
      const [first, last] = user.displayName?.split(" ") || [];
      setFirstName(first || "");
      setLastName(last || "");
      setPhotoURL(user.photoURL || "https://via.placeholder.com/100"); // fallback
    }
  }, [user]);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "user_profile_upload");
    formData.append("folder", "admin-profile");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dhc0tpnsb/image/upload", //
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Upload failed");
    return data.secure_url;
  };

  // ✅ Image handler
const handleImageChange = (e) => {
  const selected = e.target.files[0];
  if (selected) {
    setPreviewImage(URL.createObjectURL(selected));
    setFile(selected); // will be uploaded in handleSave
  }
};


  // ✅ Save handler
  const handleSave = async () => {
    if (password && password !== passwordConfirmation) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      let uploadedURL = photoURL;

        // 🔁 Upload to Cloudinary if a new file was selected
    if (file) {
      uploadedURL = await uploadToCloudinary(file);
      console.log("✅ Uploaded to Cloudinary:", uploadedURL);
    }

      const fullName = `${firstName} ${lastName}`.trim();


        // ✅ Update Firebase Auth
      await updateProfile(user, {
        displayName: fullName,
        photoURL: uploadedURL,
      });

      await refreshUser();
      window.location.reload();


   // ✅ Update password if needed
      if (password) {
        await updatePassword(user, password);
      }

      await user.reload();
      //const user = auth.currentUser;

      await setDoc(
        doc(db, "users", user.uid),
        {
          firstName,
          lastName,
          photoURL: uploadedURL,
          displayName: fullName,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setPhotoURL(uploadedURL);
      setPreviewImage(null);
      setFile(null);
      setMessage("✅ Profile updated successfully!");
    } catch (error) {
      console.error("❌ Error during profile update:", error);
      setMessage("❌ Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-w-full  mx-auto mt-6 bg-white p-6 rounded-lg shadow-lg md:min-w-[600px] md:h-[800px]  lg:min-w-[70%] border">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Update Admin Profile
      </h2>

      <div className="flex flex-col items-center mb-4">
        <img
          src={previewImage || photoURL || "https://via.placeholder.com/100"}
          alt="Admin avatar"
          className="w-24 h-24 object-cover rounded-full mb-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium text-gray-700">First Name</label>
        <input
          type="text"
          className="border rounded px-3 py-2 w-full"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium text-gray-700">Last Name</label>
        <input
          type="text"
          className="border rounded px-3 py-2 w-full"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          className="border rounded px-3 py-2 w-full bg-gray-100"
          value={`${firstName} ${lastName}`}
          readOnly
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium text-gray-700">New Password</label>
        <input
          type="password"
          className="border rounded px-3 py-2 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          type="password"
          className="border rounded px-3 py-2 w-full"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
        />
      </div>

      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
        >
          Cancel
        </button>

        <button
          type="submit"
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Updating..." : "Save"}
        </button>
      </div>

      {message && (
        <p className="mt-3 text-center text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
};

export default AdminProfileUpdate;
