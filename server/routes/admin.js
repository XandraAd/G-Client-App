// In your Express server (e.g., routes/admin.js)
import admin from 'firebase-admin';
import express from 'express';

const router = express.Router();

// Protected route to initialize first admin
router.post('/init-first-admin', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // 1. Create auth account
    //const user = await admin.auth().createUser({
    //  email,
    //  password,
     // displayName: `${firstName} ${lastName}`
  //  });
    
    // 2. Set custom claims
 const user = await admin.auth().getUserByEmail("ewuramaaddo@yahoo.com");
console.log(user.customClaims);

    
    // 3. Create user document
    await admin.firestore().collection('users').doc(user.uid).set({
      email,
      firstName,
      lastName,
      isAdmin: true,
     
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, uid: user.uid });
  } catch (error) {
    console.error("Error creating first admin:", error);
    res.status(500).json({ error: error.message });
  }
});

// routes/admin.js
router.post("/signup", async (req, res) => {
  try {
    const { idToken, ...extraData } = req.body;

    // 1. Verify token
    const decoded = await admin.auth().verifyIdToken(idToken);

    // 2. User is authenticated, safe to write to Firestore
    const userId = decoded.uid;

    await db.collection("users").doc(userId).set({
      email: decoded.email,
      ...extraData,
      createdAt: new Date(),
    });

    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});



// promote a user as admin
router.post('/promote-to-admin', async (req, res) => {
  try {
    // Verify the requesting user is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { email } = req.body;

    // Get the user by email
    const user = await admin.auth().getUserByEmail(email);

    // Update Firestore
    await admin.firestore().collection('users').doc(user.uid).update({
      isAdmin: true,
      promotedBy: req.user.uid,
      promotedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;