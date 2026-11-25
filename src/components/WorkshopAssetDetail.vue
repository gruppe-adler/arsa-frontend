<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import {
    PopoverRoot,
    PopoverTrigger,
    PopoverPortal,
    PopoverContent,
    DialogRoot,
    DialogPortal,
    DialogOverlay,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose
} from 'reka-ui';
import { Asset, AssetDetailResponse, ScenarioEntry } from '../api/model';
import { useWorkshopStore } from '../stores/workshop';
import { depIdsOf, reforgerWorkshopUrl } from '../utils/workshop';
import DependencyBullets from './DependencyBullets.vue';

const props = defineProps<{
    asset: Asset;
    selectable?: boolean;
    missionSelectable?: boolean;
    /** modIds already configured on the server this detail view was opened from, used to mark dependencies as already installed. */
    installedModIds?: string[];
}>();

const emit = defineEmits<{
    select: [asset: Asset];
    setMission: [payload: { asset: Asset; scenario: ScenarioEntry }];
    back: [];
}>();

const store = useWorkshopStore();

const detail = ref<AssetDetailResponse | undefined>(undefined);
const loading = ref(false);
const copyState = ref<'idle' | 'copied'>('idle');
let copyTimer: ReturnType<typeof setTimeout>;

async function copyId() {
    try {
        await navigator.clipboard.writeText(props.asset.id);
    } catch {
        return;
    }
    copyState.value = 'copied';
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
        copyState.value = 'idle';
    }, 1400);
}

// Incremented per load so a response for an asset we've since moved away from is dropped.
let loadSeq = 0;

async function load(id: string) {
    const seq = ++loadSeq;
    loading.value = true;
    detail.value = undefined;
    try {
        const result = await store.getDetail(id);
        if (seq === loadSeq) detail.value = result;
    } catch {
        // Leave detail unset: the view falls back to the search-result data (previews, stats).
    } finally {
        if (seq === loadSeq) loading.value = false;
    }
}

onMounted(() => load(props.asset.id));
watch(
    () => props.asset.id,
    id => load(id)
);

const scenarioEntries = computed<ScenarioEntry[]>(
    () => detail.value?.version_detail.scenarios.map(s => ({ name: s.name, path: s.gameId })) ?? []
);

const images = computed(() => {
    const d = detail.value?.asset;
    if (!d) return props.asset.previews;
    // Prefer screenshots, fall back to previews.
    return d.screenshots.length > 0 ? d.screenshots : d.previews;
});

// Lightbox: index of the image being viewed full-size, or null when closed.
const lightboxIndex = ref<number | null>(null);
const lightboxOpen = computed({
    get: () => lightboxIndex.value !== null,
    set: open => {
        if (!open) lightboxIndex.value = null;
    }
});
const lightboxImage = computed(() => (lightboxIndex.value === null ? undefined : images.value[lightboxIndex.value]));

// The thumbnail that opened the lightbox. The DialogRoot has no DialogTrigger,
// so focus has to be handed back to it manually on close.
let lightboxOpener: HTMLElement | null = null;

function openLightbox(idx: number, e: MouseEvent) {
    lightboxOpener = e.currentTarget instanceof HTMLElement ? e.currentTarget : null;
    lightboxIndex.value = idx;
}
function onLightboxCloseAutoFocus(e: Event) {
    const opener = lightboxOpener;
    lightboxOpener = null;
    // The thumbnail may be gone if the asset changed while the lightbox was open.
    if (opener?.isConnected) {
        e.preventDefault();
        opener.focus();
    }
}
function stepLightbox(delta: number) {
    if (lightboxIndex.value === null || images.value.length === 0) return;
    const n = images.value.length;
    lightboxIndex.value = (lightboxIndex.value + delta + n) % n;
}
function onLightboxKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepLightbox(-1);
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepLightbox(1);
    }
}
// Switching asset closes the lightbox.
watch(
    () => props.asset.id,
    () => {
        lightboxIndex.value = null;
    }
);
// The list also changes when the detail arrives (search-result previews ->
// screenshots). Keep the lightbox open: stay on the same image if the new list
// has it, otherwise clamp to the new length.
watch(images, (next, prev) => {
    if (lightboxIndex.value === null) return;
    if (next.length === 0) {
        lightboxIndex.value = null;
        return;
    }
    const url = prev[lightboxIndex.value]?.url;
    const same = next.findIndex(img => img.url === url);
    lightboxIndex.value = same >= 0 ? same : Math.min(lightboxIndex.value, next.length - 1);
});

