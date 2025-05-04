import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

// Define interfaces for our database
export interface PlayerRecord {
  name: string;
  lastSeen: string; // ISO date string
}

export interface Database {
  players: PlayerRecord[];
  lastMessageId?: string; // Store the last message ID for persistence
}

// Default database path
const DB_PATH = path.join(process.cwd(), "data", "database.json");

/**
 * Initialize the database
 */
export function initDatabase(): void {
  // Create the data directory if it doesn't exist
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create the database file if it doesn't exist
  if (!fs.existsSync(DB_PATH)) {
    const initialData: Database = { players: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    console.log("Database initialized at", DB_PATH);
  }
}

/**
 * Load the database
 */
export function loadDatabase(): Database {
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data) as Database;
  } catch (error) {
    console.error("Error loading database:", error);
    return { players: [] };
  }
}

/**
 * Save the database
 */
export function saveDatabase(db: Database): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error("Error saving database:", error);
  }
}

/**
 * Save the message ID for persistence
 * @param messageId Discord message ID to persist
 */
export function saveMessageId(messageId: string): void {
  const db = loadDatabase();
  db.lastMessageId = messageId;
  saveDatabase(db);
}

/**
 * Get the last saved message ID
 * @returns Last message ID or null if not found
 */
export function getLastMessageId(): string | null {
  const db = loadDatabase();
  return db.lastMessageId || null;
}

/**
 * Update players' last seen time
 * @param onlinePlayers Array of player names currently online
 * @returns Updated database
 */
export function updatePlayerActivity(onlinePlayers: string[]): Database {
  const db = loadDatabase();
  const currentTime = new Date().toISOString();

  // Update or add records for online players
  for (const playerName of onlinePlayers) {
    const existingPlayerIndex = db.players.findIndex(
      (p) => p.name === playerName
    );

    if (existingPlayerIndex >= 0) {
      // Update existing player
      db.players[existingPlayerIndex].lastSeen = currentTime;
    } else {
      // Add new player
      db.players.push({
        name: playerName,
        lastSeen: currentTime,
      });
    }
  }

  // Save the updated database
  saveDatabase(db);
  return db;
}

/**
 * Get recently seen players who are not currently online
 * @param onlinePlayers Array of player names currently online
 * @param daysToKeep How many days to keep players in the "recently seen" list
 * @returns Array of player records
 */
export function getRecentlySeenPlayers(
  onlinePlayers: string[],
  daysToKeep = 7
): PlayerRecord[] {
  const db = loadDatabase();
  const now = dayjs();
  const cutoffDate = now.subtract(daysToKeep, "day");

  return db.players
    .filter((player) => {
      // Skip currently online players
      if (onlinePlayers.includes(player.name)) return false;

      // Check if the player was seen within the cutoff period
      const lastSeenDate = dayjs(player.lastSeen);
      return lastSeenDate.isAfter(cutoffDate);
    })
    .sort((a, b) => {
      // Sort by most recently seen first
      return dayjs(b.lastSeen).unix() - dayjs(a.lastSeen).unix();
    });
}

/**
 * Format the lastSeen timestamp to a readable format
 * @param isoTimestamp ISO date string
 * @returns Formatted string like "2 days ago" or "5 hours ago"
 */
export function formatLastSeen(isoTimestamp: string): string {
  const lastSeen = dayjs(isoTimestamp);
  const now = dayjs();
  
  const diffMinutes = now.diff(lastSeen, "minute");
  
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  }
  
  const diffHours = now.diff(lastSeen, "hour");
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  }
  
  const diffDays = now.diff(lastSeen, "day");
  return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
}
