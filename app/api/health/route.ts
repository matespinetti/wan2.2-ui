import { NextResponse } from "next/server";
import { db } from "@/lib/database";

export async function GET() {
  try {
    // Verify database health
    const dbHealth = db.isHealthy();

    return NextResponse.json(
      {
        status: dbHealth ? "ok" : "degraded",
        database: dbHealth,
        timestamp: new Date().toISOString(),
        service: "wan-video-generator",
      },
      { status: dbHealth ? 200 : 503 }
    );
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        database: false,
        timestamp: new Date().toISOString(),
        service: "wan-video-generator",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
