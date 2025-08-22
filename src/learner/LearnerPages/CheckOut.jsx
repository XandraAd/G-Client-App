import { useState, useEffect } from "react";
import { useCart } from "../../admin/contexts/CartContext";
import { useLearnerAuth } from "../contexts/LearnerAuthContext";
import { useSearchParams,useNavigate } from "react-router-dom";
import { db } from "../../admin/Config/Firebase";
import { FaCediSign } from "react-icons/fa6";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";

export default function CheckOut() {
  const { cartItems } = useCart();
  const { currentLearner } = useLearnerAuth();
  const [isProcessing, setIsProcessing] = useState(false);
 const [paymentStatus, setPaymentStatus] = useState(null); // Add payment status state
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // We only use exchangeRate to *display* an approximate USD equivalent
  const [exchangeRate, setExchangeRate] = useState(null); // GHS per 1 USD
  
  const trxref = params.get("trxref");
  const reference = trxref || params.get("reference");

// ---- Utility: remove undefined fields ----
const cleanObject = (obj) => {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
};

// Add this useEffect to handle payment completion redirects
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const trxref = params.get("trxref");
      const reference = params.get("reference");
      const paymentRef = trxref || reference;

      if (paymentRef) {
        console.log("Payment reference found in URL:", paymentRef);
        setIsProcessing(true);
        
        try {
          const res = await fetch(`http://localhost:5000/api/payment/verify/${paymentRef}`);
          const data = await res.json();
          
          if (data.success) {
            setPaymentStatus("success");
            // Clear cart on successful payment
           
            // Show success message
            alert("Payment successful! You will be redirected to your dashboard.");
            // Redirect to dashboard after a delay
            setTimeout(() => navigate("/learner/dashboard"), 3000);
          } else {
            setPaymentStatus("failed");
            alert("Payment verification failed. Please contact support.");
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          setPaymentStatus("error");
          alert("Error verifying payment. Please check your email for confirmation.");
        } finally {
          setIsProcessing(false);
        }
      }
    };

    checkPaymentStatus();
  }, [params, navigate]);

// ---- Utility: prepare data for API (remove Firestore-specific values) ----

{/**const prepareForAPI = (obj) => {
  const cleaned = Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => {
      // Remove Firestore serverTimestamp and other special values
      if (v && typeof v === 'object') {
        // Keep regular objects but remove Firestore-specific ones
        if (v.constructor.name === 'Timestamp' || 
            (v.constructor.name === 'Object' && Object.keys(v).length === 0)) {
          return false;
        }
      }
      return v !== undefined;
    })
  );
  
  return cleaned;
}; */}


  useEffect(() => {
    if (reference) {
      verifyPayment(reference);
    }
  }, [reference]);

  // Fetch exchange rate (optional—display only)
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const data = await response.json();
        setExchangeRate(data.rates.GHS); // 1 USD = X GHS
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
        setExchangeRate(null); // hide USD equivalent if we can't load it
      }
    };
    fetchExchangeRate();
  }, []);

  // ---- Totals in GHS (tracks are in cedis now) ----
  const calculateTotals = () => {
    // Accept a few possible price keys, but treat as GHS
    const ghsTotal = cartItems.reduce(
      (sum, item) =>
        sum +
        Number(
          item.priceGHS ??
          item.ghsPrice ??
          item.price ??        // now assumed to be GHS
          item.value ??        // legacy field, also treated as GHS
          0
        ),
      0
    );

    return {
      ghsTotal,
      displayTotal: ghsTotal,
      minPayment: ghsTotal * 0.3, // 30% deposit rule (still in GHS)
    };
  };

  const { displayTotal, minPayment } = calculateTotals();
  const [customAmount, setCustomAmount] = useState(displayTotal);

  useEffect(() => {
    setCustomAmount(displayTotal);
  }, [displayTotal]);

  // ---- Form data ----
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    course: "",
    gender: "",
    phone: "",
    location: "",
    pwdStatus: "",
    disabilityOther: "",
  });


  // Add this function to update user profile
