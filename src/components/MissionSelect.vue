<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import InfoTooltip from './InfoTooltip.vue';
import { Branch, ScenarioEntry, type Mod } from '../api/model';
import { useScenarioStore } from '../stores/scenarios.ts';

const scenarioStore = useScenarioStore();

const props = defineProps({
    readonly: Boolean,
    name: { type: String, default: 'scenarioId' },
    tooltip: { type: String, default: 'Select a mission from the workshop assets listed in the server mods.' },
    modelValue: { type: String, required: true },
    branch: { type: String, default: 'stable' },
    mods: { type: Array as () => Mod[], default: () => [] }
});
const emit = defineEmits(['update:modelValue']);

const missions = ref<ScenarioEntry[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
/** Names of mods whose scenarios couldn't be loaded (e.g. no longer on the workshop). */
const unresolvedMods = ref<string[]>([]);

const selectedMission = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
});

const available = computed(() => missions.value.length > 0);

const selectedMissionEntry = computed(() => missions.value.find(m => m.path === props.modelValue));

function extractAssetId(modId: string): string | null {
    if (!modId) return null;
    const trimmed = modId.trim();
    const match = trimmed.match(/([0-9A-Fa-f]{16})/);
    return match ? match[1] : null;
}

async function loadMissions() {
    missions.value = [];
    error.value = null;
    unresolvedMods.value = [];

    // asset id -> display name of the first mod that references it
    const assets = new Map<string, string>();
    for (const mod of props.mods) {
        const id = extractAssetId(mod.modId);
        if (id && !assets.has(id)) assets.set(id, mod.name || id);
    }

    loading.value = true;
    try {
        // Settle each mod on its own: one asset the workshop doesn't know (deleted, private, typo)
        // must not hide the scenarios of every other mod and the vanilla ones.
        const results = await Promise.allSettled([...assets.keys()].map(assetId => scenarioStore.getModScenarios(assetId)));

        const modScenarios: ScenarioEntry[] = [];
        const unresolved: string[] = [];
        [...assets.values()].forEach((name, i) => {
            const result = results[i];
            if (result.status === 'fulfilled') modScenarios.push(...result.value);
            else unresolved.push(name);
        });
        modScenarios.sort((a, b) => a.name.localeCompare(b.name));
        unresolvedMods.value = unresolved;

        const vanillaScenarios = await scenarioStore.getScenarios(props.branch as Branch);

        missions.value = [...modScenarios, ...vanillaScenarios];
    } catch (err) {
        error.value = err instanceof Error ? err.message : String(err);
    } finally {
        loading.value = false;
    }
}

watch(
    () => props.mods,
    async () => {
        await loadMissions();
    },
    { immediate: true, deep: true }
);

onMounted(loadMissions);
</script>

<template>
    <div class="form-input-container">
        <label class="form-input-label">
            {{ name }}
            <InfoTooltip v-if="tooltip" :content="tooltip" />
        </label>

        <div class="mission-select-control">
            <div v-if="loading" class="mission-select-status">Loading missions...</div>
            <div v-else-if="error" class="mission-select-status mission-select-error">{{ error }}</div>
            <div v-else>
                <select v-model="selectedMission" :disabled="props.readonly || !available">
                    <option value="" disabled>Select a vanilla mission or a mission from installed mods</option>
                    <option v-for="mission in missions" :key="mission.path" :value="mission.path">
                        {{ mission.name }}
                    </option>
                </select>
                <p v-if="selectedMissionEntry" class="mission-select-path">{{ selectedMissionEntry.path }}</p>
                <p v-if="!available" class="mission-select-hint">No mission scenarios found for the current mod list.</p>
                <p v-if="unresolvedMods.length > 0" class="mission-select-warning">
                    Couldn't load scenarios for {{ unresolvedMods.join(', ') }}. The mod may have been removed from the workshop.
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.mission-select-control {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.mission-select-status {
    font-size: 0.95rem;
    color: var(--ink);
}

.mission-select-error {
    color: var(--red);
}

.mission-select-hint {
    margin: 0;
    color: var(--ink);
    font-size: 0.9rem;
}

.mission-select-warning {
    margin: 0;
    color: var(--amber);
    font-size: 0.9rem;
}

.mission-select-path {
    margin: 0;
    color: var(--ink-3);
    font-size: 0.8rem;
    font-family: 'Geist Mono', ui-monospace, monospace;
}
</style>
