import { NextRequest, NextResponse } from "next/server";
import { runpodClient } from "@/lib/runpod";
import { generationParamsSchema, GenerationHistoryItem } from "@/lib/validations";
import { db } from "@/lib/database";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const params = generationParamsSchema.parse(body);

    // Call RunPod API
    const response = await runpodClient.generateVideo(params);

    // Calculate estimated time based on parameters
    const estimatedTime = calculateEstimatedTime(params);

    // Save to database immediately
    const historyItem: GenerationHistoryItem = {
      id: response.id,
      prompt: params.prompt,
      params,
      status: runpodClient.mapStatus(response.status),
      createdAt: Date.now(),
      progress: 0,
      estimatedTime,
    };

    db.createGeneration(historyItem);

    return NextResponse.json({
      jobId: response.id,
      status: runpodClient.mapStatus(response.status),
      estimatedTime,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid parameters", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to start generation" },
      { status: 500 }
    );
  }
}

// Helper function to estimate generation time
function calculateEstimatedTime(params: any): number {
  // Base time in seconds
  let estimate = 30;

  // Add time based on resolution
  if (params.resolution === "1080p") estimate += 60;
  else if (params.resolution === "720p") estimate += 30;

  // Add time based on inference steps
  estimate += (params.num_inference_steps - 20) * 2;

  // Add time based on frames
  estimate += (params.num_frames - 25) * 0.5;

  return Math.round(estimate);
}
