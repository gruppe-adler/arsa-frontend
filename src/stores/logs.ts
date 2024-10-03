import { defineStore } from 'pinia'

interface State {
    logs: string[]
}

export const useLogsStore = defineStore('logs', {
    state: (): State => {
        return {
            logs: [],
        }
    },
    actions: {
        async add(entry: string) { 
            const now = new Date();
            this.logs.push(`[${now.toISOString()}]: ${entry}`);
        },
    },
})