'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, GoogleAuthProvider, signInWithRedirect, signInWithPopup, getRedirectResult, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Handle redirect result on page load
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User signed in successfully via redirect
          setUser(result.user);
        }
      } catch (error) {
        console.error("Error handling redirect result:", error);
      }
    };

    handleRedirectResult();
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // Try popup first, fallback to redirect if it fails
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.warn("Popup blocked or failed, trying redirect:", error);
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectError) {
        console.error("Error signing in with Google:", redirectError);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const value = { user, loading, signInWithGoogle, logout };

  return (
    <AuthContext.Provider value={value}>
        {loading ? (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
