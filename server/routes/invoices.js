// backend/routes/invoices.js
import express from "express";
import { db } from "../firebase-admin.js";

const router = express.Router();
const getLearnerDetails = async (learnerId, email) => {
  if (!learnerId && !email) return null;

  try {
    let learnerDocSnapshot = null;

    if (learnerId) {
      // Direct document fetch
      const docRef = await db.collection("learners").doc(learnerId).get();
      if (docRef.exists) learnerDocSnapshot = docRef;
    } else if (email) {
      // Query by email
      const snapshot = await db
        .collection("learners")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (!snapshot.empty) learnerDocSnapshot = snapshot.docs[0];
    }

    if (!learnerDocSnapshot) return null;

    const learnerData = learnerDocSnapshot.data();
     // FIXED: Handle Firebase timestamp conversion properly
    let createdAtFormatted = "No date";
    if (learnerData.createdAt) {
      if (typeof learnerData.createdAt.toDate === 'function') {
        createdAtFormatted = learnerData.createdAt.toDate().toLocaleDateString();
      } else if (learnerData.createdAt instanceof Date) {
        createdAtFormatted = learnerData.createdAt.toLocaleDateString();
      } else if (typeof learnerData.createdAt === 'string') {
        createdAtFormatted = new Date(learnerData.createdAt).toLocaleDateString();
      } else if (learnerData.createdAt.seconds) {
        createdAtFormatted = new Date(learnerData.createdAt.seconds * 1000).toLocaleDateString();
      }
    }

    
    // Construct the learner name properly
    const learnerName = 
      (learnerData.firstName && learnerData.lastName)
        ? `${learnerData.firstName} ${learnerData.lastName}`
        : learnerData.firstName || learnerData.lastName || "Unknown";

    return {
      id: learnerDocSnapshot.id,
      uid:learnerData.uid ||learnerDocSnapshot.id,
   learnerName,
      email: learnerData.email || "No email",
      firstName: learnerData.firstName || "",
      lastName: learnerData.lastName || "",
      createdAt: createdAtFormatted,
      ...learnerData,
    };
  } catch (error) {
    console.error("Error fetching learner:", error);
    return null;
  }
};



/**
 * ✅ Create new invoice
 */
router.post("/", async (req, res) => {
  try {
    const { userId, email, amount, currency, items, reference } = req.body;

    if (!amount || !(userId || email)) {
      return res
        .status(400)
        .json({ error: "Missing required fields: userId/email and amount" });
    }

    const learner = await getLearnerDetails(userId, email);

    const createdAt = new Date();
    const dueDate = new Date(createdAt);
    dueDate.setMonth(dueDate.getMonth() + 2);

    const learnerName = learner
      ? `${learner.firstName || ""} ${learner.lastName || ""}`.trim() || "Unknown"
      : email?.split("@")[0];

    const learnerEmail = learner ? learner.email : email;

    const invoiceData = {
      userId: userId || learner?.uid || null,
      learnerName,
      learnerEmail,
      amount: parseFloat(amount),
      currency: currency || "GHS",
      reference: reference || `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      items: items || [],
      status: "pending",
      dueDate: dueDate.toISOString(),
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    };

    // 🔑 Use reference as document ID when available
    const docRef = reference
      ? db.collection("invoices").doc(reference)
      : db.collection("invoices").doc();

    await docRef.set(invoiceData);

    console.log("✅ Invoice saved with learner:", learnerName, learnerEmail);

    res.status(201).json({ id: docRef.id, ...invoiceData });
  } catch (err) {
    console.error("Error creating invoice:", err);
    res.status(500).json({ error: "Failed to create invoice" });
  }
});



/**
 * ✅ Get all invoices (admin)
 */
router.get("/", async (req, res) => {
  try {
    const snapshot = await db
      .collection("invoices")
      .orderBy("createdAt", "desc")
      .get();

    const invoices = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        let learner = null;

        if (data.userId || data.email) {
          learner = await getLearnerDetails(
            data.userId,
            data.learnerEmail || data.email
          );
        }

        const amountValue =
          typeof data.amount === "number"
            ? data.amount
            : parseFloat(data.amount || 0);
        const currency = data.currency || "GHS";

        const parseDate = (value) => {
          if (!value) return null;
          if (value.toDate) return value.toDate();
          if (value instanceof Date) return value;
          return new Date(value);
        };

        return {
          id: doc.id,
          ...data,
          learnerName:
            data.learnerName ||
            (learner ? learner.learnerName : null) ||
            data.name ||
            "Unknown",
          email:
            data.learnerEmail ||
            (learner ? learner.email : null) ||
            data.email ||
            "No email",
          amount: amountValue,
          currency,
          amountDisplay:
            currency === "GHS"
              ? `GHS ${amountValue.toFixed(2)}`
              : `$${amountValue.toFixed(2)}`,
          createdAt: data.createdAt
            ? new Date(data.createdAt).toLocaleDateString()
            : "Unknown date",
          paidAt: data.paidAt
            ? new Date(data.paidAt).toLocaleDateString()
            : null,
          dueDate: data.dueDate
            ? new Date(data.dueDate).toLocaleDateString()
            : "—",
          status: data.status || "pending",
        };
      })
    );

    res.status(200).json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ✅ Get invoices by learnerId
 */
router.get("/:learnerId", async (req, res) => {
  try {
    const { learnerId } = req.params;
    if (!learnerId) {
      return res.status(400).json({ error: "Missing learnerId" });
    }

    const snapshot = await db
      .collection("invoices")
      .where("userId", "==", learnerId)
      .orderBy("createdAt", "desc")
      .get();

    const invoices = snapshot.docs.map((doc) => {
      const data = doc.data();
      const amountValue =
        typeof data.amount === "number"
          ? data.amount
          : parseFloat(data.amount || 0);
      const currency = data.currency || "GHS";

      return {
        id: doc.id,
        ...data,
        amount: amountValue,
        currency,
        amountDisplay:
          currency === "GHS"
            ? `GHS ${amountValue.toFixed(2)}`
            : `$${amountValue.toFixed(2)}`,
        createdAt: data.createdAt
          ? new Date(data.createdAt).toLocaleDateString()
          : "Unknown date",
        dueDate: data.dueDate
          ? new Date(data.dueDate).toLocaleDateString()
          : "—",
        status: data.status || "pending",
      };
    });

    res.status(200).json(invoices);
  } catch (error) {
    console.error("Error fetching learner invoices:", error);
    res.status(500).json({ error: error.message });
  }
});

// 
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Add updatedAt timestamp
    updateData.updatedAt = new Date().toISOString();
    
    const docRef = db.collection("invoices").doc(id);
    await docRef.update(updateData);
    
    // Get the updated document
    const updatedDoc = await docRef.get();
    
    res.status(200).json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (err) {
    console.error("Error updating invoice:", err);
    res.status(500).json({ error: "Failed to update invoice" });
  }
});

// DELETE an  Invoice
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  

  try {
    const docRef = db.collection("invoices").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "invoice not found" });
    }

    await docRef.delete();
    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting invoice:", error);
    res
      .status(500)
      .json({ message: "Failed to delete invoice", error: error.message });
  }
});



export default router;
