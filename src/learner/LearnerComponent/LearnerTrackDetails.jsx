import { Link, useParams } from "react-router-dom";
import { FiStar, FiClock, FiBookOpen, FiUser, FiCalendar } from "react-icons/fi";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../admin/Config/Firebase";
import { useCart } from "../../admin/contexts/CartContext";
import { useLearnerAuth } from "../contexts/LearnerAuthContext";
import { toast } from "react-toastify"; 
import SkeletonLoader from "../../admin/Components/SkeletonLoader";
import { FaCediSign } from "react-icons/fa6";

export default function LearnerTrackDetails() {
  const { id } = useParams();
  const { currentLearner } = useLearnerAuth();
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolledStudents, setEnrolledStudents] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [relatedTracks, setRelatedTracks] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const { addToCart, cartItems } = useCart();

  useEffect(() => {
    const fetchTrackData = async () => {
      setLoading(true);
      try {
        // Fetch track details
        const docRef = doc(db, "tracks", id);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const trackData = { id: snap.id, ...snap.data(), image: snap.data().bgImg };
          setTrack(trackData);
          setEnrolledStudents(trackData.students || trackData.enrolledCount || 0);

          // Check if learner is enrolled
          if (currentLearner) {
            try {
              const userDoc = await getDoc(doc(db, "users", currentLearner.uid));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                const isUserEnrolled =
                  userData.purchasedTracks && userData.purchasedTracks.includes(id);
                setIsEnrolled(isUserEnrolled);
              }
            } catch (enrollmentError) {
              console.warn("Could not check enrollment:", enrollmentError);
            }
          }

          // Fetch reviews
          await fetchReviews();
          // Fetch related tracks
          await fetchRelatedTracks(trackData);
        }
      } catch (error) {
        console.error("Error fetching track data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const q = query(collection(db, "reviews"), where("trackId", "==", id));
        const querySnapshot = await getDocs(q);
        const reviewsData = [];
        let totalRating = 0;

        querySnapshot.forEach((doc) => {
          const review = { id: doc.id, ...doc.data() };
          reviewsData.push(review);
          totalRating += review.rating || 0;
        });

        // Sort by date (newest first)
        reviewsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
          return dateB - dateA;
        });

        setReviews(reviewsData);
        if (reviewsData.length > 0) {
          setAverageRating(totalRating / reviewsData.length);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    const fetchRelatedTracks = async (currentTrack) => {
      try {
        setLoadingRelated(true);
        const tracksQuery = query(collection(db, "tracks"));
        const querySnapshot = await getDocs(tracksQuery);

        const allTracks = [];
        querySnapshot.forEach((doc) => {
          if (doc.id !== currentTrack.id) {
            allTracks.push({ id: doc.id, ...doc.data() });
          }
        });

        const currentCategories = extractCategories(currentTrack);
        let related = allTracks
          .map((track) => {
            const trackCategories = extractCategories(track);
            const similarity = calculateCategorySimilarity(
              currentCategories,
              trackCategories
            );
            return { ...track, similarity };
          })
          .sort((a, b) => b.similarity - a.similarity);

        // Always return up to 2 tracks, even if similarity is 0
        related = related.slice(0, 2);

        setRelatedTracks(related);
      } catch (error) {
        console.error("Error fetching related tracks:", error);
      } finally {
        setLoadingRelated(false);
      }
    };

    const extractCategories = (track) => {
      const categories = new Set();
      if (Array.isArray(track.program)) {
        track.program.forEach((item) => {
          if (typeof item === "string") {
            categories.add(item.toLowerCase());
          } else if (item && typeof item === "object" && item.label) {
            categories.add(item.label.toLowerCase());
          }
        });
      }

      const text = `${track.title || ""} ${track.description || ""}`.toLowerCase();
      const commonCategories = [
        "software",
        "development",
        "web",
        "mobile",
        "ui/ux",
        "design",
        "data",
        "cloud",
        "ai",
        "machine learning",
        "backend",
        "frontend",
      ];
      commonCategories.forEach((category) => {
        if (text.includes(category)) {
          categories.add(category);
        }
      });
      return Array.from(categories);
    };

    const calculateCategorySimilarity = (categories1, categories2) => {
      const set1 = new Set(categories1);
      const set2 = new Set(categories2);
      const intersection = new Set([...set1].filter((x) => set2.has(x)));
      return intersection.size;
    };

    fetchTrackData();
  }, [id, currentLearner]);

  const instructor = track?.instructor || "John Doe";

  const handleAddToCart = () => {
    const alreadyInCart = cartItems.some((item) => item.id === track.id);
    if (alreadyInCart) {
      toast.error("This track is already in your cart!");
    } else {
      addToCart(track);
      toast.success("Track added to cart!");
    }
  };

  const generateLearningOutcomes = (track) => {
  const outcomes = [];

  // Use program keywords if available
  if (Array.isArray(track.program)) {
    track.program.forEach((item) => {
      const skill = typeof item === "string" ? item : item.label || "";
      if (skill) outcomes.push(`Gain practical skills in ${skill}`);
    });
  }

  // Use track title/description keywords
  if (track.title) {
    outcomes.push(`Understand the fundamentals of ${track.title}`);
  }

if (track.description) {
  const desc = track.description.toLowerCase();

  const outcomesMap = [
    { keywords: ["software"], text: "Master software development principles" },
    { keywords: ["data"], text: "Analyze and interpret complex data sets" },
    { keywords: ["cloud"], text: "Design and manage cloud-based solutions" },
    { keywords: ["ai", "artificial intelligence"], text: "Implement AI and machine learning models" },
    { keywords: ["web"], text: "Build responsive and dynamic web applications" },
    { keywords: ["mobile"], text: "Develop mobile applications for various platforms" },
    { keywords: ["ui/ux", "design"], text: "Create user-centric designs with UI/UX best practices" },
  ];

  outcomesMap.forEach(({ keywords, text }) => {
    if (keywords.some((keyword) => desc.includes(keyword))) {
      outcomes.push(text);
    }
  });
}




  // Fallback
  if (outcomes.length === 0) {
    outcomes.push("Develop key skills and hands-on experience in this track");
  }

  return outcomes;
};

  // Function to render stars
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    return (
      <div className="flex gap-1 text-amber-400">
        {Array.from({ length: fullStars }).map((_, i) => (
          <FiStar key={i} fill="currentColor" />
        ))}
        {hasHalfStar && <FiStar key="half" fill="currentColor" style={{ opacity: 0.5 }} />}
        {Array.from({ length: 5 - Math.ceil(rating) }).map((_, i) => (
          <FiStar key={`empty-${i}`} />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <SkeletonLoader width="60%" height="2rem" className="mb-4" /> 
        <SkeletonLoader width="100%" height="200px" className="mb-4" rounded="md" /> 
        <SkeletonLoader width="80%" height="1rem" className="mb-2" count={3} /> 
        <SkeletonLoader width="40%" height="2rem" className="mt-6" /> 
      </div>
    );
  }

  if (!track) return <p className="text-center mt-10">Track not found.</p>;



  return (
    <div className="flex flex-col">
      {/* ===== HERO (Blue) ===== */}
      <section className="bg-blue-700 text-white relative pb-16 md:pb-24">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
          {/* Breadcrumb */}
          <nav className="text-xs md:text-sm text-blue-100 mb-4">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/tracks" className="hover:underline">Tracks</Link>
            <span className="mx-2">›</span>
            <span className="opacity-90">{track.title}</span>
          </nav>

          {/* Content */}
          <div className="max-w-full md:max-w-[400px] lg:max-w-lg">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">{track.title}</h1>
            <p className="text-blue-100 text-sm md:text-base leading-relaxed mb-8 max-w-full md:max-w-lg">
              {track.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 text-xs md:text-sm">
              <div>
                <p className="text-blue-200">Instructor</p>
                <p className="font-semibold">{instructor}</p>
              </div>
              <div>
                <p className="text-blue-200">Enrolled students</p>
                <p className="font-semibold">{enrolledStudents}</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-blue-200">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                <div className="flex items-center gap-1 mt-1">
                  {renderStars(averageRating)}
                  <span className="text-blue-100 ml-1">({averageRating.toFixed(1)})</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== FLOATING CARD ===== */}
          {/* Right side - Desktop */}
        <div className="w-full  border border-black mt-6 md:w-[300px] lg:w-[360px] md:absolute md:right-6 md:top-2 md:h-[760px]">

            <div className="bg-white rounded-lg overflow-hidden shadow-xl border border-gray-100">
              {/* Image */}
              {track.bgImg ? (
                <img 
                  src={track.bgImg} 
                  alt={track.title} 
                  className="w-full p-4 h-[500px] lg:mb-8 object-cover" 
                />
              ) : (
                <div className="w-full h-48 bg-gray-200" />
              )}

              {/* Details */}
              <div className="p-4 text-sm text-gray-800">
                <h2 className="font-bold text-xl lg:mt-12 ">Course Details</h2>
                <ul className="space-y-2">
                  <li className="flex justify-between my-2 lg:my-8">
                    <span className="flex items-center gap-2"><FiClock /> Duration</span>
                    <span>{track.duration || "12 weeks"}</span>
                  </li>
                  <hr className="text-gray-200 h-[1px]"/>
                  <li className="flex justify-between  my-2 lg:my-8">
                    <span className="flex items-center gap-2"><FiBookOpen /> Courses</span>
                    <span>{Array.isArray(track.program) ? track.program.length : 0}</span>
                  </li>
                     <hr className="text-gray-200 h-[1px]"/>
                  <li className="flex justify-between  my-2 lg:my-8">
                    <span className="flex items-center gap-2"><FiUser /> Instructor</span>
                    <span>{instructor}</span>
                  </li>
                     <hr className="text-gray-200 h-[1px]"/>
                  <li className="flex justify-between  my-2 lg:my-8">
                    <span className="flex items-center gap-2"><FiCalendar /> Date</span>
                    <span>{track.startDate || "03/2025"}</span>
                  </li>
               
                 
                </ul>
                <div className="mt-4 text-center">
                  <p className="font-bold text-lg"> 
                    <FaCediSign className="inline mr-1" />
                    {Number(track.value) || 0}
                  </p>

                  {cartItems.some((item) => item.id === track.id) ? (
                    <button
                      disabled
                      className="bg-gray-300 text-gray-600 px-4 py-2 mt-2 rounded w-full cursor-not-allowed"
                    >
                      Already in Cart
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="bg-blue-600 text-white px-4 py-2 mt-2 rounded hover:bg-blue-700 w-full"
                    >
                      Enroll
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Will Learn Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mx-4  mt-6 md:mt-10 p-6 md:max-w-md max-w-lg lg:max-w-xl xl:max-w-3xl">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">What You Will Learn</h2>
        <div className="grid grid-cols-1  gap-4">
         <ul className="list-disc pl-6 space-y-2">
    {generateLearningOutcomes(track).map((item, index) => (
      <li key={index} className="text-gray-700">{item}</li>
    ))}
  </ul>
        </div>
      </div>


           {/* Related Tracks */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Explore Related Tracks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2   gap-6">
          {relatedTracks.map((relatedTrack) => (
            <div
              key={relatedTrack.id}
              className="grid w-[400px] h-[160px] grid-cols-2 border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <img
                src={relatedTrack.bgImg}
                alt={relatedTrack.title}
                className="w-full p-2 h-40 object-cover"
              />
              <div className="p-3">
                <h2 className="font-bold text-xl mb-2">{relatedTrack.title}</h2>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {relatedTrack.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Mobile Floating Card - Appears at bottom on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4 z-10">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold text-lg">
              <FaCediSign className="inline mr-1" />
              {Number(track.value) || 0}
            </p>
          </div>
          {cartItems.some((item) => item.id === track.id) ? (
            <button
              disabled
              className="bg-gray-300 text-gray-600 px-6 py-3 rounded cursor-not-allowed"
            >
              Already in Cart
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            >
              Enroll Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}