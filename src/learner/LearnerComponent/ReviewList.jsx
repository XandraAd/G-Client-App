import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../admin/Config/Firebase.js";
import { FiStar } from "react-icons/fi";

const ReviewsList = ({ trackId }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const snap = await getDocs(collection(db, "tracks", trackId, "reviews"));
      setReviews(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchReviews();
  }, [trackId]);

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-3">Student Reviews</h3>
      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews yet.</p>
      ) : (
        reviews.map((r) => (
          <div key={r.id} className="border p-3 rounded mb-2 bg-white">
            <div className="flex justify-between items-center">
              <p className="font-semibold">{r.userName}</p>
              <div className="flex text-amber-400">
                {[...Array(r.rating)].map((_, i) => (
                  <FiStar key={i} />
                ))}
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-2">{r.comment}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default ReviewsList;
