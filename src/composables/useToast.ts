import { ref } from 'vue';

export type ToastType = 'info' | 'warning' | 'error';

export interface ToastParameters {
    type: ToastType;
    title: string;
    description?: string;
    duration?: number;
}

export interface Toast {
    id: number;
    type: ToastType;
    title: string;
    description?: string;
    duration: number;
}

const toasts = ref<Toast[]>([]);
let idCounter = 0;

export function useToast() {
    function addToast(type: ToastType, title: string, description?: string, duration = 10000): void {
        const id = ++idCounter;
        toasts.value.push({ id, type, title, description, duration });

        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
    }

    function removeToast(id: number): void {
        toasts.value = toasts.value.filter(t => t.id !== id);
    }

    const toast = {
        info: (title: string, description?: string, duration?: number) => addToast('info', title, description, duration),
        warning: (title: string, description?: string, duration?: number) => addToast('warning', title, description, duration),
        error: (title: string, description?: string, duration?: number) => addToast('error', title, description, duration)
    };

    return { toasts, toast, removeToast };
}
