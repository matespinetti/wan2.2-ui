"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useGenerationStore } from "@/lib/store";
import { Loader2, X } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface GenerationStatusProps {
  onCancel?: () => void;
}

export function GenerationStatus({ onCancel }: GenerationStatusProps) {
  const { currentGeneration, isGenerating } = useGenerationStore();

  if (!currentGeneration || !isGenerating) {
    return null;
  }

  const { status, progress = 0, estimatedTime } = currentGeneration;

  const statusText = {
    queued: "Queued",
    processing: "Generating",
    completed: "Completed",
    failed: "Failed",
    cancelled: "Cancelled",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {status === "processing" && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {statusText[status]}
          </CardTitle>
          {(status === "queued" || status === "processing") && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{progress}%</span>
          {estimatedTime && status === "queued" && (
            <span>Est. {formatDuration(estimatedTime)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
