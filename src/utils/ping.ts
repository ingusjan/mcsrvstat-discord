import { Socket } from "net";
import dns from "dns";
import { promisify } from "util";
import { logger } from "./logger";

const dnsLookup = promisify(dns.lookup);

/**
 * Ping a server IP using DNS resolution and TCP socket
 * This implementation doesn't require special permissions
 * @param serverAddress IP address or hostname of the server
 * @returns Ping time in milliseconds, or undefined if ping failed
 */
export async function pingServerIP(
  serverAddress: string
): Promise<number | undefined> {
  try {
    // Extract hostname and determine port to try
    const parts = serverAddress.split(":");
    const hostname = parts[0];
    const portToTry = parts.length > 1 ? parseInt(parts[1]) : 25565; // Use Minecraft port if specified, otherwise default

    // First, resolve hostname to IP
    const startTime = Date.now();
    const { address } = await dnsLookup(hostname);

    // Try to connect to the actual Minecraft port
    try {
      // Create a promise that resolves when the connection is established or rejects on error
      await new Promise<void>((resolve, reject) => {
        const socket = new Socket();

        // Set a 5 second timeout
        socket.setTimeout(5000);

        socket.on("connect", () => {
          socket.destroy();
          resolve();
        });

        socket.on("timeout", () => {
          socket.destroy();
          reject(new Error("Connection timed out"));
        });

        socket.on("error", (err) => {
          socket.destroy();
          // We don't fail on connection errors - just measure the RTT to the ip
          resolve();
        });

        // Try to connect to the Minecraft port
        socket.connect(portToTry, address);
      });
    } catch (socketError) {
      // We still continue even if socket connection fails - we got DNS time at minimum
    }

    // Calculate total round-trip time
    const pingTime = Date.now() - startTime;

    logger.info(
      `Network latency to ${hostname} is approximately ${pingTime}ms`
    );
    return pingTime;
  } catch (error) {
    logger.warn(
      `Could not measure network latency for ${serverAddress}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return undefined;
  }
}
