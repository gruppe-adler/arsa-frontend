<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { Asset, AssetDetailResponse } from '../api/model';
import { useWorkshopStore } from '../stores/workshop';

const props = defineProps<{
    asset: Asset;
    selectable?: boolean;
}>();

const emit = defineEmits<{
    select: [asset: Asset];
    back: [];
}>();

const store = useWorkshopStore();

const detail = ref<AssetDetailResponse | undefined>(undefined);
const loading = ref(false);

async function load(id: string) {
    loading.value = true;
    detail.value = undefined;
    try {
        detail.value = await store.getDetail(id);
    } finally {
        loading.value = false;
    }
}

onMounted(() => load(props.asset.id));
watch(
    () => props.asset.id,
    id => load(id)
);

const images = computed(() => {
    const d = detail.value?.asset;
    if (!d) return props.asset.previews;
    // Prefer screenshots, fall back to previews.
    return d.screenshots.length > 0 ? d.screenshots : d.previews;
});

function formatBytes(bytes: number): string {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatNumber(n: number): string {
    return n.toLocaleString();
}
</script>

<template>
    <div class="detail">
        <div class="detail-head">
            <button class="btn btn-ghost btn-sm" type="button" @click="emit('back')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to results
            </button>
            <button v-if="selectable" class="btn btn-primary btn-sm" type="button" @click="emit('select', asset)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14" />
                </svg>
                Add to server
            </button>
        </div>

        <div class="detail-title">
            <h2>{{ asset.name }}</h2>
            <span class="detail-author">by {{ asset.author.username }}</span>
        </div>

        <div v-if="loading" class="detail-loading">Loading details…</div>

        <template v-else>
            <!-- Image gallery -->
            <div v-if="images.length > 0" class="gallery">
                <img
                    v-for="(img, idx) in images"
                    :key="idx"
                    :src="img.url"
                    :alt="`${asset.name} preview ${idx + 1}`"
                    class="gallery-img"
                    loading="lazy"
                />
            </div>

            <!-- Stats -->
            <div class="stats">
                <div class="stat">
                    <span class="stat-label">Version</span>
                    <span class="stat-value">{{ asset.currentVersionNumber }}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Size</span>
                    <span class="stat-value">{{ formatBytes(asset.currentVersionSize) }}</span>
                </div>
                <div v-if="detail" class="stat">
                    <span class="stat-label">Game version</span>
                    <span class="stat-value">{{ detail.asset.gameVersion }}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Subscribers</span>
                    <span class="stat-value">{{ formatNumber(asset.subscriberCount) }}</span>
                </div>
                <div v-if="detail" class="stat">
                    <span class="stat-label">Downloads</span>
                    <span class="stat-value">{{ formatNumber(detail.download_total) }}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Rating</span>
                    <span class="stat-value">
                        {{ asset.averageRating.toFixed(1) }}
                        <span class="muted">({{ formatNumber(asset.ratingCount) }})</span>
                    </span>
                </div>
                <div v-if="detail" class="stat">
                    <span class="stat-label">Likes / Dislikes</span>
                    <span class="stat-value">
                        {{ formatNumber(detail.asset.ratings.likes) }} /
                        {{ formatNumber(detail.asset.ratings.dislikes) }}
                    </span>
                </div>
            </div>

            <!-- Tags -->
            <div v-if="asset.tags.length > 0" class="tag-row">
                <span v-for="tag in asset.tags" :key="tag.name" class="badge">{{ tag.name }}</span>
            </div>

            <!-- Summary / description -->
            <div v-if="asset.summary" class="section">
                <h3 class="section-title">Summary</h3>
                <p class="prose">{{ asset.summary }}</p>
            </div>
            <div v-if="detail && detail.asset.description" class="section">
                <h3 class="section-title">Description</h3>
                <p class="prose">{{ detail.asset.description }}</p>
            </div>

            <!-- Changelog -->
            <div v-if="detail && detail.version_detail.changelog" class="section">
                <h3 class="section-title">Changelog ({{ asset.currentVersionNumber }})</h3>
                <pre class="log-block">{{ detail.version_detail.changelog }}</pre>
            </div>

            <!-- Scenarios -->
            <div v-if="detail && detail.version_detail.scenarios.length > 0" class="section">
                <h3 class="section-title">Scenarios</h3>
                <ul class="plain-list">
                    <li v-for="(s, idx) in detail.version_detail.scenarios" :key="idx">
                        {{ s.name }} <span class="muted">— {{ s.gameMode }}</span>
                    </li>
                </ul>
            </div>

            <!-- Dependencies -->
            <div v-if="detail && detail.version_detail.dependencies.length > 0" class="section">
                <h3 class="section-title">Dependencies</h3>
                <ul class="plain-list">
                    <li v-for="(dep, idx) in detail.version_detail.dependencies" :key="idx">
                        {{ dep.asset?.name ?? dep.asset?.id ?? 'Unknown' }}
                        <span v-if="dep.version" class="muted">v{{ dep.version }}</span>
                    </li>
                </ul>
            </div>
        </template>
    </div>
</template>

<style scoped>
.detail {
    display: flex;
    flex-direction: column;
    gap: 18px;
}
.detail-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}
.detail-title {
    display: flex;
    align-items: baseline;
    gap: 12px;
    flex-wrap: wrap;
}
.detail-title h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.02em;
}
.detail-author {
    color: var(--ink-3);
    font-size: 13px;
}
.detail-loading {
    color: var(--ink-3);
    font-size: 14px;
    padding: 24px 0;
}

.gallery {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 6px;
}
.gallery-img {
    height: 200px;
    border-radius: var(--radius);
    border: 1px solid var(--line);
    object-fit: cover;
    flex-shrink: 0;
}

.stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    background: var(--bg-soft);
    padding: 16px;
}
.stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.stat-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--ink-4);
}
.stat-value {
    font-size: 14px;
    font-weight: 500;
    color: var(--ink);
}
.muted {
    color: var(--ink-4);
    font-weight: 400;
}

.tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.section .section-title {
    margin: 0;
}
.prose {
    margin: 0;
    color: var(--ink-2);
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
}
.plain-list {
    margin: 0;
    padding-left: 18px;
    color: var(--ink-2);
    font-size: 14px;
    line-height: 1.7;
}
</style>
