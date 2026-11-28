<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDocumentVisibility, useEventListener, useIntervalFn, useLocalStorage } from '@vueuse/core';
import { useServersStore } from '../stores/servers';
import Loading from '../components/Loading.vue';
import NotFound from '../components/NotFound.vue';
import { Log, LogType } from '../api/model';
import type { FetchOptions } from '../utils/fetcher';

const POLL_INTERVAL_MS = 3000;
/** Slack (px) for deciding whether the reader is at the live end of the log. */
const FOLLOW_THRESHOLD_PX = 50;
/** Height of the sticky app top bar (App.vue), which covers the top of the page. */
const TOPBAR_HEIGHT_PX = 60;
const REQUEST_TIMEOUT_MS = 10_000;
/** How often to check whether the server started a new log session. */
const SESSION_CHECK_INTERVAL_MS = 15_000;
/**
 * Lines kept on screen. Past this the oldest are dropped (down to TRIM_TO of it),
 * so a Live tab left open for days stays responsive.
 */
const MAX_LINES = 100_000;
const TRIM_TO = 0.8;
/** Log session directories, as named by the server (matches the backend's LOG_DIR_NAME_REGEX). */
const LOG_DIR_REGEX = /^logs_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/;
/** Polls run in the background: no error toasts, never served from cache, never hang. */
const SILENT_STATUSES = [400, 401, 403, 404, 500, 502, 503, 504];
function pollOptions(): FetchOptions {
    return { silentStatuses: SILENT_STATUSES, cache: 'no-store', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) };
}

const route = useRoute();
const router = useRouter();
const serversStore = useServersStore();

const loading = ref(true);
const found = ref(false);
const arsVersion = ref('');
const pollError = ref(false);
/** Old lines were dropped to stay under the line limit. */
const trimmed = ref(false);
const logEl = ref<HTMLElement | null>(null);
/** New lines that arrived while the reader was scrolled away from the live end. */
const unseenLines = ref(0);
/** Newest log directory, when it is newer than the one being viewed (the server restarted). */
const newerLog = ref<Log | null>(null);

const live = useLocalStorage('arsa-server-log-live', true);
const newestFirst = useLocalStorage('arsa-server-log-newest-first', true);
const visibility = useDocumentVisibility();

/**
 * The log is kept as append-only chunks of complete lines, one per fetch that
 * returned data, oldest chunk first. Each chunk renders as a single text node, so a
 * poll only ever inserts one new node and never rebuilds what is already on screen.
 * A chunk's `text` holds its lines in display order (newest line first when
 * `newestFirst` is on), so only one copy of the log is kept.
 */
interface Chunk {
    id: number;
    text: string;
    lines: number;
}
const chunks = shallowRef<Chunk[]>([]);
/** Trailing partial line (no newline yet); merged into the next chunk. */
const tail = ref('');

let offset = 0;
/** Fingerprint of the file start, so the backend can tell when the file was replaced. */
let head: string | undefined;
let totalLines = 0;
/** Line limit for this load: at least the size of the file as first loaded. */
let lineLimit = MAX_LINES;
let nextChunkId = 0;
/** Bumped on every full reload so in-flight polls for the old state are dropped. */
let generation = 0;
let polling = false;
let reloading = false;
let lastSessionCheck = 0;

const orderedChunks = computed(() => (newestFirst.value ? [...chunks.value].reverse() : chunks.value));
const isEmpty = computed(() => chunks.value.length === 0 && !tail.value);
const trimmedNote = 'Older lines were removed to keep the page responsive. Refresh to load the whole file.';

