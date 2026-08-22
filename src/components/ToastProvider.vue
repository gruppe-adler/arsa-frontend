<script setup lang="ts">
import { ToastProvider, ToastRoot, ToastTitle, ToastDescription, ToastClose, ToastViewport } from 'reka-ui';
import { ToastType, useToast } from '../composables/useToast';

const { toasts, removeToast } = useToast();

interface TypeConfig {
    class: string;
    iconColor: string;
}

const typeConfig: Record<ToastType, TypeConfig> = {
    info: { class: 'toast--info', iconColor: '#3b82f6' },
    warning: { class: 'toast--warning', iconColor: '#f59e0b' },
    error: { class: 'toast--error', iconColor: '#ef4444' }
};
</script>

<template>
    <ToastProvider>
        <ToastRoot
            v-for="toast in toasts"
            :key="toast.id"
            :open="true"
            :duration="toast.duration"
            class="toast"
            @update:open="(val: boolean) => !val && removeToast(toast.id)"
        >
            <div class="toast__icon">
                <!-- Info -->
                <svg
                    v-if="toast.type === 'info'"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    :stroke="typeConfig[toast.type].iconColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>

                <!-- Warning -->
                <svg
                    v-else-if="toast.type === 'warning'"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    :stroke="typeConfig[toast.type].iconColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>

                <!-- Error -->
                <svg
                    v-else-if="toast.type === 'error'"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    :stroke="typeConfig[toast.type].iconColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
            </div>
            <div class="toast__content">
                <ToastTitle class="toast__title">{{ toast.title }}</ToastTitle>
                <ToastDescription v-if="toast.description" class="toast__description">
                    {{ toast.description }}
                </ToastDescription>
            </div>
            <ToastClose class="toast__close" aria-label="Close">✕</ToastClose>
        </ToastRoot>

        <ToastViewport class="toast-viewport" />
    </ToastProvider>
</template>

<style>
/* viewport must be global — Reka owns this element */
.toast-viewport {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    z-index: 9999;
    max-width: 380px;
    width: 100%;
    list-style: none;
    margin: 0;
    padding: 0;
    outline: none;
}

.toast {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-radius: 0.5rem;
    border-left: 4px solid;
    background: var(--bg);
    border: 2px solid var(--line);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    animation: slide-in 0.2s ease;
    word-break: break-all;
}

@keyframes slide-in {
    from {
        transform: translateX(110%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.toast--info {
    border-color: #3b82f6;
}
.toast--warning {
    border-color: #f59e0b;
}
.toast--error {
    border-color: #ef4444;
}

.toast__icon {
    font-size: 1.1rem;
    padding-top: 1px;
}

.toast__content {
    flex: 1;
}
.toast__title {
    font-weight: 600;
    font-size: 0.9rem;
    margin: 0 0 0.2rem;
}
.toast__description {
    font-size: 0.82rem;
    color: #6b7280;
    margin: 0;
}

.toast__close {
    background: none;
    border: none;
    cursor: pointer;
    color: #9ca3af;
    font-size: 0.85rem;
    padding: 0;
    line-height: 1;
}
.toast__close:hover {
    color: #374151;
}
</style>
