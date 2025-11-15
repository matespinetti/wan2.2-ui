import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";

// GET /api/history - Get all generations with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const status = searchParams.get("status");

    let history;
    if (query) {
      history = db.searchGenerations(query);
    } else if (status) {
      history = db.filterByStatus(status as any);
    } else {
      history = db.getAllGenerations();
    }

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}

// DELETE /api/history?id=xxx - Delete a single generation
// DELETE /api/history?all=true - Clear all history
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all");

    if (all === "true") {
      db.clearAllGenerations();
      return NextResponse.json({ success: true, message: "History cleared" });
    }

    if (id) {
      db.deleteGeneration(id);
      return NextResponse.json({ success: true, message: "Generation deleted" });
    }

    return NextResponse.json(
      { error: "Missing id or all parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error deleting history:", error);
    return NextResponse.json(
      { error: "Failed to delete history" },
      { status: 500 }
    );
  }
}
