import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore"; // Import Firestore methods
import db from '../configFirebase'; // Import your Firestore config

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false); // State to track account status
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log(currentUser);
        setUser(currentUser);
        const uid = currentUser.uid;

        // Fetch user document using query
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, where('uid', '==', uid));
        
        // Execute the query
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0].data(); // Get the user document data
          
          // Check if status is "active"
          if (userDoc.status === 'active') {
            setIsActive(true); // Set isActive to true if status is active
          } else {
            setIsActive(false); 
            alert("Your account isn't active yet!") // Change to your desired inactive route
          }
        } else {
          console.error("No such user document!");
          navigate("/"); // Redirect to login if user document does not exist
        }
      } else {
        navigate("/"); // Redirect to login if the user is not authenticated
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [auth, navigate]);

  if (loading) {
    return <p>Chargement...</p>;
  }

  return user && isActive ? children : null; // Display children if user is active, else redirect
};

export default ProtectedRoute;
