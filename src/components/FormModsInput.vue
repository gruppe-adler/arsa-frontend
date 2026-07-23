<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid';
import { onMounted, ref, watch } from 'vue';
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogClose } from 'reka-ui';
import InfoTooltip from './InfoTooltip.vue';

import Ajv from 'ajv';
import ajvFormats from 'ajv-formats';
import ajvKeywords from 'ajv-keywords';
import { arsModSchema, arsModsetSchema } from '../utils/json-schema';
import { Asset, Dependency, Mod, ScenarioEntry } from '../api/model';
import { useToast } from '../composables/useToast.ts';
import { useWorkshopStore } from '../stores/workshop';
import WorkshopBrowser from './WorkshopBrowser.vue';

const { toast } = useToast();
const workshopStore = useWorkshopStore();

const ajv = new Ajv({ allErrors: true, useDefaults: true });
ajvFormats(ajv);
ajvKeywords(ajv);

const validateMod = ajv.compile(arsModSchema);
const validateModset = ajv.compile(arsModsetSchema);

const props = defineProps({ readonly: Boolean, name: String, tooltip: String });
const model = defineModel<Mod[]>({ required: true });
const emit = defineEmits<{ 'set-scenario': [path: string] }>();

const showImportPanel = ref(false);
const showExportPanel = ref(false);
const showWorkshopPanel = ref(false);
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
    showWorkshopPanel.value = false;
}

function openImport() {
    showImportPanel.value = true;
    showExportPanel.value = false;
    showWorkshopPanel.value = false;
}

function openWorkshop() {
    showWorkshopPanel.value = true;
    showImportPanel.value = false;
    showExportPanel.value = false;
}

function ensureModPresent(asset: Asset): boolean {
    if (localMods.value.some(m => m.modId === asset.id)) {
        return false;
    }

    const mod: Mod = {
        modId: asset.id,
        name: asset.name,
        version: asset.currentVersionNumber || undefined,
        required: true
    };

    localMods.value.push(mod);
    setTimeout(() => {
        selectAll();
        model.value = localMods.value;
    }, 0);
    return true;
}

function depToMod(dep: Dependency): Mod | undefined {
    if (!dep.asset) return undefined;
    return {
        modId: dep.asset.id,
        name: dep.asset.name,
        version: dep.version || undefined,
        required: true
    };
}

// The Workshop API only returns one level of dependencies per asset (a
// dependency's own `dependencies` field always comes back empty), so the
// transitive closure has to be walked by fetching each newly-discovered
// dependency's own detail in turn. Dedup by id guards against diamond
// dependencies and cycles.
async function resolveDependencyMods(initialDeps: Dependency[]): Promise<Mod[]> {
    const resolved = new Map<string, Mod>();
    const seen = new Set<string>();
    const queue: Dependency[] = [...initialDeps];

    while (queue.length > 0) {
        const dep = queue.shift()!;
        const id = dep.asset?.id;
        if (!id || seen.has(id)) continue;
        seen.add(id);

        const mod = depToMod(dep);
        if (mod) resolved.set(id, mod);

        try {
            const detail = await workshopStore.getDetail(id);
            if (detail) queue.push(...detail.version_detail.dependencies);
        } catch {
            // Best-effort: skip this branch's further dependencies if the lookup fails.
        }
    }

    return Array.from(resolved.values());
}

async function addDependenciesFor(asset: Asset): Promise<number> {
    let addedCount = 0;
    try {
        const detail = await workshopStore.getDetail(asset.id);
        const depMods = await resolveDependencyMods(detail?.version_detail.dependencies ?? []);
        depMods.forEach(mod => {
            if (!localMods.value.some(m => m.modId === mod.modId)) {
                localMods.value.push(mod);
                addedCount++;
            }
        });
        if (addedCount > 0) {
            setTimeout(() => {
                selectAll();
                model.value = localMods.value;
            }, 0);
        }
    } catch {
        toast.error('Dependency lookup failed', `Could not resolve dependencies for ${asset.name}. Add them manually if needed.`);
    }
    return addedCount;
}

async function addFromWorkshop(asset: Asset) {
    if (!ensureModPresent(asset)) {
        toast.info('Mod already added', `${asset.name} is already in the list.`);
        return;
    }

    const addedCount = await addDependenciesFor(asset);
    toast.info(
        'Mod added',
        addedCount > 0
            ? `${asset.name} was added, plus ${addedCount} dependenc${addedCount === 1 ? 'y' : 'ies'}.`
            : `${asset.name} was added to the mod list.`
    );
}

async function onSetMission({ asset, scenario }: { asset: Asset; scenario: ScenarioEntry }) {
    const wasAdded = ensureModPresent(asset);
    emit('set-scenario', scenario.path);
    showWorkshopPanel.value = false;

    if (wasAdded) {
        const addedCount = await addDependenciesFor(asset);
        toast.info(
            'Mission set',
            addedCount > 0
                ? `${scenario.name} is now the mission scenario. Added ${asset.name} plus ${addedCount} dependenc${addedCount === 1 ? 'y' : 'ies'}.`
                : `${scenario.name} is now the mission scenario.`
        );
    } else {
        toast.info('Mission set', `${scenario.name} is now the mission scenario.`);
    }
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

                <!-- Workshop search -->
                    <button class="btn" type="button" :class="{ 'has-panel': showWorkshopPanel }" @click="openWorkshop">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="7" />
                            <path d="M21 21l-4.3-4.3" />
                        </svg>
                        Search workshop
                    </button>

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

            <!-- Workshop search overlay -->
            <DialogRoot v-model:open="showWorkshopPanel">
                <DialogPortal>
                    <DialogOverlay class="workshop-dialog-overlay" />
                    <DialogContent class="workshop-dialog-content">
                        <div class="modset-panel-head">
                            <DialogTitle class="modset-panel-title">Search workshop</DialogTitle>
                            <DialogClose class="btn btn-ghost" type="button">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </DialogClose>
                        </div>
                        <div class="workshop-panel-body">
                            <WorkshopBrowser selectable @select="addFromWorkshop" @set-mission="onSetMission" />
                        </div>
                    </DialogContent>
                </DialogPortal>
            </DialogRoot>
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

/* Workshop search overlay */
.workshop-dialog-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background-color: var(--bg-sunken);
    animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
}
.workshop-dialog-content {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1001;
    display: flex;
    flex-direction: column;
    width: 96vw;
    height: 92vh;
    border-radius: var(--radius-lg);
    background-color: var(--bg);
    box-shadow:
        hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
        hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
    overflow: hidden;
    animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
}
.workshop-dialog-content:focus {
    outline: none;
}
.workshop-panel-body {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
}

@keyframes overlayShow {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
@keyframes contentShow {
    from {
        opacity: 0;
        transform: translate(-50%, -48%) scale(0.96);
    }
    to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
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
