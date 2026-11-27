// src/lib/fetcher.ts

import { ToastParameters } from '../composables/useToast';

const BACKEND_PROTOCOL = import.meta.env.VITE_API_PROTOCOL;
const BACKEND_URL = import.meta.env.VITE_API_BACKEND_URL;

export const API_URL = `${BACKEND_PROTOCOL}://${BACKEND_URL}`;

const getBody = <T>(c: Response | Request): Promise<T> => {
    const contentType = c.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
        return c.json();
    }

    if (contentType && contentType.includes('application/pdf')) {
        return c.blob() as Promise<T>;
    }

    return c.text() as Promise<T>;
};

/** Thrown for every non-2xx response. Keeps the status and parsed body so callers can react to specific errors. */
export class ApiError extends Error {
    constructor(
        message: string,
        readonly status: number,
        readonly body: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export type FetchOptions = RequestInit & {
    /** Statuses the caller handles itself, so no error toast is shown for them. */
    silentStatuses?: number[];
};

export const customFetch = async <T>(url: string, options: FetchOptions): Promise<T> => {
    if (API_URL) {
        url = API_URL + url;
    }

    const { silentStatuses, ...requestOptions } = options;
    const response = await fetch(url, {
        ...requestOptions,
        headers: {
            ...options.headers,
            'Content-Type': 'application/json'
            // ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include'
    });

    if (!response.ok) {
        // if (response.status === 401 && (!auth.isAuthenticated || !token)) {
        //     redirectToLogin(auth);
        // }

        const body = await response.json().catch(() => null);
        const message = body?.message || `Error ${response.status}`;
        if (silentStatuses?.includes(response.status)) {
            throw new ApiError(message, response.status, body);
        }
        window.dispatchEvent(
            new CustomEvent<ToastParameters>('app:toast', {
                detail: {
                    type: 'error',
                    title: 'An error occurred during the request.',
                    description: message
                }
            })
        );

        throw new ApiError(message, response.status, body);
    }

    const data = await getBody<T>(response);

    return { status: response.status, data, headers: response.headers } as T;
};
