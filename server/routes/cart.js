// routes/cartRoutes.js
import express from "express";
import { db } from "../firebase-admin.js"

const router = express.Router();

// ----------------------
// GET /api/cart/:uid
// ----------------------
router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const cartRef = db.collection("carts").doc(uid);
    const cartSnap = await cartRef.get();

    if (!cartSnap.exists) return res.json([]);
    res.json(cartSnap.data().items || []);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// ----------------------
// POST /api/cart/:uid
// ----------------------
router.post("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const item = req.body;

    const cartRef = db.collection("carts").doc(uid);
    const cartSnap = await cartRef.get();

    let items = [];
    if (cartSnap.exists) {
      items = cartSnap.data().items || [];
    }

    // prevent duplicates
    if (!items.find((i) => i.id === item.id)) {
      items.push(item);
    }

    await cartRef.set({ items }, { merge: true });
    res.json(items);
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ error: "Failed to add item" });
  }
});

// ----------------------
// DELETE /api/cart/:uid/:itemId
// ----------------------
router.delete("/:uid/:itemId", async (req, res) => {
  try {
    const { uid, itemId } = req.params;

    const cartRef = db.collection("carts").doc(uid);
    const cartSnap = await cartRef.get();

    if (!cartSnap.exists) return res.json([]);

    const items = (cartSnap.data().items || []).filter((i) => i.id !== itemId);
    await cartRef.set({ items }, { merge: true });

    res.json(items);
  } catch (err) {
    console.error("Error removing item:", err);
    res.status(500).json({ error: "Failed to remove item" });
  }
});

// ----------------------
// DELETE /api/cart/:uid (clear cart)
// ----------------------
router.delete("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    await db.collection("carts").doc(uid).set({ items: [] }, { merge: true });
    res.json([]);
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

export default router;
