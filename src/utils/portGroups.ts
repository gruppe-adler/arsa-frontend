import { PortConflictResponse, PortGroup, Server, ServerConfig } from '../api/model';
import { ApiError } from './fetcher';

// Mirrors arsa-backend's models/port_group.rs: a group is three consecutive ports.
export const rconPort = (group: PortGroup) => group.gamePort + 1;
export const a2sPort = (group: PortGroup) => group.gamePort + 2;

export type PortRole = 'game' | 'rcon' | 'a2s';

/** The host ports a server binds, with what each is for. */
export const PORT_ROLES: { role: PortRole; label: string; purpose: string }[] = [
    { role: 'game', label: 'Game', purpose: 'players connect here' },
    { role: 'rcon', label: 'RCON', purpose: 'remote admin console' },
    { role: 'a2s', label: 'A2S', purpose: 'server browser queries' }
];

export function portOf(config: ServerConfig, role: PortRole): number {
    switch (role) {
        case 'game':
            return config.bindPort;
        case 'rcon':
            return config.rcon.port;
        case 'a2s':
            return config.a2s.port;
    }
}

/** What the port is used for in this config, e.g. "Game" or "RCON and A2S" when misconfigured. */
export function portRoleLabel(config: ServerConfig, port: number): string {
    return PORT_ROLES.filter(r => portOf(config, r.role) === port)
        .map(r => r.label)
        .join(' and ');
}

export const MIN_GAME_PORT = 1024;
export const MAX_GAME_PORT = 65533;

export function portRange(group: PortGroup): string {
    return `${group.gamePort}–${a2sPort(group)}`;
}

export function portGroupLabel(group: PortGroup): string {
    return `${group.name} (${portRange(group)})`;
}

/** Sets game, public, RCON and A2S ports of the config to the group's ports. */
export function applyPortGroup(config: ServerConfig, group: PortGroup): void {
    config.bindPort = group.gamePort;
    config.publicPort = group.gamePort;
    config.rcon.port = rconPort(group);
    config.a2s.port = a2sPort(group);
}

/** The group whose ports the config uses, or undefined for custom ports. */
export function matchingPortGroup(config: ServerConfig, groups: PortGroup[]): PortGroup | undefined {
    return groups.find(
        group => config.bindPort === group.gamePort && config.rcon.port === rconPort(group) && config.a2s.port === a2sPort(group)
    );
}

/** Servers (other than `exceptUuid`) set to this group's ports. */
export function serversInPortGroup(group: PortGroup, servers: Server[], exceptUuid?: string): Server[] {
    return servers.filter(server => server.uuid !== exceptUuid && matchingPortGroup(server.config, [group])?.id === group.id);
}

/** The first group no server is set to, so a new server doesn't share ports with an existing one. */
export function firstUnassignedPortGroup(groups: PortGroup[], servers: Server[]): PortGroup | undefined {
    return groups.find(group => serversInPortGroup(group, servers).length === 0);
}

/**
 * The group a new or cloned server should get: one no server uses yet. When all are taken, keep its
 * ports, unless only port groups are allowed and they don't match a group; then take the first group.
 */
export function portGroupForNewServer(
    config: ServerConfig,
    groups: PortGroup[],
    servers: Server[],
    portGroupsOnly: boolean
): PortGroup | undefined {
    const unassigned = firstUnassignedPortGroup(groups, servers);
    if (unassigned || !portGroupsOnly || matchingPortGroup(config, groups)) {
        return unassigned;
    }
    return groups[0];
}

/**
 * Merges the groups into contiguous ranges for firewall rules, e.g. "2001–2009, 3001–3003".
 */
export function firewallRanges(groups: PortGroup[]): string {
    const ranges: [number, number][] = [];
    for (const group of [...groups].sort((a, b) => a.gamePort - b.gamePort)) {
        const last = ranges[ranges.length - 1];
        if (last && group.gamePort <= last[1] + 1) {
            last[1] = Math.max(last[1], a2sPort(group));
        } else {
            ranges.push([group.gamePort, a2sPort(group)]);
        }
    }
    return ranges.map(([from, to]) => `${from}–${to}`).join(', ');
}

/** The next game port after the highest group, or 2001 (the ARS default) when there are none. */
export function nextGamePort(groups: PortGroup[]): number {
    if (groups.length === 0) {
        return 2001;
    }
    const next = Math.max(...groups.map(a2sPort)) + 1;
    return next <= MAX_GAME_PORT ? next : MIN_GAME_PORT;
}

/** The conflict details when starting a server failed because its ports are taken. */
export function asPortConflict(error: unknown): PortConflictResponse | null {
    if (error instanceof ApiError && error.status === 409) {
        const body = error.body as Partial<PortConflictResponse> | null;
        if (body && Array.isArray(body.freePortGroups)) {
            return body as PortConflictResponse;
        }
    }
    return null;
}
