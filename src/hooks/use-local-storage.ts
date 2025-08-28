
"use client";

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './use-auth';

// This custom hook now syncs state with Firestore if a user is logged in,
// otherwise it falls back to using localStorage.

export function useSyncedStore<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const { user } = useAuth();
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoize the setter function to avoid unnecessary re-renders
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      setDoc(docRef, { [key]: valueToStore }, { merge: true }).catch(error => {
        console.error("Error writing to Firestore: ", error);
      });
    } else {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    }
  }, [key, user, storedValue]);

  // Effect to load data from Firestore or localStorage on mount
  useEffect(() => {
    // This effect should only run on the client
    if (typeof window === 'undefined') return;

    if (user) {
      // User is logged in, use Firestore
      const docRef = doc(db, 'users', user.uid);
      
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data[key] !== undefined) {
             const localDataRaw = localStorage.getItem(key);
             if (localDataRaw) {
               try {
                 const localData = JSON.parse(localDataRaw);
                 if (Array.isArray(localData) && Array.isArray(data[key]) && localData.every(item => typeof item === 'object' && item !== null && 'id' in item) && data[key].every((item: any) => typeof item === 'object' && item !== null && 'id' in item)) {
                   const combined = [...localData, ...data[key]];
                   const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
                   setStoredValue(unique as T);
                   setDoc(docRef, { [key]: unique }, { merge: true });
                 } else {
                    setStoredValue(data[key]);
                 }
               } catch {
                 setStoredValue(data[key]);
               } finally {
                 localStorage.removeItem(key);
               }
             } else {
               setStoredValue(data[key]);
             }
          } else {
            setStoredValue(initialValue);
            setDoc(docRef, { [key]: initialValue }, { merge: true });
          }
        } else {
          setStoredValue(initialValue);
          setDoc(docRef, { [key]: initialValue });
        }
        setIsInitialized(true);
      });

      return () => unsubscribe();

    } else {
      // User is not logged in, use localStorage
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        } else {
          setStoredValue(initialValue);
          window.localStorage.setItem(key, JSON.stringify(initialValue));
        }
      } catch (error) {
        console.log(error);
        setStoredValue(initialValue);
      }
      setIsInitialized(true);
    }
  }, [user, key, initialValue]);


  // When running on the server, we need to return a stable initial value.
  // The actual data will be loaded via useEffect on the client.
  if (typeof window === 'undefined') {
    // The setter should still be a valid function, even if it does nothing on the server.
    const serverSideSetValue = () => {};
    return [initialValue, serverSideSetValue];
  }

  return [storedValue, setValue];
}


export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  }, [key, storedValue]);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage.getItem(key) === null) {
      window.localStorage.setItem(key, JSON.stringify(initialValue));
    }
  }, [key, initialValue, storedValue]);


  return [storedValue, setValue];
}
