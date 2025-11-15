"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { HistoryGrid } from "@/components/history-grid";
import { VideoPlayer } from "@/components/video-player";
import { useGenerationStore } from "@/lib/store";
import { GenerationHistoryItem } from "@/lib/validations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

export default function HistoryPage() {
  const { toast } = useToast();
  const { history, loadHistory, deleteHistoryItem, clearHistory } = useGenerationStore();
  const [selectedItem, setSelectedItem] = useState<GenerationHistoryItem | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDelete = async (id: string) => {
    await deleteHistoryItem(id);
    toast({
      title: "Deleted",
      description: "Generation removed from history.",
    });
  };

  const handleClearAll = async () => {
    await clearHistory();
    setShowDeleteDialog(false);
    toast({
      title: "History Cleared",
      description: "All generations have been removed.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Generation History</h1>
            </div>
            {history.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <HistoryGrid
          items={history}
          onDelete={handleDelete}
          onView={setSelectedItem}
        />
      </main>

      {/* View Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Video Details</DialogTitle>
          </DialogHeader>
          {selectedItem && selectedItem.videoUrl && (
            <VideoPlayer
              videoUrl={selectedItem.videoUrl}
              prompt={selectedItem.prompt}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear All History?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete all your generation history. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearAll}>
              Clear All
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
