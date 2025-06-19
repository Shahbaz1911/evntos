
"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Html5QrcodeScanner, type Html5QrcodeError, type Html5QrcodeResult, Html5QrcodeScanType } from 'html5-qrcode';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import LoadingSpinner from '@/components/loading-spinner';
import { ArrowLeft, UserCheck, UserX, ScanLine, CameraOff, Phone, Mail } from 'lucide-react';
import type { Event, Registration } from '@/types';
import { useToast } from '@/hooks/use-toast';

const SCANNER_REGION_ID = "qr-scanner-region";

export default function ScanTicketPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  // checkInGuest removed from useEvents destructuring
  const { getEventById, getRegistrationByIdFromFirestore, contextLoading: eventContextLoading } = useEvents();
  const { user: authUser, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  
  const [scannedData, setScannedData] = useState<Registration | null>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error" | "not_found" | "already_verified">("idle");
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [showScannerUI, setShowScannerUI] = useState(false); 

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
        if (!eventContextLoading) {
             toast({ title: "Event Not Found", description: "The event you are trying to scan for does not exist.", variant: "destructive" });
             router.push('/');
             return;
        }
      }
      setPageLoading(false);
    } else if (authLoading || eventContextLoading) {
        setPageLoading(true);
    }
  }, [eventId, getEventById, authUser, authLoading, eventContextLoading, router, toast]);


  const processScanResult = useCallback(async (decodedText: string) => {
    setScanStatus("idle");
    setScannedData(null);
    setScanMessage("Verifying ticket...");

    try {
        const registration = await getRegistrationByIdFromFirestore(decodedText);
        if (registration) {
            if (registration.eventId === eventId) {
                setScannedData(registration);
                if (registration.checkedIn) { // Check if already marked as checkedIn
                    setScanStatus("already_verified");
                    setScanMessage(`Guest ${registration.name} was already verified/checked in at ${new Date(registration.checkedInAt!).toLocaleString()}.`);
                    toast({ title: "Already Verified", description: `${registration.name} was previously verified.`});
                } else {
                    setScanStatus("success");
                    setScanMessage(`Ticket Verified for ${registration.name}! This guest can proceed.`);
                    toast({ title: "Ticket Verified", description: `${registration.name} (${registration.email}) is a valid guest.`});
                }
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
    } catch(error) {
        console.error("Error verifying ticket:", error);
        setScanStatus("error");
        setScanMessage("An error occurred during verification. Please try again.");
        toast({ title: "Verification System Error", description: "Could not verify ticket due to a system error.", variant: "destructive" });
    }
  }, [eventId, getRegistrationByIdFromFirestore, toast]);


  useEffect(() => {
    if (showScannerUI && hasCameraPermission) {
      const scannerRegionElement = document.getElementById(SCANNER_REGION_ID);
      if (!scannerRegionElement) {
          console.error(`Scanner region element with ID '${SCANNER_REGION_ID}' not found in the DOM.`);
          setTimeout(() => {
            if (!document.getElementById(SCANNER_REGION_ID)) {
                toast({ title: "Scanner Error", description: "Could not initialize scanner view. Please refresh.", variant: "destructive" });
                setShowScannerUI(false); 
            } else {
                const scanner = new Html5QrcodeScanner(
                    SCANNER_REGION_ID,
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        rememberLastUsedCamera: true,
                        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                    },
                    false 
                );
                html5QrCodeScannerRef.current = scanner;
                scanner.render(
                    (decodedText, result) => {
                        setShowScannerUI(false); 
                        processScanResult(decodedText);
                    }, 
                    (errorMessage) => { /* console.warn(`QR error = ${errorMessage}`); */ }
                );
            }
          }, 100); 
          return; 
      }

      const scanner = new Html5QrcodeScanner(
        SCANNER_REGION_ID,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        },
        false 
      );
      html5QrCodeScannerRef.current = scanner;

      scanner.render(
        (decodedText, result) => { 
          setShowScannerUI(false); 
          processScanResult(decodedText);
        }, 
        (errorMessage) => { /* console.warn(`QR error = ${errorMessage}`); */ }
      );
    }

    return () => {
      if (html5QrCodeScannerRef.current) {
        html5QrCodeScannerRef.current.clear()
          .catch(err => { console.warn("Error clearing scanner during cleanup:", err); })
          .finally(() => { html5QrCodeScannerRef.current = null; });
      }
    };
  }, [showScannerUI, hasCameraPermission, processScanResult, toast]);


  const handleStartScanning = async () => {
    setScanStatus("idle");
    setScannedData(null);
    setScanMessage(null);

    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      setShowScannerUI(true); 
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasCameraPermission(false);
      setShowScannerUI(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to use the scanner.',
      });
    }
  };

  const handleStopScanning = () => {
    setShowScannerUI(false); 
  };


  if (pageLoading || authLoading || eventContextLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!event) {
    return (
      <AuthGuard>
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">Event details could not be loaded or access denied.</p>
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
            <div className="w-full border-dashed border-2 border-muted-foreground/50 rounded-lg aspect-square bg-muted/20 flex items-center justify-center overflow-hidden">
              {showScannerUI && hasCameraPermission ? (
                <div id={SCANNER_REGION_ID} className="w-full h-full" />
              ) : hasCameraPermission === false ? (
                 <div className="text-center p-4 text-destructive">
                    <CameraOff size={48} className="mx-auto mb-2"/>
                    <p>Camera access denied. Please enable camera permissions in your browser settings to use the scanner.</p>
                </div>
              ) : (
                <p className="text-muted-foreground p-4 text-center">Click "Start Scanning" to activate the camera.</p>
              )}
            </div>

            {showScannerUI ? (
              <Button onClick={handleStopScanning} variant="outline" className="w-full">
                Stop Scanning
              </Button>
            ) : (
              <Button onClick={handleStartScanning} className="w-full bg-primary hover:bg-primary/90" disabled={hasCameraPermission === false}>
                <ScanLine className="mr-2 h-5 w-5" /> Start Scanning
              </Button>
            )}

            {scanMessage && (
                <Alert 
                    variant={scanStatus === "success" || scanStatus === "already_verified" ? "default" : (scanStatus === "idle" ? "default" : "destructive")} 
                    className={`mt-4 ${scanStatus === "success" || scanStatus === "already_verified" ? "border-green-500 bg-green-50" : ""}`}
                >
                     {(scanStatus === "success" || scanStatus === "already_verified") && <UserCheck className="h-4 w-4 text-green-600" />}
                     {(scanStatus === "error" || scanStatus === "not_found") && <UserX className="h-4 w-4" />}
                    <AlertTitle className={scanStatus === "success" || scanStatus === "already_verified" ? "text-green-700" : ""}>
                        {scanStatus === "success" ? "Ticket Verified" : 
                         scanStatus === "already_verified" ? "Already Verified" :
                         scanStatus === "error" ? "Scan Error" : 
                         scanStatus === "not_found" ? "Ticket Not Found" : "Scan Status"}
                    </AlertTitle>
                    <AlertDescription>{scanMessage}</AlertDescription>
                </Alert>
            )}

            {(scanStatus === "success" || scanStatus === "already_verified") && scannedData && (
              <Card className={`mt-4 ${scanStatus === "already_verified" ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200"}`}>
                <CardHeader>
                  <CardTitle className={scanStatus === "already_verified" ? "text-blue-700 font-headline" : "text-green-700 font-headline"}>
                    {scanStatus === "already_verified" ? "Guest Previously Verified" : "Guest Details Verified"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="flex items-center"><UserCheck className="mr-2 h-4 w-4 text-green-600" /><strong>Name:</strong> {scannedData.name}</p>
                  <p className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Email:</strong> {scannedData.email}</p>
                  {scannedData.contactNumber && (
                     <p className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Contact:</strong> {scannedData.contactNumber}</p>
                  )}
                   <p className="text-xs text-muted-foreground pt-1"><strong>Registered:</strong> {new Date(scannedData.registeredAt).toLocaleString()}</p>
                  {scannedData.checkedIn && scannedData.checkedInAt && (
                     <p className="text-xs text-blue-700 font-semibold pt-1"><strong>Previously Verified/Checked In at:</strong> {new Date(scannedData.checkedInAt).toLocaleString()}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
