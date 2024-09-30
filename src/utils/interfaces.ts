export interface Server {
    'uuid': string
    'name': string
    'config': ServerConfig
}

//TODO(@y0014984): Define Arrays

export interface ServerConfig {
    'bindAddress': string,
    'bindPort': number,
    'publicAddress': string,
    'publicPort': number,
    'a2s': {
      'address': string,
      'port': number
    },
    'rcon': {
      'address': string,
      'port': number,
      'password': string,
      'permission': string,
      'maxClients': number,
      'blacklist': [],
      'whitelist': []
    },
    'game': {
      'name': string,
      'password': string,
      'passwordAdmin': string,
      'admins': [],
      'scenarioId': string,
      'maxPlayers': number,
      'visible': boolean,
      'crossPlatform': boolean,
      'supportedPlatforms': [],
      'gameProperties': {
        'serverMaxViewDistance': number,
        'serverMinGrassDistance': number,
        'networkViewDistance': number,
        'disableThirdPerson': boolean,
        'fastValidation': boolean,
        'battlEye': boolean,
        'VONDisableUI': boolean,
        'VONDisableDirectSpeechUI': boolean,
        'missionHeader': {}
      },
      'mods': []
    },
    'operating': {
      'lobbyPlayerSynchronise': boolean
    }
}