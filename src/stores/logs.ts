import { defineStore } from 'pinia';
import { Message, ServerStatusUpdate } from '../utils/interfaces';
import { PullLog } from '../api/model';
import { getAllPullLogs } from '../utils/api';

interface State {
    logs: HostLog[];
    pullLogs: Map<string, Map<string, PullLog>>;
}

export interface HostLog {
    timestamp: Date;
    log: ServerStatusUpdate;
}

export const useLogsStore = defineStore('logs', {
    state: (): State => {
        return {
            logs: [],
            pullLogs: new Map<string, Map<string, PullLog>>()
        };
    },
    actions: {
        async add(message: string) {
            let msg = { type: 'message', message: message } as Message;
            this.logs.push({ timestamp: new Date(), log: msg });
        },

        groupPullLogs(logs: PullLog[]): Map<string, Map<string, PullLog>> {
            return logs.reduce((acc, log) => {
                const pullId = log.pullId ?? 'unknown';

                if (!acc.has(pullId)) {
                    acc.set(pullId, new Map());
                }

                acc.get(pullId)!.set(log.id, log);

                return acc;
            }, new Map<string, Map<string, PullLog>>());
        },

        upsertPullLog(grouped: Map<string, Map<string, PullLog>>, log: PullLog): void {
            const pullId = log.pullId ?? 'unknown';

            if (!grouped.has(pullId)) {
                grouped.set(pullId, new Map());
            }

            grouped.get(pullId)!.set(log.id, log);
        },

        async loadPullLogs(): Promise<void> {
            this.pullLogs = this.groupPullLogs(await getAllPullLogs());
        },

        async updatePullLog(pullLog: PullLog) {
            this.upsertPullLog(this.pullLogs, pullLog);
        },

        clearPullLog(uuid: string) {
            this.pullLogs.delete(uuid);
        },

        addServerStatusUpdate(message: ServerStatusUpdate) {
            this.logs.push({ timestamp: new Date(), log: message });
        },

        clear() {
            this.logs = [];
        }
    }
});
