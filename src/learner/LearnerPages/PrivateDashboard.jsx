import React, { useEffect, useState } from "react";
import { useLearnerAuth } from "../contexts/LearnerAuthContext";
import { doc, getDoc, collection, getDocs, updateDoc, arrayUnion, addDoc, serverTimestamp, query, where } from "firebase/firestore";
import { db } from "../../admin/Config/Firebase.js";

// ReviewForm Component 
const ReviewForm = ({ trackId, onReviewSubmitted }) => {
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
      
      // Call the refresh function if provided
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submitReview} className="mt-4">
      <h4 className="font-medium text-gray-700 mb-2">Rate this course</h4>
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
        className="w-full p-2 border rounded mb-2 text-sm"
        rows="2"
        required
      />
      
      <button
        type="submit"
        disabled={submitting || !rating || !comment}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:bg-gray-400"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

// ReviewsList Component (enhanced)
const ReviewsList = ({ trackId, refreshTrigger }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('trackId', '==', trackId)
      );
      
      const querySnapshot = await getDocs(q);
      const reviewsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort manually on the client side
      reviewsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return dateB - dateA; // Descending order
      });
      
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [trackId, refreshTrigger]);

  if (loading) return <div className="text-sm text-gray-500">Loading reviews...</div>;

  return (
    <div className="mt-3">
      <h4 className="font-medium text-gray-700 mb-2">Reviews ({reviews.length})</h4>
      
      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews yet.</p>
      ) : (
        <div className="space-y-2">
          {reviews.slice(0, 2).map((review) => ( // Show only 2 reviews to save space
            <div key={review.id} className="text-sm">
              <div className="flex items-center mb-1">
                <span className="font-medium">{review.userName}</span>
                <span className="ml-2 text-amber-400">{"⭐".repeat(review.rating)}</span>
              </div>
              <p className="text-gray-600">{review.comment}</p>
            </div>
          ))}
          {reviews.length > 2 && (
            <p className="text-sm text-blue-600">+{reviews.length - 2} more reviews</p>
          )}
        </div>
      )}
    </div>
  );
};

// Main PrivateDashboard Component
export default function PrivateDashboard() {
  const { currentLearner: user } = useLearnerAuth();
  const [enrolledTracks, setEnrolledTracks] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to refresh reviews
  const refreshReviews = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get user document with progress data
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProgress(userData.trackProgress || {});
          
          // Fetch enrolled tracks
          if (userData.purchasedTracks && userData.purchasedTracks.length > 0) {
            const tracksCollection = collection(db, "tracks");
            const tracksSnapshot = await getDocs(tracksCollection);
            
            const tracksData = [];
            tracksSnapshot.forEach((trackDoc) => {
              if (userData.purchasedTracks.includes(trackDoc.id)) {
                tracksData.push({
                  id: trackDoc.id,
                  ...trackDoc.data()
                });
              }
            });
            
            setEnrolledTracks(tracksData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Function to mark module as completed
  const markModuleComplete = async (trackId, moduleId) => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const trackProgress = userProgress[trackId] || { completedModules: [], totalModules: 0 };
      
      // Add module to completed if not already
      if (!trackProgress.completedModules.includes(moduleId)) {
        const updatedCompletedModules = [...trackProgress.completedModules, moduleId];
        const progressPercentage = Math.round((updatedCompletedModules.length / trackProgress.totalModules) * 100);
        
        await updateDoc(userRef, {
          [`trackProgress.${trackId}.completedModules`]: arrayUnion(moduleId),
          [`trackProgress.${trackId}.progressPercentage`]: progressPercentage,
          [`trackProgress.${trackId}.totalModules`]: trackProgress.totalModules,
          updatedAt: new Date()
        });

        // Update local state
        setUserProgress(prev => ({
          ...prev,
          [trackId]: {
            ...prev[trackId],
            completedModules: updatedCompletedModules,
            progressPercentage
          }
        }));
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Enrolled Courses</h2>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Enrolled courses</h2>

      {enrolledTracks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No enrolled courses yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrolledTracks.map((track) => (
            <div key={track.id} className="bg-white rounded-lg shadow-md border p-6">
              {/* Track Header with Image and Title */}
              <div className="mb-4">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full mb-4">
                  {/* Track Image */}
                  <div
                    className="relative w-full aspect-[4/3] bg-no-repeat bg-cover bg-center"
                    style={{ backgroundImage: `url(${track.bgImg})` }}
                  >
                    {/* Optional: Add overlay or fallback if no image */}
                    {!track.bgImg && (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Track Details */}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold mb-2">
                      {track.title}
                      <span className="ml-2 text-sm text-gray-500 font-normal">Track</span>
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {track.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modules Section */}
              <div className="space-y-2 mb-4">
                <h4 className="font-medium text-gray-700 text-sm">Courses</h4>
                {track.program?.map((module, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-sm text-gray-700">{typeof module === 'string' ? module : module.label}</span>
                    <button
                      onClick={() => markModuleComplete(track.id, typeof module === 'string' ? module : module.label)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                    >
                      Mark Complete
                    </button>
                  </div>
                ))}
              </div>

              {/* Progress Section */}
              {userProgress[track.id] && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${userProgress[track.id].progressPercentage || 0}%` }}
                    ></div>
                  </div>
               <p className="text-xs text-gray-600 mt-1">
  {userProgress[track.id] ? userProgress[track.id].progressPercentage : 0}% Complete
</p>
                </div>
              )}

              {/* Reviews Section */}
              <div className="border-t pt-4">
                <ReviewsList trackId={track.id} refreshTrigger={refreshTrigger} />
                <ReviewForm trackId={track.id} onReviewSubmitted={refreshReviews} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}