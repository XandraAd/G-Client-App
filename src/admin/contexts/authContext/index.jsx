import React,{useContext, useEffect, useState,useMemo ,createContext} from "react";
import { auth } from "../../Config/Firebase";
import { onAuthStateChanged } from "firebase/auth";


// Create Auth Context
const AuthContext = createContext();

//Custom hook to acces the AuthContext
export const useAuth=()=>{
    return useContext(AuthContext)
}

// AuthProvider component
export function AuthProvider ({children}){
  const[currentUser,setCurrentUser]=useState(null) ;
  const[loading,setLoading]=useState(true) ;
  const[userLoggedIn,setUserLoggedIn]=useState(false); 
  
  useEffect(()=>{
     const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload(); // Always get latest data
        setCurrentUser(user);
        setUserLoggedIn(true);
      } else {
        setCurrentUser(null);
        setUserLoggedIn(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

    // ✅ Add this to allow manual refresh after updates
  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setCurrentUser(auth.currentUser);
    }
  };

  const value = useMemo(() => ({
    currentUser,
    userLoggedIn,
    refreshUser, // expose refresh function
  }), [currentUser, userLoggedIn]);

  return(
    <AuthContext.Provider value={value}>
        {!loading && children}
    </AuthContext.Provider>
  )
}