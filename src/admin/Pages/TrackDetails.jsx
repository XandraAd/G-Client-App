// src/pages/TrackDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactModal from "react-modal";
import EditTrack from "../Components/forms/EditTracks";
import CalendarIcon from "../../assets/icons/calendarIcon.png";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import { ImWarning } from "react-icons/im";
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../admin/Config/Firebase';

const TrackDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [track, setTrack] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const fetchTrack = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/tracks/${id}`);
      setTrack(res.data);
    } catch (error) {
      console.error("Failed to load track:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews for this specific track from Firebase
  useEffect(() => {
    if (!id) return;

    setReviewsLoading(true);
    const q = query(
      collection(db, 'reviews'),
      where('trackId', '==', id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reviewsData = [];
      querySnapshot.forEach((doc) => {
        const reviewData = doc.data();
        // Convert Firestore timestamp to JS Date object if it exists
        if (reviewData.createdAt) {
          reviewData.createdAt = reviewData.createdAt.toDate();
        }
        if (reviewData.updatedAt) {
          reviewData.updatedAt = reviewData.updatedAt.toDate();
        }
        reviewsData.push({ id: doc.id, ...reviewData });
      });
      setReviews(reviewsData);
      setReviewsLoading(false);
    }, (error) => {
      console.error("Error fetching reviews:", error);
      setReviewsLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    fetchTrack();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/tracks/${id}`);
      navigate("/dashboard/tracks");
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setIsDeleteOpen(false);
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center min-h-64">
        <p className="text-gray-500">Loading track details...</p>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center min-h-64">
        <p className="text-red-500">Failed to load track details.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h4 className="text-xl font-semibold md:text-2xl">Manage Tracks</h4>
      <p className="text-gray-400 text-base font-normal md:text-lg">
        Filter, sort, and access detailed tracks
      </p>

      <div className="mt-6 lg:mt-10 max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Image Section */}
        <div
          className="w-full h-48 sm:h-56 md:h-64 lg:h-72 bg-no-repeat bg-cover bg-center relative"
          style={{
            backgroundImage: `url(${track.bgImg})`,
          }}
        >
          <p className="text-sm mt-3 mr-3 px-3 py-1 bg-white rounded-lg shadow-sm absolute top-2 right-2 font-medium">
            ${track.value}
          </p>
        </div>

        {/* Content Section */}
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2 md:text-2xl">
                {track.title}
              </h3>
           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
  {/* Calendar/Duration - Left side */}
  <div className="flex items-center text-gray-500 text-sm md:text-base">
    <img src={CalendarIcon} alt="calendar" className="w-4 h-4 md:w-5 md:h-5" />
    <p className="ml-2">{track.duration}</p>
  </div>
  
  {/* Action Buttons - Right side */}
  <div className="flex justify-end gap-3 md:gap-4">
    <FiEdit2 
      className="text-green-700 text-2xl p-2 rounded-full hover:bg-green-100 cursor-pointer transition-colors md:text-3xl" 
      onClick={() => setIsEditOpen(true)} 
      title="Edit track"
    />
    <MdDeleteOutline 
      className="text-red-600 text-2xl p-2 rounded-full hover:bg-red-100 cursor-pointer transition-colors md:text-3xl" 
      onClick={() => setIsDeleteOpen(true)} 
      title="Delete track"
    />
  </div>
</div>
              
             

              {/* Program Tags and Rating on the same line */}
              <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between  mt-4 gap-3 lg:gap-5">
                {/* Program Tags - Left side */}
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Program Includes:</h4>
                  <div className="flex flex-wrap gap-2">
                    {track.program?.slice(0, 3).map((item, idx) => {
                      const label = typeof item === 'string' ? item : item.label;
                      const bgColor = (typeof item === 'object' && item.bgColor) || "#E0F2FE";
                      const textColor = (typeof item === 'object' && item.textColor) || "#1E40AF";
                      
                      return (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 md:text-sm"
                          style={{ 
                            backgroundColor: bgColor, 
                            color: textColor,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                          title={label}
                        >
                          {label}
                        </span>
                      );
                    })}
                    {track.program && track.program.length > 3 && (
                      <span
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 md:text-sm"
                        title={track.program.slice(3).map(item => typeof item === 'string' ? item : item.label).join(', ')}
                      >
                        +{track.program.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating - Right side */}
                <div className="flex-shrink-0">
                  <div className="flex items-center bg-gray-50 rounded-lg  py-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-lg">
                          {star <= Math.round(averageRating) ? '⭐' : '☆'}
                        </span>
                      ))}
                      <span className="ml-2 text-sm text-gray-600 font-medium">
                        {averageRating}/5
                      </span>
                    </div>
                    <span className="ml-2 text-xs text-gray-500">
                      ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                </div>
              </div>
            </div>

           
          </div>

          {/* Description (if available) */}
          {track.description && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-gray-600 text-sm md:text-base">{track.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8 max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-4 md:p-6">
        <h3 className="text-xl font-semibold mb-4 md:text-2xl">
          Learner Reviews ({reviews.length})
        </h3>
        
        {/* Reviews List */}
        {(() => {
          if (reviewsLoading) {
            return (
              <div className="mt-4">
                <p className="text-gray-500">Loading reviews...</p>
              </div>
            );
          } else if (reviews.length === 0) {
            return (
              <div className="mt-4">
                <p className="text-gray-500 text-center py-4">No reviews yet for this track.</p>
              </div>
            );
          } else {
            return (
              <div className="mt-4 space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex mr-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className="text-sm">
                                  {star <= review.rating ? '⭐' : '☆'}
                                </span>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">({review.rating}/5)</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {review.createdAt ? review.createdAt.toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        
                        <div className="mb-2">
                          <p className="text-gray-800 font-medium">{review.userName}</p>
                          {review.userEmail && (
                            <p className="text-gray-600 text-xs">{review.userEmail}</p>
                          )}
                        </div>
                        
                        <p className="text-gray-700 mt-2 text-sm md:text-base">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          }
        })()}
      </div>

      {/* Edit Modal */}
      <ReactModal
        isOpen={isEditOpen}
        onRequestClose={() => setIsEditOpen(false)}
        className=" rounded-lg p-4 w-11/12 max-w-md  mx-auto mt-20 outline-none relative md:p-6"
        contentLabel="Edit Track"
        overlayClassName="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50"
      >
        <EditTrack 
          track={track} 
          onClose={() => setIsEditOpen(false)} 
          refresh={fetchTrack} 
        />
      </ReactModal>

      {/* Delete Confirmation Modal */}
      <ReactModal
        isOpen={isDeleteOpen}
        onRequestClose={() => setIsDeleteOpen(false)}
        className="bg-white rounded-lg p-6 w-11/12 max-w-sm mx-auto mt-20 outline-none relative text-center md:p-8"
        overlayClassName="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50"
      >
        <ImWarning className="text-yellow-500 w-12 h-12 mx-auto mb-4 md:w-16 md:h-16" />
        
        <h2 className="text-xl font-semibold mb-2 md:text-2xl">Delete this track?</h2>
        <p className="text-sm text-gray-500 mb-6 md:text-base">
          This will permanently delete the track and all associated data. This action cannot be undone.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex-1 sm:flex-none"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => setIsDeleteOpen(false)}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors flex-1 sm:flex-none"
          >
            Cancel
          </button>
        </div>
      </ReactModal>
    </div>
  );
};

export default TrackDetails;