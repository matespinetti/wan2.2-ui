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

    // Only allow .mp4 and .jpg files
    const isVideo = filename.endsWith(".mp4");
    const isThumbnail = filename.endsWith(".jpg") || filename.endsWith(".jpeg");

    if (!isVideo && !isThumbnail) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "videos", filename);

    console.log("Serving file from:", filePath);

    // Check if file exists
    try {
      const fileStat = await stat(filePath);
      console.log("File size:", fileStat.size, "bytes");
    } catch (statError) {
      console.error("File not found:", filePath);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read the file
    const fileBuffer = await readFile(filePath);

    // Determine content type
    const contentType = isVideo ? "video/mp4" : "image/jpeg";

    // Return file with proper headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length.toString(),
        ...(isVideo && { "Accept-Ranges": "bytes" }),
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
