#!/usr/bin/env node

/**
 * CLI script to create users in the database
 *
 * Usage:
 *   npm run create-user
 *
 * In Docker:
 *   docker exec -it <container-name> npm run create-user
 */

import * as readline from "readline";
import { hash } from "bcrypt";
import { randomBytes } from "crypto";
import Database from "better-sqlite3";
import path from "path";

// Database path (same as in lib/database.ts)
const DB_PATH = process.env.NODE_ENV === "production"
  ? "/app/data/wan-generator.db"
  : path.join(process.cwd(), "data", "wan-generator.db");

interface PromptOptions {
  prompt: string;
  hidden?: boolean;
}

// Helper function to prompt for input
function promptInput(options: PromptOptions): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    if (options.hidden) {
      // Hide password input
      const stdin = process.stdin as any;
      stdin.setRawMode(true);

      let input = "";
      process.stdout.write(options.prompt);

      stdin.on("data", (char: Buffer) => {
        const c = char.toString();

        switch (c) {
          case "\n":
          case "\r":
          case "\u0004": // Ctrl-D
            stdin.setRawMode(false);
            stdin.pause();
            process.stdout.write("\n");
            rl.close();
            resolve(input);
            break;
          case "\u0003": // Ctrl-C
            process.exit();
            break;
          case "\u007f": // Backspace
            if (input.length > 0) {
              input = input.slice(0, -1);
              process.stdout.write("\b \b");
            }
            break;
          default:
            input += c;
            process.stdout.write("*");
            break;
        }
      });
    } else {
      rl.question(options.prompt, (answer) => {
        rl.close();
        resolve(answer);
      });
    }
  });
}

async function createUser() {
  try {
    console.log("\n=== Create New User ===\n");

    // Get username
    const username = await promptInput({
      prompt: "Username: "
    });

    if (!username || username.trim().length === 0) {
      console.error("Error: Username cannot be empty");
      process.exit(1);
    }

    // Get password
    const password = await promptInput({
      prompt: "Password: ",
      hidden: true
    });

    if (!password || password.length < 6) {
      console.error("Error: Password must be at least 6 characters");
      process.exit(1);
    }

    // Confirm password
    const passwordConfirm = await promptInput({
      prompt: "Confirm password: ",
      hidden: true
    });

    if (password !== passwordConfirm) {
      console.error("Error: Passwords do not match");
      process.exit(1);
    }

    // Hash password
    console.log("\nHashing password...");
    const passwordHash = await hash(password, 10);

    // Generate user ID
    const userId = randomBytes(16).toString("hex");

    // Open database
    console.log("Connecting to database...");
    const db = new Database(DB_PATH);

    // Enable WAL mode for better concurrency
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    // Create tables if they don't exist (same schema as in lib/database.ts)
    console.log("Initializing database schema...");
    db.exec(`
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

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_username ON users(username);
    `);

    // Check if username already exists
    const existingUser = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
    if (existingUser) {
      console.error(`Error: User "${username}" already exists`);
      db.close();
      process.exit(1);
    }

    // Create user
    const stmt = db.prepare(`
      INSERT INTO users (id, username, password_hash, created_at)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(userId, username, passwordHash, Date.now());
    db.close();

    console.log(`\n✓ User "${username}" created successfully!`);
    console.log(`User ID: ${userId}\n`);

  } catch (error) {
    console.error("\nError creating user:", error);
    process.exit(1);
  }
}

// Run the script
createUser();
