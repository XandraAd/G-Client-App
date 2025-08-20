import { Link, useParams } from "react-router-dom";
import { FiStar, FiClock, FiBookOpen, FiUser, FiCalendar } from "react-icons/fi";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../admin/Config/Firebase";
import { useCart } from "../../admin/contexts/CartContext";
import { toast } from "react-toastify"; 
import SkeletonLoader from "../../admin/Components/SkeletonLoader"
import { FaCediSign } from "react-icons/fa6";

export default function LearnerTrackDetails() {
  const { id } = useParams();
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, cartItems } = useCart();

  useEffect(() => {
    const fetchTrack = async () => {
      setLoading(true);
      const docRef = doc(db, "tracks", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setTrack({ id: snap.id, ...snap.data(), image: snap.data().bgImg });
      }
      setLoading(false);
    };
    fetchTrack();
  }, [id]);

  const instructor = track?.instructor || "John Doe";
  const students = track?.students || 0;

  const handleAddToCart = () => {
    const alreadyInCart = cartItems.some((item) => item.id === track.id);
    if (alreadyInCart) {
      toast.error("This track is already in your cart!");
    } else {
      addToCart(track);
      toast.success("Track added to cart!");
    }
  };

  if (loading) {
    // Skeleton loader matching layout
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
      <section className="bg-[#0c4a6e] text-white relative pb-24">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
          {/* Breadcrumb */}
          <nav className="text-xs text-blue-100 mb-4">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/tracks" className="hover:underline">Tracks</Link>
            <span className="mx-2">›</span>
            <span className="opacity-90">{track.title}</span>
          </nav>

          {/* Content */}
          <div className="max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-bold mb-3">{track.title}</h1>
            <p className="text-blue-100 text-sm leading-relaxed mb-8">{track.description}</p>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-blue-200">Instructor</p>
                <p className="font-semibold">{instructor}</p>
              </div>
              <div>
                <p className="text-blue-200">Enrolled students</p>
                <p className="font-semibold">{students}</p>
              </div>
              <div>
                <p className="text-blue-200">1 review</p>
                <div className="flex gap-1 text-amber-400 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar key={i} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ===== FLOATING CARD ===== */}
          <div className="absolute right-4 top-70 transform -translate-y-1/2 w-[360px] hidden md:block">
            <div className="bg-white rounded-lg overflow-hidden shadow-xl border border-gray-100">
              {/* Image */}
              {track.bgImg ? (
                <img src={track.bgImg} alt={track.title} className="w-full h-56 object-cover" />
              ) : (
                <div className="w-full h-56 bg-gray-200" />
              )}

              {/* Details */}
              <div className="p-4 text-sm text-gray-800">
                <h2 className="font-semibold mb-3">Course Details</h2>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="flex items-center gap-2"><FiClock /> Duration</span>
                    <span>{track.duration || "12 weeks"}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="flex items-center gap-2"><FiBookOpen /> Courses</span>
                    <span>{Array.isArray(track.program) ? track.program.length : 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="flex items-center gap-2"><FiUser /> Instructor</span>
                    <span>{instructor}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="flex items-center gap-2"><FiCalendar /> Date</span>
                    <span>{track.startDate || "03/2025"}</span>
                  </li>
                </ul>
                <div className="mt-4 text-center">
                  <p className="font-bold text-lg"> <FaCediSign className="inline mr-1" />{Number(track.value) || 0}</p>

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
    </div>
  );
}
