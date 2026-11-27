<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useServersStore } from '../stores/servers';
import { useDefaultsStore } from '../stores/defaults';
import { defaultServer } from '../utils/defaults';
import ConfigForm from '../components/ConfigForm.vue';
import ConfigUploadDownload from '../components/ConfigUploadDownload.vue';
import FormTabs from '../components/FormTabs.vue';
import { Server } from '../api/model';
import { SettingOrModTab } from '../utils/type.ts';
import { usePortGroupsStore } from '../stores/portGroups';
import { useSettingsStore } from '../stores/settings';
import { applyPortGroup, portGroupForNewServer } from '../utils/portGroups';

const router = useRouter();
const serversStore = useServersStore();
const defaultsStore = useDefaultsStore();
// Deep copy, so filling in the form (and assigning a port group) doesn't change the defaults it started from.
const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const server = ref<Server>(copy(defaultServer));
const inputViolationCounter = ref(0);

const portGroupsStore = usePortGroupsStore();
const settingsStore = useSettingsStore();

// Put the new server on a port group no server uses yet, so it can run next to the others.
async function assignFreePortGroup() {
    try {
        const [groups, settings] = await Promise.all([portGroupsStore.load(), settingsStore.load(), serversStore.getAll()]);
        const group = portGroupForNewServer(server.value.config, groups, serversStore.servers, !!settings.portGroupsOnly);
        if (group) {
            applyPortGroup(server.value.config, group);
        }
    } catch {
        // Keep the default ports.
    }
}

// Global defaults live on the backend (editable via /defaults); fall back to the
// bundled static defaults if they can't be reached rather than blocking the form.
defaultsStore
    .get()
    .then(defaults => {
        server.value = {
            uuid: '',
            isRunning: false,
            playerCount: 0,
            name: defaults.name,
            branch: defaults.branch,
            config: copy(defaults.config),
            startupParameters: copy(defaults.startupParameters)
        };
    })
    .catch(() => {})
    .finally(assignFreePortGroup);
const disabled = computed<boolean>(() => inputViolationCounter.value > 0);
const activeTab = ref<string>('settings');
const configForm = ref<InstanceType<typeof ConfigForm>>();

function goToViolation() {
    const violation = configForm.value?.firstViolation;
    if (!violation) {
        return;
    }
    activeTab.value = violation.tab;
    nextTick(() => configForm.value?.focusViolation(violation.id, violation.subTab));
}

const tabs = [
    { key: 'settings', label: 'Settings' },
    { key: 'mods', label: 'Mods' },
    { key: 'players', label: 'Players', disabled: true },
    { key: 'stats', label: 'Stats', disabled: true },
    { key: 'size', label: 'Size', disabled: true },
    { key: 'logs', label: 'Logs', disabled: true }
];

function addServer() {
    serversStore.add(server.value).then(() => {
        router.push('/servers-list');
    });
}
</script>

<template>
    <main class="form-container">
        <div class="page-header">
            <div>
                <h1>Add server</h1>
                <p>Configure a new Arma Reforger server instance. Import an existing config file to prefill the form.</p>
            </div>
            <div class="header-actions">
                <ConfigUploadDownload v-model:server="server" />
            </div>
        </div>

        <FormTabs v-model="activeTab" :tabs="tabs" />
        <ConfigForm ref="configForm" v-model:inputViolationCounter="inputViolationCounter" v-model:server="server" :tab="activeTab as SettingOrModTab" />

        <div class="form-toolbar">
            <div class="form-toolbar-status">
                <span v-if="disabled" class="dot red"></span>
                <span v-else class="dot green"></span>
                <span v-if="disabled"
                    >Fix {{ inputViolationCounter }} violation{{ inputViolationCounter > 1 ? 's' : '' }} before saving</span
                >
                <span v-else>Ready to add</span>
                <button v-if="disabled" class="btn btn-ghost" type="button" @click="goToViolation">Go to violation</button>
            </div>
            <div class="row">
                <button class="btn btn-ghost" type="button" @click="router.push('/servers-list')">Cancel</button>
                <button class="btn btn-primary" type="button" :disabled @click="addServer">Add server</button>
            </div>
        </div>
    </main>
</template>

<style scoped>
main {
    max-width: 1280px;
    margin: 0 auto;
    padding: 48px var(--gutter) 96px;
}
.page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px 32px;
    margin-bottom: 36px;
}
.page-header h1 {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.02em;
    margin: 0 0 6px;
}
.page-header p {
    margin: 0;
    color: var(--ink-3);
    font-size: 14px;
    max-width: 56ch;
}
.header-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}

@media (max-width: 480px) {
    .page-header h1 {
        font-size: 22px;
    }
}
</style>
