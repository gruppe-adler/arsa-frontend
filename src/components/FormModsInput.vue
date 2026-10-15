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
// Full dependency count for the selected mod (not just the ones already in
// the list, unlike highlightedDepIds). Null while nothing is selected or the
// lookup hasn't resolved.
const selectedModDepCount = ref<number | null>(null);

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

function selectAllMods() {
    checkedIds.value = new Set(localMods.value.map(m => m.modId));
}

function clearSelection() {
    checkedIds.value = new Set();
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
        selectedModDepCount.value = null;
        return;
    }

    selectedModId.value = mod.modId;
    highlightedDepIds.value = new Set();
    selectedModDepCount.value = null;

    try {
        const detail = await workshopStore.getDetail(mod.modId);
        const depIds = (detail?.version_detail.dependencies ?? []).map(d => d.asset?.id).filter((id): id is string => !!id);
        highlightedDepIds.value = new Set(depIds.filter(id => localMods.value.some(m => m.modId === id)));
        selectedModDepCount.value = depIds.length;
    } catch {
        // Not a resolvable workshop mod (manually added/local) — nothing to highlight.
    }
}

// Finds mods in `candidates` whose own dependency list includes one of
// `targetIds`, so a removal can warn before orphaning a dependant.
// Candidates that fail to resolve (manually added/local mods) are skipped.
async function findDependents(targetIds: Set<string>, candidates: Mod[]): Promise<Mod[]> {
    const dependents: Mod[] = [];
    await Promise.all(
        candidates.map(async mod => {
            try {
                const detail = await workshopStore.getDetail(mod.modId);
                const depIds = (detail?.version_detail.dependencies ?? []).map(d => d.asset?.id);
                if (depIds.some(id => id && targetIds.has(id))) {
                    dependents.push(mod);
                }
            } catch {
                // Not a resolvable workshop mod — can't tell, skip.
            }
        })
    );
    return dependents;
}

