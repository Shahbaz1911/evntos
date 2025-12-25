
"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ImageKitUploaderProps {
  onUploadSuccess: (url: string) => void;
  initialImageUrl?: string;
}

const ImageKitUploader: React.FC<ImageKitUploaderProps> = ({ onUploadSuccess, initialImageUrl }) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const form = new FormData();
    form.append("file", file);

    try {
      // Simulate progress for better UX
      setUploadProgress(50); 
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed with no specific error message.");
      }
      
      setUploadProgress(100);
      
      toast({
          title: 'Upload Successful',
          description: 'Your event image has been uploaded.',
          variant: 'success',
      });
      onUploadSuccess(data.url);
      setPreviewUrl(data.url);

    } catch (err: any) {
      console.error("ImageKit full error:", err);
      toast({
          title: 'Upload Failed',
          description: err.message || 'There was an error uploading your image. Please try again.',
          variant: 'destructive',
      });
    } finally {
        setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
        }, 500);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File Too Large',
          description: 'Please select an image smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }
      handleUpload(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onUploadSuccess(''); // Notify form that the image is removed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
        {previewUrl ? (
            <div className="relative group w-full h-64 rounded-md overflow-hidden border">
                <Image src={previewUrl} alt="Event preview" fill style={{objectFit:"cover"}} data-ai-hint="event poster" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={handleRemoveImage}
                        aria-label="Remove image"
                    >
                        <XCircle className="h-6 w-6" />
                    </Button>
                </div>
            </div>
        ) : (
            <div 
                className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => { e.preventDefault(); handleFileChange({ target: { files: e.dataTransfer.files } } as any); }}
                onDragOver={(e) => e.preventDefault()}
            >
                <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="font-semibold text-foreground">Click to upload or drag & drop</p>
                <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
            </div>
        )}

        <Input
            id="image-upload"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/gif, image/webp"
            disabled={isUploading}
        />

        {isUploading && (
            <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">{`Uploading... ${Math.round(uploadProgress)}%`}</p>
            </div>
        )}
    </div>
  );
};

export default ImageKitUploader;
