"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import LoadingSpinner from '@/components/loading-spinner';
import { CheckCircle, XCircle, Wifi, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Status = 'pending' | 'success' | 'error';

export default function FirebaseTestPage() {
  const { user, loading: authLoading } = useAuth();
  const [authStatus, setAuthStatus] = useState<Status>('pending');
  const [firestoreStatus, setFirestoreStatus] = useState<Status>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      setAuthStatus('success');
    }
  }, [authLoading]);

  useEffect(() => {
    const testFirestore = async () => {
      try {
        // We try to get a document that doesn't exist. 
        // A successful query (even if it returns 'not found') means we are connected.
        // A failure means there's a problem with rules or configuration.
        const testDocRef = doc(db, 'internal-test-collection', 'test-doc');
        await getDoc(testDocRef);
        setFirestoreStatus('success');
      } catch (error: any) {
        console.error("Firestore connection test failed:", error);
        setFirestoreStatus('error');
        setErrorMessage(error.message || 'An unknown error occurred.');
      }
    };

    testFirestore();
  }, []);

  const StatusIndicator = ({ status, serviceName }: { status: Status, serviceName: string }) => {
    if (status === 'pending') {
      return (
        <div className="flex items-center">
          <LoadingSpinner size={16} className="mr-2" />
          <span>Testing {serviceName}...</span>
        </div>
      );
    }
    if (status === 'success') {
      return (
        <div className="flex items-center text-green-600">
          <CheckCircle className="mr-2 h-5 w-5" />
          <span>{serviceName} Connected</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-destructive">
        <XCircle className="mr-2 h-5 w-5" />
        <span>{serviceName} Connection Failed</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Firebase Connection Test</CardTitle>
          <CardDescription>
            This page checks the live connection to your Firebase services. Your Project ID is set to: <strong>{process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "Not Set"}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center text-lg font-medium">
              <Wifi className="mr-3 h-6 w-6 text-primary" />
              Firebase Authentication
            </div>
            <div className="mt-2 pl-9">
              <StatusIndicator status={authStatus} serviceName="Authentication" />
              {authStatus === 'success' && (
                <p className="text-sm text-muted-foreground mt-1">
                  {user ? `Logged in as: ${user.email}` : 'Status: Not logged in.'}
                </p>
              )}
            </div>
          </Card>

          <Card className="p-4 bg-muted/50">
            <div className="flex items-center text-lg font-medium">
              <Database className="mr-3 h-6 w-6 text-primary" />
              Cloud Firestore
            </div>
            <div className="mt-2 pl-9">
              <StatusIndicator status={firestoreStatus} serviceName="Firestore" />
              {firestoreStatus === 'error' && (
                <div className="mt-2 text-xs text-destructive bg-destructive/10 p-2 rounded-md">
                    <p><strong>Error Details:</strong> {errorMessage}</p>
                    <p className="mt-1">This often means your Firestore Security Rules are blocking access. Make sure they allow reads for your test case (e.g., allow read if logged in).</p>
                </div>
              )}
               {firestoreStatus === 'success' && (
                <p className="text-sm text-muted-foreground mt-1">
                    Successfully communicated with the database.
                </p>
              )}
            </div>
          </Card>
          
          <div className="text-center pt-4">
             <Button asChild>
                <Link href="/">Back to Home</Link>
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
