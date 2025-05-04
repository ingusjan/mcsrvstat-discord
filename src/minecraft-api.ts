import axios from "axios";
import { MinecraftServerStatus } from "./types/minecraft-api";

/**
 * Fetch Minecraft server status from the API v3
 * @param serverAddress The Minecraft server address to check
 * @returns MinecraftServerStatus object containing server information
 */
export async function fetchServerStatus(
  serverAddress: string
): Promise<MinecraftServerStatus> {
  try {
    // Record start time to measure ping
    const startTime = Date.now();

    // Using API v3 instead of v2
    const response = await axios.get(
      `https://api.mcsrvstat.us/3/${serverAddress}`
    );

    // Calculate ping time in milliseconds
    const pingMs = Date.now() - startTime;

    // Add ping measurement to the response data
    return {
      ...response.data,
      pingMs,
    };
  } catch (error) {
    console.error("Error fetching Minecraft server status:", error);
    // Return a basic offline status if we can't reach the API
    return {
      online: false,
      ip: serverAddress,
      port: 25565, // Default Minecraft port
    };
  }
}
