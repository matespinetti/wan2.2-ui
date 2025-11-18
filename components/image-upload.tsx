"use client";

import { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface ImageUploadProps {
  value?: string; // base64
  onChange: (base64: string | null) => void;
  error?: { message?: string };
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FORMATS = ["image/jpeg", "image/png", "image/webp"];

export function ImageUpload({ value, onChange, error }: ImageUploadProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);

  const processFile = useCallback(
    (file: File) => {
      // Validate file type
      if (!ACCEPTED_FORMATS.includes(file.type)) {
        toast({
          title: "Invalid File Format",
          description: "Please upload a JPEG, PNG, or WebP image.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File Too Large",
          description: "Image must be less than 10MB.",
          variant: "destructive",
        });
        return;
      }

      // Read file and convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;

        // Get image dimensions
        const img = document.createElement("img");
        img.onload = () => {
          setDimensions({ width: img.width, height: img.height });
          setFileSize(file.size);
          onChange(base64);
        };
        img.src = base64;
      };
      reader.onerror = () => {
        toast({
          title: "Upload Failed",
          description: "Failed to read the image file.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    },
    [onChange, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleClear = useCallback(() => {
    onChange(null);
    setDimensions(null);
    setFileSize(null);
  }, [onChange]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getAspectRatio = (): string => {
    if (!dimensions) return "";
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(dimensions.width, dimensions.height);
    return `${dimensions.width / divisor}:${dimensions.height / divisor}`;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload">
        Image <span className="text-destructive">*</span>
      </Label>

      <div
        className={`relative overflow-hidden rounded-lg border-2 border-dashed transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : value
            ? "border-border"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        } ${error ? "border-destructive" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {value ? (
          // Image Preview
          <div className="relative">
            <div className="relative h-64 w-full">
              <Image
                src={value}
                alt="Uploaded image"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="absolute right-2 top-2 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const input = document.getElementById("image-upload") as HTMLInputElement;
                  input?.click();
                }}
              >
                Change
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          // Upload Zone
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-1">
              Drop image here or click to browse
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              JPEG, PNG, or WebP • Max 10MB • Resolution auto-detected
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.getElementById("image-upload") as HTMLInputElement;
                input?.click();
              }}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Select Image
            </Button>
          </div>
        )}

        <input
          id="image-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Image Info */}
      {dimensions && fileSize && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            {dimensions.width} × {dimensions.height}
          </span>
          <span>•</span>
          <span>{getAspectRatio()}</span>
          <span>•</span>
          <span>{formatFileSize(fileSize)}</span>
        </div>
      )}

      {/* Error Message */}
      {error?.message && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}

      {/* Help Text */}
      {!error && !value && (
        <p className="text-sm text-muted-foreground">
          Upload an image to animate. The model will generate a video based on your image and optional prompt.
        </p>
      )}
    </div>
  );
}
