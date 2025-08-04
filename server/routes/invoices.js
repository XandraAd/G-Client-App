// routes/invoices.js
import express from 'express';
import { db } from "../firebase-admin.js";
; // Firebase Admin initialized here

const router = express.Router();

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('invoices').get();
    const invoices = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch invoices', error });
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

