import S from 'fluent-json-schema';

const PLATFORM = {
    PLATFORM_PC: 'PLATFORM_PC',
    PLATFORM_XBL: 'PLATFORM_XBL',
    PLATFORM_PSN: 'PLATFORM_PSN'
};

const RCON_PERMISSION = {
    admin: 'admin',
    monitor: 'monitor'
};

const arsMod = S.object()
    .prop(
        'modId',
        S.raw({
            type: 'string',
            regexp: { pattern: '^[0-9A-F]{16}$', flags: 's' }
        })
    )
    .required()
    .prop('name', S.string().minLength(1))
    .required()
    .prop(
        'version',
        S.raw({
            type: 'string',
            regexp: { pattern: '^[0-9]+.[0-9]+.[0-9]+$', flags: 's' }
        })
    )
    .prop('required', S.boolean());

const arsModset = S.array().items(arsMod);

export const arsModSchema = arsMod.valueOf();
export const arsModsetSchema = arsModset.valueOf();

export const arsConfigSchema = S.object()
    .id('https://arsa.gruppe-adler.de/server-config')
    .title('Arma Reforger Server Config')
    .description('Used in conjunction with Server Settings')
    .prop('bindAddress', S.string().format(S.FORMATS.IPV4).default('0.0.0.0'))
    .prop('bindPort', S.number().minimum(1).maximum(65535).default(2001))
    .prop('publicAddress', S.string().format(S.FORMATS.IPV4))
    .prop('publicPort', S.number().minimum(1).maximum(65535).default(2001))
    .required()
    .prop(
        'a2s',
        S.object()
            .prop('address', S.string().format(S.FORMATS.IPV4))
            .required()
            .prop('port', S.number().minimum(1).maximum(65535).default(17777))
            .required()
    )
    .required()
    .prop(
        'rcon',
        S.object()
            .prop('address', S.string().format(S.FORMATS.IPV4))
            .required()
            .prop('port', S.number().minimum(1).maximum(65535).default(19999))
            .required()
            .prop(
                'password',
                S.raw({
                    type: 'string',
                    minLength: 3,
                    regexp: { pattern: '^\\S*$', flags: 's' } /* no whitespaces */
                })
            )
            .required()
            .prop('maxClients', S.number().minimum(1).maximum(16).default(16))
            .required()
            .prop('permission', S.string().enum(Object.values(RCON_PERMISSION)))
            .required()
            .prop('blacklist', S.array().items(S.string()).default([]))
            .required()
            .prop('whitelist', S.array().items(S.string()).default([]))
    )
    .prop(
        'game',
        S.object()
            .prop('name', S.string().minLength(0).maxLength(100))
            .required()
            .prop('password', S.string())
            .required()
            .prop(
                'passwordAdmin',
                S.raw({
                    type: 'string',
                    regexp: { pattern: '^\\S*$', flags: 's' } /* no whitespaces */
                })
            )
            .required()
            .prop(
                'admins',
                S.array().items(
                    S.oneOf([
                        S.raw({
                            type: 'string',
                            regexp: {
                                pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
                                flags: 's'
                            } /* identityId */
                        }),
                        S.raw({
                            type: 'string',
                            regexp: { pattern: '^[0-9]{17}$', flags: 's' } /* steam64 id */
                        })
                    ])
                )
            )
            .required()
            .prop(
                'scenarioId',
                S.raw({
                    type: 'string',
                    regexp: { pattern: '^{[0-9A-F]{16}}.+.conf$', flags: 's' }
                })
            )
            .required()
            .prop('maxPlayers', S.number().minimum(1).maximum(128).default(64))
            .required()
            .prop('visible', S.boolean().default(true))
            .required()
            .prop('crossPlatform', S.boolean().default(false))
            .required()
            .prop(
                'supportedPlatforms',
                S.array()
                    .items(S.enum(Object.values(PLATFORM)))
                    .uniqueItems(true)
                    .minItems(1)
            )
            .required()
            .prop(
                'gameProperties',
                S.object()
                    .prop('serverMaxViewDistance', S.number().minimum(500).maximum(10000).default(1600))
                    .required()
                    .prop(
                        'serverMinGrassDistance',
                        S.oneOf([S.number().minimum(0).maximum(0), S.number().minimum(50).maximum(150)]).default(0)
                    )
                    .required()
                    .prop('fastValidation', S.boolean().default(true))
                    .required()
                    .prop('networkViewDistance', S.number().minimum(500).maximum(5000).default(1500))
                    .required()
                    .prop('battlEye', S.boolean().default(true))
                    .required()
                    .prop('disableThirdPerson', S.boolean().default(false))
                    .required()
                    .prop('VONDisableUI', S.boolean().default(false))
                    .required()
                    .prop('VONDisableDirectSpeechUI', S.boolean().default(false))
                    .required()
                    .prop('VONCanTransmitCrossFaction', S.boolean().default(false))
                    .required()
                    .prop('missionHeader', S.object())
                    .required()
            )
            .required()
            .prop('modsRequiredByDefault', S.boolean().default(true))
            .required()
            .prop('mods', arsModset)
            .required()
    )
    .required()
    .prop(
        'operating',
        S.object()
            .prop('lobbyPlayerSynchronise', S.boolean().default(true))
            .required()
            .prop('disableCrashReporter', S.boolean().default(false))
            .required()
            .prop('disableNavmeshStreaming', S.array().items(S.string()))
            .prop('disableServerShutdown', S.boolean().default(false))
            .required()
            .prop('disableAI', S.boolean().default(false))
            .required()
            .prop('playerSaveTime', S.number().minimum(1).default(120))
            .required()
            .prop('aiLimit', S.number().default(-1))
            .required()
            .prop('slotReservationTimeout', S.number().minimum(5).maximum(300).default(60))
            .required()
            .prop('joinQueue', S.object().prop('maxSize', S.number().minimum(0).maximum(50).default(0)))
            .required()
    )
    .required()
    .valueOf();
