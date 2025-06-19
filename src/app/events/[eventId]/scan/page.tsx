
"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Html5QrcodeScanner, Html5QrcodeError, Html5QrcodeResult } from 'html5-qrcode';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import LoadingSpinner from '@/components/loading-spinner';
import { ArrowLeft, UserCheck, UserX, ScanLine, CameraOff } from 'lucide-react';
import type { Event, Registration } from '@/types';

const SCANNER_REGION_ID = "qr-scanner-region";

export default function ScanTicketPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { getEventById, getRegistrationByIdFromFirestore, contextLoading: eventContextLoading } = useEvents();
  const { user: authUser, loading: authLoading } = useAuth();
  const { toast } = useToast(); // Assuming useToast is globally available or import it

  const [event, setEvent] = useState<Event | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<Registration | null>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error" | "not_found">("idle");
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const html5QrCodeScannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!eventContextLoading && !authLoading) {
      const foundEvent = getEventById(eventId);
      if (foundEvent) {
        if (foundEvent.userId !== authUser?.uid) {
          toast({ title: "Unauthorized", description: "You are not allowed to scan tickets for this event.", variant: "destructive" });
          router.push(`/events/${eventId}/edit`);
          return;
        }
        setEvent(foundEvent);
      } else {
        toast({ title: "Event Not Found", description: "The event you are trying to scan for does not exist.", variant: "destructive" });
        router.push('/');
        return;
      }
      setPageLoading(false);
    }
  }, [eventId, getEventById, authUser, authLoading, eventContextLoading, router, toast]);

  const onScanSuccess = async (decodedText: string, result: Html5QrcodeResult) => {
    if (!isScanning) return;
    setIsScanning(false); // Stop further scans until this one is processed
    if (html5QrCodeScannerRef.current) {
        try {
            await html5QrCodeScannerRef.current.clear();
        } catch (clearError) {
            console.warn("Failed to clear scanner, it might have already been cleared:", clearError);
        }
    }
    
    setScanStatus("idle");
    setScannedData(null);
    setScanMessage("Verifying ticket...");

    const registration = await getRegistrationByIdFromFirestore(decodedText);
    if (registration) {
      if (registration.eventId === eventId) {
        setScannedData(registration);
        setScanStatus("success");
        // TODO: Implement actual check-in logic here in a future step (mark as checkedIn in Firestore)
        setScanMessage(`Guest ${registration.name} Verified!`);
        toast({ title: "Guest Verified", description: `${registration.name} (${registration.email})`});
      } else {
        setScanStatus("error");
        setScanMessage("Ticket is for a different event.");
        toast({ title: "Verification Error", description: "This ticket is not valid for the current event.", variant: "destructive" });
      }
    } else {
      setScanStatus("not_found");
      setScanMessage("Invalid Ticket: Guest not found.");
      toast({ title: "Verification Error", description: "This QR code does not correspond to a valid registration.", variant: "destructive" });
    }
  };

  const onScanFailure = (error: Html5QrcodeError | string) => {
    // console.warn(`QR error = ${error}`);
    // No need to show toast for every minor scan failure, could be annoying.
    // Continuous scanning will retry.
  };
  
  const startScanner = async () => {
    setScanStatus("idle");
    setScannedData(null);
    setScanMessage(null);

    try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
    } catch (err) {
        setHasCameraPermission(false);
        setScanMessage("Camera permission denied. Please enable camera access in your browser settings.");
        toast({ title: "Camera Error", description: "Camera permission is required to scan tickets.", variant: "destructive" });
        return;
    }

    if (!html5QrCodeScannerRef.current) {
        html5QrCodeScannerRef.current = new Html5QrcodeScanner(
            SCANNER_REGION_ID,
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                rememberLastUsedCamera: true,
                supportedScanTypes: [0], // SCAN_TYPE_CAMERA
            },
            false // verbose
        );
    }
    html5QrCodeScannerRef.current.render(onScanSuccess, onScanFailure);
    setIsScanning(true);
  };

  const stopScanner = async () => {
    setIsScanning(false);
    if (html5QrCodeScannerRef.current && html5QrCodeScannerRef.current.getState() === 2) { // 2 is SCANNING state
        try {
            await html5QrCodeScannerRef.current.clear();
        } catch (e) {
            console.warn("Error stopping scanner: ", e);
        }
    }
  };

  useEffect(() => {
    // Cleanup scanner on component unmount
    return () => {
      if (html5QrCodeScannerRef.current) {
        html5QrCodeScannerRef.current.clear().catch(err => console.warn("Cleanup error", err));
      }
    };
  }, []);


  if (pageLoading || authLoading || eventContextLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!event) {
    return (
      <AuthGuard>
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">Event details could not be loaded.</p>
          <Button asChild className="mt-4">
            <Link href="/">Back to Dashboard</Link>
          </Button>
        </div>
      </AuthGuard>
    );
  }


  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto py-8">
        <Button variant="outline" size="sm" asChild className="mb-6">
          <Link href={`/events/${eventId}/edit`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event Edit
          </Link>
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl text-primary">Scan Tickets</CardTitle>
            <CardDescription>For event: {event.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div id={SCANNER_REGION_ID} className="w-full border-dashed border-2 border-muted-foreground/50 rounded-lg aspect-square bg-muted/20 flex items-center justify-center">
              {!isScanning && hasCameraPermission !== false && (
                <p className="text-muted-foreground p-4 text-center">Click "Start Scanning" to activate the camera.</p>
              )}
              {hasCameraPermission === false && (
                 <div className="text-center p-4 text-destructive">
                    <CameraOff size={48} className="mx-auto mb-2"/>
                    <p>Camera access denied. Please enable camera permissions in your browser settings to use the scanner.</p>
                </div>
              )}
            </div>

            {isScanning ? (
              <Button onClick={stopScanner} variant="outline" className="w-full">
                Stop Scanning
              </Button>
            ) : (
              <Button onClick={startScanner} className="w-full bg-primary hover:bg-primary/90">
                <ScanLine className="mr-2 h-5 w-5" /> Start Scanning
              </Button>
            )}

            {scanMessage && (
                <Alert variant={scanStatus === "success" ? "default" : (scanStatus === "idle" ? "default" : "destructive")} className="mt-4">
                     {scanStatus === "success" && <UserCheck className="h-4 w-4" />}
                     {scanStatus === "error" && <UserX className="h-4 w-4" />}
                     {scanStatus === "not_found" && <UserX className="h-4 w-4" />}
                    <AlertTitle>
                        {scanStatus === "success" ? "Scan Successful" : 
                         scanStatus === "error" ? "Scan Error" : 
                         scanStatus === "not_found" ? "Ticket Not Found" : "Scan Status"}
                    </AlertTitle>
                    <AlertDescription>{scanMessage}</AlertDescription>
                </Alert>
            )}

            {scanStatus === "success" && scannedData && (
              <Card className="mt-4 bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-700 font-headline">Guest Verified</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p><strong>Name:</strong> {scannedData.name}</p>
                  <p><strong>Email:</strong> {scannedData.email}</p>
                  <p><strong>Registered:</strong> {new Date(scannedData.registeredAt).toLocaleString()}</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}

// Helper to ensure useToast is available.
// In a real app, ensure Toaster is in your RootLayout and useToast is correctly set up.
function useToast() {
    // This is a placeholder. Ensure you have a global toast context.
    // For now, it will just console.log. Replace with your actual useToast hook.
    return {
        toast: (options: { title: string, description?: string, variant?: string }) => {
            console.log("Toast:", options.title, options.description, options.variant);
        }
    };
}
