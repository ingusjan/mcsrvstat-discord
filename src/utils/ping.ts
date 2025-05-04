import * as pingLib from "ping";
import { logger } from "./logger";

/**
 * Ping a server IP using the ping npm library
 * @param serverAddress IP address or hostname of the server
 * @returns Ping time in milliseconds, or undefined if ping failed
 */
export async function pingServerIP(
  serverAddress: string
): Promise<number | undefined> {
  try {
    // Extract just the hostname without port
    const hostname = serverAddress.split(":")[0];

    // Use the ping library to ping the server
    const result = await pingLib.promise.probe(hostname, {
      timeout: 5, // 5 seconds timeout
      min_reply: 1, // Only need one successful response
    });

    if (result.alive) {
      // Handle the case where time might be a number or "unknown"
      const pingTime =
        typeof result.time === "number"
          ? result.time
          : result.time === "unknown"
          ? undefined
          : parseFloat(result.time);

      if (pingTime !== undefined) {
        logger.info(`Ping to ${hostname} completed in ${pingTime}ms`);
        return pingTime;
      } else {
        logger.warn(`Could not determine ping time for ${serverAddress}`);
        return undefined;
      }
    } else {
      logger.warn(`Could not ping server ${serverAddress}: Host is not alive`);
      return undefined;
    }
  } catch (error) {
    logger.warn(
      `Could not ping server ${serverAddress}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return undefined;
  }
}