// Resolving a pasted modId reads straight off the clipboard event rather than
// the input's value: the 'paste' event fires before the browser applies the
// paste to the field, so event.target.value would still be the old content.
async function onModIdPaste(event: ClipboardEvent) {
    const pasted = event.clipboardData?.getData('text')?.trim();
    if (!pasted) return;

    try {
        const detail = await workshopStore.getDetail(pasted);
        if (detail?.asset.name) {
            const nameInput = document.getElementById(nameInputId) as HTMLInputElement;
            if (nameInput) nameInput.value = detail.asset.name;
        }
    } catch {
        // Could be a non-workshop id, or the lookup itself failed (network/CORS
        // errors reject here without customFetch's own toast ever firing) —
        // either way, let the user know rather than silently doing nothing.
        toast.error('Could not resolve mod name', `Could not look up a name for ${pasted}. Enter it manually.`);
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

    if (localMods.value.some(m => m.modId === mod.modId)) {
        toast.error('Mod already added', `${mod.name || mod.modId} is already in the list.`);
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

async function removeMod(modId: string) {
    const mod = localMods.value.find(m => m.modId === modId);
    const remaining = localMods.value.filter(m => m.modId !== modId);

    const dependents = await findDependents(new Set([modId]), remaining);
    if (dependents.length > 0) {
        const names = dependents.map(d => d.name).join(', ');
        if (!confirm(`${mod?.name ?? modId} is a dependency of ${names}. Delete it anyway?`)) {
            return;
        }
    }

    localMods.value = remaining;

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

async function removeChecked() {
    const targetIds = new Set(checkedIds.value);
    const remaining = localMods.value.filter(m => !targetIds.has(m.modId));

    const dependents = await findDependents(targetIds, remaining);
    if (dependents.length > 0) {
        const names = dependents.map(d => d.name).join(', ');
        if (!confirm(`One or more selected mods are a dependency of ${names}. Delete them anyway?`)) {
            return;
        }
    }

    localMods.value = remaining;
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

    const existingIds = new Set(localMods.value.map(m => m.modId));
    let skippedCount = 0;
    modset.forEach(mod => {
        if (existingIds.has(mod.modId)) {
            skippedCount++;
            return;
        }
        existingIds.add(mod.modId);
        if (!mod.required) mod.required = true;
        localMods.value.push(mod);
    });
    importText.value = '';
    showImportPanel.value = false;
    if (skippedCount > 0) {
        toast.info('Some mods skipped', `${skippedCount} mod${skippedCount === 1 ? '' : 's'} already in the list.`);
    }
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
            <div v-if="!props.readonly || (selectedModId && selectedModDepCount !== null)" class="mods-list-toolbar">
                <div v-if="!props.readonly" class="toolbar-actions">
                    <button type="button" class="btn btn-ghost" :disabled="localMods.length === 0" @click="selectAllMods">Select all</button>
                    <button type="button" class="btn btn-ghost" :disabled="checkedIds.size === 0" @click="clearSelection">Clear selection</button>
                </div>
                <span v-if="selectedModId && selectedModDepCount !== null" class="dep-count">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.5" />
                        <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L12.5 19.5" />
                    </svg>
                    {{ selectedModDepCount }} dependenc{{ selectedModDepCount === 1 ? 'y' : 'ies' }}
                </span>
            </div>
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
                        <input
                            type="checkbox"
                            class="checkbox"
                            title="Select mod"
                            :checked="isChecked(mod.modId)"
                            @click.stop
                            @change="toggleChecked(mod.modId)"
                        />
                    </span>
                    <span v-else class="col-check"></span>
                    <span class="col-name">
                        <span class="mod-name-line">
                            <svg
                                v-if="highlightedDepIds.has(mod.modId)"
                                class="dep-icon"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                title="This mod is a dependency of the selected mod"
                            >
                                <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.5" />
                                <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L12.5 19.5" />
                            </svg>
                            <span class="mod-name">{{ mod.name }}</span>
                        </span>
                        <span class="id-chip">{{ mod.modId }}</span>
                    </span>
                    <span class="col-required">
                        <label class="switch" :title="isRequired(mod) ? 'Required (click to make optional)' : 'Optional (click to make required)'">
                            <input type="checkbox" :checked="isRequired(mod)" :disabled="props.readonly" @click.stop @change="toggleRequired(mod)" />
                            <span class="switch-track"><span class="switch-thumb"></span></span>
                        </label>
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
                    <input :id="modIdInputId" class="input" type="text" @paste="onModIdPaste" />
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

.mods-list-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    margin-bottom: -2px;
}
.toolbar-actions {
    display: flex;
    gap: 6px;
}
.mods-list-toolbar .btn {
    padding: 4px 8px;
    font-size: 12px;
}
.dep-count {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--amber);
    margin-left: auto;
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
    grid-template-columns: 24px 1fr 70px 108px 28px;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
}

.mods-list-head {
    position: sticky;
    top: 0;
    /* Explicit z-index: rows contain positioned (.switch) elements, which
       would otherwise paint over the sticky header per DOM order. */
    z-index: 2;
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
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: center;
    gap: 2px 8px;
    min-width: 0;
}
/* Name and id always stack on their own line (not just on narrow screens) so
   the id-chip never has to fight the name for horizontal space and overflow
   into neighbouring columns. */
.mod-name-line {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    flex: 1 1 100%;
    min-width: 0;
}
.mod-name {
    min-width: 0;
    white-space: normal;
    word-break: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.dep-icon {
    flex-shrink: 0;
    margin-top: 2px;
    color: var(--amber);
}
.col-name :deep(.id-chip) {
    flex: 1 1 100%;
    min-width: 0;
    max-width: 100%;
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
    min-width: 0;
}
.col-version .badge {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

/* Toggle switch (used for row select + required) */
.switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 30px;
    height: 17px;
    flex-shrink: 0;
    cursor: pointer;
}
.switch input {
    position: absolute;
    inset: 0;
    margin: 0;
    opacity: 0;
    cursor: pointer;
}
.switch-track {
    position: absolute;
    inset: 0;
    border-radius: 999px;
    background: var(--line-strong);
    transition: background 120ms ease;
}
.switch-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: var(--bg);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
    transition: transform 120ms ease;
}
.switch:hover .switch-track {
    background: var(--ink-3);
}
.switch input:checked + .switch-track {
    background: var(--ink);
}
.switch input:checked + .switch-track .switch-thumb {
    transform: translateX(13px);
}
.switch input:disabled {
    cursor: not-allowed;
}
.switch input:disabled + .switch-track {
    opacity: 0.45;
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
        grid-template-columns: 20px 1fr 56px 92px 24px;
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
