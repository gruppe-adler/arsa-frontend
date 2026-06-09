<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid';
import { onMounted, ref, watch, computed } from 'vue';
import InfoTooltip from './InfoTooltip.vue';
import Combobox from './Combobox.vue';
import { useServersStore } from '../stores/servers';
import type { PlayerIdentityId } from '../api/model';
import { useToast } from '../composables/useToast.ts';

const { toast } = useToast();

const serversStore = useServersStore();

const props = defineProps({
    readonly: Boolean,
    name: String,
    tooltip: String,
    optionalParam: Boolean,
    regEx: Array
});
const model = defineModel<string[] | undefined>({ required: true });

const selectId = uuidv4();
const inputId = uuidv4();

const localOptions = ref<string[]>([]);
const knownPlayers = ref<PlayerIdentityId[]>([]);
const selectedPlayer = ref<string>('');

if (model.value) localOptions.value = Array.from(model.value);

watch(
    model,
    value => {
        if (value) localOptions.value = model.value ? Array.from(model.value) : [];
    },
    { immediate: true }
);

// Create a mapping of player names for display
const playerNameMap = computed(() => {
    const map: Record<string, string> = {};
    knownPlayers.value.forEach(player => {
        map[player.identityId] = player.name;
    });
    return map;
});

// Get list of player names for the combobox
const playerNames = computed(() => {
    return knownPlayers.value.map(p => p.name);
});

function addItem() {
    const input: HTMLInputElement = document.getElementById(inputId) as HTMLInputElement;
    if (props.regEx) {
        let hit = 0;
        props.regEx.forEach(e => {
            if (new RegExp(e as string).exec(input.value)) hit++;
        });
        if (hit === 0) {
            toast.error('Malformed string', 'See reference for details.');
            return;
        }
    }
    localOptions.value.push(input.value);
    input.value = '';
    assignNewValue();
}

function addPlayerFromCombobox() {
    // Find the player by name
    const player = knownPlayers.value.find(p => p.name === selectedPlayer.value);
    if (player && !localOptions.value.includes(player.identityId)) {
        localOptions.value.push(player.identityId);
        selectedPlayer.value = '';
        assignNewValue();
    }
}

function removeItem() {
    const select: HTMLSelectElement = document.getElementById(selectId) as HTMLSelectElement;
    localOptions.value.splice(select.selectedIndex, 1);
    assignNewValue();
}

function assignNewValue() {
    setTimeout(() => {
        selectAll();
        if (props.optionalParam && localOptions.value.length === 0) model.value = undefined;
        else model.value = localOptions.value;
    }, 0);
}

function selectAll() {
    const select: HTMLSelectElement = document.getElementById(selectId) as HTMLSelectElement;
    Array.from(select.options).forEach(o => (o.selected = true));
}

function focusout() {
    setTimeout(() => selectAll(), 1_000);
}

onMounted(async () => {
    selectAll();
    const players = await serversStore.getKnownPlayers();
    if (players) {
        knownPlayers.value = players;
    }
});
</script>

<template>
    <div class="form-input-container">
        <label class="form-input-label">
            {{ name }}
            <InfoTooltip v-if="tooltip" :content="tooltip" />
        </label>
        <div class="multiselect-wrap">
            <select :id="selectId" class="multiselect-list" size="5" :disabled="props.readonly" multiple @focusout="focusout">
                <option v-for="option in localOptions" :key="option" :value="option">
                    {{ playerNameMap[option] || option }}
                </option>
            </select>
            <div class="multiselect-controls">
                <input :id="inputId" class="input" type="text" :disabled="props.readonly" />
                <div class="btn-group">
                    <button class="btn" type="button" :disabled="props.readonly" @click="addItem()">Add</button>
                    <button class="btn btn-danger" type="button" :disabled="props.readonly" @click="removeItem()">Delete</button>
                </div>
            </div>
            <div class="player-selector-controls">
                <Combobox v-model="selectedPlayer" :options="playerNames" :readonly="props.readonly" placeholder="Search players..." />
                <button class="btn" type="button" :disabled="props.readonly || !selectedPlayer" @click="addPlayerFromCombobox()">
                    Add Player
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.multiselect-wrap {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.multiselect-list {
    width: 100%;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--ink);
    font: inherit;
    font-size: 13px;
    font-family: 'Geist Mono', ui-monospace, monospace;
    padding: 4px;
}
.multiselect-controls {
    display: flex;
    gap: 8px;
    align-items: center;
}
.multiselect-controls .input {
    flex: 1;
}
.player-selector {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
    background: var(--bg-muted);
    border-radius: var(--radius);
    border: 1px solid var(--line);
}
.player-selector-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--gray-11);
}
.player-selector-controls {
    display: flex;
    gap: 8px;
    align-items: center;
}
.player-selector-controls :deep(div) {
    flex: 1;
}
</style>
