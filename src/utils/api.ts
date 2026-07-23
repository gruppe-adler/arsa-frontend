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
    getPullLogs,
    getDefaults as apiGetDefaults,
    putDefaults as apiPutDefaults
} from '../api/backend';
import { getProfileFiles, getProfileFile, putProfileFile } from '../api/backend';
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
    type ProfileFileListResponse,
    type PutServerBody,
    type ServerDefaults,
    type PutDefaultsBody,
    PullLog,
    UuidResponse,
    EditProfileFileRequest
} from '../api/model';

// TODO:
// const baseUrl = import.meta.env.VITE_API_URL || 'localhost:8080';
// const protocol = import.meta.env.VITE_API_PROTOCOL || 'http';

// const apiBaseUrl = `${protocol}://${baseUrl}`;

export async function getServers(): Promise<Server[]> {
    const response = await apiGetServers();
    return (response.data || []) as unknown as Server[];
}

export async function getServer(uuid: string): Promise<Server> {
    const response = await apiGetServer(uuid);
    return response.data as unknown as Server;
}

export async function startServer(uuid: string): Promise<boolean> {
    const response = await apiStartServer(uuid);
    return response.status === 200;
}

export async function stopServer(uuid: string): Promise<boolean> {
    const response = await apiStopServer(uuid);
    return response.status === 200;
}

export async function deleteServer(uuid: string): Promise<boolean> {
    const response = await apiDeleteServer(uuid);
    return response.status === 200;
}

export async function isRunning(uuid: string): Promise<boolean> {
    const response = await apiIsServerRunning(uuid);
    return response.status === 200;
}

export async function getLogs(uuid: string): Promise<ResultLogs> {
    const response = await apiGetLogs(uuid);
    if (response.status === 200) {
        return response.data as ResultLogs;
    }
    throw new Error('Failed to get logs');
}

export async function getLog(uuid: string, log: string, file: LogType): Promise<FileContentResponse> {
    const response = await apiGetLogFile(uuid, log, file);
    if (response.status === 200) {
        return response.data;
    }
    throw new Error(`Failed to get Log ${log}/${file} for Server with UUID: ${uuid}`);
}

export async function getCrashReportsLog(uuid: string): Promise<FileContentResponse> {
    const response = await apiGetCrashLog(uuid);
    if (response.status === 200) {
        return response.data;
    }
    throw new Error(`FailedCrashReports.log for Server with UUID: ${uuid}`);
}

export async function deleteLog(uuid: string, log: string): Promise<boolean> {
    const response = await apiDeleteLog(uuid, log);
    return response.status === 200;
}

export async function getKnownPlayers(): Promise<PlayerIdentityId[]> {
    const response = await apiGetPlayerLog();
    if (response.status === 200) {
        return response.data as PlayerIdentityId[];
    }
    return [];
}

export async function getStats(uuid: string): Promise<DockerStats> {
    const response = await apiGetStats(uuid);
    if (response.status === 200) {
        return response.data as DockerStats;
    }
    throw new Error('Failed to get stats');
}

export async function getSize(uuid: string): Promise<ResultSize> {
    const response = await apiGetSize(uuid);
    if (response.status === 200) {
        return response.data as ResultSize;
    }
    throw new Error('Failed to get size');
}

export async function addServer(server: Server): Promise<string> {
    const response = await apiPostServer(server as PostServerBody);
    if (response.status === 200) {
        return (response.data as UuidResponse)?.uuid || '';
    }
    return '';
}

export async function updateServer(server: Server): Promise<boolean> {
    const response = await putServer(server as PutServerBody);
    if (response.status === 200 && response.data.success) {
        return response.data.success;
    }
    return false;
}

export async function getDefaults(): Promise<ServerDefaults> {
    const response = await apiGetDefaults();
    return response.data as unknown as ServerDefaults;
}

export async function updateDefaults(defaults: ServerDefaults): Promise<ServerDefaults> {
    const response = await apiPutDefaults(defaults as PutDefaultsBody);
    return response.data as unknown as ServerDefaults;
}

export async function getPublicIp(): Promise<string> {
    const response = await apiGetPublicIp();
    if (response.status === 200) {
        return response.data.ipv4;
    }
    return '';
}

export async function getArsStatus(): Promise<ArsStatus> {
    const response = await apiGetStatus();
    return response.data;
}

export async function getAllPullLogs(): Promise<PullLog[]> {
    const response = await getPullLogs();
    return (response.data || []) as unknown as PullLog[];
}

export async function getProfileFilesForServer(id: string): Promise<ProfileFileListResponse> {
    const response = await getProfileFiles(id);
    if (response.status === 200) {
        return response.data as ProfileFileListResponse;
    }
    throw new Error(`Failed to get profile files for ${id}`);
}

export async function getProfileFileForServer(id: string, path: string): Promise<FileContentResponse> {
    const response = await getProfileFile(id, path);
    if (response.status === 200) {
        return response.data as FileContentResponse;
    }
    throw new Error(`Failed to get profile file ${path} for ${id}`);
}

export async function editProfileFile(id: string, path: string, contents: string): Promise<boolean> {
    const body = { fileContent: contents } as EditProfileFileRequest;
    const response = await putProfileFile(id, path, body);
    return response.status === 200;
}
