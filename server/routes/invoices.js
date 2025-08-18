// routes/invoices.js
import express from 'express';
import { db } from "../firebase-admin.js";
; // Firebase Admin initialized here

const router = express.Router();

// Helper to get learner details
const getLearnerDetails = async (learnerId) => {
  if (!learnerId) return null;
  const learnerDoc = await db.collection('learners').doc(learnerId).get();
  return learnerDoc.exists ? learnerDoc.data() : null;
};


// Get all invoices
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('invoices').get();
    const invoices = await Promise.all(snapshot.docs.map(async doc => {
      const data = doc.data();
      const learner = await getLearnerDetails(data.learnerId);
      return {
        id: doc.id,
        ...data,
        learnerName: learner?.name || 'Unknown',
        email: learner?.email || 'No email'
      };
    }));
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new invoice
router.post('/', async (req, res) => {
  try {
    const newInvoice = req.body;
    const docRef = await db.collection('invoices').add(newInvoice);
    res.status(201).json({ id: docRef.id, ...newInvoice });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create invoice', error });
  }
});

// Update invoice
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('invoices').doc(id).update(req.body);
    res.status(200).json({ message: 'Invoice updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update invoice', error });
  }
});

// Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('invoices').doc(id).delete();
    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete invoice', error });
  }
});

export default router;

