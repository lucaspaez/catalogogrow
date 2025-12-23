import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const StoreContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    storeName: 'Santa Montaña',
    whatsappNumber: '5491112345678', // Default backup
    active: true,
    catalogId: 'grow-3d-main' // Constant ID for now
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to real-time updates for store settings
    // Using a hardcoded ID 'general' in 'settings' collection inside the catalog artifact
    // Path: artifacts/grow-3d-main/public/data/settings/general
    const settingsRef = doc(db, 'artifacts', settings.catalogId, 'public', 'data', 'settings', 'general');
    
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching store settings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [settings.catalogId]);

  return (
    <StoreContext.Provider value={{ settings, loading }}>
      {children}
    </StoreContext.Provider>
  );
};
