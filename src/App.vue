<script setup lang="ts">
import Menu from './components/Menu.vue';
import WebSocket from './components/WebSocket.vue';
import { useServersStore } from './stores/servers';
import { useTheme } from './composables/useTheme';
import { computed, onMounted, onUnmounted } from 'vue';
import { TooltipProvider } from 'reka-ui';
import { ArsStatus } from './api/model';
import ToastProvider from './components/ToastProvider.vue';
import { ToastParameters, useToast } from './composables/useToast.ts';

const { toast } = useToast();

const serversStore = useServersStore();
const { theme, toggleTheme, initTheme } = useTheme();

onMounted(() => {
    initTheme();
});

const arsStatusDot = computed(() => {
    switch (serversStore.arsStatus) {
        case ArsStatus.Available:
            return 'green';
        case ArsStatus.Recreating:
            return 'amber';
        case ArsStatus.RecreatingFailure:
        case ArsStatus.Unavailable:
            return 'red';
        default:
            return '';
    }
});

const arsStatusLabel = computed(() => ArsStatus[serversStore.arsStatus]);

const handleToast = ((e: CustomEvent<ToastParameters>) =>
    toast[e.detail.type](e.detail.title, e.detail.description, e.detail.duration)) as EventListener;

onMounted(() => window.addEventListener('app:toast', handleToast));
onUnmounted(() => window.removeEventListener('app:toast', handleToast));
</script>

<template>
    <TooltipProvider>
        <WebSocket />
        <header class="topbar">
            <div class="topbar-inner">
                <RouterLink to="/servers-list" class="brand">
                    <div class="brand-mark">A</div>
                    <span class="brand-name">ARSA</span>
                    <span class="brand-sub">/ Arma Reforger Server Admin</span>
                </RouterLink>
                <Menu />
                <button
                    class="theme-toggle"
                    :aria-label="theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
                    @click="toggleTheme"
                >
                    <svg v-if="theme === 'light'" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                            d="M8 11.5C9.933 11.5 11.5 9.933 11.5 8C11.5 6.067 9.933 4.5 8 4.5C6.067 4.5 4.5 6.067 4.5 8C4.5 9.933 6.067 11.5 8 11.5Z"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                        <path
                            d="M8 1.5V2.5M8 13.5V14.5M14.5 8H13.5M2.5 8H1.5M12.3 12.3L11.6 11.6M4.4 4.4L3.7 3.7M12.3 3.7L11.6 4.4M4.4 11.6L3.7 12.3"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                        />
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                            d="M14 8.5C13.9 10.9 12.6 13 10.6 14.1C8.6 15.2 6.2 15.2 4.2 14C2.2 12.8 1 10.9 1 8.8C1 6.7 2.1 4.8 3.9 3.6C3.7 4.3 3.6 5 3.6 5.7C3.6 9.3 6.5 12.2 10.1 12.2C11.4 12.2 12.6 11.8 13.6 11.1C13.8 10.2 14 9.4 14 8.5Z"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </button>
                <div class="status-chip">
                    <span class="dot" :class="arsStatusDot"></span>
                    <span class="status-chip-label">ARS</span>
                    <span class="status-chip-value status-chip-label">{{ arsStatusLabel }}</span>
                </div>
            </div>
        </header>
        <RouterView />
        <ToastProvider />
    </TooltipProvider>
</template>

<style scoped>
.topbar {
    border-bottom: 1px solid var(--line);
    background: var(--bg);
    position: sticky;
    top: 0;
    z-index: 10;
}
.topbar-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 var(--gutter);
    height: 60px;
    display: flex;
    align-items: center;
    gap: 40px;
}
.brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    letter-spacing: -0.01em;
    white-space: nowrap;
}
.brand-mark {
    width: 22px;
    height: 22px;
    border-radius: 5px;
    background: var(--ink);
    color: var(--bg);
    display: grid;
    place-items: center;
    font-family: 'Geist Mono', ui-monospace, monospace;
    font-size: 11px;
    font-weight: 600;
}
.brand-name {
    color: var(--ink);
}
.brand-sub {
    color: var(--ink-3);
    font-weight: 400;
    margin-left: 2px;
}
.brand {
    text-decoration: none;
}

.theme-toggle {
    appearance: none;
    background: none;
    border: 1px solid var(--line);
    color: var(--ink-2);
    width: 32px;
    height: 32px;
    border-radius: var(--radius);
    display: grid;
    place-items: center;
    cursor: pointer;
    transition:
        background 80ms ease,
        border-color 80ms ease,
        color 80ms ease;
    flex-shrink: 0;
    margin-left: auto;
}
.theme-toggle:hover {
    background: var(--bg-soft);
    border-color: var(--line-strong);
    color: var(--ink);
}

.status-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 5px 10px 5px 8px;
    border: 1px solid var(--line);
    border-radius: 999px;
    font-size: 12.5px;
    color: var(--ink-2);
    background: var(--bg);
    white-space: nowrap;
}
.status-chip-value {
    color: var(--ink);
    font-weight: 500;
}

@media (max-width: 480px) {
    .topbar-inner {
        gap: 8px;
        padding: 0 16px;
    }
    .brand-name {
        display: none;
    }
    .brand-sub {
        display: none;
    }
    .status-chip-label {
        display: none;
    }
    .status-chip {
        padding: 5px 8px;
        gap: 0;
        border: none;
        background: transparent;
    }
    .theme-toggle {
        width: 30px;
        height: 30px;
    }
}
</style>
