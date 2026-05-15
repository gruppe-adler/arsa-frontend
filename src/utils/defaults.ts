import { Server, ServerConfig, StartupParameter } from './interfaces';

export const defaultConfig: ServerConfig = {
    bindAddress: '0.0.0.0',
    bindPort: 2001,
    publicAddress: '',
    publicPort: 2001,
    a2s: {
        address: '0.0.0.0',
        port: 17777
    },
    rcon: {
        address: '0.0.0.0',
        port: 19999,
        password: 'mE*mueuJnG27@LZrgK4pLjEL',
        maxClients: 16,
        permission: 'monitor',
        blacklist: [],
        whitelist: []
    },
    game: {
        name: "my server's name",
        password: 'bEBArjt_Jt-A!Ce*xrr2huQo',
        passwordAdmin: 'gHuaVyZCFQ!Rg984HMj6aoHn',
        admins: [],
        scenarioId: '{59AD59368755F41A}Missions/21_GM_Eden.conf',
        maxPlayers: 32,
        visible: true,
        crossPlatform: false,
        supportedPlatforms: ['PLATFORM_PC', 'PLATFORM_XBL', 'PLATFORM_PSN'],
        gameProperties: {
            serverMaxViewDistance: 2500,
            serverMinGrassDistance: 50,
            fastValidation: true,
            networkViewDistance: 1000,
            battlEye: true,
            disableThirdPerson: true,
            VONDisableUI: true,
            VONDisableDirectSpeechUI: true,
            VONCanTransmitCrossFaction: false,
            missionHeader: {}
        },
        modsRequiredByDefault: true,
        mods: []
    },
    operating: {
        lobbyPlayerSynchronise: true,
        disableCrashReporter: false,
        disableNavmeshStreaming: undefined,
        disableServerShutdown: false,
        disableAI: false,
        playerSaveTime: 120,
        aiLimit: -1,
        slotReservationTimeout: 60,
        joinQueue: {
            maxSize: 0
        }
    }
};

export const StartupParameters: StartupParameter[] = [
    {
        parameter: 'autoReload',
        tooltip: 'Automatically reloads the scenario when the session ends after the provided delay (in seconds), without shutting down the server. Useful for continuous mission rotation. Set to 0 to disable auto-restart.',
        enabled: false,
        type: 'number',
        value: 10,
        minVal: 0
    },
    {
        parameter: 'loadSessionSave',
        tooltip: 'Loads a previous game session save. Use alone to load the latest save, or provide a specific save file name. Enables persistent progression across server restarts.',
        enabled: false,
        type: 'string',
        value: ''
    },
    {
        parameter: 'logStats',
        tooltip: 'Logs performance statistics at the defined interval (in milliseconds). Useful for monitoring server performance and identifying bottlenecks. Higher values reduce log frequency.',
        enabled: false,
        type: 'number',
        value: 10000,
        minVal: 1
    },
    {
        parameter: 'maxFPS',
        tooltip: 'Sets maximum FPS limit for the server. Essential for preventing excessive CPU load - always enable this on dedicated servers. Lower values (20-30) reduce resource usage while maintaining acceptable performance.',
        enabled: true,
        type: 'number',
        value: 30,
        minVal: 1
    },
    {
        parameter: 'nds',
        tooltip:
            'Network Dynamic Simulation (NDS) streams only relevant entities to each client. Value represents diameter (number of cells in each direction). Default is 2. Higher values increase network traffic but improve client awareness of distant entities.',
        enabled: false,
        type: 'number',
        value: 2,
        minVal: 1
    },
    {
        parameter: 'nwkResolution',
        tooltip: 'Sets the resolution of Spatial Map cells in meters (100-1000 range). Affects how the server divides the world for network streaming. Lower values provide finer granularity but increase processing overhead.',
        enabled: false,
        type: 'number',
        value: 500,
        minVal: 100,
        maxVal: 1000
    },
    {
        parameter: 'rpl-timeout-ms',
        tooltip: 'Sets client/server connection timeout in milliseconds. Determines how long the server waits before disconnecting an unresponsive client. Increase for clients with unstable connections.',
        enabled: false,
        type: 'number',
        value: 10000,
        minVal: 1
    },
    {
        parameter: 'staggeringBudget',
        tooltip: 'Defines how many stationary spatial map cells can be processed per tick (1-10201 range). Higher values improve responsiveness but increase CPU load. Adjust based on server performance.',
        enabled: false,
        type: 'number',
        value: 5000,
        minVal: 1,
        maxVal: 10201
    },
    {
        parameter: 'streamingBudget',
        tooltip:
            'Global streaming budget distributed equally among all connections. Controls total bandwidth for entity replication. Cannot go below 100 to prevent system stalling. Increase for better client experience on high-bandwidth servers.',
        enabled: false,
        type: 'number',
        value: 500,
        minVal: 100
    },
    {
        parameter: 'streamsDelta',
        tooltip: 'Limits the number of streams opened for each client (1-1000 range, default 100). Controls rate of entity updates sent to clients. Lower values reduce bandwidth usage but may cause delayed entity appearance.',
        enabled: false,
        type: 'number',
        value: 200,
        minVal: 1,
        maxVal: 1000
    },
    {
        parameter: 'keepNumOfLogs',
        tooltip: 'Maximum number of log files to keep before rotation. Older logs are automatically deleted. Increase for longer log retention, decrease to save disk space.',
        enabled: false,
        type: 'number',
        value: 10,
        minVal: 1
    },
    {
        parameter: 'logLevel',
        tooltip:
            'Sets minimum log severity level. Each level includes lower levels (e.g., "error" includes error and fatal). Options: normal (all logs), warning, error, fatal. Use "warning" or "error" in production to reduce log volume.',
        enabled: false,
        type: 'select',
        value: 'normal',
        valueList: ['normal', 'warning', 'error', 'fatal']
    }
];

export const defaultServer: Server = {
    uuid: '',
    name: "my server's name",
    isRunning: false,
    config: defaultConfig,
    startupParameters: StartupParameters
};
