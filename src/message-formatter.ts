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

/**
 * Creates a formatted Discord embed for the Minecraft server status
 */
export function createStatusEmbed(status: MinecraftServerStatus): EmbedBuilder {
  const config = loadConfig();
  const embed = new EmbedBuilder()
    .setTitle(
      `Minecraft Server Status: ${status.ip}${
        status.port !== 25565 ? `:${status.port}` : ""
      }`
    )
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

  // Add basic server info
  embed.addFields(
    { name: "Status", value: "🟢 Online", inline: true },
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
      embed.setDescription(`**MOTD:**\n${motd}`);
    }
  }

  // Add player info
  if (status.players) {
    const playerCount = `${status.players.online}/${status.players.max}`;
    const playerField = {
      name: "👥 Players",
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
        name: "🎮 Online Players",
        value: onlinePlayerNames.join(", "),
      });
    }

    // Add recently online players (offline now but seen recently)
    const recentlySeenPlayers = getRecentlySeenPlayers(
      onlinePlayerNames,
      config.recentPlayerDays
    );
    if (recentlySeenPlayers.length > 0) {
      const recentPlayersList = recentlySeenPlayers
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

  // Create footer text with ping if available
  let footerText = "Last updated";

  // Add ping information if available
  if (status.pingMs !== undefined) {
    const pingColor =
      status.pingMs < 100 ? "🟢" : status.pingMs < 300 ? "🟡" : "🔴";
    footerText += ` | Ping: ${pingColor} ${status.pingMs}ms`;
  }

  // Add API version info if available
  if (status.debug?.apiversion) {
    footerText += ` | API v${status.debug.apiversion}`;
  }

  // Set the footer with all the combined information
  embed.setFooter({ text: footerText });

  return embed;
}
