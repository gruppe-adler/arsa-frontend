import { ArsStatus, PullLog } from '../api/model';

export interface ServerStatusUpdate {
    type: 'isRunningUpdate' | 'arsStatusUpdate' | 'message' | 'createImageProgress' | 'createImageFinished' | 'error' | 'playerCountUpdate';
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

export interface Message extends ServerStatusUpdate {
    type: 'message';
    message: string;
}

export interface CreateImageProgress extends ServerStatusUpdate {
    type: 'createImageProgress';
    info: PullLog;
}

export interface CreateImageFinished extends ServerStatusUpdate {
    type: 'createImageFinished';
    pullId: string;
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
