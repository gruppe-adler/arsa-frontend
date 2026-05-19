<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useServersStore } from '../stores/servers';
import { PlayerIdentityId } from '../api/model';

const props = defineProps<{ serverId: string }>();

const serversStore = useServersStore();
const loading = ref(true);
const found = ref(false);
const knownPlayers = ref<PlayerIdentityId[]>([]);

async function load() {
    loading.value = true;
    const players = await serversStore.getKnownPlayers();
    if (players) {
        knownPlayers.value = players;
        found.value = true;
    }
    loading.value = false;
}

watch(() => props.serverId, load, { immediate: true });

const sorted = computed(() => [...knownPlayers.value].sort((a, b) => (a.name < b.name ? -1 : 1)));
</script>

<template>
    <div class="tab-loading" v-if="loading">Loading…</div>
    <template v-else>
        <div class="data-table" v-if="sorted.length > 0">
            <div class="table-row table-head">
                <span>Name</span>
                <span>Identity ID</span>
            </div>
            <div class="table-row" v-for="player in sorted" :key="player.identityId">
                <span class="player-name">{{ player.name }}</span>
                <span class="mono player-id">{{ player.identityId }}</span>
            </div>
        </div>
        <div class="empty-box" v-else>No players recorded yet.</div>
    </template>
</template>

<style scoped>
.tab-loading {
    color: var(--ink-3);
    font-size: 13px;
    padding: 24px 0;
}

.data-table {
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--bg);
}
.table-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    padding: 12px 24px;
    border-bottom: 1px solid var(--line);
    font-size: 13.5px;
}
.table-row:last-child {
    border-bottom: none;
}
.table-row:not(.table-head):hover {
    background: var(--bg-soft);
}
.table-head {
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 600;
    color: var(--ink-3);
    background: var(--bg-soft);
}
.player-name {
    font-weight: 500;
    color: var(--ink);
}
.player-id {
    color: var(--ink-2);
    font-size: 12px;
}

.empty-box {
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    padding: 40px 24px;
    text-align: center;
    color: var(--ink-3);
    font-size: 14px;
    background: var(--bg);
}

@media (max-width: 480px) {
    .table-row {
        padding: 10px 16px;
        gap: 12px;
    }
}
</style>
