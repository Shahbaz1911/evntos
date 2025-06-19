
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import LoadingSpinner from '@/components/loading-spinner';
import type { FirebaseError } from 'firebase/app';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, pass: string) => Promise<User | null>;
  logIn: (email: string, pass: string) => Promise<User | null>;
  logOut: () => Promise<void>;
  signInWithGoogle: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/login', '/signup', '/']; // Root path is now public landing
const PUBLIC_PREFIXES = ['/e/', '/landing']; // Public event pages and explicit landing

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      setUser(userCredential.user);
      router.push('/dashboard'); 
      return userCredential.user;
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error("Signup error:", firebaseError.message);
      throw firebaseError;
    } finally {
      setLoading(false);
    }
  };

  const logIn = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      setUser(userCredential.user);
      router.push('/dashboard'); 
      return userCredential.user;
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error("Login error:", firebaseError.message);
      throw firebaseError;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<User | null> => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      router.push('/dashboard');
      return result.user;
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error("Google Sign-in error:", firebaseError.code, firebaseError.message);
      throw firebaseError;
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      router.push('/'); // Redirect to public landing page on logout
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  
  // Adjusted loading screen logic
  const isPublicPage = PUBLIC_ROUTES.includes(pathname) || PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));
  if (loading && !isPublicPage) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <LoadingSpinner size={48} />
      </div>
    );
  }


  return (
    <AuthContext.Provider value={{ user, loading, signUp, logIn, logOut, signInWithGoogle }}>
      {children}
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
