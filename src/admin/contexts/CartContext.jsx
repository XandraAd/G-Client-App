import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/authContext/index"; 

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { currentUser, userLoggedIn } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // ------------------
  // Helper: Local guest cart
  // ------------------
  const getGuestCart = () =>
    JSON.parse(localStorage.getItem("guestCart")) || [];

  const saveGuestCart = (cart) => {
    localStorage.setItem("guestCart", JSON.stringify(cart));
    setCartItems(cart);
  };

  // ------------------
  // Firestore cart fetch
  // ------------------
  const fetchCart = async (uid) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/cart/${uid}`);
      setCartItems(res.data || []);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setCartItems([]);
    }
  };

  // ------------------
  // Add to cart
  // ------------------
const addToCart = async (item) => {
  const cartItem = {
    id: item.id || item.trackId,   // make sure you have a unique ID
    title: item.title,
    instructor: item.instructor,
    image: item.bgImg || item.image,
    duration: item.duration || "12 weeks",
    courses: item.courses || 1,
    price: Number(item.price) || Number(item.value),   // ✅ enforce price
  };

  if (!userLoggedIn) {
    const guestCart = getGuestCart();
    guestCart.push(cartItem);
    saveGuestCart(guestCart);
  } else {
    await axios.post(`http://localhost:5000/api/cart/${currentUser.uid}`, cartItem);
    fetchCart(currentUser.uid);
  }
};


  // ------------------
  // Remove from cart
  // ------------------
  const removeFromCart = async (id) => {
    if (!userLoggedIn) {
      const guestCart = getGuestCart().filter((i) => i.id !== id);
      saveGuestCart(guestCart);
    } else {
      await axios.delete(`http://localhost:5000/api/cart/${currentUser.uid}/${id}`);
      fetchCart(currentUser.uid);
    }
  };

  // ------------------
  // Clear cart
  // ------------------
  const clearCart = async () => {
    if (!userLoggedIn) {
      localStorage.removeItem("guestCart");
      setCartItems([]);
    } else {
      await axios.delete(`http://localhost:5000/api/cart/${currentUser.uid}`);
      setCartItems([]);
    }
  };

  // ------------------
  // Merge guest cart → Firestore after login
  // ------------------
  useEffect(() => {
    if (userLoggedIn && currentUser) {
      const guestCart = getGuestCart();
      if (guestCart.length > 0) {
        guestCart.forEach(async (item) => {
          await axios.post(`http://localhost:5000/api/cart/${currentUser.uid}`, item);
        });
        localStorage.removeItem("guestCart");
      }
      fetchCart(currentUser.uid);
    } else {
      setCartItems(getGuestCart());
    }
  }, [userLoggedIn, currentUser]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};


