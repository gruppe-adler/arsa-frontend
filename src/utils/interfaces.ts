import { ArsStatus } from '../api/model';

export interface ServerStatusUpdate {
    type: 'isRunningUpdate' | 'arsStatusUpdate' | 'message' | 'createImageProgress' | 'error';
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
    info: CreateImageInfo;
}

export interface CreateImageInfo {
    id: string | undefined;
    errorDetail: ErrorDetail | undefined;
    status: string | undefined;
    progressDetail: ProgressDetail | undefined;
}

export interface ErrorDetail {
    code: number | undefined;
    message: string | undefined;
}

export interface ProgressDetail {
    current: number | undefined;
    total: number | undefined;
}

export interface Error extends ServerStatusUpdate {
    type: 'error';
    error: string;
}
