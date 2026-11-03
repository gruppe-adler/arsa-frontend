<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import ConfigForm from '../components/ConfigForm.vue';
import { defaultConfig, StartupParameters } from '../utils/defaults';
import { Branch, Server } from '../api/model';
import { useWorkshopStore } from '../stores/workshop';
import { mockWorkshopAssets, mockWorkshopDetails } from '../utils/mockWorkshop';

const workshopStore = useWorkshopStore();
onMounted(() => workshopStore.useMockData(mockWorkshopAssets, mockWorkshopDetails));
onUnmounted(() => workshopStore.clearMockData());

// Dev-only sandbox for the server-config/mods UI: builds a fully populated
// `Server` in-memory instead of fetching one, so this view works with the
// backend offline. Only reachable via the dev-gated route/nav link in
// router.ts / Menu.vue — never shipped as a real server page.
const mockServer = ref<Server>({
    uuid: 'debug-server',
    branch: Branch.stable,
    name: 'Debug Server',
    isRunning: true,
    playerCount: 7,
    startupParameters: StartupParameters,
    config: {
        ...defaultConfig,
        game: {
            ...defaultConfig.game,
            name: 'Debug Server',
            mods: [
                { modId: '59E4SIM0001AAAA', name: 'Community Framework', required: true, version: '1.4.2' },
                { modId: '59E4SIM0002BBBB', name: 'Enhanced Movement', required: true },
                { modId: '59E4SIM0003CCCC', name: 'Fox Reforger Flags', required: false, version: '0.9.1' },
                { modId: '59E4SIM0004DDDD', name: 'Tactical UI Overhaul', required: false },
                { modId: '59E4SIM0005EEEE', name: 'Project Atlas Terrain', required: true, version: '2.1.0' },
                { modId: '59E4SIM0006FFFF', name: 'Ambient Civilians', required: false }
            ]
        }
    }
});

const router = useRouter();
const inputViolationCounter = ref(0);
const activeTab = ref<'settings' | 'mods'>('mods');

const tabs = [
    { key: 'settings', label: 'Settings' },
    { key: 'mods', label: 'Mods' }
];

const disabled = computed<boolean>(() => inputViolationCounter.value > 0);
</script>

<template>
    <main class="form-container">
        <div class="debug-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <path d="M12 9v4M12 17h.01" />
            </svg>
            Debug page — mock server data, no backend calls. Not linked from production navigation.
        </div>

        <div class="server-detail-header">
            <h1>
                {{ mockServer.name }}
                <span class="badge"><span class="dot green"></span>Online</span>
            </h1>
        </div>

        <div class="tabs">
            <button
                v-for="tab in tabs"
                :key="tab.key"
                class="tab-btn"
                :class="{ active: activeTab === tab.key }"
                type="button"
                @click="activeTab = tab.key as 'settings' | 'mods'"
            >
                {{ tab.label }}
            </button>
        </div>

        <ConfigForm v-model:inputViolationCounter="inputViolationCounter" v-model:server="mockServer" :tab="activeTab" />

        <div class="form-toolbar">
            <div class="form-toolbar-status">
                <span class="dot" :class="disabled ? 'red' : 'green'"></span>
                <span v-if="disabled">Fix {{ inputViolationCounter }} violation{{ inputViolationCounter > 1 ? 's' : '' }}</span>
                <span v-else>Ready (mock — nothing is persisted)</span>
            </div>
            <div class="row">
                <button class="btn btn-ghost" type="button" @click="router.push('/servers-list')">Back to servers</button>
            </div>
        </div>
    </main>
</template>

<style scoped>
.debug-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    padding: 10px 14px;
    border: 1px solid color-mix(in oklab, var(--amber), transparent 60%);
    background: color-mix(in oklab, var(--amber), transparent 90%);
    color: var(--amber);
    border-radius: var(--radius);
    font-size: 13px;
}

.server-detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px 24px;
    margin-bottom: 32px;
}
.server-detail-header h1 {
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.02em;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
}

.tabs {
    display: flex;
    gap: 2px;
    flex-wrap: wrap;
    border-bottom: 1px solid var(--line);
    margin-bottom: 36px;
}
.tab-btn {
    appearance: none;
    background: none;
    border: none;
    font: inherit;
    font-size: 13.5px;
    font-weight: 500;
    color: var(--ink-3);
    padding: 10px 14px;
    margin-bottom: -1px;
    border-bottom: 2px solid transparent;
    cursor: pointer;
}
.tab-btn:hover {
    color: var(--ink);
}
.tab-btn.active {
    color: var(--ink);
    border-bottom-color: var(--ink);
}
</style>
