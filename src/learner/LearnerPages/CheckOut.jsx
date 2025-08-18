// src/components/Learner/CheckOut.jsx
import { useState, useEffect } from "react";
import { useCart } from "../../admin/contexts/CartContext";
import { useLearnerAuth } from "../contexts/LearnerAuthContext";
import { db } from "../../admin/Config/Firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

export default function CheckOut() {
  const { cartItems } = useCart();
  const { currentLearner } = useLearnerAuth();

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.value || Number(item.price) || 0),
    0
  );

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    course: "",
    gender: "",
    phone: "",
    location: "",
    pwdStatus: "",
    disabilityOther: "",
    password: "",
    confirmPassword: "",
  });

  // Fetch user profile if logged in
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentLearner) {
        // reset if logged out
        setFormData({
          fullName: "",
          email: "",
          course: "",
          gender: "",
          phone: "",
          location: "",
          pwdStatus: "",
          disabilityOther: "",
          password: "",
          confirmPassword: "",
        });
        return;
      }

      try {
        const docRef = doc(db, "users", currentLearner.uid);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const profile = snap.data();

          // Prefill only if learner
          if (profile.role === "learner" || profile.roles?.includes("learner")) {
            setFormData({
              fullName: profile.fullName || currentLearner.displayName || "",
              email: profile.email || currentLearner.email || "",
              course: profile.track || "",
              gender: profile.gender || "",
              phone: profile.phone || "",
              location: profile.location || "",
              pwdStatus: profile.pwdStatus || "",
              disabilityOther: profile.disabilityOther || "",
              password: "",
              confirmPassword: "",
            });
          } else {
            // fallback if not a learner
            setFormData({
              fullName: currentLearner.displayName || "",
              email: currentLearner.email || "",
              course: "",
              gender: "",
              phone: "",
              location: "",
              pwdStatus: "",
              disabilityOther: "",
              password: "",
              confirmPassword: "",
            });
          }
        }
      } catch (err) {
        console.error("Error fetching learner profile:", err);
      }
    };

    fetchProfile();
  }, [currentLearner]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Checkout logic: Save learner data + enrolled courses
  const handleCheckout = async () => {
    if (!currentLearner) {
      alert("Please sign in to continue.");
      return;
    }

    try {
      const userRef = doc(db, "users", currentLearner.uid);

      // Save learner profile + role
      await setDoc(
        userRef,
        {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          gender: formData.gender,
          pwdStatus: formData.pwdStatus,
          disabilityOther: formData.disabilityOther,
          role: "learner",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Save enrolled courses
      for (const item of cartItems) {
        await updateDoc(userRef, {
          enrolledTracks: arrayUnion({
            id: item.id,
            title: item.title,
            pricePaid: Number(item.value) || Number(item.price) || 0,
            dateEnrolled: new Date().toISOString(),
          }),
        });
      }

      alert("Checkout successful 🎉 You are now enrolled!");
      // TODO: clear cart + redirect to learner dashboard
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-700 text-white py-6 text-center text-2xl font-semibold shadow-md">
        Checkout
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
        {/* Billing Form */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Billing Information
          </h2>

          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full border px-4 py-2 rounded-md"
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border px-4 py-2 rounded-md"
          />

          <input
            type="text"
            name="course"
            value={cartItems.map((item) => item.title).join(", ")} // auto from cart
            readOnly
            placeholder="Course / Track"
            className="w-full border px-4 py-2 rounded-md bg-gray-100"
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-md text-gray-600"
          >
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full border px-4 py-2 rounded-md"
          />

          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full border px-4 py-2 rounded-md"
          />

          <select
            name="pwdStatus"
            value={formData.pwdStatus}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-md text-gray-600"
          >
            <option value="">PWD Status</option>
            <option value="pwd">PWD</option>
            <option value="not_disabled">Not Disabled</option>
            <option value="other">Other</option>
          </select>

          {(formData.pwdStatus === "pwd" || formData.pwdStatus === "other") && (
            <input
              type="text"
              name="disabilityOther"
              value={formData.disabilityOther}
              onChange={handleChange}
              placeholder="If PWD, please specify"
              className="w-full border px-4 py-2 rounded-md"
            />
          )}
        </div>

        {/* RIGHT: Payment + Order Summary */}
        <div className="bg-white rounded-xl shadow-md p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Complete Payment
          </h2>

          {/* Order Summary */}
          <div className="border-b pb-4 mb-4">
            <h3 className="font-medium text-gray-700 mb-2">
              Order details ({cartItems.length} courses)
            </h3>
            <ul className="divide-y">
              {cartItems.map((item) => (
                <li key={item.id} className="flex justify-between py-2 text-sm">
                  <span>{item.title}</span>
                  <span className="font-medium">
                    ${Number(item.value) || Number(item.price) || 0}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Total:</span>
            <span className="text-2xl font-bold text-gray-800">
              ${totalPrice.toFixed(2)}USD
            </span>
          </div>

          <label className="block mb-2 text-sm font-medium text-gray-700">
            Enter Payment Amount
          </label>
          <input
            type="number"
            min={(totalPrice * 0.3).toFixed(2)}
            max={totalPrice.toFixed(2)}
            step="1"
            placeholder={`Min: $${(totalPrice * 0.3).toFixed(2)}`}
            className="w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700"
          />
          <p className="text-xs text-gray-500 mt-1">
            You can pay any amount between{" "}
            <strong className="mr-1">${(totalPrice * 0.3).toFixed(2)}</strong>
            and <strong>${totalPrice.toFixed(2)}</strong>.
          </p>

          <button
            onClick={handleCheckout}
            className="w-full bg-blue-700 text-white py-3 rounded-md hover:bg-blue-800 font-medium"
          >
            Complete my purchase →
          </button>
        </div>
      </div>
    </div>
  );
}
