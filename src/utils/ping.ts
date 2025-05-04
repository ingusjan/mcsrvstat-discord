import { Socket } from "net";
import dns from "dns";
import { promisify } from "util";
import { logger } from "./logger";

const dnsLookup = promisify(dns.lookup);

/**
 * Ping a server IP directly using a basic TCP connection
 * @param serverAddress IP address or hostname of the server
 * @returns Ping time in milliseconds, or undefined if ping failed
 */
export async function pingServerIP(
  serverAddress: string
): Promise<number | undefined> {
  try {
    // Extract just the hostname without port
    const hostname = serverAddress.split(":")[0];

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
      `Ping to ${hostname} completed in ${totalPingTime}ms (DNS: ${dnsTime}ms, TCP: ${connectTime}ms)`
    );

    return totalPingTime;
  } catch (error) {
    logger.warn(
      `Could not ping server ${serverAddress}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return undefined;
  }
}
