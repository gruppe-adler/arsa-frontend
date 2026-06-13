import { defineStore } from 'pinia';
import { ServerStatusUpdate } from '../utils/interfaces';
import { GetGlobalLogsParams, GlobalLog, PullLog } from '../api/model';
import { getAllPullLogs } from '../utils/api';
import { getGlobalLogs } from '../api/backend';

interface State {
    logs: GlobalLog[];
    globalLogsPage: number;
    globalLogsTotalPages: number;
    globalLogsLimit: number;
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
            globalLogsPage: 0,
            globalLogsTotalPages: 0,
            globalLogsLimit: 50,
            pullLogs: new Map<string, Map<string, PullLog>>()
        };
    },
    actions: {
        async updateLog(log: GlobalLog) {
            this.logs.unshift(log);
        },

        async getLogs(params: GetGlobalLogsParams = {}) {
            const page = params.page ?? 1;
            const limit = params.limit ?? this.globalLogsLimit ?? 50;

            const response = await getGlobalLogs({
                page,
                limit
            });

            if (response.status !== 200) {
                throw new Error('Failed to load global logs');
            }

            this.globalLogsPage = response.data.page;
            this.globalLogsTotalPages = response.data.total_pages;
            this.globalLogsLimit = response.data.limit;

            if (page <= 1) {
                this.logs = [...response.data.data];
                return;
            }

            this.logs = [...this.logs, ...response.data.data];
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

        clear(): void {
            this.logs = [];
            this.globalLogsPage = 0;
            this.globalLogsTotalPages = 0;
            this.globalLogsLimit = 50;
        },

        clearPullLog(uuid: string) {
            this.pullLogs.delete(uuid);
        }
    }
});
