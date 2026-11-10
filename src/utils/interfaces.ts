import { ArsStatus, Branch, GlobalLog, PullLog } from '../api/model';

export interface ServerStatusUpdate {
    type:
        | 'isRunningUpdate'
        | 'arsStatusUpdate'
        | 'message'
        | 'createImageProgress'
        | 'createImageFinished'
        | 'scenariosUpdateFinished'
        | 'error'
        | 'playerCountUpdate'
        | 'logUpdate';
}

export interface IsRunningUpdate extends ServerStatusUpdate {
    type: 'isRunningUpdate';
    uuid: string;
    isRunning: boolean;
}

export interface ArsStatusUpdate extends ServerStatusUpdate {
    type: 'arsStatusUpdate';
    arsStatus: ArsStatus;
}

export interface LogUpdate extends ServerStatusUpdate {
    type: 'logUpdate';
    log: GlobalLog;
}

export interface CreateImageProgress extends ServerStatusUpdate {
    type: 'createImageProgress';
    info: PullLog;
}

export interface CreateImageFinished extends ServerStatusUpdate {
    type: 'createImageFinished';
    pullId: string;
}

export interface ScenariosUpdateFinished extends ServerStatusUpdate {
    type: 'scenariosUpdateFinished';
    branch: Branch;
    success: boolean;
    count: number;
    error: string | null;
}

export interface PlayerCountUpdate extends ServerStatusUpdate {
    type: 'playerCountUpdate';
    uuid: string;
    playerCount: number;
}

export interface Error extends ServerStatusUpdate {
    type: 'error';
    error: string;
}
