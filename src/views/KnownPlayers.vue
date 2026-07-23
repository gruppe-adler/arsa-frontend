<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useServersStore } from '../stores/servers';
import Loading from '../components/Loading.vue';
import NotFound from '../components/NotFound.vue';
import { PlayerIdentityId } from '../api/model';

const router = useRouter();
const loading = ref(true);
const found = ref(false);
const serversStore = useServersStore();

const searchText = ref('');

const knownPlayers = ref<PlayerIdentityId[]>([]);
serversStore.getKnownPlayers().then(players => {
    if (players) {
        knownPlayers.value = players;
        found.value = true;
    }
    loading.value = false;
});

const sortedKnownPlayers = computed((): PlayerIdentityId[] => {
    return (Object.assign([], knownPlayers.value) as PlayerIdentityId[])
        .filter(x => {
            return (
                x.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
                x.identityId.toLowerCase().includes(searchText.value.toLowerCase())
            );
        })
        .sort((a, b) => (a.name < b.name ? -1 : 1));
});
</script>

<template>
    <Loading v-if="loading" />
    <NotFound v-else-if="!found" />
    <main v-else class="page-main">
        <div class="breadcrumb">
            <a @click="router.back()">Server</a>
            <span class="sep">/</span>
            <span>Players</span>
        </div>

        <div class="page-header">
            <div>
                <h1>Known Players</h1>
                <p>All player identities seen across all servers.</p>
            </div>
            <div>
                <input v-model="searchText" class="input search-box" type="text" placeholder="Search players or ids..." />
            </div>
        </div>

        <div v-if="sortedKnownPlayers.length > 0" class="data-table">
            <div class="table-row table-head">
                <span>Name</span>
                <span>Identity ID</span>
            </div>
            <div v-for="player in sortedKnownPlayers" :key="player.identityId" class="table-row">
                <span class="player-name">{{ player.name }}</span>
                <span class="mono player-id">{{ player.identityId }}</span>
            </div>
        </div>
        <div v-else class="empty-box">No players recorded yet.</div>
    </main>
</template>

<style scoped>
.page-main {
    max-width: 1280px;
    margin: 0 auto;
    padding: 48px var(--gutter) 96px;
}
.breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--ink-3);
    margin-bottom: 10px;
}
.breadcrumb a {
    color: var(--ink-3);
    text-decoration: none;
    cursor: pointer;
}
.breadcrumb a:hover {
    color: var(--ink);
}
.breadcrumb .sep {
    color: var(--ink-4);
}
.page-header {
    margin-bottom: 32px;
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
}

.search-box {
    margin: 5px 0px;
    width: 300px;

    padding: 7px 10px;
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
</style>
