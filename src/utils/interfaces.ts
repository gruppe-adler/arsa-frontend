export interface Result {
  value: boolean
}

export interface ServerId {
  uuid: string
}

export interface Server {
  uuid: string
  name: string
  config: ServerConfig
}

export interface ServerConfig {
  bindAddress: string,
  bindPort: number,
  publicAddress: string,
  publicPort: number,
  a2s: {
    address: string,
    port: number
  },
  rcon: {
    address: string,
    port: number,
    password: string,
    permission: string,
    maxClients: number,
    blacklist: string[],
    whitelist: string[]
  },
  game: {
    name: string,
    password: string,
    passwordAdmin: string,
    admins: string[],
    scenarioId: string,
    maxPlayers: number,
    visible: boolean,
    crossPlatform: boolean,
    supportedPlatforms: string[],
    gameProperties: {
      serverMaxViewDistance: number,
      serverMinGrassDistance: number,
      networkViewDistance: number,
      disableThirdPerson: boolean,
      fastValidation: boolean,
      battlEye: boolean,
      VONDisableUI: boolean,
      VONDisableDirectSpeechUI: boolean,
      missionHeader: object
    },
    mods: Mods[]
  },
  operating: {
    lobbyPlayerSynchronise: boolean
  }
}

export interface Mods {
  modId: string,
  name: string
}