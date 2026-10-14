<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid';
import { ref, watch } from 'vue';
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

const modIdInputId = uuidv4();
const nameInputId = uuidv4();
const versionInputId = uuidv4();
const requiredInputId = uuidv4();

const localMods = ref<Mod[]>(Array.from(model.value));
const checkedIds = ref<Set<string>>(new Set());
const selectedModId = ref<string | null>(null);
const highlightedDepIds = ref<Set<string>>(new Set());

watch(
    model,
    value => {
        localMods.value = Array.from(value);
    },
    { immediate: true }
);

function isLocked(mod: Mod): boolean {
    return !!mod.version;
}

function isRequired(mod: Mod): boolean {
    return mod.required !== false;
}

function toggleRequired(mod: Mod) {
    if (props.readonly) return;
    mod.required = !isRequired(mod);
    model.value = localMods.value;
}

function isChecked(modId: string): boolean {
    return checkedIds.value.has(modId);
}

function toggleChecked(modId: string) {
    const next = new Set(checkedIds.value);
    if (next.has(modId)) next.delete(modId);
    else next.add(modId);
    checkedIds.value = next;
}

async function toggleLock(mod: Mod) {
    if (props.readonly) return;

    if (mod.version) {
        mod.version = undefined;
        model.value = localMods.value;
        return;
    }

    try {
        const detail = await workshopStore.getDetail(mod.modId);
        const version = detail?.asset.currentVersionNumber;
        if (!version) {
            toast.error('Cannot lock version', `No workshop version info found for ${mod.name}.`);
            return;
        }
        mod.version = version;
        model.value = localMods.value;
    } catch {
        toast.error('Cannot lock version', `Could not look up the current version for ${mod.name}.`);
    }
}

// Dependency links aren't persisted on Mod, so this is resolved on demand from
// the (cached) workshop detail and matched against mods already in the list.
async function selectMod(mod: Mod) {
    if (selectedModId.value === mod.modId) {
        selectedModId.value = null;
        highlightedDepIds.value = new Set();
        return;
    }

    selectedModId.value = mod.modId;
    highlightedDepIds.value = new Set();

    try {
        const detail = await workshopStore.getDetail(mod.modId);
        const depIds = (detail?.version_detail.dependencies ?? []).map(d => d.asset?.id).filter((id): id is string => !!id);
        highlightedDepIds.value = new Set(depIds.filter(id => localMods.value.some(m => m.modId === id)));
    } catch {
        // Not a resolvable workshop mod (manually added/local) — nothing to highlight.
    }
}

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

    model.value = localMods.value;
}

function removeMod(modId: string) {
    localMods.value = localMods.value.filter(m => m.modId !== modId);

    if (checkedIds.value.has(modId)) {
        const next = new Set(checkedIds.value);
        next.delete(modId);
        checkedIds.value = next;
    }
    if (selectedModId.value === modId) {
        selectedModId.value = null;
        highlightedDepIds.value = new Set();
    }

    model.value = localMods.value;
}

function removeChecked() {
    localMods.value = localMods.value.filter(m => !checkedIds.value.has(m.modId));
    checkedIds.value = new Set();
    selectedModId.value = null;
    highlightedDepIds.value = new Set();
    model.value = localMods.value;
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
    model.value = localMods.value;
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

    // Mods added from the workshop track the latest version by default — the
    // user opts in to locking via the per-row toggle.
    const mod: Mod = {
        modId: asset.id,
        name: asset.name,
        required: true
    };

    localMods.value.push(mod);
    model.value = localMods.value;
    return true;
}

