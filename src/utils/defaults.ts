export const defaultConfig = {
    bindAddress: '0.0.0.0',
    bindPort: 2001,
    publicAddress: '',
    publicPort: 2001,
    a2s: {
        address: '',
        port: 17777
    },
    rcon: {
        address: '',
        port: 19999,
        password: 'secret',
        permission: 'monitor',
        maxClients: 16,
        blacklist: [],
        whitelist: []
    },
    game: {
        name: 'name',
        password: 'password',
        passwordAdmin: 'adminPassword',
        admins: [],
        scenarioId: '{ECC61978EDCC2B5A}Missions/23_Campaign.conf',
        maxPlayers: 32,
        visible: true,
        crossPlatform: true,
        supportedPlatforms: [
            "PLATFORM_PC",
            "PLATFORM_XBL"
        ],
        gameProperties: {
            serverMaxViewDistance: 2500,
            serverMinGrassDistance: 50,
            networkViewDistance: 1000,
            disableThirdPerson: true,
            fastValidation: true,
            battlEye: true,
            VONDisableUI: true,
            VONDisableDirectSpeechUI: true,
            missionHeader: {
            m_iPlayerCount: 40,
            m_eEditableGameFlags: 6,
            m_eDefaultGameFlags: 6
            }
        },
        mods: [
            {
            modId: "5E68F6FA97DAB5CD",
            name: "GRAD Undead"
            }
        ]
    },
    operating: {
        lobbyPlayerSynchronise: true
    }
}

export const defaultServer = {
    uuid: '',
    name: '',
    config: defaultConfig
}