import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../admin/Config/Firebase.js";
import { FiStar } from "react-icons/fi";

const ReviewForm = ({ trackId, user }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment) return alert("Please add rating and comment");

    await addDoc(collection(db, "tracks", trackId, "reviews"), {
      userId: user.uid,
      userName: user.displayName,
      rating,
      comment,
      createdAt: serverTimestamp(),
    });

    setRating(0);
    setComment("");
    alert("Review submitted!");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border p-4 rounded bg-white shadow mt-6"
    >
      <h3 className="font-semibold mb-2">Leave a Review</h3>
      {/* Rating */}
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            onClick={() => setRating(star)}
            className={`cursor-pointer ${
              star <= rating ? "text-amber-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full border rounded p-2 text-sm"
        placeholder="Write your review..."
      ></textarea>

      <button
        type="submit"
        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit Review
      </button>
    </form>
  );
};

export default ReviewForm;
