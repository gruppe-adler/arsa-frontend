<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Asset, GetWorkshopSort } from '../api/model';
import { useWorkshopStore } from '../stores/workshop';
import WorkshopAssetDetail from './WorkshopAssetDetail.vue';

defineProps<{
    selectable?: boolean;
}>();

const emit = defineEmits<{
    select: [asset: Asset];
}>();

const store = useWorkshopStore();

const searchInput = ref('');
const sort = ref<GetWorkshopSort>('newest');
const selectedAsset = ref<Asset | null>(null);

const sortOptions: { value: GetWorkshopSort; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'subscribers', label: 'Subscribers' },
    { value: 'version_size', label: 'Size' }
];

async function runSearch(page = 1) {
    await store.runSearch({
        search: searchInput.value.trim() || null,
        sort: sort.value,
        page
    });
}

function onSubmit() {
    runSearch(1);
}

function prevPage() {
    if (store.page > 1) runSearch(store.page - 1);
}
function nextPage() {
    if (store.page < store.totalPages) runSearch(store.page + 1);
}

function openDetail(asset: Asset) {
    selectedAsset.value = asset;
}
function closeDetail() {
    selectedAsset.value = null;
}

function thumbnail(asset: Asset): string | undefined {
    return asset.previews[0]?.url;
}

function formatNumber(n: number): string {
    return n.toLocaleString();
}

onMounted(() => {
    // Initialise from the store so re-opening the browser keeps prior results.
    searchInput.value = store.searchTerm;
    sort.value = store.sort;
    if (store.assets.length === 0) {
        runSearch(1);
    }
});
</script>

<template>
    <div class="browser">
        <!-- Detail view -->
        <WorkshopAssetDetail
            v-if="selectedAsset"
            :asset="selectedAsset"
            :selectable="selectable"
            @back="closeDetail"
            @select="emit('select', $event)"
        />

        <!-- Search + results -->
        <template v-else>
            <form class="search-bar" @submit.prevent="onSubmit">
                <div class="search-field">
                    <svg
                        class="search-icon"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <circle cx="11" cy="11" r="7" />
                        <path d="M21 21l-4.3-4.3" />
                    </svg>
                    <input
                        v-model="searchInput"
                        class="search-input"
                        type="text"
                        placeholder="Search the Arma Reforger Workshop…"
                    />
                    <button
                        v-if="searchInput"
                        type="button"
                        class="search-clear"
                        aria-label="Clear search"
                        @click="((searchInput = ''), onSubmit())"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <select v-model="sort" class="select-input sort-select" @change="onSubmit">
                    <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
                <button class="btn btn-primary search-btn" type="submit">Search</button>
            </form>

            <div v-if="store.loading" class="state-msg">Searching…</div>
            <div v-else-if="store.error" class="state-msg state-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <path d="M12 9v4M12 17h.01" />
                </svg>
                <div>
                    <p class="state-title">Couldn't reach the workshop service</p>
                    <p class="state-sub">The backend may be offline. Check your connection and try again.</p>
                </div>
                <button class="btn btn-sm" type="button" @click="runSearch(store.page)">Retry</button>
            </div>
            <div v-else-if="store.assets.length === 0" class="state-msg">No assets found.</div>

            <template v-else>
                <div class="results-meta">{{ formatNumber(store.totalCount) }} results</div>
                <div class="grid">
                    <button
                        v-for="asset in store.assets"
                        :key="asset.id"
                        type="button"
                        class="card"
                        @click="openDetail(asset)"
                    >
                        <div class="card-thumb">
                            <img v-if="thumbnail(asset)" :src="thumbnail(asset)" :alt="asset.name" loading="lazy" />
                            <div v-else class="card-thumb-empty"></div>
                        </div>
                        <div class="card-body">
                            <h3 class="card-name">{{ asset.name }}</h3>
                            <p class="card-summary">{{ asset.summary }}</p>
                            <div class="card-meta">
                                <span class="card-author">{{ asset.author.username }}</span>
                                <span class="card-stats">
                                    ★ {{ asset.averageRating.toFixed(1) }}
                                    · ▼ {{ formatNumber(asset.subscriberCount) }}
                                </span>
                            </div>
                        </div>
                        <button
                            v-if="selectable"
                            type="button"
                            class="btn btn-primary btn-sm card-add"
                            @click.stop="emit('select', asset)"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            Add
                        </button>
                    </button>
                </div>

                <div class="pagination">
                    <button class="btn btn-sm" type="button" :disabled="store.page <= 1" @click="prevPage">Previous</button>
                    <span class="page-info">Page {{ store.page }} of {{ store.totalPages }}</span>
                    <button class="btn btn-sm" type="button" :disabled="store.page >= store.totalPages" @click="nextPage">
                        Next
                    </button>
                </div>
            </template>
        </template>
    </div>
