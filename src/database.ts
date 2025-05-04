import mongoose from "mongoose";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Player, Message } from "./models";
import { logger } from "./utils/logger";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

// Define interface for player records returned to the application
export interface PlayerRecord {
  name: string;
  lastSeen: string; // ISO date string
}

// MongoDB connection string from environment variables
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/minecraft-discord-status";

/**
 * Initialize the MongoDB connection
 */
export async function initDatabase(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI);
    logger.success("Connected to MongoDB database");
  } catch (error) {
    logger.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

/**
 * Save the message ID for persistence
 * @param messageId Discord message ID to persist
 */
export async function saveMessageId(messageId: string): Promise<void> {
  try {
    // Find and update the existing message record, or create a new one
    await Message.findOneAndUpdate(
      { type: "statusMessage" },
      { messageId, type: "statusMessage" },
      { upsert: true, new: true }
    );
  } catch (error) {
    logger.error("Error saving message ID:", error);
  }
}

/**
 * Get the last saved message ID
 * @returns Last message ID or null if not found
 */
export async function getLastMessageId(): Promise<string | null> {
  try {
    const message = await Message.findOne({ type: "statusMessage" });
    return message?.messageId || null;
  } catch (error) {
    logger.error("Error getting last message ID:", error);
    return null;
  }
}

/**
 * Update players' last seen time
 * @param onlinePlayers Array of player names currently online
 */
export async function updatePlayerActivity(
  onlinePlayers: string[]
): Promise<void> {
  try {
    const currentTime = new Date();

    // Use bulkWrite for efficient batch operations
    const operations = onlinePlayers.map((playerName) => ({
      updateOne: {
        filter: { name: playerName },
        update: { $set: { lastSeen: currentTime } },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await Player.bulkWrite(operations);
    }
  } catch (error) {
    logger.error("Error updating player activity:", error);
  }
}

/**
 * Get recently seen players who are not currently online
 * @param onlinePlayers Array of player names currently online
 * @param daysToKeep How many days to keep players in the "recently seen" list
 * @returns Array of player records
 */
export async function getRecentlySeenPlayers(
  onlinePlayers: string[],
  daysToKeep = 7
): Promise<PlayerRecord[]> {
  try {
    const cutoffDate = dayjs().subtract(daysToKeep, "day").toDate();

    // Find players who:
    // 1. Are not in the onlinePlayers list
    // 2. Have been seen after the cutoff date
    const recentPlayers = await Player.find({
      name: { $nin: onlinePlayers },
      lastSeen: { $gte: cutoffDate },
    }).sort({ lastSeen: -1 });

    // Convert to PlayerRecord format
    return recentPlayers.map((player) => ({
      name: player.name,
      lastSeen: player.lastSeen.toISOString(),
    }));
  } catch (error) {
    logger.error("Error getting recently seen players:", error);
    return [];
  }
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
