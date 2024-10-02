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
    maxClients: number,
    permission: string,
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
      fastValidation: boolean,
      networkViewDistance: number,
      battlEye: boolean,
      disableThirdPerson: boolean,
      VONDisableUI: boolean,
      VONDisableDirectSpeechUI: boolean,
      VONCanTransmitCrossFaction: boolean,
      missionHeader: object
    },
    mods: Mod[]
  },
  operating: {
    lobbyPlayerSynchronise: boolean,
    disableNavmeshStreaming: string[] | undefined,
    disableServerShutdown: boolean,
    disableAI: boolean,
    playerSaveTime: number,
    aiLimit: number,
    slotReservationTimeout: number
  }
}

export interface Mod {
  modId: string,
  name: string,
  version: string | undefined
}