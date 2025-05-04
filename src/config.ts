import * as dotenv from "dotenv";
import { Config } from "./types/config";

// Load environment variables
dotenv.config();

// Load and validate configuration
export function loadConfig(): Config {
  const discordToken = process.env.DISCORD_TOKEN;
  const channelId = process.env.CHANNEL_ID;
  const mcServerAddress = process.env.MC_SERVER_ADDRESS;
  const updateIntervalStr = process.env.UPDATE_INTERVAL;
  const recentPlayerDaysStr = process.env.RECENT_PLAYER_DAYS;

  // Validate required configuration
  if (!discordToken) throw new Error("DISCORD_TOKEN is required in .env file");
  if (!channelId) throw new Error("CHANNEL_ID is required in .env file");
  if (!mcServerAddress)
    throw new Error("MC_SERVER_ADDRESS is required in .env file");

  // Parse update interval with default fallback
  const updateInterval = updateIntervalStr
    ? parseInt(updateIntervalStr, 10)
    : 5;

  // Parse recent player days with default fallback (7 days)
  const recentPlayerDays = recentPlayerDaysStr
    ? parseInt(recentPlayerDaysStr, 10)
    : 7;

  return {
    discordToken,
    channelId,
    mcServerAddress,
    updateInterval,
    recentPlayerDays,
  };
}
