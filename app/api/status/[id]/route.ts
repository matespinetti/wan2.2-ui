import { NextRequest, NextResponse } from "next/server";
import { runpodClient } from "@/lib/runpod";
import { db } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // Get status from RunPod
    const response = await runpodClient.getStatus(id);

    // Map RunPod response to our format
    const status = runpodClient.mapStatus(response.status);

    // Calculate progress (if in progress)
    let progress = 0;
    if (status === "queued") progress = 0;
    else if (status === "processing") progress = 50; // Estimate
    else if (status === "completed") progress = 100;

    let videoUrl: string | undefined = undefined;

    // If video is completed and we have base64 data, save it
    if (status === "completed" && response.output?.video_base64) {
      try {
        // Save video file via internal API call
        const saveResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/videos`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jobId: id,
              videoBase64: response.output.video_base64,
            }),
          }
        );

        if (saveResponse.ok) {
          const { videoPath } = await saveResponse.json();
          videoUrl = videoPath;

          // Update database with video path
          db.updateGeneration(id, {
            videoUrl: videoPath,
            status: "completed",
            progress: 100,
            completedAt: Date.now(),
          });
        }
      } catch (saveError) {
        console.error("Error saving video:", saveError);
      }
    }

    // Update database with current status and progress
    if (status !== "completed") {
      db.updateGeneration(id, {
        status,
        progress,
      });
    }

    return NextResponse.json({
      status,
      progress,
      videoUrl,
      error: response.error,
      executionTime: response.executionTime,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}

// Cancel endpoint
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    await runpodClient.cancelJob(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel error:", error);
    return NextResponse.json(
      { error: "Failed to cancel generation" },
      { status: 500 }
    );
  }
}
