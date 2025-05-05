import * as pingLib from "ping";
import { Socket } from "net";
import dns from "dns";
import { promisify } from "util";
import { logger } from "./logger";

const dnsLookup = promisify(dns.lookup);

/**
 * Ping a server IP using the ping npm library with fallback to TCP socket
 * @param serverAddress IP address or hostname of the server
 * @returns Ping time in milliseconds, or undefined if ping failed
 */
export async function pingServerIP(
  serverAddress: string
): Promise<number | undefined> {
  try {
    // Extract just the hostname without port
    const hostname = serverAddress.split(":")[0];

    // First try using the ping library
    try {
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
          logger.info(
            `Ping to ${hostname} completed in ${pingTime}ms using ping library`
          );
          return pingTime;
        }
      }
    } catch (pingError) {
      logger.warn(
        `Ping library failed for ${serverAddress}: ${
          pingError instanceof Error ? pingError.message : "Unknown error"
        }. Falling back to TCP socket method.`
      );
      // Fall through to TCP socket method
    }

    // Fallback to TCP socket method if ping library failed
    return await pingWithTcpSocket(hostname);
  } catch (error) {
    logger.warn(
      `Could not ping server ${serverAddress}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return undefined;
  }
}

/**
 * Ping a server using TCP socket connection as fallback
 * @param hostname Hostname to ping
 * @returns Ping time in milliseconds, or undefined if ping failed
 */
async function pingWithTcpSocket(
  hostname: string
): Promise<number | undefined> {
  try {
    // First, resolve the hostname to an IP address
    const startDns = Date.now();
    const { address } = await dnsLookup(hostname);
    const dnsTime = Date.now() - startDns;

    logger.info(`Resolved ${hostname} to ${address} in ${dnsTime}ms`);

    // Now measure the time it takes to establish a TCP connection
    const startTime = Date.now();

    // Create a promise that resolves when the connection is established or rejects on error
    const connectPromise = new Promise<number>((resolve, reject) => {
      const socket = new Socket();

      // Set a timeout of 5 seconds
      socket.setTimeout(5000);

      socket.on("connect", () => {
        const connectTime = Date.now() - startTime;
        socket.destroy();
        resolve(connectTime);
      });

      socket.on("timeout", () => {
        socket.destroy();
        reject(new Error("Connection timed out"));
      });

      socket.on("error", (err) => {
        socket.destroy();
        reject(err);
      });

      // Try to connect to port 80 (HTTP) which is commonly open
      // We don't actually care about the service, just that we can reach the server
      socket.connect(80, address);
    });

    const connectTime = await connectPromise;

    // Total ping time is DNS lookup + TCP connection time
    const totalPingTime = dnsTime + connectTime;
    logger.info(
      `Ping to ${hostname} completed in ${totalPingTime}ms (DNS: ${dnsTime}ms, TCP: ${connectTime}ms) using TCP socket`
    );

    return totalPingTime;
  } catch (error) {
    logger.warn(
      `TCP socket ping failed for ${hostname}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return undefined;
  }
}