</template>

<style scoped>
.browser {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.search-bar {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 10px;
    align-items: stretch;
}

.search-field {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 0;
}
.search-icon {
    position: absolute;
    left: 14px;
    color: var(--ink-4);
    pointer-events: none;
}
.search-input {
    width: 100%;
    height: 44px;
    box-sizing: border-box;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-lg);
    background: var(--bg);
    color: var(--ink);
    font: inherit;
    font-size: 15px;
    padding: 0 40px 0 42px;
}
.search-input::placeholder {
    color: var(--ink-4);
}
.search-input:focus {
    outline: 2px solid color-mix(in oklab, var(--indigo), transparent 70%);
    outline-offset: -1px;
    border-color: var(--indigo);
}
.search-clear {
    position: absolute;
    right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: var(--radius);
    background: transparent;
    color: var(--ink-4);
    cursor: pointer;
}
.search-clear:hover {
    background: var(--bg-soft);
    color: var(--ink);
}

.sort-select {
    width: 140px;
    height: 44px;
    box-sizing: border-box;
    border-radius: var(--radius-lg);
}
.search-btn {
    height: 44px;
    padding: 0 22px;
    border-radius: var(--radius-lg);
}

@media (max-width: 560px) {
    .search-bar {
        grid-template-columns: 1fr;
    }
    .sort-select,
    .search-btn {
        width: 100%;
    }
}

.state-msg {
    color: var(--ink-3);
    font-size: 14px;
    padding: 32px 0;
    text-align: center;
}
.state-error {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    text-align: left;
    color: var(--red);
    border: 1px solid color-mix(in oklab, var(--red), transparent 70%);
    border-radius: var(--radius-lg);
    background: var(--red-soft);
    padding: 20px 24px;
}
.state-error svg {
    flex-shrink: 0;
}
.state-error .state-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
}
.state-error .state-sub {
    margin: 2px 0 0;
    font-size: 13px;
    color: var(--ink-3);
}
.state-error .btn {
    flex-shrink: 0;
    margin-left: auto;
}
.results-meta {
    font-size: 12px;
    color: var(--ink-4);
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 14px;
}

.card {
    position: relative;
    display: flex;
    flex-direction: column;
    text-align: left;
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    background: var(--bg);
    overflow: hidden;
    cursor: pointer;
    padding: 0;
    font: inherit;
    color: inherit;
    transition: border-color 0.12s, box-shadow 0.12s;
}
.card:hover {
    border-color: var(--line-strong);
    box-shadow: 0 0 16px rgba(0, 0, 0, 0.06);
}

.card-thumb {
    aspect-ratio: 16 / 9;
    background: var(--bg-sunken);
}
.card-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}
.card-thumb-empty {
    width: 100%;
    height: 100%;
}

.card-body {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 14px 14px;
}
.card-name {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.3;
}
.card-summary {
    margin: 0;
    font-size: 13px;
    color: var(--ink-3);
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.card-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 2px;
    font-size: 12px;
    color: var(--ink-4);
}
.card-author {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.card-stats {
    flex-shrink: 0;
}
.card-add {
    position: absolute;
    top: 8px;
    right: 8px;
}

.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 8px;
}
.page-info {
    font-size: 13px;
    color: var(--ink-3);
}
</style>
