
import admin from 'firebase-admin';
import {getFirestore,Timestamp } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
//import fs from 'fs';

dotenv.config();

// ======== DEBUG HELPER ======== //
const debugKey = (key) => {
  console.log('\n--- FIREBASE PRIVATE KEY DEBUG ---');
  console.log('Key Type:', typeof key);
  console.log('Key Length:', key.length);
  console.log('First 50 chars:', key.substring(0, 50).replace(/\n/g, '\\n'));
  console.log('Last 50 chars:', key.substring(key.length - 50).replace(/\n/g, '\\n'));
  console.log('Escaped \\n count:', (key.match(/\\n/g) || []).length);
  console.log('Actual newline count:', (key.match(/\n/g) || []).length);
  console.log('Has BEGIN marker:', key.includes('-----BEGIN PRIVATE KEY-----'));
  console.log('Has END marker:', key.includes('-----END PRIVATE KEY-----'));
  console.log('--------------------------------\n');
};

debugKey(process.env.FIREBASE_PRIVATE_KEY)

// Ensure correct path resolution
//const __filename = fileURLToPath(import.meta.url);
//////const __dirname = path.dirname(__filename);

// Load service account JSON securely
//const serviceAccountPath = path.join(__dirname, '../server/serviceAccountKey.json'); // ✅ Adjust this
//const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/gm, '\n');

// Initialize Firebase Admin

// Initialize Firebase Admin (with optional Storage Bucket)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'g-client-app.appspot.com' // Default bucket
  });
}

const db = getFirestore();
const bucket = admin.storage().bucket();

export { db, Timestamp,bucket };
