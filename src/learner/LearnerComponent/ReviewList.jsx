// ReviewForm.jsx
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../admin/Config/Firebase';
import { useLearnerAuth } from '../contexts/LearnerAuthContext';

export default function ReviewForm({ trackId }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { currentLearner } = useLearnerAuth();

  const submitReview = async (e) => {
    e.preventDefault();
    if (!rating || !comment || !currentLearner) {
      alert('Please provide a rating, comment, and make sure you are logged in.');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        trackId,
        userId: currentLearner.uid,
        userName: currentLearner.displayName || currentLearner.email,
        rating,
        comment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setRating(0);
      setComment('');
      alert('Review submitted successfully!');
      window.location.reload(); // Refresh to show new review
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submitReview} className="mt-4">
      <div className="flex items-center mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="text-2xl focus:outline-none"
          >
            {star <= rating ? '⭐' : '☆'}
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
      
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your review..."
        className="w-full p-2 border rounded mb-2"
        rows="3"
        required
      />
      
      <button
        type="submit"
        disabled={submitting || !rating || !comment}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
