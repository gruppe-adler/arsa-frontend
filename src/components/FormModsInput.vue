<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid';
import { onMounted, ref, watch } from 'vue';
import InfoTooltip from './InfoTooltip.vue';

import Ajv from 'ajv';
import ajvFormats from 'ajv-formats';
import ajvKeywords from 'ajv-keywords';
import { arsModSchema, arsModsetSchema } from '../utils/json-schema';
import { Mod } from '../api/model';
import { useToast } from '../composables/useToast.ts';

const { toast } = useToast();

const ajv = new Ajv({ allErrors: true, useDefaults: true });
ajvFormats(ajv);
ajvKeywords(ajv);

const validateMod = ajv.compile(arsModSchema);
const validateModset = ajv.compile(arsModsetSchema);

const props = defineProps({ readonly: Boolean, name: String, tooltip: String });
const model = defineModel<Mod[]>({ required: true });

const showImportPanel = ref(false);
const showExportPanel = ref(false);
const importText = ref('');
const exportText = ref('');

const selectId = uuidv4();
const modIdInputId = uuidv4();
const nameInputId = uuidv4();
const versionInputId = uuidv4();
const requiredInputId = uuidv4();

const localMods = ref<Mod[]>(Array.from(model.value));

watch(
    model,
    value => {
        localMods.value = Array.from(value);
    },
    { immediate: true }
);

function addMod() {
    const modIdInput = document.getElementById(modIdInputId) as HTMLInputElement;
    const nameInput = document.getElementById(nameInputId) as HTMLInputElement;
    const versionInput = document.getElementById(versionInputId) as HTMLInputElement;
    const requiredInput = document.getElementById(requiredInputId) as HTMLInputElement;

    let version: string | undefined = versionInput?.value || '';
    if (version === '') version = undefined;

    const mod: Mod = {
        modId: modIdInput?.value || '',
        name: nameInput?.value || '',
        version,
        required: requiredInput !== null ? requiredInput.checked : true
    };

    if (!validateMod(mod)) {
        toast.error('Mod validation failed.', ' See browser console for details.');
        // TODO: Rework this when redesigning the Mod/Workshop stuff
        console.log(validateMod.errors);
        return;
    }

    if (mod.version === '') mod.version = undefined;
    localMods.value.push(mod);
    modIdInput.value = '';
    nameInput.value = '';
    versionInput.value = '';
    requiredInput.checked = true;

    setTimeout(() => {
        selectAll();
        model.value = localMods.value;
    }, 0);
}

function removeMod() {
    const select = document.getElementById(selectId) as HTMLSelectElement;
    const indices = Array.from(select.selectedOptions)
        .map(o => o.index)
        .reverse();
    indices.forEach(i => localMods.value.splice(i, 1));
    setTimeout(() => {
        selectAll();
        model.value = localMods.value;
    }, 0);
}

function importModset() {
    const text = importText.value.trim();
    if (!text) return;

    let modset: Mod[] = [];
    try {
        modset = JSON.parse('[' + text + ']');
    } catch {
        toast.error('Not valid JSON', 'See browser console for details.');
        return;
    }
    if (modset.length === 0) return;

    if (!validateModset(modset)) {
        toast.error('Modset validation failed', 'See browser console for details.');
        console.log(validateModset.errors);
        return;
    }

    modset.forEach(mod => {
        if (!mod.required) mod.required = true;
        localMods.value.push(mod);
    });
    importText.value = '';
    showImportPanel.value = false;
    setTimeout(() => {
        selectAll();
        model.value = localMods.value;
    }, 0);
}

function openExport() {
    const json = JSON.stringify(localMods.value, null, 2);
    exportText.value = json.substring(2, json.length - 2);
    showExportPanel.value = true;
    showImportPanel.value = false;
}

function openImport() {
    showImportPanel.value = true;
    showExportPanel.value = false;
}

function selectAll() {
    const select = document.getElementById(selectId) as HTMLSelectElement;
    Array.from(select.options).forEach(o => (o.selected = true));
}

function focusout() {
    setTimeout(() => selectAll(), 1_000);
}

function mod2string(mod: Mod) {
    return `${mod.name}${mod.version ? ' v' + mod.version : ''} (${mod.modId}) ${mod.required ? 'required' : 'optional'}`;
}

onMounted(() => selectAll());
</script>

