// src/learner/LearnerPages/LearnerSettings.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider,signOut} from "firebase/auth";

import { doc, setDoc,getDoc } from "firebase/firestore";
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
  const navigate = useNavigate();

  // Fetch learner details (replace with backend call)
 useEffect(() => {
  const fetchProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      // Always pull displayName from Auth first
      const [firstName, lastName] = (user.displayName || "").split(" ");

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile((prev) => ({
          ...prev,
          ...docSnap.data(),
          firstName: firstName || docSnap.data().firstName || "",
          lastName: lastName || docSnap.data().lastName || "",
        }));
      } else {
        // fallback only from auth
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

  
const handleSave = async () => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;

      // 🔐 Update password if all fields filled
      if (profile.currentPassword && profile.newPassword && profile.confirmPassword) {
        if (profile.newPassword !== profile.confirmPassword) {
          alert("❌ New password and confirm password do not match!");
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

      // 📝 Update Authentication displayName
      await updateProfile(firebaseUser, {
        displayName: `${profile.firstName} ${profile.lastName}`,
      });

      // 🔄 Save extra data to Firestore
      await setDoc(
        doc(db, "users", firebaseUser.uid),
        {
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          location: profile.location,
          role: profile.role,
          email: firebaseUser.email,
        },
        { merge: true }
      );

      alert("✅ Profile saved successfully!");
      // clear password fields
      setProfile((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      console.error("❌ Error saving profile:", err);
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/learner/signin");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Profile Column */}
      <div className="col-span-1 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gray-300 mb-2"></div>
        <h3 className="font-semibold">
          {profile.firstName} {profile.lastName}
        </h3>
        <span className="text-gray-500 text-sm">{profile.role}</span>
      </div>

      {/* Profile Form */}
      <div className="col-span-2">
        <h2 className="font-bold mb-4">Profile</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <input
            type="text"
             name="firstName"
            placeholder="first name"
            value={profile.firstName}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
             name="lastName"
            placeholder="last name"
            value={profile.lastName}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={profile.phone}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={profile.location}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        {/* Password Change */}
        <h2 className="font-bold mb-4">Change Password</h2>
        <div >
            <input
        type="password"
        name="currentPassword"
        value={profile.currentPassword}
        onChange={handleChange}
        placeholder="Current Password"
        className="border p-2 rounded w-full mb-4"
      />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
                  <input
            type="password"
            name="newPassword"
            placeholder="New password"
             onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
             onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded mr-4"
        >
          Save changes
        </button>
        <button
          onClick={handleLogout}
          className="bg-gray-200 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
