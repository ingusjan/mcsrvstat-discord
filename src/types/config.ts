/**
 * Configuration interface for the Discord bot
 */
export interface Config {
  discordToken: string;
  channelId: string;
  mcServerAddress: string;
  updateInterval: number;
  recentPlayerDays: number; // How many days to keep players in the "recently seen" list
}
