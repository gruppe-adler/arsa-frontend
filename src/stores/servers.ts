import { defineStore } from 'pinia';
import {
    getServers,
    getServer,
    addServer,
    updateServer,
    startServer,
    stopServer,
    deleteServer,
    isRunning,
    getLogs,
    getLog,
    deleteLog,
    getPublicIp,
    getArsStatus,
    recreateArsDockerImage,
    getKnownPlayers,
    getStats,
    getSize,
    getCrashReportsLog
} from '../utils/api';
import {
    ArsStatus,
    Branch,
    DockerStats,
    FileContentResponse,
    LogType,
    PlayerIdentityId,
    ResultLogs,
    ResultSize,
    Server
} from '../api/model';
import { getImageVersion } from '../api/backend';

interface State {
    servers: Server[];
    publicIp: string;
    arsStatus: ArsStatus;
}

export const useServersStore = defineStore('servers', {
    state: (): State => {
        return {
            servers: [],
            publicIp: '',
            arsStatus: ArsStatus.Unknown
        };
    },
    actions: {
        async getAll(): Promise<void> {
            this.servers = await getServers();
        },
        async get(uuid: string): Promise<Server> {
            return await getServer(uuid);
        },
        async add(server: Server): Promise<string> {
            return await addServer(server);
        },
        async update(server: Server): Promise<boolean> {
            return await updateServer(server);
        },
        async start(uuid: string): Promise<boolean> {
            const result = await startServer(uuid);
            if (result) {
                const server = this.servers.find(i => i.uuid === uuid);
                if (server) server.isRunning = true;
            }
            return result;
        },
        async stop(uuid: string): Promise<boolean> {
            const result = await stopServer(uuid);
            if (result) {
                const server = this.servers.find(i => i.uuid === uuid);
                if (server) server.isRunning = false;
            }
            return result;
        },
        async delete(uuid: string): Promise<boolean> {
            return await deleteServer(uuid);
        },
        async isRunning(uuid: string): Promise<boolean> {
            return await isRunning(uuid);
        },
        async getLogs(uuid: string): Promise<ResultLogs> {
            return await getLogs(uuid);
        },
        async getLog(uuid: string, log: string, file: LogType): Promise<FileContentResponse> {
            return await getLog(uuid, log, file);
        },
        async getCrashReportsLog(uuid: string): Promise<FileContentResponse> {
            return await getCrashReportsLog(uuid);
        },
        async deleteLog(uuid: string, log: string): Promise<boolean> {
            return await deleteLog(uuid, log);
        },
        async getKnownPlayers(): Promise<PlayerIdentityId[] | null> {
            return await getKnownPlayers();
        },
        async getStats(uuid: string): Promise<DockerStats | null> {
            return await getStats(uuid);
        },
        async getSize(uuid: string): Promise<ResultSize | null> {
            const result: ResultSize = await getSize(uuid);
            return result;
        },
        async getPublicIp(): Promise<string> {
            if (this.publicIp === '') {
                this.publicIp = await getPublicIp();
            }
            return this.publicIp;
        },
        async getArsStatus(): Promise<ArsStatus> {
            if (this.arsStatus === ArsStatus.Unknown) {
                this.arsStatus = await getArsStatus();
            }
            return this.arsStatus;
        },
        async recreateArsDockerImage(): Promise<boolean> {
            const result = await recreateArsDockerImage();
            return result;
        },
        async isRunningUpdate(uuid: string, isRunning: boolean): Promise<void> {
            const server = this.servers.find(i => i.uuid === uuid);
            if (server) server.isRunning = isRunning;
        },
        async playerCountUpdate(uuid: string, playerCount: number): Promise<void> {
            const server = this.servers.find(i => i.uuid === uuid);
            if (server) server.playerCount = playerCount;
        },
        async getImageVersion(branch: Branch): Promise<string | null> {
            const result = await getImageVersion(branch);
            if (result.status === 200) {
                return result.data.version;
            }
            return null;
        }
    }
});