const versionRegEx = /version ([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+) built ([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{1,2}:[0-9]{2}:[0-9]{2} UTC)/;

function params() {
    return {
        id: route.params.id as string,
        log: route.params.log as string,
        file: route.params.file as LogType
    };
}

function resetContent() {
    chunks.value = [];
    tail.value = '';
    offset = 0;
    head = undefined;
    totalLines = 0;
    trimmed.value = false;
    arsVersion.value = '';
    unseenLines.value = 0;
}

function reverseLines(text: string): string {
    return text.split('\n').reverse().join('\n');
}

/** Index of the `n`th newline (1-based) from the start, or from the end when `fromEnd`. */
function nthNewline(text: string, n: number, fromEnd: boolean): number {
    let index = fromEnd ? text.length : -1;
    for (let i = 0; i < n; i++) {
        index = fromEnd ? text.lastIndexOf('\n', index - 1) : text.indexOf('\n', index + 1);
    }
    return index;
}

/** Drop the oldest lines once the log grows past the line limit. */
function trimOldest() {
    if (totalLines <= lineLimit) return;

    let excess = totalLines - Math.floor(lineLimit * TRIM_TO);
    let kept = chunks.value;
    let first = 0;
    while (first < kept.length - 1 && kept[first].lines <= excess) {
        excess -= kept[first].lines;
        first++;
    }
    kept = kept.slice(first);

    if (excess > 0) {
        // Cut the oldest lines off the oldest remaining chunk, which sit at its end in newest-first order.
        const chunk = kept[0];
        const cut = nthNewline(chunk.text, excess, newestFirst.value);
        const text = newestFirst.value ? chunk.text.slice(0, cut) : chunk.text.slice(cut + 1);
        kept = [{ ...chunk, text, lines: chunk.lines - excess }, ...kept.slice(1)];
    }

    chunks.value = kept;
    totalLines = kept.reduce((sum, chunk) => sum + chunk.lines, 0);
    trimmed.value = true;
}

/** Add fetched content; returns the number of completed lines. */
function ingest(content: string): number {
    if (!content) return 0;

    const combined = tail.value + content;
    // Match on the tail as well, so a version line split across two polls is still found.
    if (!arsVersion.value) {
        const match = versionRegEx.exec(combined);
        if (match) arsVersion.value = `Arma Reforger Server v${match[1]} (build date ${match[2]})`;
    }

    const lastNewline = combined.lastIndexOf('\n');
    if (lastNewline === -1) {
        tail.value = combined;
        return 0;
    }

    const text = combined.slice(0, lastNewline);
    tail.value = combined.slice(lastNewline + 1);
    const lines = text.split('\n');
    // Replace the array rather than mutating it: `orderedChunks` hands this same array
    // to the template in oldest-first mode, and a mutated array would look unchanged.
    chunks.value = [
        ...chunks.value,
        { id: nextChunkId++, text: newestFirst.value ? lines.reverse().join('\n') : text, lines: lines.length }
    ];
    totalLines += lines.length;
    trimOldest();
    return lines.length;
}

/** Load a whole file. It is never trimmed, and leaves room to grow before trimming starts. */
function ingestWhole(content: string) {
    lineLimit = Infinity;
    ingest(content);
    lineLimit = Math.max(MAX_LINES, Math.ceil(totalLines / TRIM_TO));
}

/** Is the reader looking at the end of the log where new lines appear? */
function isAtLiveEnd(): boolean {
    if (newestFirst.value) {
        const top = logEl.value?.getBoundingClientRect().top ?? 0;
        return top >= TOPBAR_HEIGHT_PX - FOLLOW_THRESHOLD_PX;
    }
    return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - FOLLOW_THRESHOLD_PX;
}

function scrollToBottom(smooth = false) {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
}

function jumpToLiveEnd() {
    unseenLines.value = 0;
    if (newestFirst.value) window.scrollTo({ top: 0, behavior: 'smooth' });
    else scrollToBottom(true);
}

/**
 * Position of chunk `id`'s edge that faces the older lines. Measured on the chunk
 * that was newest before an update: new lines and the tail only ever appear on its
 * other side, and trimmed lines only beyond the older ones, so this edge moves
 * exactly as far as the lines the reader is looking at. Null once it is trimmed away.
 */
function anchorEdge(id: number | undefined): number | null {
    const el = id === undefined ? null : logEl.value?.querySelector(`[data-chunk="${id}"]`);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return newestFirst.value ? rect.top : rect.bottom;
}

/**
 * Add polled content without yanking the reader around. At the live end the new
 * lines simply show up. Scrolled away, the view is held still and an indicator
 * counts the new lines. (Browser scroll anchoring is off for this page: it would
 * silently push newest-first lines above the viewport, so updates looked missing.)
 */
async function appendLive(content: string) {
    const following = isAtLiveEnd();
    // Remember the chunk, not "the newest one": ingest() is about to add a newer one.
    const anchorId = chunks.value[chunks.value.length - 1]?.id;
    const anchorBefore = anchorEdge(anchorId);
    const heightBefore = logEl.value?.offsetHeight ?? 0;
    const added = ingest(content);
    await nextTick();

    if (following) {
        if (!newestFirst.value) scrollToBottom();
        return;
    }
    const anchorAfter = anchorBefore === null ? null : anchorEdge(anchorId);
    if (anchorBefore !== null && anchorAfter !== null) window.scrollBy(0, anchorAfter - anchorBefore);
    else if (newestFirst.value) window.scrollBy(0, (logEl.value?.offsetHeight ?? 0) - heightBefore);
    unseenLines.value += added;
}

useEventListener(
    window,
    'scroll',
    () => {
        if (unseenLines.value > 0 && isAtLiveEnd()) unseenLines.value = 0;
    },
    { passive: true }
);

const FILE_FLAGS: Record<LogType, keyof Log> = {
    'console.log': 'containsConsoleLog',
    'error.log': 'containsErrorLog',
    'script.log': 'containsScriptLog',
    'crash.log': 'containsCrashLog'
};

/** A restarted server writes to a new log directory, so this file stops growing. */
async function checkForNewerSession() {
    lastSessionCheck = Date.now();
    const { id, log } = params();
    try {
        const result = await serversStore.getLogs(id, pollOptions());
        // Only real session directories: anything else in the logs folder cannot be opened.
        const newest = result.logs
            .filter(entry => LOG_DIR_REGEX.test(entry.dir))
            .reduce<Log | null>((max, entry) => (!max || entry.dir > max.dir ? entry : max), null);
        if (params().log === log) newerLog.value = newest && newest.dir > log ? newest : null;
    } catch {
        // Not important enough to report; try again on the next check.
    }
}

const newerLogLink = computed(() => {
    if (!newerLog.value) return '';
    const { id, file } = params();
    const target = newerLog.value[FILE_FLAGS[file]] ? file : 'console.log';
    return `/view-server-log/${id}/${newerLog.value.dir}/${target}`;
});

/**
 * Fetch the whole file from scratch. `initial` shows the page loader (first open
 * or a different file); a manual refresh keeps the current content on screen
 * until the new copy has arrived.
 */
async function reload(initial = false) {
    const gen = ++generation;
    reloading = true;
    pollError.value = false;
    // A manual refresh only jumps to the end if the reader was already there.
    const following = initial || isAtLiveEnd();
    if (initial) {
        loading.value = true;
        newerLog.value = null;
    }

    try {
        const { id, log, file } = params();
        const result = await serversStore.getLog(id, log, file, undefined, undefined, initial ? undefined : pollOptions());
        if (gen !== generation) return;
        resetContent();
        ingestWhole(result.file_content);
        offset = result.offset;
        head = result.head;
        found.value = true;
    } catch {
        if (gen !== generation) return;
        if (initial) found.value = false;
        else pollError.value = true;
    } finally {
        if (gen === generation) {
            loading.value = false;
            reloading = false;
        }
    }

    if (gen === generation && found.value) {
        void checkForNewerSession();
        if (!newestFirst.value && following) {
            await nextTick();
            scrollToBottom();
        }
    }
}

async function poll() {
    if (polling || reloading || !found.value) return;
    polling = true;
    const gen = generation;

    try {
        const { id, log, file } = params();
        const result = await serversStore.getLog(id, log, file, offset, head, pollOptions());
        if (gen !== generation) return;
        pollError.value = false;

        // Like a manual refresh, a replaced file only jumps to the end if the reader was there.
        const following = isAtLiveEnd();
        if (result.reset) {
            // The file was replaced: this is the new file from the start.
            resetContent();
            ingestWhole(result.file_content);
        }
        offset = result.offset;
        head = result.head;

        if (result.reset) {
            if (!newestFirst.value && following) {
                await nextTick();
                scrollToBottom();
            }
        } else if (result.file_content) {
            await appendLive(result.file_content);
        } else if (!newerLog.value && Date.now() - lastSessionCheck >= SESSION_CHECK_INTERVAL_MS) {
            // Only worth checking while the file is quiet: a growing file is still the live one.
            await checkForNewerSession();
        }
    } catch {
        if (gen === generation) pollError.value = true;
    } finally {
        polling = false;
    }
}

const { pause, resume } = useIntervalFn(poll, POLL_INTERVAL_MS, { immediate: false });

const shouldPoll = computed(() => live.value && visibility.value === 'visible' && found.value && !loading.value);
watch(
    shouldPoll,
    active => {
        if (active) {
            // Catch up right away when returning to the tab or switching Live on.
            void poll();
            resume();
        } else {
            pause();
        }
    },
    { immediate: true }
);

watch(newestFirst, async value => {
    unseenLines.value = 0;
    chunks.value = chunks.value.map(chunk => ({ ...chunk, text: reverseLines(chunk.text) }));
    if (!value) {
        await nextTick();
        scrollToBottom();
    }
});

// The route can change params without remounting (e.g. console.log → error.log).
watch(
    () => [route.params.id, route.params.log, route.params.file],
    () => {
        // Ignore the param change that happens while navigating away from this page.
        if (route.path.startsWith('/view-server-log/')) void reload(true);
    },
    { immediate: true }
);
</script>

<template>
    <Loading v-if="loading" />
    <NotFound v-else-if="!found" />
    <main v-else class="page-main">
        <div class="breadcrumb">
            <a @click="router.push(`/edit-server/${route.params.id}?tab=logs`)">Logs</a>
            <span class="sep">/</span>
            <span>{{ route.params.log }}/{{ route.params.file }}</span>
        </div>

        <div class="page-header">
            <div>
                <h1>{{ route.params.file }}</h1>
                <p v-if="arsVersion" class="mono version-line">{{ arsVersion }}</p>
            </div>
            <div class="row controls">
                <span v-if="pollError" class="poll-error">{{ live ? 'Live update failed, retrying…' : 'Refresh failed.' }}</span>
                <button
                    class="btn"
                    :class="{ 'live-on': live }"
                    type="button"
                    :aria-pressed="live"
                    :title="live ? 'Pause live updates' : 'Resume live updates'"
                    @click="live = !live"
                >
                    <span class="live-dot" aria-hidden="true"></span>
                    {{ live ? 'Live' : 'Paused' }}
                </button>
                <button
                    class="btn"
                    type="button"
                    :title="newestFirst ? 'Show oldest lines first' : 'Show newest lines first'"
                    @click="newestFirst = !newestFirst"
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4" />
                    </svg>
                    {{ newestFirst ? 'Newest first' : 'Oldest first' }}
                </button>
                <button class="btn" type="button" title="Reload the whole file" @click="reload()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6" />
                    </svg>
                    Refresh
                </button>
            </div>
        </div>

        <div v-if="newerLog" class="session-banner" role="status">
            <span>The server has started a new log session, so this file is no longer updated.</span>
            <button class="btn" type="button" @click="router.push(newerLogLink)">Open latest log</button>
        </div>

        <button
            v-if="unseenLines > 0"
            class="unseen-pill"
            :class="newestFirst ? 'at-top' : 'at-bottom'"
            type="button"
            @click="jumpToLiveEnd"
        >
            {{ newestFirst ? '↑' : '↓' }} {{ unseenLines }} new {{ unseenLines === 1 ? 'line' : 'lines' }}
        </button>

        <div ref="logEl" class="log-block log-text">
            <span v-if="isEmpty" class="log-empty">This log is empty{{ live ? ' — new lines will appear here.' : '.' }}</span>
            <template v-else>
                <div v-if="trimmed && !newestFirst" class="log-trimmed">{{ trimmedNote }}</div>
                <div v-if="newestFirst && tail" class="log-chunk">{{ tail }}</div>
                <div v-for="chunk in orderedChunks" :key="chunk.id" class="log-chunk" :data-chunk="chunk.id">{{ chunk.text }}</div>
                <div v-if="!newestFirst && tail" class="log-chunk">{{ tail }}</div>
                <div v-if="trimmed && newestFirst" class="log-trimmed">{{ trimmedNote }}</div>
            </template>
        </div>
    </main>
</template>

<style scoped>
.page-main {
    /* Scroll anchoring would hide newly prepended lines; appendLive() handles scrolling instead. */
    overflow-anchor: none;
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
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 32px;
    margin-bottom: 32px;
}
.page-header h1 {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.02em;
    margin: 0 0 6px;
}
.version-line {
    margin: 0;
    color: var(--ink-3);
    font-size: 12.5px;
}
.controls {
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
}
.poll-error {
    color: var(--red);
    font-size: 12px;
}

.live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--ink-4);
}
.live-on .live-dot {
    background: var(--green);
    animation: live-pulse 1.6s ease-in-out infinite;
}
@keyframes live-pulse {
    0%,
    100% {
        box-shadow: 0 0 0 0 color-mix(in oklab, var(--green), transparent 40%);
    }
    50% {
        box-shadow: 0 0 0 4px color-mix(in oklab, var(--green), transparent 100%);
    }
}
@media (prefers-reduced-motion: reduce) {
    .live-on .live-dot {
        animation: none;
    }
}

.session-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 16px;
    padding: 10px 14px;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius);
    background: var(--bg-soft);
    color: var(--ink-2);
    font-size: 13px;
}

.unseen-pill {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9;
    appearance: none;
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    background: var(--ink);
    color: var(--bg);
    font: inherit;
    font-size: 12.5px;
    font-weight: 500;
    padding: 6px 14px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.unseen-pill.at-top {
    top: 72px;
}
.unseen-pill.at-bottom {
    bottom: 24px;
}

.log-text {
    white-space: pre-wrap;
}
.log-chunk {
    /* Every chunk holds at least one line, even if that line is blank. */
    min-height: 1lh;
}
.log-empty {
    color: var(--ink-4);
}
.log-trimmed {
    color: var(--ink-4);
    font-style: italic;
}

@media (max-width: 640px) {
    .page-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
    }
    .controls {
        justify-content: flex-start;
    }
}
</style>