function depToMod(dep: Dependency): Mod | undefined {
    if (!dep.asset) return undefined;
    return {
        modId: dep.asset.id,
        name: dep.asset.name,
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
            model.value = localMods.value;
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
</script>

<template>
    <div class="form-input-container mods-container">
        <label class="form-input-label">
            {{ name }}
            <InfoTooltip v-if="tooltip" :content="tooltip" />
        </label>
        <div class="mods-wrap">
            <!-- Mod list -->
            <div class="mods-list">
                <div class="mods-list-head">
                    <span class="col-check"></span>
                    <span class="col-name">Mod</span>
                    <span class="col-required">Required</span>
                    <span class="col-version">Version</span>
                    <span class="col-actions"></span>
                </div>
                <div v-if="localMods.length === 0" class="mods-list-empty">No mods added yet.</div>
                <div
                    v-for="mod in localMods"
                    :key="mod.modId"
                    class="mods-list-row"
                    :class="{ selected: selectedModId === mod.modId, 'is-dependency': highlightedDepIds.has(mod.modId) }"
                    :title="mod.modId"
                    @click="selectMod(mod)"
                >
                    <span v-if="!props.readonly" class="col-check">
                        <input type="checkbox" class="checkbox" :checked="isChecked(mod.modId)" @click.stop @change="toggleChecked(mod.modId)" />
                    </span>
                    <span v-else class="col-check"></span>
                    <span class="col-name">
                        <span class="mod-name">{{ mod.name }}</span>
                        <span class="id-chip">{{ mod.modId }}</span>
                    </span>
                    <span class="col-required">
                        <input
                            type="checkbox"
                            class="checkbox"
                            :checked="isRequired(mod)"
                            :disabled="props.readonly"
                            @click.stop
                            @change="toggleRequired(mod)"
                        />
                    </span>
                    <span class="col-version">
                        <span class="badge" :class="isLocked(mod) ? 'locked' : 'latest'">{{ isLocked(mod) ? `v${mod.version}` : 'Latest' }}</span>
                        <button
                            v-if="!props.readonly"
                            type="button"
                            class="btn-icon"
                            :class="{ active: isLocked(mod) }"
                            :title="isLocked(mod) ? 'Unlock version (always use latest)' : 'Lock to current version'"
                            @click.stop="toggleLock(mod)"
                        >
                            <svg v-if="isLocked(mod)" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="5" y="11" width="14" height="10" rx="2" />
                                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                            </svg>
                            <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="5" y="11" width="14" height="10" rx="2" />
                                <path d="M8 11V7a4 4 0 0 1 7.5-2" />
                            </svg>
                        </button>
                    </span>
                    <span class="col-actions">
                        <button
                            v-if="!props.readonly"
                            type="button"
                            class="btn-icon btn-icon-danger"
                            title="Remove mod"
                            @click.stop="removeMod(mod.modId)"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                            </svg>
                        </button>
                    </span>
                </div>
            </div>

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
                    <button class="btn btn-danger" type="button" :disabled="checkedIds.size === 0" @click="removeChecked">
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
                            <WorkshopBrowser selectable mission-selectable @select="addFromWorkshop" @set-mission="onSetMission" />
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

/* Mod list */
.mods-list {
    width: 100%;
    height: 240px;
    min-height: 120px;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius);
    background: var(--bg);
    overflow-y: auto;
    resize: vertical;
}

.mods-list-head,
.mods-list-row {
    display: grid;
    grid-template-columns: 24px 1fr 70px 150px 28px;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
}

.mods-list-head {
    position: sticky;
    top: 0;
    font-family: 'Geist Mono', ui-monospace, monospace;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--ink-4);
    background: var(--bg-soft);
    border-bottom: 1px solid var(--line);
}

.mods-list-row {
    font-size: 12.5px;
    color: var(--ink);
    border-bottom: 1px solid var(--line);
    cursor: pointer;
}
.mods-list-row:last-child {
    border-bottom: none;
}
.mods-list-row:hover {
    background: var(--bg-soft);
}
.mods-list-row.selected {
    background: color-mix(in oklab, var(--indigo), transparent 85%);
}
.mods-list-row.is-dependency {
    background: color-mix(in oklab, var(--amber), transparent 88%);
}

.mods-list-empty {
    padding: 20px;
    text-align: center;
    font-size: 12.5px;
    color: var(--ink-4);
}

.col-check,
.col-actions {
    display: flex;
    justify-content: center;
}
.col-name {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
}
.mod-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.col-required {
    display: flex;
    justify-content: center;
}
.col-version {
    display: flex;
    align-items: center;
    gap: 6px;
}

.badge.locked {
    color: var(--amber);
    background: color-mix(in oklab, var(--amber), transparent 85%);
}
.badge.latest {
    color: var(--ink-3);
    background: var(--bg-soft);
}

.btn-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex: none;
    border: 1px solid transparent;
    border-radius: var(--radius);
    background: transparent;
    color: var(--ink-3);
    cursor: pointer;
}
.btn-icon:hover {
    background: var(--bg-soft);
    color: var(--ink);
}
.btn-icon.active {
    color: var(--amber);
}
.btn-icon-danger:hover {
    color: var(--red);
    background: color-mix(in oklab, var(--red), transparent 90%);
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
    .mods-list-head,
    .mods-list-row {
        grid-template-columns: 20px 1fr 56px 120px 24px;
    }
    .add-mod-row {
        grid-template-columns: 1fr;
        gap: 4px;
    }
    .mods-actions {
        flex-wrap: wrap;
    }
}
</style>
