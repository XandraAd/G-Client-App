import React,{useContext, useEffect, useState,useMemo } from "react";
import { auth } from "../../Config/Firebase";
import { onAuthStateChanged } from "firebase/auth";


// Create Auth Context
const AuthContext = React. createContext();

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
    const unsubscribe =onAuthStateChanged(auth,(user)=>{
        setCurrentUser(user);
        setUserLoggedIn(!!user);
        setLoading(false);
    });
    return ()=> unsubscribe();
  },[])

  const value = useMemo(() => ({
    currentUser,
    userLoggedIn,
  }), [currentUser, userLoggedIn]);

  return(
    <AuthContext.Provider value={value}>
        {!loading && children}
    </AuthContext.Provider>
  )
}