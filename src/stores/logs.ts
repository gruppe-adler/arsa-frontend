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
            const msg = { type: 'message', message: message } as Message;
            this.logs.push({ timestamp: new Date(), log: msg });
        },

        groupPullLogs(logs: PullLog[]): Map<string, Map<string, PullLog>> {
            return logs.reduce((acc, log) => {
                const pullId = log.pullId ?? 'unknown';

                let value = acc.get(pullId);
                if (!value) {
                    value = new Map();
                }

                value.set(log.id, log);

                acc.set(pullId, value);

                return acc;
            }, new Map<string, Map<string, PullLog>>());
        },

        upsertPullLog(grouped: Map<string, Map<string, PullLog>>, log: PullLog): void {
            const pullId = log.pullId ?? 'unknown';

            let value = grouped.get(pullId);
            if (!value) {
                value = new Map();
            }

            value.set(log.id, log);
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
