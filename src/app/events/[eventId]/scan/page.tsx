
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
import { ArrowLeft, UserCheck, UserX, ScanLine, CameraOff, Phone, Mail, Camera, QrCode } from 'lucide-react';
import type { Event, Registration } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const SCANNER_REGION_ID = "qr-scanner-region";

type ScanStatus = "idle" | "scanning" | "verifying" | "success" | "error" | "not_found";

export default function ScanTicketPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { getEventById, getRegistrationByIdFromFirestore, contextLoading: eventContextLoading } = useEvents();
  const { user: authUser, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [scannedData, setScannedData] = useState<Registration | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | undefined>(undefined);

  // Initial data loading
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
    }
  }, [eventId, getEventById, authUser, authLoading, eventContextLoading, router, toast]);

  const processScanResult = useCallback(async (decodedText: string) => {
    setScanStatus("verifying");
    setScanMessage("Verifying ticket...");
    setScannedData(null);

    try {
        const registration = await getRegistrationByIdFromFirestore(decodedText);
        if (registration) {
            if (registration.eventId === eventId) {
                setScannedData(registration);
                setScanStatus("success");
                setScanMessage(`Ticket Verified for ${registration.name}!`);
                toast({ title: "Ticket Verified", description: `${registration.name} is a valid guest.`, variant: "success" });
            } else {
                setScanStatus("error");
                setScanMessage("This ticket is for a different event.");
                toast({ title: "Verification Error", description: "This ticket is not valid for the current event.", variant: "destructive" });
            }
        } else {
            setScanStatus("not_found");
            setScanMessage("Invalid Ticket: This QR code does not match any registration.");
            toast({ title: "Verification Error", description: "Invalid QR code.", variant: "destructive" });
        }
    } catch(error) {
        console.error("Error verifying ticket:", error);
        setScanStatus("error");
        setScanMessage("A system error occurred during verification. Please try again.");
        toast({ title: "System Error", description: "Could not verify ticket due to a system error.", variant: "destructive" });
    }
  }, [eventId, getRegistrationByIdFromFirestore, toast]);

  // Scanner Lifecycle Effect
  useEffect(() => {
    if (scanStatus !== 'scanning' || !selectedCameraId) {
        if (html5QrCodeRef.current?.isScanning) {
            html5QrCodeRef.current.stop().catch(err => console.warn("Scanner stop failed", err));
        }
        return;
    }

    const scannerRegionElement = document.getElementById(SCANNER_REGION_ID);
    if (!scannerRegionElement) return;

    // Ensure we don't create multiple instances
    if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(SCANNER_REGION_ID, { verbose: false });
    }
    const html5QrCode = html5QrCodeRef.current;

    const onScanSuccess = (decodedText: string, result: Html5QrcodeResult) => {
        if (html5QrCode.isScanning) {
            html5QrCode.stop().catch(err => console.warn("Scanner stop on success failed", err));
        }
        processScanResult(decodedText);
    };
    const onScanFailure = (error: any) => { /* ignore */ };

    html5QrCode.start(
        selectedCameraId,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        onScanFailure
    ).catch(err => {
        console.error("Failed to start scanner:", err);
        toast({ title: "Scanner Error", description: "Could not start scanner. Please select a different camera or refresh.", variant: "destructive" });
        setScanStatus("idle");
    });
    
    return () => {
        if (html5QrCodeRef.current?.isScanning) {
            html5QrCodeRef.current.stop().catch(err => console.warn("Scanner cleanup stop failed", err));
        }
    };
  }, [scanStatus, selectedCameraId, processScanResult, toast]);


  const handleStartScanning = async () => {
    // Reset previous scan state
    setScanStatus("idle");
    setScannedData(null);
    setScanMessage(null);

    try {
        if (!hasCameraPermission) {
            const availableCameras = await Html5Qrcode.getCameras();
            if (availableCameras && availableCameras.length > 0) {
                setCameras(availableCameras);
                setHasCameraPermission(true);
                const backCamera = availableCameras.find(c => c.label.toLowerCase().includes('back')) || availableCameras.find(c => c.label.toLowerCase().includes('environment'));
                setSelectedCameraId(backCamera ? backCamera.id : availableCameras[0].id);
            } else {
                setHasCameraPermission(false);
                toast({ variant: 'destructive', title: 'No Camera Found', description: 'Could not find a camera on this device.' });
                return;
            }
        }
        setScanStatus("scanning");
    } catch (err) {
        console.error('Error accessing camera:', err);
        setHasCameraPermission(false);
        toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use the scanner.',
        });
    }
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

  const renderScannerContent = () => {
    switch(scanStatus) {
      case 'scanning':
        return <div id={SCANNER_REGION_ID} className="w-full h-full" />;
      case 'verifying':
        return (
          <div className="flex flex-col items-center justify-center h-full text-foreground">
            <LoadingSpinner size={64} />
            <p className="mt-4 font-semibold text-lg">{scanMessage}</p>
          </div>
        );
      case 'success':
        return (
            <div className="text-center p-4 text-green-600">
              <UserCheck size={64} className="mx-auto mb-4"/>
              <p className="text-lg font-semibold">Ticket Verified!</p>
            </div>
          );
      case 'error':
      case 'not_found':
        return (
            <div className="text-center p-4 text-destructive">
              <UserX size={64} className="mx-auto mb-4"/>
              <p className="text-lg font-semibold">{scanStatus === "error" ? "Scan Error" : "Ticket Not Found"}</p>
            </div>
          );
       case 'idle':
        if (hasCameraPermission === false) {
             return (
                 <div className="text-center p-4 text-destructive">
                    <CameraOff size={48} className="mx-auto mb-2"/>
                    <p>Camera access denied. Please enable permissions in your browser settings and try again.</p>
                </div>
              );
        }
        return <p className="text-muted-foreground p-4 text-center">Click "Start Scanning" to activate the camera.</p>;
      default:
        return null;
    }
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
             <QrCode className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="font-headline text-3xl">Scan Tickets</CardTitle>
            <CardDescription>For event: {event.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="w-full border-dashed border-2 border-muted-foreground/50 rounded-lg aspect-square bg-muted/20 flex items-center justify-center overflow-hidden">
              {renderScannerContent()}
            </div>

            {scanStatus === 'scanning' && cameras.length > 1 && (
              <div className="space-y-2">
                <Label htmlFor="camera-select" className="flex items-center text-muted-foreground font-medium">
                  <Camera className="mr-2 h-4 w-4" />
                  Select Camera
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
            
            {scanStatus !== 'scanning' && (
              <Button onClick={handleStartScanning} className="w-full bg-primary hover:bg-primary/90 text-lg py-6">
                <ScanLine className="mr-2 h-5 w-5" /> 
                {scanStatus === "idle" ? "Start Scanning" : "Scan Another Ticket"}
              </Button>
            )}
            
            {scanStatus !== 'scanning' && scanStatus !== 'verifying' && scanStatus !== 'idle' && scanMessage && (
                <Alert 
                    variant={scanStatus === "success" ? "default" : "destructive"} 
                    className={`mt-4 ${scanStatus === "success" ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700" : ""}`}
                >
                     {scanStatus === "success" && <UserCheck className="h-5 w-5 text-current" />}
                     {(scanStatus === "error" || scanStatus === "not_found") && <UserX className="h-5 w-5 text-current" />}
                    <AlertTitle className="font-semibold text-lg">
                        {scanStatus === "success" ? "Ticket Verified" : 
                         scanStatus === "error" ? "Scan Error" : "Ticket Not Found"}
                    </AlertTitle>
                    <AlertDescription className="text-base">{scanMessage}</AlertDescription>
                </Alert>
            )}

            {scannedData && scanStatus === "success" && (
              <Card className="mt-4 bg-green-50 border-green-300 dark:bg-green-900/30 dark:border-green-700">
                <CardHeader>
                  <CardTitle className="font-headline text-xl text-green-700 dark:text-green-300">
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
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
