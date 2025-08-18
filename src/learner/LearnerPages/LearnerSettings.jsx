// src/learner/LearnerPages/LearnerSettings.js
import React from "react";

export default function LearnerSettings() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Profile Column */}
      <div className="col-span-1 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gray-300 mb-2"></div>
        <h3 className="font-semibold">John Doe</h3>
        <span className="text-gray-500 text-sm">Learner</span>
      </div>

      {/* Profile Form */}
      <div className="col-span-2">
        <h2 className="font-bold mb-4">Profile</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <input type="text" placeholder="First name" className="border p-2 rounded" />
          <input type="text" placeholder="Last name" className="border p-2 rounded" />
          <input type="text" placeholder="Phone" className="border p-2 rounded" />
          <input type="text" placeholder="Location" className="border p-2 rounded" />
        </div>

        {/* Password Change */}
        <h2 className="font-bold mb-4">Change Password</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <input type="password" placeholder="New password" className="border p-2 rounded" />
          <input type="password" placeholder="Confirm password" className="border p-2 rounded" />
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded mr-4">Save changes</button>
        <button className="bg-gray-200 px-4 py-2 rounded">Logout</button>
      </div>
    </div>
  );
}
