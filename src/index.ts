import { Client, Events, GatewayIntentBits, TextChannel } from "discord.js";
import cron from "node-cron";
import { loadConfig } from "./config";
import { fetchServerStatus } from "./minecraft-api";
import { createStatusEmbed } from "./message-formatter";
import {
  initDatabase,
  updatePlayerActivity,
  saveMessageId,
  getLastMessageId,
} from "./database";
import { logger } from "./utils/logger";

// Load configuration
const config = loadConfig();

// Initialize Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Function to update the server status
async function updateServerStatus() {
  try {
    // Get the target channel
    const channel = await client.channels.fetch(config.channelId);
    if (!channel || !(channel instanceof TextChannel)) {
      logger.error(
        `Channel with ID ${config.channelId} not found or is not a text channel.`
      );
      return;
    }

    // Fetch current server status
    const serverStatus = await fetchServerStatus(config.mcServerAddress);

    // Update player database if server is online and has players
    if (serverStatus.online && serverStatus.players?.list) {
      const onlinePlayerNames = serverStatus.players.list.map(
        (player) => player.name
      );
      await updatePlayerActivity(onlinePlayerNames);
    }

    // Create formatted embed with server information
    const statusEmbed = await createStatusEmbed(serverStatus);

    // Try to retrieve the last message ID from the database
    const lastMessageId = await getLastMessageId();

    // Try to update existing message, or send a new one if it doesn't exist
    try {
      if (lastMessageId) {
        try {
          const message = await channel.messages.fetch(lastMessageId);
          await message.edit({ embeds: [statusEmbed] });
          logger.success("Server status message updated.");
          return; // Exit if successful
        } catch (fetchError) {
          logger.warn(
            "Could not find the last message, will search for it or send a new one."
          );
          // Continue to search or create new message
        }
      }

      // Try to find the last status message in the channel
      const messages = await channel.messages.fetch({ limit: 50 });
      const botMessages = messages.filter(
        (m) => m.author.id === client.user?.id && m.embeds.length > 0
      );

      // Check if any of the bot's messages have our characteristic embed
      for (const [_, message] of botMessages) {
        // Look for a message with an embed that has our server status title
        if (
          message.embeds.some((embed) =>
            embed.title?.includes(
              `Minecraft Server Status: ${config.mcServerAddress}`
            )
          )
        ) {
          // Update the found message
          await message.edit({ embeds: [statusEmbed] });
          // Store the message ID for future use
          await saveMessageId(message.id);
          logger.success("Found and updated existing server status message.");
          return; // Exit after updating
        }
      }

      // If we get here, we need to create a new message
      logger.info("Sending new server status message.");
      const newMessage = await channel.send({ embeds: [statusEmbed] });
      await saveMessageId(newMessage.id);
    } catch (error) {
      logger.error("Error updating server status message:", error);

      // If all else fails, create a new message
      try {
        const newMessage = await channel.send({ embeds: [statusEmbed] });
        await saveMessageId(newMessage.id);
        logger.success("Sent new server status message as fallback.");
      } catch (sendError) {
        logger.error("Failed to send new message:", sendError);
      }
    }
  } catch (error) {
    logger.error("Error updating server status:", error);
  }
}

// Main async function to start the bot after database initialization
async function main() {
  try {
    // Initialize MongoDB database connection
    await initDatabase();

    // Login to Discord
    await client.login(config.discordToken);

    // Set up event handlers
    client.once(Events.ClientReady, (readyClient) => {
      logger.success(`Bot logged in as ${readyClient.user.tag}`);

      // Update server status immediately on startup
      updateServerStatus();

      // Schedule periodic updates
      const cronExpression = `*/${config.updateInterval} * * * *`; // Run every X minutes
      cron.schedule(cronExpression, updateServerStatus);

      logger.info(
        `Server status updates scheduled every ${config.updateInterval} minutes.`
      );
    });

    // Error handling
    client.on(Events.Error, (error) => {
      logger.error("Discord client error:", error);
    });
  } catch (error) {
    logger.error("Failed to start the application:", error);
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  logger.error("Application startup failed:", error);
  process.exit(1);
});
