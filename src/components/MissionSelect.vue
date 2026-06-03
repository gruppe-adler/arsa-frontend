<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import InfoTooltip from './InfoTooltip.vue';
import { getWorkshopScenarios } from '../api/backend';
import { Branch, type Mod } from '../api/model';
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

const missions = ref<{ label: string; value: string }[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const selectedMission = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
});

const available = computed(() => missions.value.length > 0);

function extractAssetId(modId: string): string | null {
    if (!modId) return null;
    const trimmed = modId.trim();
    const match = trimmed.match(/([0-9A-Fa-f]{16})/);
    return match ? match[1] : null;
}

async function loadMissions() {
    missions.value = [];
    error.value = null;

    const assetIds = Array.from(new Set(props.mods.map(mod => extractAssetId(mod.modId)).filter((id): id is string => Boolean(id))));

    if (assetIds.length === 0) {
        return;
    }

    loading.value = true;
    try {
        const allScenarios = await Promise.all(
            assetIds.map(async assetId => {
                const response = await getWorkshopScenarios(assetId);
                return response.status === 200 ? response.data.scenarios : [];
            })
        );

        const merged = new Map<string, { label: string; value: string }>();
        allScenarios.flat().forEach(scenario => {
            const value = scenario.gameId;
            if (!merged.has(value)) {
                merged.set(value, {
                    value,
                    label: `${scenario.name} (${scenario.gameId})`
                });
            }
        });

        const missionsTemp = Array.from(merged.values()).sort((a, b) => a.label.localeCompare(b.label));

        const vanillaScenarios = (await scenarioStore.getScenarios(props.branch as Branch)).map(scenario => {
            return {
                label: `${scenario.name} (${scenario.path}) [Vanilla]`,
                value: scenario.path
            };
        });

        missions.value = [...missionsTemp, ...vanillaScenarios];
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
                    <option v-for="mission in missions" :key="mission.value" :value="mission.value">
                        {{ mission.label }}
                    </option>
                </select>
                <p v-if="!available" class="mission-select-hint">No mission scenarios found for the current mod list.</p>
            </div>
        </div>

        <div v-if="available" class="mission-select-list">
            <p class="mission-select-list-title">Available missions</p>
            <ul>
                <li v-for="mission in missions" :key="mission.value">{{ mission.label }}</li>
            </ul>
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

.mission-select-list {
    margin-top: 0.75rem;
    grid-column: 2;
}

.mission-select-list-title {
    margin: 0 0 0.25rem;
    font-size: 0.95rem;
    font-weight: 600;
}

.mission-select-list ul {
    margin: 0;
    padding-left: 1.2rem;
    color: var(--ink);
}

.mission-select-list li {
    margin-bottom: 0.3rem;
    line-height: 1.4;
}
</style>
