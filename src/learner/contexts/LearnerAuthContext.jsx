// src/contexts/learnerAuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../../admin/Config/Firebase";;
import { onAuthStateChanged } from "firebase/auth";

const LearnerAuthContext = createContext();

export const useLearnerAuth = () => useContext(LearnerAuthContext);

export const LearnerAuthProvider = ({ children }) => {
  const [currentLearner, setCurrentLearner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentLearner(user);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <LearnerAuthContext.Provider value={{ currentLearner,loading }}>
      {children}
    </LearnerAuthContext.Provider>
  );
};