const updateUserProfile = async (userId, formData) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      phone: formData.phone,
      location: formData.location,
      gender: formData.gender,
      pwdStatus: formData.pwdStatus,
      disabilityOther: formData.disabilityOther,
      fullName: formData.fullName,
      updatedAt: serverTimestamp()
    });
    console.log("User profile updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return false;
  }
};

  // Load user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentLearner) {
        setFormData({
          fullName: "",
          email: "",
          course: "",
          gender: "",
          phone: "",
          location: "",
          pwdStatus: "",
          disabilityOther: "",
        });
        return;
      }

      try {
        const docRef = doc(db, "users", currentLearner.uid);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const profile = snap.data();
          setFormData({
            fullName: profile.fullName || currentLearner.displayName || "",
            email: profile.email || currentLearner.email || "",
            course: profile.track || "",
            gender: profile.gender || "",
            phone: profile.phone || "",
            location: profile.location || "",
            pwdStatus: profile.pwdStatus || "",
            disabilityOther: profile.disabilityOther || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [currentLearner]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



// ---- Verify payment with backend ----
const verifyPayment = async (reference) => {
  try {
    const res = await fetch(`http://localhost:5000/api/payment/verify/${reference}`);
    const data = await res.json();

    if (data.success) {
      // ✅ Sanitize cart items before saving
      const sanitizedItems = cartItems.map((item) =>
        cleanObject({
          id: item.id || null,
          title: item.title || "Untitled",
          price: Number(item.priceGHS ?? item.price ?? 0),
          currency: "GHS",
        })
      );

      // ✅ Update payment record
      const paymentRef = doc(db, "payments", reference);
      await updateDoc(paymentRef, {
        status: "completed",
        updatedAt: new Date(),
      });

      // ✅ Update user record (enrolledCourses + clear cart)
      const userRef = doc(db, "users", currentLearner.uid);
     await updateDoc(userRef, cleanObject({
  enrolledCourses: arrayUnion(...sanitizedItems.map((item) => item.id)),
  cart: [],
  updatedAt: new Date(),
}));

      // ✅ Create invoice (store in GHS only)
      await fetch("http://localhost:5000/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentLearner.uid,
          email: currentLearner.email,
          amount: data.data.amount / 100, // Paystack sends pesewas → convert to GHS
          currency: "GHS",
          items: sanitizedItems,
          reference,
        }),
      });

      alert("🎉 Payment verified! You're now enrolled. Invoice generated.");
      // 👇 redirect user to dashboard (optional)
      navigate("/learner");
    } else {
      alert("⚠️ Payment verification failed. Please contact support.");
    }
  } catch (err) {
    console.error("Verification error:", err);
    alert("❌ Error verifying payment. Please check your confirmation email.");
  }
};



  // ---- Handle checkout ----
