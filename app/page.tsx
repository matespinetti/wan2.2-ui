"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PromptInput } from "@/components/prompt-input";
import { ParameterPanel } from "@/components/parameter-panel";
import { PresetSelector } from "@/components/preset-selector";
import { GenerationStatus } from "@/components/generation-status";
import { VideoPlayer } from "@/components/video-player";
import { generationParamsSchema, GenerationParams } from "@/lib/validations";
import { useGenerationStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { History } from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const {
    currentGeneration,
    isGenerating,
    startGeneration,
    updateGeneration,
    completeGeneration,
    failGeneration,
    cancelGeneration,
  } = useGenerationStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<GenerationParams>({
    resolver: zodResolver(generationParamsSchema),
    defaultValues: {
      prompt: "",
      resolution: "720p",
      num_inference_steps: 30,
      guidance_scale: 7.5,
      guidance_scale_2: 7.5,
      num_frames: 49,
      fps: 16,
    },
  });

  // Restore active generation on mount (after page refresh)
  useEffect(() => {
    const restoreActiveGeneration = async () => {
      // Skip if already have active generation in persisted state
      if (currentGeneration && (currentGeneration.status === "queued" || currentGeneration.status === "processing")) {
        return;
      }

      // Check database for any active generations
      try {
        const response = await fetch("/api/history");
        if (response.ok) {
          const { history } = await response.json();
          const activeGeneration = history.find(
            (item: any) => item.status === "queued" || item.status === "processing"
          );

          if (activeGeneration && !currentGeneration) {
            // Restore the active generation to state to resume polling
            useGenerationStore.setState({
              currentGeneration: activeGeneration,
              isGenerating: true,
            });
          }
        }
      } catch (error) {
        console.error("Error restoring active generation:", error);
      }
    };

    restoreActiveGeneration();
  }, []); // Run once on mount

  // Poll for status updates
  useEffect(() => {
    if (!currentGeneration || !isGenerating) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/status/${currentGeneration.id}`);
        const data = await response.json();

        if (data.status === "completed" && data.videoUrl) {
          completeGeneration(data.videoUrl);
          toast({
            title: "Generation Complete",
            description: "Your video has been generated successfully!",
          });
        } else if (data.status === "failed") {
          failGeneration(data.error || "Generation failed");
          toast({
            title: "Generation Failed",
            description: data.error || "Something went wrong",
            variant: "destructive",
          });
        } else {
          updateGeneration({
            status: data.status,
            progress: data.progress,
          });
        }
      } catch (error) {
        console.error("Error polling status:", error);
      }
    };

    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, [
    currentGeneration,
    isGenerating,
    updateGeneration,
    completeGeneration,
    failGeneration,
    toast,
  ]);

  const onSubmit = async (data: GenerationParams) => {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to start generation");
      }

      const result = await response.json();
      await startGeneration(data, result.jobId);

      toast({
        title: "Generation Started",
        description: `Estimated time: ${result.estimatedTime}s`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start generation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async () => {
    if (!currentGeneration) return;

    try {
      await fetch(`/api/status/${currentGeneration.id}`, {
        method: "DELETE",
      });
      await cancelGeneration();
      toast({
        title: "Cancelled",
        description: "Generation has been cancelled.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel generation.",
        variant: "destructive",
      });
    }
  };

  const handlePresetSelect = (params: Partial<GenerationParams>) => {
    Object.entries(params).forEach(([key, value]) => {
      setValue(key as keyof GenerationParams, value);
    });
  };

  const handleRegenerate = () => {
    if (currentGeneration) {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Wan 2.2 Video Generator</h1>
          <Link href="/history">
            <Button variant="outline">
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Generator Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Video</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <PromptInput
                    register={register}
                    error={errors.prompt}
                    value={watch("prompt")}
                  />

                  <PresetSelector onSelect={handlePresetSelect} />

                  <ParameterPanel
                    register={register}
                    watch={watch}
                    setValue={setValue}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Generating..." : "Generate Video"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Status & Preview */}
          <div className="space-y-6">
            {isGenerating && <GenerationStatus onCancel={handleCancel} />}

            {currentGeneration?.status === "completed" && currentGeneration.videoUrl && (
              <VideoPlayer
                videoUrl={currentGeneration.videoUrl}
                prompt={currentGeneration.prompt}
                onRegenerate={handleRegenerate}
              />
            )}

            {!isGenerating && !currentGeneration && (
              <Card className="border-dashed">
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      Your generated video will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
