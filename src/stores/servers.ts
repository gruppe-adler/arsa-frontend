import { defineStore } from 'pinia'
import { getServers, getServer, addServer } from '../utils/api'
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
        }
    },
})