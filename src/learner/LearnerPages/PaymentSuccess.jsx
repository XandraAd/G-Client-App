// PaymentSuccess.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCart } from "../../admin/contexts/CartContext"; // Import the useCart hook

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const {clearCart} = useCart();  // this is to clear the cart after successful payment

  useEffect(() => {
    const verifyPayment = async () => {
      const trxref = params.get("trxref");
      const reference = params.get("reference");
      const paymentRef = trxref || reference;

      if (!paymentRef) {
        setStatus("missing_reference");
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/payment/verify/${paymentRef}`);
        const data = await res.json();
        
       if (data.success) {
          setStatus("success");
          // Clear the cart after successful payment verification
          await clearCart();
          console.log("Cart cleared after successful payment");
        } else {
          setStatus("failed");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("error");
      }
    };

    verifyPayment();
  }, [params, clearCart]);

  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        {status === "success" && (
          <>
            <div className="text-green-500 text-6xl mb-4 text-center">✓</div>
            <h2 className="text-2xl font-bold text-green-700 text-center mb-4">
              Payment Successful!
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Your payment has been processed successfully. You're now enrolled in your courses.
            </p>
          </>
        )}
        {status === "failed" && (
          <>
            <div className="text-red-500 text-6xl mb-4 text-center">✗</div>
            <h2 className="text-2xl font-bold text-red-700 text-center mb-4">
              Payment Failed
            </h2>
            <p className="text-gray-600 text-center mb-6">
              There was an issue with your payment. Please try again or contact support.
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-yellow-500 text-6xl mb-4 text-center">⚠️</div>
            <h2 className="text-2xl font-bold text-yellow-700 text-center mb-4">
              Verification Error
            </h2>
            <p className="text-gray-600 text-center mb-6">
              We're having trouble verifying your payment. Please check your email for confirmation.
            </p>
          </>
        )}
        {status === "missing_reference" && (
          <>
            <div className="text-gray-500 text-6xl mb-4 text-center">❓</div>
            <h2 className="text-2xl font-bold text-gray-700 text-center mb-4">
              Missing Payment Reference
            </h2>
            <p className="text-gray-600 text-center mb-6">
              We couldn't find a payment reference. Please check your email for confirmation or contact support.
            </p>
          </>
        )}
        <button
          onClick={() => navigate("/learner")}
          className="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}