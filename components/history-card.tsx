"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GenerationHistoryItem } from "@/lib/validations";
import { Download, Trash2, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface HistoryCardProps {
  item: GenerationHistoryItem;
  onDelete?: (id: string) => void;
  onView?: (item: GenerationHistoryItem) => void;
}

export function HistoryCard({ item, onDelete, onView }: HistoryCardProps) {
  const statusColors = {
    queued: "bg-blue-100 text-blue-800",
    processing: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
  };

  const handleDownload = () => {
    if (!item.videoUrl) return;
    const link = document.createElement("a");
    link.href = item.videoUrl;
    link.download = `video-${item.id}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="aspect-video w-full bg-muted flex items-center justify-center">
          {item.status === "completed" && item.videoUrl ? (
            <video
              src={item.videoUrl}
              className="h-full w-full object-cover"
              muted
              loop
            />
          ) : (
            <Play className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span
            className={`text-xs px-2 py-1 rounded-full ${statusColors[item.status]}`}
          >
            {item.status}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm line-clamp-2">{item.prompt}</p>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>{item.params.resolution}</span>
          <span>•</span>
          <span>{item.params.num_frames}f</span>
          <span>•</span>
          <span>{item.params.fps}fps</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        {item.status === "completed" && item.videoUrl && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView?.(item)}
              className="flex-1"
            >
              <Play className="mr-2 h-4 w-4" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete?.(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
