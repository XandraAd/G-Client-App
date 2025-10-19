import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/authContext/index"; 

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { currentUser, userLoggedIn } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartSource, setCartSource] = useState('guest');

  const getGuestCart = () => {
    try {
      return JSON.parse(localStorage.getItem("guestCart")) || [];
    } catch {
      return [];
    }
  };

  const saveGuestCart = (cart) => {
    localStorage.setItem("guestCart", JSON.stringify(cart));
    setCartItems(cart);
    setCartSource('guest');
  };

  const fetchCart = async (uid) => {
    if (!uid) return;
    setIsLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/cart/${uid}`);
      const userCart = res.data || [];
      setCartItems(userCart);
      setCartSource('user');
    } catch (err) {
      console.error("Error fetching cart:", err);
      setCartSource('user');
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (item) => {
    const cartItem = {
      id: item.id || item.trackId,
      title: item.title,
      instructor: item.instructor,
      image: item.bgImg || item.image,
      duration: item.duration || "12 weeks",
      courses: item.courses || 1,
      price: Number(item.price) || Number(item.value),
    };

    if (!userLoggedIn) {
      const guestCart = getGuestCart();
      const existingItemIndex = guestCart.findIndex(ci => ci.id === cartItem.id);
      if (existingItemIndex === -1) {
        guestCart.push(cartItem);
        saveGuestCart(guestCart);
      }
    } else {
      try {
        await axios.post(`http://localhost:5000/api/cart/${currentUser.uid}`, cartItem);
        await fetchCart(currentUser.uid);
      } catch (error) {
        console.error("Error adding to user cart:", error);
      }
    }
  };

  const removeFromCart = async (id) => {
    if (!userLoggedIn) {
      const guestCart = getGuestCart().filter((i) => i.id !== id);
      saveGuestCart(guestCart);
    } else {
      try {
        await axios.delete(`http://localhost:5000/api/cart/${currentUser.uid}/${id}`);
        await fetchCart(currentUser.uid);
      } catch (error) {
        console.error("Error removing from user cart:", error);
      }
    }
  };

  const clearCart = async () => {
    if (!userLoggedIn) {
      localStorage.removeItem("guestCart");
      setCartItems([]);
    } else {
      try {
        await axios.delete(`http://localhost:5000/api/cart/${currentUser.uid}`);
        setCartItems([]);
      } catch (error) {
        console.error("Error clearing user cart:", error);
      }
    }
  };

  // Clear user cart specifically
  const clearUserCart = async () => {
    if (!userLoggedIn || !currentUser) return;
    try {
      await axios.delete(`http://localhost:5000/api/cart/${currentUser.uid}`);
      setCartItems([]);
    } catch (error) {
      console.error("Error clearing user cart:", error);
    }
  };

  // Initialize with empty cart on sign-in
  const initializeWithEmptyCart = async () => {
    if (!userLoggedIn || !currentUser) return;
    try {
      localStorage.removeItem("guestCart"); // Clear guest cart
      await axios.delete(`http://localhost:5000/api/cart/${currentUser.uid}`);
      setCartItems([]);
      setCartSource('user');
    } catch (error) {
      console.error("Error initializing empty cart:", error);
      setCartItems([]); // Still set empty cart even if API fails
    }
  };

  useEffect(() => {
    if (userLoggedIn && currentUser) {
      // ✅ RECOMMENDED: Start with fresh empty cart on login
      initializeWithEmptyCart();
    } else {
      // User logged out - show guest cart
      const guestCart = getGuestCart();
      setCartItems(guestCart);
      setCartSource('guest');
    }
  }, [userLoggedIn, currentUser]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        clearUserCart,
        fetchCart,
        isLoading,
        cartSource,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};