const installedSet = computed(() => new Set(props.installedModIds ?? []));

function isDepInstalled(dep: { asset?: { id: string } }): boolean {
    return !!dep.asset && installedSet.value.has(dep.asset.id);
}

// No server context (e.g. the standalone /workshop page) means there's
// nothing to compare against — don't claim every dependency is "missing".
const dependencyIds = computed(() => (props.installedModIds === undefined ? [] : depIdsOf(detail.value)));

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
            <div class="detail-head-actions">
                <a
                    class="btn btn-sm"
                    :href="reforgerWorkshopUrl(asset.id)"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open this asset on the official Reforger Workshop"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <path d="M15 3h6v6M10 14L21 3" />
                    </svg>
                    Reforger Workshop
                </a>
                <button
                    v-if="missionSelectable && scenarioEntries.length === 1"
                    type="button"
                    class="btn btn-sm"
                    @click="emit('setMission', { asset, scenario: scenarioEntries[0] })"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    Set as mission
                </button>
                <PopoverRoot v-else-if="missionSelectable && scenarioEntries.length > 1">
                    <PopoverTrigger class="btn btn-sm">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 11l3 3L22 4" />
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                        Set as mission
                    </PopoverTrigger>
                    <PopoverPortal>
                        <PopoverContent class="mission-popover-content" position="popper" :sideOffset="4">
                            <button
                                v-for="scenario in scenarioEntries"
                                :key="scenario.path"
                                type="button"
                                class="mission-popover-item"
                                @click="emit('setMission', { asset, scenario })"
                            >
                                {{ scenario.name }}
                            </button>
                        </PopoverContent>
                    </PopoverPortal>
                </PopoverRoot>
                <span v-if="selectable && installedSet.has(asset.id)" class="btn btn-sm btn-added">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Added
                </span>
                <button v-else-if="selectable" class="btn btn-primary btn-sm" type="button" @click="emit('select', asset)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add to server
                </button>
            </div>
        </div>

        <div class="detail-title">
            <h2>{{ asset.name }}</h2>
            <span class="detail-author">by {{ asset.author.username }}</span>
            <button
                class="id-chip"
                type="button"
                :class="{ copied: copyState === 'copied' }"
                :title="copyState === 'copied' ? 'Copied!' : 'Click to copy workshop ID'"
                @click="copyId"
            >
                <span class="id-label">{{ asset.id }}</span>
                <svg
                    v-if="copyState === 'idle'"
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <svg
                    v-else
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M5 12l5 5L20 7" />
                </svg>
            </button>
        </div>

        <div v-if="loading" class="detail-loading">Loading details…</div>

        <template v-else>
            <!-- Image gallery -->
            <div v-if="images.length > 0" class="gallery">
                <div v-for="(img, idx) in images" :key="idx" class="gallery-item">
                    <button
                        type="button"
                        class="gallery-thumb"
                        :aria-label="`View image ${idx + 1} of ${images.length} full size`"
                        @click="openLightbox(idx, $event)"
                    >
                        <img :src="img.url" :alt="`${asset.name} preview ${idx + 1}`" class="gallery-img" loading="lazy" />
                    </button>
                    <DependencyBullets v-if="idx === 0" :dep-ids="dependencyIds" :installed-ids="installedSet" />
                </div>
            </div>

            <!-- Lightbox -->
            <DialogRoot v-model:open="lightboxOpen">
                <DialogPortal>
                    <DialogOverlay class="lightbox-overlay" />
                    <DialogContent
                        class="lightbox"
                        @keydown="onLightboxKeydown"
                        @click.self="lightboxOpen = false"
                        @close-auto-focus="onLightboxCloseAutoFocus"
                    >
                        <DialogTitle class="sr-only">{{ asset.name }} images</DialogTitle>
                        <DialogDescription class="sr-only">Use the left and right arrow keys to browse images.</DialogDescription>

                        <img
                            v-if="lightboxImage"
                            :key="lightboxImage.url"
                            :src="lightboxImage.url"
                            :alt="`${asset.name} image ${(lightboxIndex ?? 0) + 1}`"
                            class="lightbox-img"
                        />

                        <DialogClose class="lightbox-btn lightbox-close" aria-label="Close">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </DialogClose>

                        <template v-if="images.length > 1">
                            <button type="button" class="lightbox-btn lightbox-prev" aria-label="Previous image" @click="stepLightbox(-1)">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>
                            <button type="button" class="lightbox-btn lightbox-next" aria-label="Next image" @click="stepLightbox(1)">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </button>
                            <span class="lightbox-counter">{{ (lightboxIndex ?? 0) + 1 }} / {{ images.length }}</span>
                        </template>
                    </DialogContent>
                </DialogPortal>
            </DialogRoot>

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
                <ul class="scenario-list">
                    <li v-for="(s, idx) in detail.version_detail.scenarios" :key="idx" class="scenario-item">
                        <span>{{ s.name }} <span v-if="s.gameMode" class="muted">— {{ s.gameMode }}</span></span>
                        <button
                            v-if="missionSelectable"
                            type="button"
                            class="btn btn-sm"
                            @click="emit('setMission', { asset, scenario: { name: s.name, path: s.gameId } })"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 11l3 3L22 4" />
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                            </svg>
                            Set as mission
                        </button>
                    </li>
                </ul>
            </div>

            <!-- Dependencies -->
            <div v-if="detail && detail.version_detail.dependencies.length > 0" class="section">
                <h3 class="section-title">Dependencies</h3>
                <ul class="plain-list">
                    <li
                        v-for="(dep, idx) in detail.version_detail.dependencies"
                        :key="idx"
                        :class="{ 'dep-installed': isDepInstalled(dep) }"
                    >
                        {{ dep.asset?.name ?? dep.asset?.id ?? 'Unknown' }}
                        <span v-if="dep.version" class="muted">v{{ dep.version }}</span>
                        <span v-if="isDepInstalled(dep)" class="dep-installed-label">— already installed</span>
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
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}
.detail-head-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
}

