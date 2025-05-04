/**
 * MinecraftServerStatus interface for mcsrvstat.us API v3 response
 * Documentation: https://api.mcsrvstat.us/
 */
export interface MinecraftServerStatus {
  // Basic server information
  online: boolean;
  ip: string;
  port: number;
  hostname?: string;

  // Custom ping measurement (not part of the mcsrvstat.us API)
  pingMs?: number;

  // Debug information
  debug?: {
    ping: boolean;
    query: boolean;
    bedrock?: boolean;
    srv: boolean;
    querymismatch: boolean;
    ipinsrv: boolean;
    cnameinsrv: boolean;
    animatedmotd: boolean;
    cachehit?: boolean;
    cachetime: number;
    cacheexpire?: number;
    apiversion: number;
  };

  // Server version and protocol information
  version?: string;
  protocol?: {
    version: number;
    name?: string;
  };
  software?: string;

  // Map information
  map?: {
    raw: string;
    clean: string;
    html: string;
  };

  // Gamemode (Bedrock servers)
  gamemode?: string;

  // Server ID (Bedrock servers)
  serverid?: string;

  // Player information
  players?: {
    online: number;
    max: number;
    list?: {
      name: string;
      uuid: string;
    }[];
  };

  // Server MOTD (Message of the Day)
  motd?: {
    raw: string[];
    clean: string[];
    html: string[];
  };

  // Server icon (Base64 encoded)
  icon?: string;

  // Server status health check
  eula_blocked?: boolean;

  // Forge/Fabric mods information
  info?: {
    raw: string[];
    clean: string[];
    html: string[];
  };

  // Plugins installed on the server
  plugins?: {
    name: string;
    version: string;
  }[];

  // Server mods information
  mods?: {
    name: string;
    version: string;
  }[];
}