<template>
    <div class="form-input-container mods-container">
        <label class="form-input-label">
            {{ name }}
            <InfoTooltip v-if="tooltip" :content="tooltip" />
        </label>
        <div class="mods-wrap">
            <!-- Mod list -->
            <select :id="selectId" class="mods-select" size="8" :disabled="props.readonly" multiple @focusout="focusout">
                <option v-for="mod in localMods" :key="mod.modId" :value="mod">{{ mod2string(mod) }}</option>
            </select>

            <!-- Add mod fields -->
            <div v-if="!props.readonly" class="add-mod-fields">
                <div class="add-mod-row">
                    <label class="add-mod-label">modId</label>
                    <input :id="modIdInputId" class="input" type="text" />
                </div>
                <div class="add-mod-row">
                    <label class="add-mod-label">name</label>
                    <input :id="nameInputId" class="input" type="text" />
                </div>
                <div class="add-mod-row">
                    <label class="add-mod-label">version <span class="optional">(optional)</span></label>
                    <input :id="versionInputId" class="input" type="text" />
                </div>
                <div class="add-mod-row">
                    <label class="add-mod-label">required <span class="optional">(optional)</span></label>
                    <input :id="requiredInputId" class="checkbox" type="checkbox" checked />
                </div>
            </div>

            <!-- Action clusters -->
            <div v-if="!props.readonly" class="mods-actions">
                <!-- Add / Delete -->
                <div class="btn-group">
                    <button class="btn" type="button" @click="addMod">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Add mod
                    </button>
                    <button class="btn btn-danger" type="button" @click="removeMod">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                        </svg>
                        Delete selected
                    </button>
                </div>

                <!-- Import / Export modset -->
                <div class="btn-group">
                    <button class="btn" type="button" :class="{ 'has-panel': showImportPanel }" @click="openImport">
                        <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Import modset
                    </button>
                    <button class="btn" type="button" :class="{ 'has-panel': showExportPanel }" @click="openExport">
                        <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 14 12 9 17 14" />
                            <line x1="12" y1="9" x2="12" y2="21" />
                        </svg>
                        Export modset
                    </button>
                </div>
            </div>

            <!-- Import panel -->
            <div v-if="showImportPanel" class="modset-panel">
                <div class="modset-panel-head">
                    <span class="modset-panel-title">Import modeset</span>
                    <button class="btn btn-ghost" type="button" @click="showImportPanel = false">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <p class="modset-panel-desc">Paste a modset JSON array (without outer brackets) from Arma Reforger.</p>
                <textarea v-model="importText" class="modset-textarea" placeholder='{ "modId": "...", "name": "..." },' />
                <div class="modset-panel-foot">
                    <button class="btn btn-ghost" type="button" @click="showImportPanel = false">Cancel</button>
                    <button class="btn btn-primary" type="button" @click="importModset">Apply</button>
                </div>
            </div>

            <!-- Export panel -->
            <div v-if="showExportPanel" class="modset-panel">
                <div class="modset-panel-head">
                    <span class="modset-panel-title">Export modeset</span>
                    <button class="btn btn-ghost" type="button" @click="showExportPanel = false">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <p class="modset-panel-desc">Copy this into Arma Reforger's modset field (no outer brackets).</p>
                <textarea class="modset-textarea" :value="exportText" readonly />
                <div class="modset-panel-foot">
                    <button class="btn btn-primary" type="button" @click="showExportPanel = false">Done</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.mods-container {
    align-items: start;
}

.mods-wrap {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
}

.mods-select {
    width: 100%;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--ink);
    font: inherit;
    font-size: 12.5px;
    font-family: 'Geist Mono', ui-monospace, monospace;
    padding: 4px;
}

/* Add-mod fields */
.add-mod-fields {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--bg-soft);
}
.add-mod-row {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 12px;
    align-items: center;
}
.add-mod-label {
    font-family: 'Geist Mono', ui-monospace, monospace;
    font-size: 12px;
    color: var(--ink-2);
}
.optional {
    color: var(--ink-4);
    font-size: 11px;
}

/* Action row */
.mods-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.btn.has-panel {
    color: var(--indigo);
    border-color: color-mix(in oklab, var(--indigo), transparent 60%);
    background: var(--indigo-soft);
}

/* Modset panel */
.modset-panel {
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    background: var(--bg);
    overflow: hidden;
}
.modset-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--line);
    background: var(--bg-soft);
}
.modset-panel-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--ink);
}
.modset-panel-desc {
    margin: 12px 16px 8px;
    font-size: 12.5px;
    color: var(--ink-3);
}
.modset-textarea {
    display: block;
    width: 100%;
    min-height: 140px;
    border: none;
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    background: var(--bg-sunken);
    color: var(--ink);
    font: inherit;
    font-size: 12px;
    font-family: 'Geist Mono', ui-monospace, monospace;
    padding: 12px 16px;
    resize: vertical;
    outline: none;
}
.modset-panel-foot {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 16px;
}

@media (max-width: 480px) {
    .add-mod-row {
        grid-template-columns: 1fr;
        gap: 4px;
    }
    .mods-actions {
        flex-wrap: wrap;
    }
}
</style>