const handleCheckout = async () => {
  console.log("Checkout process started");

  if (!currentLearner) {
    alert("Please sign in to continue.");
    return;
  }
  
  if (!formData.phone || !formData.email) {
    alert("Please provide valid email and phone number.");
    return;
  }
  
  if (customAmount < minPayment) {
    alert(`Minimum payment is GHS ${minPayment.toFixed(2)}`);
    return;
  }

  setIsProcessing(true);

  try {
      // First update the user profile with the form data
    const profileUpdated = await updateUserProfile(currentLearner.uid, formData);
    if (!profileUpdated) {
      alert("Failed to update profile. Please try again.");
      setIsProcessing(false);
      return;
    }
    const trxRef = `trx-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const invoiceNumber = "INV-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);

    // Sanitize cart items
    const sanitizedItems = cartItems.map((item) =>
      cleanObject({
        id: item.id || null,
        title: item.title || "Untitled",
        price: Number(item.priceGHS ?? item.ghsPrice ?? item.price ?? item.value ?? 0),
        currency: "GHS",
      })
    );

 // Build payment data for API
    const paymentDataForAPI = cleanObject({
      userId: currentLearner.uid,
      learnerName: formData.fullName || currentLearner.displayName || "Unknown",
      email: formData.email || currentLearner.email || "No email",
      amount: Number(customAmount),
      gender: formData.gender,
      phone: formData.phone, // Add phone to payment data
      location: formData.location, // Add location to payment data
      currency: "GHS",
      reference: trxRef,
      courses: sanitizedItems.map((item) => item.id),
      cartItems: sanitizedItems,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    // Right before the fetch call, add:
console.log("Sending to backend:", {
  ...paymentDataForAPI,
  cartItems: sanitizedItems // Log the actual cart items
});

console.log("Number of cart items:", sanitizedItems.length);
console.log("Cart items details:", sanitizedItems);

    // 🔑 Send to backend
    const response = await fetch("http://localhost:5000/api/payment/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentDataForAPI),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Payment initialization failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("Backend success response:", data);

    // FIXED: Use authUrl instead of authorizationUrl
    const authUrl = data.authUrl || data.authorization_url || data.data?.authorization_url;
    
    if (!authUrl) {
      console.error("No authorization URL in response:", data);
      throw new Error("Payment initialization failed: No redirect URL received");
    }

    // ✅ Save to Firestore - SIMPLIFIED to avoid permission issues
    try {
      const batch = writeBatch(db);
      const userRef = doc(db, "users", currentLearner.uid);
      
      // Only store minimal data that matches security rules
      const userUpdateData = {
        pendingPayments: arrayUnion(trxRef), // Just store reference, not full object
        updatedAt: serverTimestamp(),
      };
      
      batch.set(userRef, userUpdateData, { merge: true });

      const paymentRef = doc(db, "payments", trxRef);
      
      // Create simple payment data that matches security rules
      const firestorePaymentData = cleanObject({
        userId: currentLearner.uid,
        learnerName: paymentDataForAPI.learnerName,
        email: paymentDataForAPI.email,
        amount: paymentDataForAPI.amount,
        currency: paymentDataForAPI.currency,
        reference: trxRef,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      batch.set(paymentRef, firestorePaymentData);
      await batch.commit();
      console.log("✅ Firestore updated successfully");
    } catch (firestoreError) {
      console.warn("Firestore save warning (proceeding anyway):", firestoreError);
      // Continue with redirect even if Firestore save fails
    }

    console.log("✅ Redirecting to:", authUrl);

    // REDIRECT TO PAYSTACK - This is the most important part
    window.location.href = authUrl;
    
  } catch (error) {
    console.error("Checkout error details:", error);
    
    // More specific error messages
    if (error.message.includes('Missing or insufficient permissions')) {
      alert("Payment initialization failed: Database permissions issue. Please contact support.");
    } else {
      alert("Payment initialization failed: " + error.message);
    }
  } finally {
    setIsProcessing(false);
  }
};
  const formatGHS = (n) =>
    `GHS ${Number(n || 0).toFixed(2)}`;

  const usdEquivalent = (ghs) =>
    exchangeRate ? (Number(ghs) / exchangeRate).toFixed(2) : null;

  // ---- JSX ----
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-700 text-white py-6 text-center text-2xl font-semibold shadow-md">
        Checkout
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
        {/* Billing */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Billing Information
          </h2>

          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            disabled
            placeholder="Full Name"
            className="w-full border px-4 py-2 rounded-md"
            required
          />

          <input
            type="email"
            name="email"
            value={formData.email}
        disabled
            placeholder="Email"
            className="w-full border px-4 py-2 rounded-md"
            required
          />

          <input
            type="text"
            name="course"
            value={cartItems.map((item) => item.title).join(", ")}
            readOnly
            className="w-full border px-4 py-2 rounded-md bg-gray-100"
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-md"
          >
            <option value="">Select Gender</option>
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
            required
          />

          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full border px-4 py-2 rounded-md"
            required
          />

          <select
            name="pwdStatus"
            value={formData.pwdStatus}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-md"
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
              placeholder="Please specify"
              className="w-full border px-4 py-2 rounded-md"
            />
          )}
        </div>

        {/* Payment summary */}
        <div className="bg-white rounded-xl shadow-md p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Complete Payment
          </h2>

          {/* No currency switcher — always GHS */}
          <div className="border-b pb-4 mb-4">
            <h3 className="font-medium text-gray-700 mb-2">
              Order ({cartItems.length} items)
            </h3>
            <ul className="divide-y">
              {cartItems.map((item) => {
                const priceGHS =
                  item.priceGHS ??
                  item.ghsPrice ??
                  item.price ??
                  item.value ??
                  0;
                return (
                  <li key={item.id} className="flex justify-between py-2 text-sm">
                    <span>{item.title}</span>
                    <span>
                      <span className="inline-flex items-center gap-1">
                        <FaCediSign aria-label="GHS" />
                        {Number(priceGHS).toFixed(2)}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-600 font-medium">Total (GHS):</span>
            <span className="text-2xl font-bold text-gray-800">
              {formatGHS(displayTotal)}
            </span>
          </div>

          {exchangeRate && (
            <p className="text-xs text-gray-500 mb-4 text-right">
              ≈ ${usdEquivalent(displayTotal)} @ 1 USD = {exchangeRate.toFixed(2)} GHS
            </p>
          )}

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Payment Amount (GHS)
            </label>
            <input
              type="number"
              min={minPayment}
              max={displayTotal}
              step="0.01"
              value={customAmount}
              onChange={(e) => {
                const value = Number(e.target.value);
                setCustomAmount(
                  Math.min(
                    displayTotal,
                    Math.max(minPayment, isNaN(value) ? minPayment : value)
                  )
                );
              }}
              className="w-full border px-4 py-2 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum: {formatGHS(minPayment)}
            </p>
            {exchangeRate && (
              <p className="text-xs text-gray-500 mt-1">
                ≈ ${usdEquivalent(customAmount)} (display only)
              </p>
            )}
          </div>

          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className={`w-full py-3 rounded-md font-medium ${
              isProcessing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-800 text-white"
            }`}
          >
            {isProcessing ? "Processing..." : "Complete Purchase →"}
          </button>
          
        </div>
      </div>
    </div>
  );
}
