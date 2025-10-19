// src/learner/LearnerPages/LearnerSettings.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../admin/Config/Firebase";

export default function LearnerSettings() {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
    role: "Learner",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [photoURL, setPhotoURL] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Cloudinary upload function
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "user_profile_upload"); // Make sure this matches your Cloudinary preset
    formData.append("folder", "learner-profiles");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dhc0tpnsb/image/upload", // Your Cloudinary cloud name
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Upload failed");
    return data.secure_url;
  };

  // Fetch learner details
  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        // Always pull displayName and photoURL from Auth first
        const [firstName, lastName] = (user.displayName || "").split(" ");
        setPhotoURL(user.photoURL || "");

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setProfile((prev) => ({
            ...prev,
            ...userData,
            firstName: firstName || userData.firstName || "",
            lastName: lastName || userData.lastName || "",
          }));
          // Use Firestore photoURL if available, otherwise use Auth photoURL
          setPhotoURL(userData.photoURL || user.photoURL || "");
        } else {
          setProfile((prev) => ({
            ...prev,
            firstName: firstName || "",
            lastName: lastName || "",
          }));
        }
      }
    };

    fetchProfile();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      // Validate file type
      if (!selected.type.startsWith('image/')) {
        alert("Please select a valid image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (selected.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      setPreviewImage(URL.createObjectURL(selected));
      setFile(selected);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;

      // 🔐 Update password if all fields filled
      if (profile.currentPassword && profile.newPassword && profile.confirmPassword) {
        if (profile.newPassword !== profile.confirmPassword) {
          alert("❌ New password and confirm password do not match!");
          setLoading(false);
          return;
        }

        const credential = EmailAuthProvider.credential(
          firebaseUser.email,
          profile.currentPassword
        );
        await reauthenticateWithCredential(firebaseUser, credential);
        await updatePassword(firebaseUser, profile.newPassword);
        console.log("✅ Password updated");
      }

      let uploadedURL = photoURL;

      // 📸 Upload new image to Cloudinary if selected
      if (file) {
        try {
          uploadedURL = await uploadToCloudinary(file);
          console.log("✅ Image uploaded to Cloudinary:", uploadedURL);
        } catch (uploadError) {
          console.error("❌ Image upload failed:", uploadError);
          alert("Failed to upload image. Please try again.");
          setLoading(false);
          return;
        }
      }

      // 📝 Update Authentication profile (displayName and photoURL)
      await updateProfile(firebaseUser, {
        displayName: `${profile.firstName} ${profile.lastName}`.trim(),
        photoURL: uploadedURL,
      });

      // 🔄 Save extra data to Firestore
      await setDoc(
        doc(db, "users", firebaseUser.uid),
        {
          firstName: profile.firstName,
          lastName: profile.lastName,
          fullName: `${profile.firstName} ${profile.lastName}`.trim(),
          phone: profile.phone,
          location: profile.location,
          role: profile.role,
          email: firebaseUser.email,
          // Store image in multiple fields for compatibility
          photoURL: uploadedURL,
          avatar: uploadedURL,
          profilePicture: uploadedURL,
          image: uploadedURL,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      // Update local state
      setPhotoURL(uploadedURL);
      setPreviewImage(null);
      setFile(null);

      alert("✅ Profile saved successfully!");
      
      // Clear password fields
      setProfile((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

    } catch (err) {
      console.error("❌ Error saving profile:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/learner/signin");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
      {/* Profile Column with Image */}
      <div className="col-span-1 flex flex-col items-center">
        <div className="relative mb-4">
          <img
            src={previewImage || photoURL || "/default-avatar.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
          />
          <label 
            htmlFor="profile-image" 
            className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors"
            title="Change photo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </label>
          <input
            type="file"
            id="profile-image"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
        <h3 className="font-semibold text-lg">
          {profile.firstName} {profile.lastName}
        </h3>
        <span className="text-gray-500 text-sm">{profile.role}</span>
        <span className="text-gray-400 text-xs mt-1">{auth.currentUser?.email}</span>
      </div>

      {/* Profile Form */}
      <div className="col-span-2">
        <h2 className="font-bold text-xl mb-6">Profile Settings</h2>
        
        {/* Personal Information */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your last name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your location"
              />
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={profile.currentPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter current password"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={profile.newPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={profile.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}