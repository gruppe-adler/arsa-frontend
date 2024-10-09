import { defineStore } from 'pinia'
import { getServers, getServer, addServer, updateServer, startServer, stopServer, deleteServer, isRunning, getLogs, getLog, getPublicIp } from '../utils/api'
import { Server } from '../utils/interfaces'

interface State {
    servers: Server[]
    publicIp: string
}

export const useServersStore = defineStore('servers', {
    state: (): State => {
        return {
            servers: [],
            publicIp: ''
        }
    },
    actions: {
        async getAll() { 
            this.servers = await getServers()
        },
        async get(uuid: string) { 
            return await getServer(uuid)
        },
        async add(server: Server) {
            await addServer(server)
        },
        async update(server: Server) {
            await updateServer(server)
        },
        async start(uuid: string) { 
            const result = await startServer(uuid)
            if (result) {
                const server = this.servers.find(i => i.uuid === uuid);
                if (server) server.isRunning = true;
            }
            return result
        },
        async stop(uuid: string) { 
            const result = await stopServer(uuid)
            if (result) {
                const server = this.servers.find(i => i.uuid === uuid);
                if (server) server.isRunning = false;
            }
            return result
        },
        async delete(uuid: string) { 
            return await deleteServer(uuid)
        },
        async isRunning(uuid: string) { 
            return await isRunning(uuid)
        },
        async getLogs(uuid: string) { 
            return await getLogs(uuid)
        },
        async getLog(uuid: string, log: string, file: string) { 
            return await getLog(uuid, log, file)
        },
        async getPublicIp() { 
            if (this.publicIp === '') {
                this.publicIp = await getPublicIp()
            };
        },
        async isRunningUpdate(uuid: string, isRunning: boolean) { 
            const server = this.servers.find(i => i.uuid === uuid);
            if (server) server.isRunning = isRunning;
        }
    },
})