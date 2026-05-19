import { defineStore } from 'pinia';
import { CreateImageProgress, Message, ServerStatusUpdate } from '../utils/interfaces';
import { Branch } from '../api/model';

interface State {
    logs: HostLog[];
    progress: Map<string, ProgressLog>;
}

export interface HostLog {
    timestamp: Date;
    log: ServerStatusUpdate;
}

enum ProgressLogStatus {
    Empty = '',
    Downloading = 'Downloading',
    Extracting = 'Extracting',
    PullComplete = 'Pull complete'
}

interface ProgressLog {
    status: String;
    current: Number;
    total: Number;

    percentage: Number;
    percentageFormatted: String;
}

// Message received: {"type":"createImageProgress","info":{"id":"d5b5d6a813d3","status":"Extracting","progressDetail":{"current":41}}}
// Message received: {"type":"createImageProgress","info":{"id":"d5b5d6a813d3","status":"Extracting","progressDetail":{"current":41}}}
// Message received: {"type":"createImageProgress","info":{"id":"d5b5d6a813d3","status":"Extracting","progressDetail":{"current":41}}}
// Message received: {"type":"createImageProgress","info":{"id":"d5b5d6a813d3","status":"Extracting","progressDetail":{"current":41}}}

// Message received: {"type":"createImageProgress","info":{"id":"4f4fb700ef54","status":"Pull complete","progressDetail":{}}}
// Message received: {"type":"createImageProgress","info":{"id":"908e160bbb95","status":"Pull complete","progressDetail":{}}}
// Message received: {"type":"createImageProgress","info":{"id":"d5b5d6a813d3","status":"Pull complete","progressDetail":{}}}
// Message received: {"type":"createImageProgress","info":{"status":"Digest: sha256:26da7a35a63f4a51d63505cb143227f3ee472b1a1e86365c9a0bae3772250701"}}
// Message received: {"type":"createImageProgress","info":{"status":"Status: Downloaded newer image for thewillard/arsa-test:stable"}}

export const useLogsStore = defineStore('logs', {
    state: (): State => {
        return {
            logs: [],
            progress: new Map<string, ProgressLog>()
        };
    },
    actions: {
        async add(message: string) {
            let msg = { type: 'message', message: message } as Message;
            this.logs.push({ timestamp: new Date(), log: msg });
        },

        addServerStatusUpdate(message: ServerStatusUpdate) {
            this.logs.push({ timestamp: new Date(), log: message });
        },

        clear() {
            this.logs = [];
        },

        async addProgress(progress: CreateImageProgress) {
            const info = progress.info;
            if (!info.id) {
                return;
            }
            let status = info.status ?? 'Unknown Status';
            let current = info.progressDetail?.current ?? 0;
            let total = info.progressDetail?.total ?? 0;

            let percentage = 100;
            let percentageFormatted = '';

            if (info.progressDetail?.current && info.progressDetail?.total) {
                percentage = (current / total) * 100;
                percentageFormatted = percentage.toFixed(2) + '%';
            }

            this.progress.set(info.id, {
                status: status,
                current: current,
                total: total,
                percentage: percentage,
                percentageFormatted: percentageFormatted
            });

            this.updateAggregateProgress();
        },

        updateAggregateProgress() {
            let currentBranch = '';
            for (const id in Branch) {
                if (this.progress.has(id)) {
                    currentBranch = id;
                    break;
                }
            }

            if (currentBranch === '') {
                return;
            }

            const aggregate = this.calculateAggregateProgress(currentBranch);
            if (aggregate) {
                this.progress.set(currentBranch, aggregate);
            }
        },

        calculateAggregateProgress(excludeId: string): ProgressLog | null {
            let totalCurrent = 0;
            let totalSum = 0;

            for (const [id, log] of this.progress.entries()) {
                if (id !== excludeId) {
                    totalCurrent += log.current.valueOf();
                    totalSum += log.total.valueOf();
                }
            }

            if (totalSum === 0) {
                return null;
            }

            const percentage = (totalCurrent / totalSum) * 100;
            return {
                status: `Total Progress`,
                current: totalCurrent,
                total: totalSum,
                percentage: percentage,
                percentageFormatted: percentage.toFixed(2) + '%'
            };
        }
    }
});
