
import React,{useState} from "react";
import { useCart } from "../../admin/contexts/CartContext";
import { useLearnerAuth } from "../contexts/LearnerAuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { FaCediSign } from "react-icons/fa6";

const CartPage = () => {
  const { cartItems, removeFromCart } = useCart();
  const { currentLearner } = useLearnerAuth();
 const [message,setMessage] = useState("");
  const navigate = useNavigate();

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.value || item.price || 0),
    0
  );

const handleCheckout = () => {
  if (!currentLearner) {
    setMessage("Kindly login to proceed");
    navigate("/learner/signin", { 
      state: { redirectTo: "/checkout", message: "Kindly login to proceed" } 
    });
  } else {
    navigate("/checkout");
  }
};



  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <p className="font-medium text-gray-700">
            {cartItems.length} Course{cartItems.length !== 1 && "s"} in Cart
          </p>

          {cartItems.length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 border-b pb-4">
                {/* Track Image */}
                <img
                  src={item.image || item.bgImg}
                  alt={item.title}
                  className="w-32 h-20 object-cover rounded-md"
                />

                {/* Track Info */}
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{item.title}</h2>
                  <p className="text-sm text-gray-500">By {item.instructor}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {Array.isArray(item.program)
                      ? `${item.program.length} Course${
                          item.program.length > 1 ? "s" : ""
                        }`
                      : "1 Course"}
                  </p>

                  <div className="flex gap-4 text-sm mt-2">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-purple-600 font-medium hover:underline"
                    >
                      Remove
                    </button>
                    <button className="text-purple-600 font-medium hover:underline">
                      Save for Later
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="text-lg font-semibold">
                   <FaCediSign className="inline mr-1" />{Number(item.price || 0).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Cart Summary */}
        <div className="border p-4 rounded-md h-fit">
          <p className="font-semibold text-lg mb-2">Total:</p>
          <p className="text-2xl font-bold mb-4"> <FaCediSign className="inline mr-1" />{totalPrice.toFixed(2)}</p>

        

          <button
            onClick={handleCheckout}
            className="w-full bg-purple-600 text-white py-3 rounded-md font-medium hover:bg-purple-700"
          >
            Proceed to Checkout →
          </button>

          <p className="text-sm text-gray-500 mt-2">You won’t be charged yet</p>

          <hr className="my-4" />

          <button className="w-full border border-gray-400 py-2 rounded-md font-medium hover:bg-gray-100">
            Apply Coupon
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
