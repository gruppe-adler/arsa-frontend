import { defineStore } from 'pinia'

interface State {
    logs: Log[]
}

interface Log {
    timestamp: Date,
    log: string,
}

export const useLogsStore = defineStore('logs', {
    state: (): State => {
        return {
            logs: [],
        }
    },
    actions: {
        async add(entry: string) {
            this.logs.push({ timestamp: new Date(), log: entry });
        },
    },
})