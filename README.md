# Discord Bot for mcsrvstat

A Discord bot that periodically checks and displays the status of a Minecraft server using the [mcsrvstat.us API](https://api.mcsrvstat.us/).

## Example
![image](https://github.com/user-attachments/assets/4d16834d-9549-4008-9e87-dff18c396273)

## Features

- 🔄 **Auto-updates**: Periodically checks the server status and updates the message
- 🎮 **Rich Information**: Displays detailed server information including:
  - Online/offline status
  - Player count and player list
  - MOTD (Message of the Day)
  - Server version and software
  - Installed plugins and mods
- 👻 **Player Tracking**: Remembers when players were last online
  - Shows "Recently Online" players with timestamps
  - Configurable duration for how long to keep player history
- 📊 **Performance Metrics**: Displays server ping time with color indicators
- 📝 **Message Persistence**: Edits the same status message across bot restarts
- 🗄️ **MongoDB Database**: Reliable storage of player activity and message data
- 🛠️ **Easy Configuration**: Simple environment variables to configure the bot
- 🌐 **Open Source**: Easy to modify and extend for your own needs

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud-hosted)
- A Discord Bot Token ([Create a Discord Bot](https://discord.com/developers/applications))
- A Discord server where you have permission to add bots

### Installation

1. Clone this repository:
   ```
   git clone https://github.com/ingusjan/minecraft-discord-status.git
   cd minecraft-discord-status
   ```

2. Install dependencies using Yarn:
   ```
   yarn
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
   - `RECENT_PLAYER_DAYS`: How many days to show players in the "Recently Online" list (optional, defaults to 7)
   - `MONGO_URI`: MongoDB connection string (default: `mongodb://localhost:27017/minecraft-discord-status`)

5. Build the TypeScript code:
   ```
   yarn build
   ```

6. Run the bot:
   ```
   yarn start
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

## Hosting

### Recommended Hosting: Hetzner Cloud

[![Hetzner Cloud](https://cdn.hetzner.com/assets/Uploads/Hetzner-Logo-slogan_space-trans.png)](https://hetzner.cloud/?ref=YBJPKaZ3842f)

You can host this Discord bot on [Hetzner Cloud](https://hetzner.cloud/?ref=YBJPKaZ3842f) with these benefits:
- Affordable cloud servers starting at €4.15/month
- Simple setup perfect for Discord bots
- Excellent performance and reliability
- Pay-as-you-go billing with no long-term commitments

[Sign up for Hetzner Cloud here](https://hetzner.cloud/?ref=YBJPKaZ3842f)

## Database

The bot uses MongoDB to store:

- Player activity data (when each player was last seen online)
- The ID of the last status message for persistence across restarts

MongoDB provides better reliability, scalability, and performance compared to the previous JSON file storage. You can use a local MongoDB instance or a cloud-hosted solution like MongoDB Atlas for better reliability.

## Updating

To update the bot to the latest version:

```
git pull
yarn
yarn build
yarn start
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [mcsrvstat.us](https://mcsrvstat.us/) for providing the Minecraft server status API
- [discord.js](https://discord.js.org/) for the Discord API wrapper
- [mongoose](https://mongoosejs.com/) for MongoDB object modeling
