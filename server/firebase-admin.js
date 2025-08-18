import admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

// ======== ENVIRONMENT VALIDATION ======== //
const validateFirebaseConfig = () => {
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(`Missing Firebase config: ${missingVars.join(', ')}`);
  }
};

// ======== PRIVATE KEY PROCESSING ======== //
const processPrivateKey = (key) => {
  if (!key) throw new Error('FIREBASE_PRIVATE_KEY is undefined');
  
  // Convert escaped newlines to actual newlines
  const processedKey = key.replace(/\\n/g, '\n');
  
  // Validate key format
  if (!processedKey.includes('-----BEGIN PRIVATE KEY-----') || 
      !processedKey.includes('-----END PRIVATE KEY-----')) {
    throw new Error('Invalid private key format');
  }
  
  return processedKey;
};

// ======== FIREBASE INITIALIZATION ======== //
let db;
let bucket;

const initializeFirebase = () => {
  try {
    validateFirebaseConfig();
    
    const privateKey = processPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'g-client-app.appspot.com',
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
      });

      console.log('🔥 Firebase Admin initialized successfully');
    }

    db = getFirestore();
    bucket = admin.storage().bucket();
    
    return { db, bucket };
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    process.exit(1);
  }
};

// ======== FIRESTORE RULES DEPLOYMENT ======== //
const deployFirestoreRules = async () => {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const rulesPath = path.join(__dirname, '../../firestore.rules');
    
    if (!fs.existsSync(rulesPath)) {
      throw new Error('firestore.rules file not found');
    }

    const rules = fs.readFileSync(rulesPath, 'utf8');
    await admin.securityRules().releaseFirestoreRuleset(
      admin.securityRules().createRuleset(rules)
    );
    
    console.log('🛡️ Firestore rules deployed successfully');
  } catch (error) {
    console.error('❌ Firestore rules deployment failed:', error);
  }
};

// Initialize Firebase and export
initializeFirebase();

export { db, Timestamp, bucket, deployFirestoreRules };