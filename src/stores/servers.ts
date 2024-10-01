import { defineStore } from 'pinia'
import { getServers, getServer, addServer, startServer, stopServer, isRunning } from '../utils/api'
import { Server } from '../utils/interfaces'

interface State {
    servers: Server[]
}

export const useServersStore = defineStore('servers', {
    state: (): State => {
        return {
            servers: [],
        }
    },
    actions: {
        async getAll() { 
            this.servers = await getServers()
        },
        async get(id: string) { 
            return await getServer(id)
        },
        async add(server: Server) {
            await addServer(server)
        },
        async start(id: string) { 
            return await startServer(id)
        },
        async stop(id: string) { 
            return await stopServer(id)
        },
        async isRunning(id: string) { 
            return await isRunning(id)
        }
    },
})