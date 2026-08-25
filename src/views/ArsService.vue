<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useServersStore } from '../stores/servers';
import { useLogsStore } from '../stores/logs';
import HostServerLog from '../components/HostServerLog.vue';
import { ArsStatus, Branch } from '../api/model';
import ImagePullLog from '../components/ImagePullLog.vue';
import { useRoute } from 'vue-router';
import Dialog from '../components/Dialog.vue';
import { useScenarioStore } from '../stores/scenarios.ts';
// import { useToast } from '../composables/useToast.ts';

const serversStore = useServersStore();
const logsStore = useLogsStore();
const scenarioStore = useScenarioStore();
const route = useRoute();
// const { toast } = useToast();

function parsePositiveInteger(value: unknown): number | undefined {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

const hostLogPage = computed(() => parsePositiveInteger(route.query.page) ?? 1);
const hostLogLimit = computed(() => parsePositiveInteger(route.query.limit));

async function updateArsStatus() {
    const result = await serversStore.getArsStatus();
    serversStore.arsStatus = result;
}

// async function updateScenarios(branch: Branch) {
//     toast.info('Updating Scenarios...', 'Takes about 30s');
//     await scenarioStore.updateScenarios(branch);
// }

async function pullImage(branch: Branch) {
    await serversStore.pullImage(branch);
    await logsStore.loadPullLogs();
}

const arsStatus = computed<string>(() => ArsStatus[serversStore.arsStatus]);

const statusDot = computed(() => {
    switch (serversStore.arsStatus) {
        case ArsStatus.Available:
            return 'green';
        case ArsStatus.Recreating:
            return 'amber';
        case ArsStatus.RecreatingFailure:
        case ArsStatus.Unavailable:
            return 'red';
        default:
            return '';
    }
});

async function getBranchVersions() {
    const entries = await Promise.all(
        Object.values(Branch).map(async branch => {
            const version = (await serversStore.getImageVersion(branch)) ?? '';
            return [branch, version] as [Branch, string];
        })
    );
    return new Map<Branch, string>(entries);
}

async function getScenarioCounts() {
    const scenarioCounts = await Promise.all(
        Object.values(Branch).map(async branch => {
            const scenarioCount = (await scenarioStore.getScenarios(branch)).length;
            return [branch, scenarioCount] as [Branch, number];
        })
    );

    return new Map<Branch, number>(scenarioCounts);
}

const branchVersions = ref(new Map<Branch, string>());
const scenarioCounts = ref(new Map<Branch, number>());

onMounted(async () => {
    branchVersions.value = await getBranchVersions();
    scenarioCounts.value = await getScenarioCounts();
});

const recreateDisabled = computed(() => serversStore.arsStatus === ArsStatus.Recreating || serversStore.arsStatus === ArsStatus.Unknown);

updateArsStatus();
</script>

<template>
    <main>
        <div class="page-header">
            <div>
                <h1>ARS Service</h1>
                <p>Administer the Arma Reforger Server host service itself — check status and manage the underlying Docker image.</p>
            </div>
        </div>

        <div class="ars-grid">
            <!-- status card -->
            <div class="card">
                <div class="card-eyebrow">Service status</div>
                <h3>Host service</h3>
                <p>
                    The ARS daemon manages the lifecycle of every server on this host. Check the current state to confirm new operations
                    will be accepted.
                </p>
                <div class="card-foot">
                    <div class="ars-value">
                        <span class="dot" :class="statusDot"></span>
                        {{ arsStatus }}
                    </div>
                    <button class="btn" @click="updateArsStatus">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6" />
                        </svg>
                        Update status
                    </button>
                </div>
            </div>

            <!-- recreate card -->
            <div class="card">
                <div class="card-eyebrow">Image</div>
                <h3>Recreate Docker image</h3>
                <p>
                    Rebuild the ARS container image from scratch. Any running servers will be stopped. This operation may take several
                    minutes.
                </p>
                <div class="warning-banner">
                    <svg width="24px" height="24px" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                            <path
                                d="M12.5 10V14M12.5 17V15.5M14.2483 5.64697L20.8493 17.5287C21.5899 18.8618 20.6259 20.5 19.101 20.5H5.89903C4.37406 20.5 3.41013 18.8618 4.15072 17.5287L10.7517 5.64697C11.5137 4.27535 13.4863 4.27535 14.2483 5.64697Z"
                                stroke="currentColor"
                                stroke-width="1.5"
                            ></path>
                        </g>
                    </svg>
                    <span>Destructive — do not run unless you know what you're doing.</span>
                </div>
                <div v-for="[branch, version] in branchVersions" :key="branch" class="card-foot">
                    <span class="card-foot-note">Branch: {{ branch }} Version: {{ version ?? 'n/a' }}</span>

                    <Dialog
                        :disabled="recreateDisabled"
                        :triggerLabel="`Pull latest image (${branch})`"
                        :titleLabel="`Pull latest image (${branch})`"
                        :description="`Rebuild the ARS container image (Branch: ${branch}) from scratch. Any running servers will be stopped. This operation may take several minutes.`"
                        :cancelLabel="'Cancel'"
                        :handleLabel="'Start pull'"
                        :handleFunction="() => pullImage(branch)"
                    ></Dialog>
                    <button class="btn btn-danger" :disabled="recreateDisabled || true">
                        <!-- @click="updateScenarios(branch)"-->
                        Update vanilla scenarios (Current count: {{ scenarioCounts.get(branch) ?? 0 }})
                    </button>
                </div>
            </div>
        </div>
        <ImagePullLog></ImagePullLog>
        <div class="log-header">
            <h2 class="section-title">Host server log</h2>
            <button class="btn btn-sm" @click="logsStore.clear">
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
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Clear
            </button>
        </div>
        <HostServerLog :page="hostLogPage" :limit="hostLogLimit" />
    </main>
</template>

<style scoped>
main {
    max-width: 1280px;
    margin: 0 auto;
    padding: 48px var(--gutter) 96px;
}
.page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 32px;
    margin-bottom: 36px;
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
    max-width: 56ch;
}

.ars-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 8px;
}

.card {
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    padding: 28px;
    background: var(--bg);
}
.card-eyebrow {
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--ink-3);
    font-weight: 600;
    margin-bottom: 14px;
}
.card h3 {
    font-size: 17px;
    margin: 0 0 6px;
    font-weight: 600;
    letter-spacing: -0.01em;
}
.card p {
    margin: 0 0 20px;
    color: var(--ink-3);
    font-size: 13.5px;
}
.card-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--line);
}
.card-foot-note {
    color: var(--ink-3);
    font-size: 12.5px;
}
.ars-value {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Geist Mono', ui-monospace, monospace;
    font-size: 13px;
    font-weight: 500;
    color: var(--ink);
}

.log-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 64px 0 16px;
}
.log-header .section-title {
    margin: 0;
    flex: 1;
}

@media (max-width: 480px) {
    .page-header h1 {
        font-size: 22px;
    }
    .ars-grid {
        grid-template-columns: 1fr;
    }
    .card-foot {
        flex-wrap: wrap;
    }
}
</style>
