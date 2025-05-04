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
- 📝 **No message spam in Discord**: The same message is re-used across bot restarts
- 🗄️ **MongoDB Database**: Reliable storage of player activity and message data
- 🛠️ **Easy Configuration**: Just change the variables in .env and restart

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

   ```

   ```

# Discord Bot Token

DISCORD_TOKEN=your_discord_bot_token_here

# Discord Channel ID to send server status updates

CHANNEL_ID=your_channel_id_here

# Minecraft Server Address

MC_SERVER_ADDRESS=your_minecraft_server_address_here

# Update Interval in minutes (how often to check the server status)

UPDATE_INTERVAL=5

# How many days to show players in the "Recently Online" list

RECENT_PLAYER_DAYS=7

# MongoDB Connection URI

MONGO_URI=mongodb://localhost:27017/minecraft-discord-status

```

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

### Recommended Hosting: Hetzner Cloud with Coolify

[![Hetzner Cloud](https://cdn.hetzner.com/assets/Uploads/Hetzner-Logo-slogan_space-trans.png)](https://hetzner.cloud/?ref=YBJPKaZ3842f)

The easiest way to host this bot is to deploy Coolify using Hetzner Cloud:

1. Sign up for [Hetzner Cloud](https://hetzner.cloud/?ref=YBJPKaZ3842f)
2. Deploy Coolify using Hetzner's one-click app: [Coolify on Hetzner](https://docs.hetzner.com/cloud/apps/list/coolify/)
3. Within Coolify, create a new project that includes:
- This Node.js application (connect to your GitHub repository)
- A MongoDB database within the same project
4. Copy the MongoDB URI from Coolify into your application's environment variables
5. Deploy your application

You can also host this bot on any platform that supports Node.js applications and MongoDB.

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
```
