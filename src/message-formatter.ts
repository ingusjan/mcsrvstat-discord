import { EmbedBuilder } from "discord.js";
import { MinecraftServerStatus } from "./types/minecraft-api";
import {
  PlayerRecord,
  formatLastSeen,
  getRecentlySeenPlayers,
} from "./database";
import { loadConfig } from "./config";

// Colors for different server states
const COLORS = {
  ONLINE: 0x4caf50, // Green
  OFFLINE: 0xf44336, // Red
  WARN: 0xff9800, // Orange
};

// Default Minecraft logo URL to use when no server icon is available
const DEFAULT_MINECRAFT_ICON =
  "https://images.icon-icons.com/2699/PNG/512/minecraft_logo_icon_168974.png";

// Cache for recently seen players to avoid multiple DB calls
let recentlySeenPlayersCache: PlayerRecord[] = [];
let lastCacheUpdate = 0;
const CACHE_TTL = 60000; // 1 minute in milliseconds

/**
 * Creates a formatted Discord embed for the Minecraft server status
 */
export async function createStatusEmbed(
  status: MinecraftServerStatus
): Promise<EmbedBuilder> {
  const config = loadConfig();
  const embed = new EmbedBuilder()
    .setTitle(`Minecraft Server Status: ${config.mcServerAddress}`)
    .setColor(status.online ? COLORS.ONLINE : COLORS.OFFLINE)
    .setTimestamp()
    .setFooter({ text: "Last updated" });

  // Always set a thumbnail - either the server icon or the default Minecraft logo
  if (status.icon) {
    embed.setThumbnail(`data:image/png;base64,${status.icon}`);
  } else {
    embed.setThumbnail(DEFAULT_MINECRAFT_ICON);
  }

  if (!status.online) {
    return embed.setDescription("⚠️ **Server is offline** ⚠️");
  }

  // Determine ping info text (without color indicators)
  let pingInfo = "";
  if (status.pingMs !== undefined) {
    pingInfo = ` (${status.pingMs}ms)`;
  }

  // Add basic server info
  embed.addFields(
    { name: "Status", value: `🟢 Online${pingInfo}`, inline: true }
  );

  // Add direct connection IP field right after status
  const directIp = `${status.ip}${status.port !== 25565 ? `:${status.port}` : ""}`;
  embed.addFields({ name: "🔌 Direct IP", value: directIp, inline: true });

  // Add version info
  embed.addFields(
    { name: "Version", value: status.version || "Unknown", inline: true }
  );

  // Add software info only if it's not the default "Vanilla"
  if (status.software && status.software !== "Vanilla") {
    embed.addFields({ name: "Software", value: status.software, inline: true });
  }

  // Add MOTD if available
  if (status.motd?.clean && status.motd.clean.length > 0) {
    const motd = status.motd.clean.join("\n").trim();
    if (motd) {
      embed.setDescription(motd);
    }
  }

  // Add player info
  if (status.players) {
    const playerCount = `${status.players.online}/${status.players.max}`;
    const playerField = {
      name: "🚪 Slots",
      value: playerCount,
      inline: true,
    };
    embed.addFields(playerField);

    // Get current online player names or empty array if none
    const onlinePlayerNames: string[] = status.players.list
      ? status.players.list.map((player) => player.name)
      : [];

    // Add online player list if available
    if (onlinePlayerNames.length > 0) {
      embed.addFields({
        name: "👥 Online Now",
        value: onlinePlayerNames.join(", "),
      });
    }

    // Refresh cache if needed
    const now = Date.now();
    if (now - lastCacheUpdate > CACHE_TTL) {
      recentlySeenPlayersCache = await getRecentlySeenPlayers(
        onlinePlayerNames,
        config.recentPlayerDays
      );
      lastCacheUpdate = now;
    }

    // Add recently online players (offline now but seen recently)
    if (recentlySeenPlayersCache.length > 0) {
      const recentPlayersList = recentlySeenPlayersCache
        .map((player) => `${player.name} (${formatLastSeen(player.lastSeen)})`)
        .join("\n");

      embed.addFields({
        name: "👻 Recently Online",
        value: recentPlayersList,
      });
    }
  }

  // Add map info if available
  if (status.map?.clean) {
    embed.addFields({ name: "🗺️ Map", value: status.map.clean, inline: true });
  }

  // Add gamemode if available (Bedrock servers)
  if (status.gamemode) {
    embed.addFields({
      name: "🎮 Gamemode",
      value: status.gamemode,
      inline: true,
    });
  }

  // Add plugins if available - Fixed structure
  if (status.plugins && status.plugins.length > 0) {
    const pluginList = status.plugins
      .slice(0, 10) // Limit to 10 plugins to avoid too large embeds
      .map(
        (plugin) =>
          `${plugin.name}${plugin.version ? ` (${plugin.version})` : ""}`
      )
      .join(", ");

    const pluginCount =
      status.plugins.length > 10
        ? `${pluginList} and ${status.plugins.length - 10} more...`
        : pluginList;

    embed.addFields({ name: "🧩 Plugins", value: pluginCount });
  }

  // Add mods if available - Fixed structure
  if (status.mods && status.mods.length > 0) {
    const modList = status.mods
      .slice(0, 10) // Limit to 10 mods to avoid too large embeds
      .map((mod) => `${mod.name}${mod.version ? ` (${mod.version})` : ""}`)
      .join(", ");

    const modCount =
      status.mods.length > 10
        ? `${modList} and ${status.mods.length - 10} more...`
        : modList;

    embed.addFields({ name: "🧱 Mods", value: modCount });
  }

  // Add additional info from API if available
  if (status.info?.clean && status.info.clean.length > 0) {
    const info = status.info.clean.join("\n").trim();
    if (info) {
      embed.addFields({ name: "Additional Info", value: info });
    }
  }

  // Add EULA blocked info if available
  if (status.eula_blocked) {
    embed.addFields({
      name: "⚠️ EULA Warning",
      value: "This server appears to be blocked by the Minecraft EULA",
    });
  }

  // Create footer text
  let footerText = "Last updated";

  // Set the footer with all the combined information
  embed.setFooter({ text: footerText });

  return embed;
}
