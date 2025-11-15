import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, videoBase64 } = body;

    if (!jobId || !videoBase64) {
      return NextResponse.json(
        { error: "Missing jobId or videoBase64" },
        { status: 400 }
      );
    }

    // Remove data URL prefix if present (e.g., "data:video/mp4;base64,")
    const base64Data = videoBase64.replace(/^data:video\/\w+;base64,/, "");

    // Convert base64 to buffer
    const videoBuffer = Buffer.from(base64Data, "base64");

    // Define file paths
    const videoFileName = `${jobId}.mp4`;
    const videoPath = path.join(process.cwd(), "public", "videos", videoFileName);

    console.log("Saving video:", {
      jobId,
      videoPath,
      bufferSize: videoBuffer.length,
      base64Length: base64Data.length
    });

    // Save video file
    await writeFile(videoPath, videoBuffer);

    console.log("Video saved successfully:", videoPath);

    // Return API URL path (not direct /videos path, use API route for serving)
    const publicVideoPath = `/api/videos/${videoFileName}`;

    return NextResponse.json({
      videoPath: publicVideoPath,
      message: "Video saved successfully",
    });
  } catch (error) {
    console.error("Error saving video:", error);
    return NextResponse.json(
      { error: "Failed to save video" },
      { status: 500 }
    );
  }
}