.mission-popover-item {
    display: block;
    width: 100%;
    text-align: left;
    border: none;
    border-radius: var(--radius);
    background: transparent;
    color: var(--ink);
    font: inherit;
    font-size: 13px;
    padding: 8px 10px;
    cursor: pointer;
}
.mission-popover-item:hover {
    background: var(--bg-soft);
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
.gallery-item {
    position: relative;
    flex-shrink: 0;
}
.gallery-thumb {
    display: block;
    padding: 0;
    border: none;
    background: none;
    border-radius: var(--radius);
    cursor: zoom-in;
}
.gallery-thumb:hover .gallery-img {
    border-color: var(--ink-4);
}
.gallery-thumb:focus-visible {
    outline: 2px solid var(--indigo);
    outline-offset: 2px;
}
.gallery-img {
    height: 200px;
    transition: border-color 80ms ease;
    border-radius: var(--radius);
    border: 1px solid var(--line);
    object-fit: cover;
    flex-shrink: 0;
    display: block;
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
.plain-list .dep-installed {
    color: var(--green);
}
.dep-installed-label {
    font-size: 12.5px;
    color: var(--green);
}

.scenario-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
}
.scenario-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 12px;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--bg-soft);
    color: var(--ink-2);
    font-size: 14px;
}
.scenario-item .btn {
    flex-shrink: 0;
}

/* Lightbox (portalled to <body>, so it must sit above the mod list's
   workshop dialog at z-index 1001 and its mission popovers at 1100). */
.lightbox-overlay {
    position: fixed;
    inset: 0;
    z-index: 1200;
    background: rgba(0, 0, 0, 0.88);
}
.lightbox {
    position: fixed;
    inset: 0;
    z-index: 1201;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 56px 72px;
    box-sizing: border-box;
}
.lightbox:focus {
    outline: none;
}
.lightbox-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: var(--radius);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}
.lightbox-btn {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    cursor: pointer;
    transition: background 80ms ease;
}
.lightbox-btn:hover {
    background: rgba(255, 255, 255, 0.24);
}
.lightbox-btn:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
}
.lightbox-close {
    top: 12px;
    right: 12px;
}
.lightbox-prev {
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
}
.lightbox-next {
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
}
.lightbox-counter {
    position: absolute;
    bottom: 18px;
    left: 50%;
    transform: translateX(-50%);
    color: rgba(255, 255, 255, 0.8);
    font-size: 13px;
    font-variant-numeric: tabular-nums;
}
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

@media (max-width: 560px) {
    .lightbox {
        padding: 56px 12px;
    }
    .lightbox-prev,
    .lightbox-next {
        top: auto;
        bottom: 8px;
        transform: none;
    }
}
</style>
