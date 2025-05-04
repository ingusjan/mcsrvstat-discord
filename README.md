# Minecraft Server Status Discord Bot

A Discord bot that periodically checks and displays the status of a Minecraft server using the [mcsrvstat.us API](https://api.mcsrvstat.us/).

## Features

- 🔄 **Auto-updates**: Periodically checks the server status and updates the message
- 🎮 **Rich Information**: Displays detailed server information including:
  - Online/offline status
  - Player count and player list
  - MOTD (Message of the Day)
  - Server version and software
  - Installed plugins and mods
- 🛠️ **Easy Configuration**: Simple environment variables to configure the bot
- 🌐 **Open Source**: Easy to modify and extend for your own needs

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- A Discord Bot Token ([Create a Discord Bot](https://discord.com/developers/applications))
- A Discord server where you have permission to add bots

### Installation

1. Clone this repository:
   ```
   git clone https://github.com/ingusjan/minecraft-discord-status.git
   cd minecraft-discord-status
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Copy the example environment file and fill in your details:
   ```
   cp .env.example .env
   ```

4. Edit the `.env` file with your specific configuration:
   - `DISCORD_TOKEN`: Your Discord bot token
   - `CHANNEL_ID`: The Discord channel ID where updates will be sent
   - `MC_SERVER_ADDRESS`: Your Minecraft server address (e.g., `mc.example.com` or IP address)
   - `UPDATE_INTERVAL`: How often to check for updates (in minutes)

5. Build the TypeScript code:
   ```
   npm run build
   ```

6. Run the bot:
   ```
   npm start
   ```

### Inviting the Bot to Your Server

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to the "OAuth2" section
4. In the "URL Generator", select the following scopes:
   - `bot`
   - `applications.commands`
5. For bot permissions, select:
   - "Send Messages"
   - "Embed Links"
   - "Read Message History"
6. Copy the generated URL and open it in your browser to invite the bot to your server

## Updating

To update the bot to the latest version:

```
git pull
npm install
npm run build
npm start
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [mcsrvstat.us](https://mcsrvstat.us/) for providing the Minecraft server status API
- [discord.js](https://discord.js.org/) for the Discord API wrapper