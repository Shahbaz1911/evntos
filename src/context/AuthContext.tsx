
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import LoadingSpinner from '@/components/loading-spinner';
import type { FirebaseError } from 'firebase/app';
import { useToast } from '@/hooks/use-toast';
import { sendWelcomeEmail } from '@/ai/flows/send-welcome-email-flow'; // Import the new flow

const ADMIN_EMAIL = "sk@gmail.com";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  userSubscriptionStatus: 'none' | 'active' | 'loading';
  signUp: (email: string, pass: string) => Promise<User | null>;
  logIn: (email: string, pass: string) => Promise<User | null>;
  logOut: () => Promise<void>;
  signInWithGoogle: () => Promise<User | null>;
  activateUserSubscription: (planName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/login', '/signup', '/', '/checkout']; 
const PUBLIC_PREFIXES = ['/e/', '/landing', '/checkout/']; 

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userSubscriptionStatus, setUserSubscriptionStatus] = useState<'none' | 'active' | 'loading'>('loading');
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const checkAndSetSubscriptionStatus = useCallback((currentUser: User | null) => {
    if (currentUser) {
      if (currentUser.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        setUserSubscriptionStatus('active'); // Admins always have active status
      } else {
        setIsAdmin(false);
        const storedStatus = localStorage.getItem(`evntos_subscription_${currentUser.uid}`);
        setUserSubscriptionStatus(storedStatus === 'active' ? 'active' : 'none');
      }
    } else {
      setIsAdmin(false);
      setUserSubscriptionStatus('none');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      checkAndSetSubscriptionStatus(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [checkAndSetSubscriptionStatus]);
  
  const activateUserSubscription = useCallback((planName: string) => {
    if (user && !isAdmin) {
      localStorage.setItem(`evntos_subscription_${user.uid}`, 'active');
      setUserSubscriptionStatus('active');
      toast({
        title: "Payment Successful!",
        description: `Your ${planName} plan is now active.`,
      });
      router.push('/dashboard');
    } else if (isAdmin && user) {
        // Admin already has access, just confirm and redirect
        toast({
            title: "Admin Access Confirmed",
            description: "Redirecting to dashboard.",
        });
        router.push('/dashboard');
    }
  }, [user, isAdmin, router, toast]);

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    checkAndSetSubscriptionStatus(loggedInUser);
    // Determine redirect based on subscription status after it's set
    if (loggedInUser.email === ADMIN_EMAIL || localStorage.getItem(`evntos_subscription_${loggedInUser.uid}`) === 'active') {
      router.push('/dashboard');
    } else {
      router.push('/pricing');
    }
  };
  
  const signUp = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      handleAuthSuccess(userCredential.user);

      // Send welcome email (fire and forget, don't let it block signup)
      sendWelcomeEmail({ userEmail: userCredential.user.email!, userName: userCredential.user.displayName || userCredential.user.email?.split('@')[0] })
        .then(emailResult => {
          if (emailResult.success) {
            console.log(`Welcome email sent to ${userCredential.user.email}`);
          } else {
            console.warn(`Failed to send welcome email to ${userCredential.user.email}: ${emailResult.message}`);
          }
        })
        .catch(emailError => {
          console.error(`Error dispatching welcome email to ${userCredential.user.email}:`, emailError);
        });
        
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
      handleAuthSuccess(userCredential.user);
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
      const additionalUserInfo = getAdditionalUserInfo(result);
      const isNewUser = additionalUserInfo?.isNewUser;
      
      handleAuthSuccess(result.user);

      if (isNewUser && result.user.email) {
        sendWelcomeEmail({ userEmail: result.user.email, userName: result.user.displayName || result.user.email?.split('@')[0] })
          .then(emailResult => {
            if (emailResult.success) {
              console.log(`Welcome email sent to new Google user ${result.user.email}`);
            } else {
              console.warn(`Failed to send welcome email to new Google user ${result.user.email}: ${emailResult.message}`);
            }
          })
          .catch(emailError => {
            console.error(`Error dispatching welcome email to new Google user ${result.user.email}:`, emailError);
          });
      }
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
      setIsAdmin(false);
      setUserSubscriptionStatus('none'); // Reset subscription status on logout
      router.push('/'); 
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const isPublicPage = PUBLIC_ROUTES.includes(pathname) || PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));
  
  if (loading || userSubscriptionStatus === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, userSubscriptionStatus, signUp, logIn, logOut, signInWithGoogle, activateUserSubscription }}>
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
