<script setup lang="ts">
import { computed } from 'vue';
import { useServersStore } from '../stores/servers';
import { ArsStatus } from '../utils/interfaces';
import HostServerLog from '../components/HostServerLog.vue';

const serversStore = useServersStore();

async function updateArsStatus() {
    const result = await serversStore.getArsStatus();
    serversStore.arsStatus = result;
}

async function recreateArsDockerImage() {
    await serversStore.recreateArsDockerImage();
}

const arsStatus = computed<string>(() => ArsStatus[serversStore.arsStatus]);

const statusDot = computed(() => {
    switch (serversStore.arsStatus) {
        case ArsStatus.AVAILABLE: return 'green';
        case ArsStatus.RECREATING: return 'amber';
        case ArsStatus.RECREATING_FAILURE:
        case ArsStatus.UNAVAILABLE: return 'red';
        default: return '';
    }
});

const recreateDisabled = computed(() =>
    serversStore.arsStatus === ArsStatus.RECREATING ||
    serversStore.arsStatus === ArsStatus.UNKNOWN
);

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
        <p>The ARS daemon manages the lifecycle of every server on this host. Check the current state to confirm new operations will be accepted.</p>
        <div class="card-foot">
          <div class="ars-value">
            <span class="dot" :class="statusDot"></span>
            {{ arsStatus }}
          </div>
          <button class="btn" @click="updateArsStatus">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6"/></svg>
            Update status
          </button>
        </div>
      </div>

      <!-- recreate card -->
      <div class="card">
        <div class="card-eyebrow">Image</div>
        <h3>Recreate Docker image</h3>
        <p>Rebuild the ARS container image from scratch. Any running servers will be stopped. This operation may take several minutes.</p>
        <div class="warning-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/></svg>
          <span>Destructive — do not run unless you know what you're doing.</span>
        </div>
        <div class="card-foot">
          <span class="card-foot-note">Rebuilds the entire ARS container</span>
          <button class="btn btn-danger" :disabled="recreateDisabled" @click="recreateArsDockerImage">
            Recreate image
          </button>
        </div>
      </div>
    </div>

    <h2 class="section-title">Host server log</h2>
    <HostServerLog />
  </main>
</template>

<style scoped>
main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px var(--gutter) 96px;
}
.page-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 32px;
  margin-bottom: 36px;
}
.page-header h1 {
  font-size: 28px; font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0 0 6px;
}
.page-header p {
  margin: 0; color: var(--ink-3); font-size: 14px; max-width: 56ch;
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
  display: flex; align-items: center; justify-content: space-between;
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
  display: flex; align-items: center; gap: 10px;
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
}
</style>
