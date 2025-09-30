// Steam App ID constants for Arma Reforger Server versions
export const STEAM_APP_VERSIONS = {
    STABLE: 1874900,
    EXPERIMENTAL: 1890870
} as const;

export const STEAM_APP_VERSION_LABELS = {
    [STEAM_APP_VERSIONS.STABLE]: 'Stable Arma Reforger Server',
    [STEAM_APP_VERSIONS.EXPERIMENTAL]: 'Experimental Arma Reforger Server'
} as const;

export const STEAM_APP_VERSION_OPTIONS = [
    { value: STEAM_APP_VERSIONS.STABLE.toString(), label: STEAM_APP_VERSION_LABELS[STEAM_APP_VERSIONS.STABLE] },
    { value: STEAM_APP_VERSIONS.EXPERIMENTAL.toString(), label: STEAM_APP_VERSION_LABELS[STEAM_APP_VERSIONS.EXPERIMENTAL] }
];

// Helper functions
export function getSteamAppVersionLabel(steamAppId: number): string {
    return STEAM_APP_VERSION_LABELS[steamAppId as keyof typeof STEAM_APP_VERSION_LABELS] || `Unknown Version (${steamAppId})`;
}

export function isValidSteamAppId(steamAppId: number): boolean {
    return steamAppId === STEAM_APP_VERSIONS.STABLE || steamAppId === STEAM_APP_VERSIONS.EXPERIMENTAL;
}