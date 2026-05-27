import {
    getServers as apiGetServers,
    getServer as apiGetServer,
    startServer as apiStartServer,
    stopServer as apiStopServer,
    deleteServer as apiDeleteServer,
    isServerRunning as apiIsServerRunning,
    getLogs as apiGetLogs,
    getLogFile as apiGetLogFile,
    getCrashLog as apiGetCrashLog,
    deleteLog as apiDeleteLog,
    getPlayerLog as apiGetPlayerLog,
    getStats as apiGetStats,
    getSizeMethod as apiGetSize,
    postServer as apiPostServer,
    getPublicIp as apiGetPublicIp,
    getStatus as apiGetStatus,
    putServer,
    getPullLogs
} from '../api/backend';
import {
    type PostServerBody,
    type ResultLogs,
    type ResultSize,
    type DockerStats,
    type PlayerIdentityId,
    type Server,
    type ArsStatus,
    type LogType,
    type FileContentResponse,
    type PutServerBody,
    PullLog,
    UuidResponse
} from '../api/model';

import { useLogsStore } from '../stores/logs';

const baseUrl = import.meta.env.VITE_API_URL || 'localhost:8080';
const protocol = import.meta.env.VITE_API_PROTOCOL || 'http';

// TODO:
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const apiBaseUrl = `${protocol}://${baseUrl}`;

export async function getServers(): Promise<Server[]> {
    const response = await apiGetServers();
    const logsStore = useLogsStore();
    logsStore.add(`Server list retrieved`);
    return (response.data || []) as unknown as Server[];
}

export async function getServer(uuid: string): Promise<Server> {
    const response = await apiGetServer(uuid);
    const logsStore = useLogsStore();
    logsStore.add(`Server with UUID ${uuid} retrieved`);
    return response.data as unknown as Server;
}

export async function startServer(uuid: string): Promise<boolean> {
    const response = await apiStartServer(uuid);
    const logsStore = useLogsStore();
    logsStore.add(`Server with UUID ${uuid} started`);
    return response.status === 200;
}

export async function stopServer(uuid: string): Promise<boolean> {
    const response = await apiStopServer(uuid);
    const logsStore = useLogsStore();
    logsStore.add(`Server with UUID ${uuid} stopped`);
    return response.status === 200;
}

export async function deleteServer(uuid: string): Promise<boolean> {
    const response = await apiDeleteServer(uuid);
    const logsStore = useLogsStore();
    logsStore.add(`Server with UUID ${uuid} deleted`);
    return response.status === 200;
}

export async function isRunning(uuid: string): Promise<boolean> {
    const response = await apiIsServerRunning(uuid);
    return response.status === 200;
}

export async function getLogs(uuid: string): Promise<ResultLogs> {
    const response = await apiGetLogs(uuid);
    const logsStore = useLogsStore();
    logsStore.add(`Getting Logs for Server with UUID ${uuid}`);
    if (response.status === 200) {
        return response.data as ResultLogs;
    }
    throw new Error('Failed to get logs');
}

export async function getLog(uuid: string, log: string, file: LogType): Promise<FileContentResponse> {
    const response = await apiGetLogFile(uuid, log, file);
    const logsStore = useLogsStore();
    logsStore.add(`Getting Log ${log}/${file} for Server with UUID: ${uuid}`);
    if (response.status === 200) {
        return response.data;
    }
    throw new Error(`Failed to get Log ${log}/${file} for Server with UUID: ${uuid}`);
}

export async function getCrashReportsLog(uuid: string): Promise<FileContentResponse> {
    const response = await apiGetCrashLog(uuid);
    const logsStore = useLogsStore();
    logsStore.add(`Getting CrashReports.log for Server with UUID: ${uuid}`);
    if (response.status === 200) {
        return response.data;
    }
    throw new Error(`FailedCrashReports.log for Server with UUID: ${uuid}`);
}

export async function deleteLog(uuid: string, log: string): Promise<boolean> {
    const response = await apiDeleteLog(uuid, log);
    const logsStore = useLogsStore();
    logsStore.add(`Deleting Log ${log} for Server with UUID: ${uuid}`);
    return response.status === 200;
}

// export async function getPlayersFromLog(uuid: string, log: string): Promise<PlayerIdentityId[]> {
//     const response = await apiGetPlayerLog(uuid);
//     const logsStore = useLogsStore();
//     logsStore.add(`Getting Players from Log ${log} for Server with UUID: ${uuid}`);
//     if (response.status === 200) {
//         return response.data as PlayerIdentityId[];
//     }
//     return [];
// }

export async function getKnownPlayers(): Promise<PlayerIdentityId[]> {
    const response = await apiGetPlayerLog();
    const logsStore = useLogsStore();
    logsStore.add(`Getting known Players`);
    if (response.status === 200) {
        return response.data as PlayerIdentityId[];
    }
    return [];
}

export async function getStats(uuid: string): Promise<DockerStats> {
    const response = await apiGetStats(uuid);
    const logsStore = useLogsStore();
    logsStore.add(`Getting Stats for Server with UUID: ${uuid}`);
    if (response.status === 200) {
        return response.data as DockerStats;
    }
    throw new Error('Failed to get stats');
}

export async function getSize(uuid: string): Promise<ResultSize> {
    const response = await apiGetSize(uuid);
    const logsStore = useLogsStore();
    logsStore.add(`Getting Size for Server with UUID: ${uuid}`);
    if (response.status === 200) {
        return response.data as ResultSize;
    }
    throw new Error('Failed to get size');
}

export async function addServer(server: Server): Promise<string> {
    const response = await apiPostServer(server as PostServerBody);
    const logsStore = useLogsStore();
    if (response.status === 200) {
        const uuid = (response.data as UuidResponse)?.uuid || '';
        logsStore.add(`New Server added with UUID: ${uuid}`);
        return uuid;
    }
    throw new Error('Failed to add server');
}

export async function updateServer(server: Server): Promise<boolean> {
    const response = await putServer(server as PutServerBody);
    const logsStore = useLogsStore();
    if (response.status === 200 && response.data.success) {
        logsStore.add(`Server with UUID ${server.uuid} updated`);
        return response.data.success;
    }
    throw new Error('Failed to update server');
}

export async function getPublicIp(): Promise<string> {
    const response = await apiGetPublicIp();
    const logsStore = useLogsStore();
    logsStore.add(`Public IP address retrieved`);
    if (response.status === 200) {
        return response.data.ipv4;
    }
    throw new Error('Failed to get public ip');
}

export async function getArsStatus(): Promise<ArsStatus> {
    const response = await apiGetStatus();
    const logsStore = useLogsStore();
    logsStore.add(`ARS status fetched`);
    return response.data;
}

export async function getAllPullLogs(): Promise<PullLog[]> {
    const response = await getPullLogs();
    return (response.data || []) as unknown as PullLog[];
}
