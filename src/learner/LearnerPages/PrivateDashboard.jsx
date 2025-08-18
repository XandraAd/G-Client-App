import React, { useEffect, useState } from "react";
import { useAuth } from "../../admin/contexts/authContext"; // assuming you have auth context
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../admin/Config/Firebase.js";
import ReviewForm from "../LearnerComponent/LearnerForm/ReviewForm";  // import the form
import ReviewsList from "../LearnerComponent/ReviewList"; // import the list

export default function PrivateDashboard() {
  const { user } = useAuth(); // current logged in learner
  const [purchasedTracks, setPurchasedTracks] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setPurchasedTracks(userDoc.data().purchasedTracks || []);
      }
    };
    fetchUserData();
  }, [user]);

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Enrolled Courses</h2>

      {/* Show Enrolled Tracks */}
      {purchasedTracks.length === 0 ? (
        <p className="text-gray-500">You haven't enrolled in any track yet.</p>
      ) : (
        purchasedTracks.map((trackId) => (
          <div key={trackId} className="mb-8 border rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">{trackId}</h3>

            {/* Reviews for this track */}
            <ReviewsList trackId={trackId} />

            {/* Allow review only if purchased */}
            <ReviewForm trackId={trackId} user={user} />
          </div>
        ))
      )}
    </div>
  );
}
