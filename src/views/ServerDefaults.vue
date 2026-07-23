<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { useDefaultsStore } from '../stores/defaults';
import { defaultServer } from '../utils/defaults';
import ConfigForm from '../components/ConfigForm.vue';
import FormTabs from '../components/FormTabs.vue';
import Loading from '../components/Loading.vue';
import { Server } from '../api/model';
import { SettingOrModTab } from '../utils/type.ts';

const defaultsStore = useDefaultsStore();
const loading = ref(true);
const saving = ref(false);
const saved = ref(false);
const server = ref<Server>(Object.assign({}, defaultServer));
const inputViolationCounter = ref(0);
const disabled = computed<boolean>(() => inputViolationCounter.value > 0);
const activeTab = ref<string>('settings');
const configForm = ref<InstanceType<typeof ConfigForm>>();

const tabs = [
    { key: 'settings', label: 'Settings' },
    { key: 'mods', label: 'Mods' }
];

defaultsStore.get().then(defaults => {
    server.value = {
        uuid: '',
        isRunning: false,
        playerCount: 0,
        name: defaults.name,
        branch: defaults.branch,
        config: defaults.config,
        startupParameters: defaults.startupParameters
    };
    loading.value = false;
});

function goToViolation() {
    const violation = configForm.value?.firstViolation;
    if (!violation) {
        return;
    }
    activeTab.value = violation.tab;
    nextTick(() => configForm.value?.focusViolation(violation.id, violation.subTab));
}

function save() {
    saving.value = true;
    defaultsStore
        .update({
            name: server.value.name,
            branch: server.value.branch,
            config: server.value.config,
            startupParameters: server.value.startupParameters
        })
        .then(() => {
            saved.value = true;
            setTimeout(() => (saved.value = false), 1400);
        })
        .finally(() => (saving.value = false));
}
</script>

<template>
    <Loading v-if="loading" />
    <main v-else class="form-container">
        <div class="page-header">
            <div>
                <h1>Server defaults</h1>
                <p>The baseline configuration used to prefill the &quot;Add server&quot; form for everyone. Changes here don't affect existing servers.</p>
            </div>
        </div>

        <FormTabs v-model="activeTab" :tabs="tabs" />
        <ConfigForm
            ref="configForm"
            v-model:inputViolationCounter="inputViolationCounter"
            v-model:server="server"
            :tab="activeTab as SettingOrModTab"
        />

        <div class="form-toolbar">
            <div class="form-toolbar-status">
                <span v-if="disabled" class="dot red"></span>
                <span v-else class="dot green"></span>
                <span v-if="disabled"
                    >Fix {{ inputViolationCounter }} violation{{ inputViolationCounter > 1 ? 's' : '' }} before saving</span
                >
                <span v-else-if="saved">Saved</span>
                <span v-else>Ready to save</span>
                <button v-if="disabled" class="btn btn-ghost" type="button" @click="goToViolation">Go to violation</button>
            </div>
            <div class="row">
                <button class="btn btn-primary" type="button" :disabled="disabled || saving" @click="save">
                    {{ saving ? 'Saving…' : 'Save defaults' }}
                </button>
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

@media (max-width: 480px) {
    .page-header h1 {
        font-size: 22px;
    }
}
</style>
