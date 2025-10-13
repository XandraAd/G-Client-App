//Firestore Collection reference
import { db } from '../firebase-admin.js';

// Firestore collection reference (no Mongoose!)
export const Track = db.collection('tracks');