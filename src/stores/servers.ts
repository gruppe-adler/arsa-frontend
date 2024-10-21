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
    getPublicIp,
    getPlayersFromLog,
    getKnownPlayers,
    getStats
} from '../utils/api';
import { PlayerIdentityId, Server, DockerStats } from '../utils/interfaces';

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
        async getLogs(uuid: string): Promise<string[]> {
            return await getLogs(uuid);
        },
        async getLog(uuid: string, log: string, file: string): Promise<string> {
            return await getLog(uuid, log, file);
        },
        async getPlayersFromLog(uuid: string, log: string): Promise<PlayerIdentityId[]> {
            return await getPlayersFromLog(uuid, log);
        },
        async getKnownPlayers(uuid: string): Promise<PlayerIdentityId[]> {
            return await getKnownPlayers(uuid);
        },
        async getStats(uuid: string): Promise<DockerStats> {
            return await getStats(uuid);
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
