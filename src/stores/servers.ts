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
    getPlayersFromLog,
    getKnownPlayers,
    getStats
} from '../utils/api';
import { PlayerIdentityId, Server, DockerStats, Result, LogFile } from '../utils/interfaces';

interface State {
    servers: Server[];
    publicIp: string;
}

export const useServersStore = defineStore('servers', {
    state: (): State => {
        return {
            servers: [],
            publicIp: ''
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
        async getLogs(uuid: string): Promise<string[] | null> {
            const result: string[] | null = await getLogs(uuid);
            if ((result as unknown as Result).value === false) {
                return null;
            } else {
                return result;
            }
        },
        async getLog(uuid: string, log: string, file: string): Promise<string | null> {
            const result: LogFile = await getLog(uuid, log, file);
            if ((result as unknown as Result).value === false) {
                return null;
            } else {
                return result.logFile;
            }
        },
        async deleteLog(uuid: string, log: string): Promise<boolean> {
            return await deleteLog(uuid, log);
        },
        async getPlayersFromLog(uuid: string, log: string): Promise<PlayerIdentityId[]> {
            return await getPlayersFromLog(uuid, log);
        },
        async getKnownPlayers(uuid: string): Promise<PlayerIdentityId[] | null> {
            const result: PlayerIdentityId[] | Result = await getKnownPlayers(uuid);
            if ((result as unknown as Result).value === false) {
                return null;
            } else {
                return result;
            }
        },
        async getStats(uuid: string): Promise<DockerStats | null> {
            const result: DockerStats | Result = await getStats(uuid);
            if ((result as unknown as Result).value === false) {
                return null;
            } else {
                return result;
            }
        },
        async getPublicIp(): Promise<string> {
            if (this.publicIp === '') {
                this.publicIp = await getPublicIp();
            }
            return this.publicIp;
        },
        async isRunningUpdate(uuid: string, isRunning: boolean): Promise<void> {
            const server = this.servers.find(i => i.uuid === uuid);
            if (server) server.isRunning = isRunning;
        }
    }
});
