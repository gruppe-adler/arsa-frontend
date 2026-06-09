// src/lib/fetcher.ts

import { ToastParameters } from '../composables/useToast';

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

export const customFetch = async <T>(url: string, options: RequestInit): Promise<T> => {
    const response = await fetch(url, options);

    if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = body?.message || `Error ${response.status}`;
        window.dispatchEvent(
            new CustomEvent<ToastParameters>('app:toast', {
                detail: {
                    type: 'error',
                    title: 'An error occurred during the request.',
                    description: message
                }
            })
        );

        throw new Error(message);
    }

    const data = await getBody<T>(response);

    return { status: response.status, data, headers: response.headers } as T;
};
