import admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

// Ensure correct path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account JSON securely
const serviceAccountPath = path.join(__dirname, '../server/serviceAccountKey.json'); // ✅ Adjust this
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
   storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'FALLBACK_BUCKET.appspot.com',

  });
}

const db = getFirestore();
const bucket = admin.storage().bucket();

export { db, Timestamp,bucket };
