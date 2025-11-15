"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  prompt: string;
  onRegenerate?: () => void;
}

export function VideoPlayer({ videoUrl, prompt, onRegenerate }: VideoPlayerProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Generated Video</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <video
            src={videoUrl}
            controls
            className="h-full w-full object-contain"
            autoPlay
            loop
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Prompt:</p>
          <p className="text-sm text-muted-foreground">{prompt}</p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={handleDownload} className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        {onRegenerate && (
          <Button variant="outline" onClick={onRegenerate} className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
