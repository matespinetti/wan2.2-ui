import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;

    // Security: prevent directory traversal attacks
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      console.error("Invalid filename attempt:", filename);
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    // Only allow .mp4 files
    if (!filename.endsWith(".mp4")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const videoPath = path.join(process.cwd(), "public", "videos", filename);

    console.log("Serving video from:", videoPath);

    // Check if file exists
    try {
      const fileStat = await stat(videoPath);
      console.log("Video file size:", fileStat.size, "bytes");
    } catch (statError) {
      console.error("Video file not found:", videoPath);
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Read the video file
    const videoBuffer = await readFile(videoPath);

    // Return video with proper headers
    return new NextResponse(videoBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": videoBuffer.length.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving video:", error);
    return NextResponse.json(
      { error: "Failed to serve video" },
      { status: 500 }
    );
  }
}
