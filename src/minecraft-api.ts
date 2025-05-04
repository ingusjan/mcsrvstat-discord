import axios from "axios";
import { MinecraftServerStatus } from "./types/minecraft-api";
import { logger } from "./utils/logger";
import { pingServerIP } from "./utils/ping";

/**
 * Fetch Minecraft server status from the API v3
 * @param serverAddress The Minecraft server address to check
 * @returns MinecraftServerStatus object containing server information
 */
export async function fetchServerStatus(
  serverAddress: string
): Promise<MinecraftServerStatus> {
  try {
    // Get direct server ping
    const directPingMs = await pingServerIP(serverAddress);

    // Using API v3
    const response = await axios.get(
      `https://api.mcsrvstat.us/3/${serverAddress}`
    );

    // Add direct ping measurement to the response data
    return {
      ...response.data,
      pingMs: directPingMs, // Use our direct ping result
    };
  } catch (error) {
    logger.error("Error fetching Minecraft server status:", error);

    // Try to get ping even if API fails
    const directPingMs = await pingServerIP(serverAddress);

    // Return a basic offline status if we can't reach the API
    return {
      online: false,
      ip: serverAddress,
      port: 25565, // Default Minecraft port
      pingMs: directPingMs, // Include ping if available
    };
  }
}
