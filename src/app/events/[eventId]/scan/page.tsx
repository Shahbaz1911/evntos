
"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Html5Qrcode, type Html5QrcodeError, type Html5QrcodeResult } from 'html5-qrcode';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import LoadingSpinner from '@/components/loading-spinner';
import { ArrowLeft, UserCheck, UserX, ScanLine, CameraOff, Phone, Mail, Camera } from 'lucide-react';
import type { Event, Registration } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const SCANNER_REGION_ID = "qr-scanner-region";

export default function ScanTicketPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { getEventById, getRegistrationByIdFromFirestore, checkInGuest, contextLoading: eventContextLoading } = useEvents();
  const { user: authUser, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  
  const [scannedData, setScannedData] = useState<Registration | null>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error" | "not_found" | "already_verified">("idle");
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [showScannerUI, setShowScannerUI] = useState(false); 

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | undefined>(undefined);

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
    if (html5QrCodeRef.current?.isScanning) {
      await html5QrCodeRef.current.stop().catch(err => console.warn("Error stopping scanner on success:", err));
    }
    html5QrCodeRef.current = null;
    setShowScannerUI(false);
    setCameras([]);
    setSelectedCameraId(undefined);

    setScanStatus("idle");
    setScannedData(null);
    setScanMessage("Verifying ticket...");

    try {
        const registration = await getRegistrationByIdFromFirestore(decodedText);
        if (registration) {
            if (registration.eventId === eventId) {
                setScannedData(registration);
                if (registration.checkedIn) {
                    setScanStatus("already_verified");
                    setScanMessage(`Guest ${registration.name} was already verified/checked in at ${new Date(registration.checkedInAt!).toLocaleString()}.`);
                    toast({ title: "Already Verified", description: `${registration.name} was previously verified.`});
                } else {
                    const checkInSuccess = await checkInGuest(registration.id);
                    if (checkInSuccess) {
                        const updatedRegistration = await getRegistrationByIdFromFirestore(decodedText);
                        setScannedData(updatedRegistration);
                        setScanStatus("success");
                        setScanMessage(`Ticket Verified for ${registration.name}! This guest can proceed.`);
                        toast({ title: "Ticket Verified", description: `${registration.name} (${registration.email}) is a valid guest.`, variant: "success" });
                    } else {
                        // The checkInGuest function already shows a toast on failure
                        setScanStatus("error");
                        setScanMessage("Failed to mark ticket as checked-in. The guest cannot proceed. Please try again.");
                    }
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
  }, [eventId, getRegistrationByIdFromFirestore, checkInGuest, toast]);

  useEffect(() => {
    if (selectedCameraId && showScannerUI) {
      const scannerRegionElement = document.getElementById(SCANNER_REGION_ID);
      if (!scannerRegionElement) {
        console.error("Scanner region not found");
        return;
      }
      
      const qrCode = new Html5Qrcode(SCANNER_REGION_ID, { verbose: false });
      html5QrCodeRef.current = qrCode;

      const onScanSuccess = (decodedText: string, result: Html5QrcodeResult) => {
        processScanResult(decodedText);
      };

      const onScanFailure = (error: any) => { /* ignore */ };
      
      qrCode.start(
        selectedCameraId,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        onScanFailure
      ).catch(err => {
        console.error("Failed to start scanner:", err);
        toast({ title: "Scanner Error", description: "Could not start scanner. Please select a different camera or refresh.", variant: "destructive" });
        setShowScannerUI(false);
      });
    }

    return () => {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().catch(err => console.warn("Failed to stop scanner cleanly during cleanup:", err));
        html5QrCodeRef.current = null;
      }
    };
  }, [selectedCameraId, showScannerUI, processScanResult, toast]);

  const handleStartScanning = async () => {
    setScanStatus("idle");
    setScannedData(null);
    setScanMessage(null);
    setShowScannerUI(true);

    try {
      const availableCameras = await Html5Qrcode.getCameras();
      setHasCameraPermission(true);

      if (availableCameras && availableCameras.length > 0) {
        setCameras(availableCameras);
        const backCamera = availableCameras.find(c => c.label.toLowerCase().includes('back')) || availableCameras.find(c => c.label.toLowerCase().includes('environment'));
        setSelectedCameraId(backCamera ? backCamera.id : availableCameras[0].id);
      } else {
        setHasCameraPermission(false);
        setShowScannerUI(false);
        toast({ variant: 'destructive', title: 'No Camera Found', description: 'Could not find a camera on this device.' });
      }
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
    if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().catch(err => console.warn("Error stopping scanner manually:", err));
    }
    setShowScannerUI(false);
    setCameras([]);
    setSelectedCameraId(undefined);
  };

  if (pageLoading || authLoading || eventContextLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-var(--header-height,0px)-var(--footer-height,0px))]">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!event) {
    return (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">Event details could not be loaded or access denied.</p>
          <Button asChild className="mt-4">
            <Link href="/">Back to Dashboard</Link>
          </Button>
        </div>
    );
  }

  return (
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
                    <p>Camera access denied. Enable permissions and click "Start Scanning".</p>
                </div>
              ) : !showScannerUI && (scanStatus === "success" || scanStatus === "already_verified") ? (
                <div className="text-center p-4 text-green-600">
                  <UserCheck size={64} className="mx-auto mb-4"/>
                  <p className="text-lg font-semibold">{scanStatus === "success" ? "Ticket Verified!" : "Already Verified!"}</p>
                </div>
              ) : !showScannerUI && (scanStatus === "error" || scanStatus === "not_found") ? (
                <div className="text-center p-4 text-destructive">
                  <UserX size={64} className="mx-auto mb-4"/>
                  <p className="text-lg font-semibold">{scanStatus === "error" ? "Scan Error" : "Ticket Not Found"}</p>
                </div>
              ) : (
                <p className="text-muted-foreground p-4 text-center">Click "Start Scanning" to activate the camera.</p>
              )}
            </div>

            {showScannerUI && cameras.length > 1 && (
              <div className="space-y-2">
                <Label htmlFor="camera-select" className="flex items-center text-muted-foreground font-medium">
                  <Camera className="mr-2 h-4 w-4" />
                  Camera Source
                </Label>
                <Select value={selectedCameraId} onValueChange={setSelectedCameraId}>
                  <SelectTrigger id="camera-select" className="w-full bg-background text-foreground">
                    <SelectValue placeholder="Select a camera..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cameras.map((camera) => (
                      <SelectItem key={camera.id} value={camera.id}>
                        {camera.label || `Camera ${camera.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showScannerUI ? (
              <Button onClick={handleStopScanning} variant="outline" className="w-full">
                Stop Scanning
              </Button>
            ) : (
              <Button onClick={handleStartScanning} className="w-full bg-primary hover:bg-primary/90">
                <ScanLine className="mr-2 h-5 w-5" /> 
                {scanStatus === "idle" && hasCameraPermission !== false ? "Start Scanning" : "Scan Another Ticket"}
              </Button>
            )}
            
            {!showScannerUI && scanMessage && (
                <Alert 
                    variant={scanStatus === "success" || scanStatus === "already_verified" ? "default" : (scanStatus === "idle" ? "default" : "destructive")} 
                    className={`mt-4 ${scanStatus === "success" || scanStatus === "already_verified" ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700" : (scanStatus === "error" || scanStatus === "not_found" ? "border-destructive bg-red-50 text-destructive dark:bg-red-900/30 dark:text-red-300 dark:border-red-700" : "")}`}
                >
                     {(scanStatus === "success" || scanStatus === "already_verified") && <UserCheck className="h-5 w-5 text-current" />}
                     {(scanStatus === "error" || scanStatus === "not_found") && <UserX className="h-5 w-5 text-current" />}
                    <AlertTitle className="font-semibold text-lg">
                        {scanStatus === "success" ? "Ticket Verified" : 
                         scanStatus === "already_verified" ? "Already Verified" :
                         scanStatus === "error" ? "Scan Error" : 
                         scanStatus === "not_found" ? "Ticket Not Found" : "Scan Status"}
                    </AlertTitle>
                    <AlertDescription className="text-base">{scanMessage}</AlertDescription>
                </Alert>
            )}

            {!showScannerUI && (scanStatus === "success" || scanStatus === "already_verified") && scannedData && (
              <Card className={`mt-4 ${scanStatus === "already_verified" ? "bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700" : "bg-green-50 border-green-300 dark:bg-green-900/30 dark:border-green-700"}`}>
                <CardHeader>
                  <CardTitle className={`font-headline text-xl ${scanStatus === "already_verified" ? "text-blue-700 dark:text-blue-300" : "text-green-700 dark:text-green-300"}`}>
                    Guest Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-foreground/90 dark:text-foreground/80">
                  <p className="flex items-center"><UserCheck className="mr-2 h-4 w-4 text-current" /><strong>Name:</strong> {scannedData.name}</p>
                  <p className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Email:</strong> {scannedData.email}</p>
                  {scannedData.contactNumber && (
                     <p className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Contact:</strong> {scannedData.contactNumber}</p>
                  )}
                   <p className="text-xs text-muted-foreground pt-1"><strong>Registered:</strong> {new Date(scannedData.registeredAt).toLocaleString()}</p>
                  {scannedData.checkedIn && scannedData.checkedInAt && (
                     <p className={`text-xs ${scanStatus === "already_verified" ? "text-blue-700 dark:text-blue-400" : "text-green-700 dark:text-green-400"} font-semibold pt-1`}><strong>Previously Verified/Checked In at:</strong> {new Date(scannedData.checkedInAt).toLocaleString()}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
  );
}


