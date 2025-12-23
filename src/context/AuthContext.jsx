import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  signInAnonymously
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Determine if user is admin (not anonymous)
      setIsAdmin(currentUser && !currentUser.isAnonymous);
      setLoading(false);
    });

    // Auto sign-in anonymously if not logged in
    // This ensures Firestore rules work for "public" read access if configured to require auth
    if (!auth.currentUser) {
        signInAnonymously(auth).catch((e) => console.error("Anonymous auth failed", e));
    }

    return () => unsubscribe();
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    return signInAnonymously(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
