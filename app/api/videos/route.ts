import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, videoBase64, imageBase64 } = body;

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

    // Generate thumbnail from uploaded image if provided
    let thumbnailPath = null;
    if (imageBase64) {
      try {
        // Remove data URL prefix if present
        const imageData = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(imageData, "base64");

        // Generate thumbnail (320x240, JPEG, 80% quality)
        const thumbnailFileName = `${jobId}-thumb.jpg`;
        const thumbnailFilePath = path.join(process.cwd(), "public", "videos", thumbnailFileName);

        await sharp(imageBuffer)
          .resize(320, 240, {
            fit: "cover",
            position: "center",
          })
          .jpeg({ quality: 80 })
          .toFile(thumbnailFilePath);

        thumbnailPath = `/api/videos/${thumbnailFileName}`;
        console.log("Thumbnail generated:", thumbnailFilePath);
      } catch (thumbnailError) {
        console.error("Error generating thumbnail:", thumbnailError);
        // Don't fail the entire request if thumbnail generation fails
      }
    }

    // Return API URL path (not direct /videos path, use API route for serving)
    const publicVideoPath = `/api/videos/${videoFileName}`;

    return NextResponse.json({
      videoPath: publicVideoPath,
      thumbnailPath,
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
