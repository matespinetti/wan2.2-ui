import Database from "better-sqlite3";
import path from "path";
import { GenerationHistoryItem, GenerationStatus } from "./validations";

// Mark this file as server-only to prevent client-side imports
import "server-only";

// Database file location (persists in Docker volume)
const DB_PATH = process.env.NODE_ENV === "production"
  ? "/app/data/wan-generator.db"
  : path.join(process.cwd(), "data", "wan-generator.db");

// SQL Schema
const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS generations (
  id TEXT PRIMARY KEY,
  prompt TEXT NOT NULL,
  params_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  video_path TEXT,
  thumbnail_path TEXT,
  error TEXT,
  created_at INTEGER NOT NULL,
  completed_at INTEGER,
  progress INTEGER DEFAULT 0,
  estimated_time INTEGER,
  execution_time INTEGER,
  delay_time INTEGER
);

CREATE INDEX IF NOT EXISTS idx_status ON generations(status);
CREATE INDEX IF NOT EXISTS idx_created_at ON generations(created_at DESC);
`;

class GenerationDatabase {
  private db: Database.Database;

  constructor() {
    // Ensure data directory exists (only at runtime)
    const fs = require("fs");
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      try {
        fs.mkdirSync(dbDir, { recursive: true });
      } catch (error) {
        // Ignore errors during build (directory will be created in Docker)
        console.warn("Could not create database directory:", error);
      }
    }

    // Initialize database
    this.db = new Database(DB_PATH);
    this.db.pragma("journal_mode = WAL"); // Better concurrency
    this.db.pragma("foreign_keys = ON");

    // Create tables if they don't exist
    this.db.exec(CREATE_TABLES_SQL);
  }

  // Create a new generation record
  createGeneration(item: GenerationHistoryItem): void {
    const stmt = this.db.prepare(`
      INSERT INTO generations (
        id, prompt, params_json, status, video_path, thumbnail_path,
        error, created_at, completed_at, progress, estimated_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      item.id,
      item.prompt,
      JSON.stringify(item.params),
      item.status,
      item.videoUrl || null,
      item.thumbnailUrl || null,
      item.error || null,
      item.createdAt,
      item.completedAt || null,
      item.progress || 0,
      item.estimatedTime || null
    );
  }

  // Get a single generation by ID
  getGeneration(id: string): GenerationHistoryItem | null {
    const stmt = this.db.prepare(`
      SELECT * FROM generations WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return this.rowToHistoryItem(row);
  }

  // Get all generations (sorted by creation date, newest first)
  getAllGenerations(): GenerationHistoryItem[] {
    const stmt = this.db.prepare(`
      SELECT * FROM generations ORDER BY created_at DESC
    `);

    const rows = stmt.all() as any[];
    return rows.map((row) => this.rowToHistoryItem(row));
  }

  // Update an existing generation
  updateGeneration(id: string, updates: Partial<GenerationHistoryItem>): void {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.status !== undefined) {
      fields.push("status = ?");
      values.push(updates.status);
    }
    if (updates.videoUrl !== undefined) {
      fields.push("video_path = ?");
      values.push(updates.videoUrl);
    }
    if (updates.thumbnailUrl !== undefined) {
      fields.push("thumbnail_path = ?");
      values.push(updates.thumbnailUrl);
    }
    if (updates.error !== undefined) {
      fields.push("error = ?");
      values.push(updates.error);
    }
    if (updates.completedAt !== undefined) {
      fields.push("completed_at = ?");
      values.push(updates.completedAt);
    }
    if (updates.progress !== undefined) {
      fields.push("progress = ?");
      values.push(updates.progress);
    }

    if (fields.length === 0) return;

    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE generations SET ${fields.join(", ")} WHERE id = ?
    `);

    stmt.run(...values);
  }

  // Delete a generation
  deleteGeneration(id: string): void {
    const stmt = this.db.prepare("DELETE FROM generations WHERE id = ?");
    stmt.run(id);
  }

  // Clear all generations
  clearAllGenerations(): void {
    this.db.exec("DELETE FROM generations");
  }

  // Search generations by prompt
  searchGenerations(query: string): GenerationHistoryItem[] {
    const stmt = this.db.prepare(`
      SELECT * FROM generations
      WHERE prompt LIKE ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(`%${query}%`) as any[];
    return rows.map((row) => this.rowToHistoryItem(row));
  }

  // Filter by status
  filterByStatus(status: GenerationStatus): GenerationHistoryItem[] {
    const stmt = this.db.prepare(`
      SELECT * FROM generations
      WHERE status = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(status) as any[];
    return rows.map((row) => this.rowToHistoryItem(row));
  }

  // Filter by date range
  filterByDateRange(startDate: number, endDate: number): GenerationHistoryItem[] {
    const stmt = this.db.prepare(`
      SELECT * FROM generations
      WHERE created_at >= ? AND created_at <= ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(startDate, endDate) as any[];
    return rows.map((row) => this.rowToHistoryItem(row));
  }

  // Health check
  isHealthy(): boolean {
    try {
      const result = this.db.prepare("SELECT 1").get();
      return result !== undefined;
    } catch {
      return false;
    }
  }

  // Close database connection
  close(): void {
    this.db.close();
  }

  // Helper: Convert database row to GenerationHistoryItem
  private rowToHistoryItem(row: any): GenerationHistoryItem {
    return {
      id: row.id,
      prompt: row.prompt,
      params: JSON.parse(row.params_json),
      status: row.status as GenerationStatus,
      videoUrl: row.video_path || undefined,
      thumbnailUrl: row.thumbnail_path || undefined,
      error: row.error || undefined,
      createdAt: row.created_at,
      completedAt: row.completed_at || undefined,
      progress: row.progress || 0,
      estimatedTime: row.estimated_time || undefined,
    };
  }
}

// Singleton instance (lazy initialization to avoid build-time instantiation)
let dbInstance: GenerationDatabase | null = null;

export function getDatabase(): GenerationDatabase {
  if (!dbInstance) {
    dbInstance = new GenerationDatabase();
  }
  return dbInstance;
}

// Lazy getter for direct access (avoids instantiation during build)
export const db = {
  createGeneration: (item: GenerationHistoryItem) => getDatabase().createGeneration(item),
  getGeneration: (id: string) => getDatabase().getGeneration(id),
  getAllGenerations: () => getDatabase().getAllGenerations(),
  updateGeneration: (id: string, updates: Partial<GenerationHistoryItem>) =>
    getDatabase().updateGeneration(id, updates),
  deleteGeneration: (id: string) => getDatabase().deleteGeneration(id),
  clearAllGenerations: () => getDatabase().clearAllGenerations(),
  searchGenerations: (query: string) => getDatabase().searchGenerations(query),
  filterByStatus: (status: GenerationStatus) => getDatabase().filterByStatus(status),
  filterByDateRange: (startDate: number, endDate: number) =>
    getDatabase().filterByDateRange(startDate, endDate),
  isHealthy: () => getDatabase().isHealthy(),
  close: () => getDatabase().close(),
};
