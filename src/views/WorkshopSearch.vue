<script setup lang="ts">
import WorkshopBrowser from '../components/WorkshopBrowser.vue';
</script>

<template>
    <main>
        <div class="page-header">
            <div>
                <h1>Workshop</h1>
                <p>Browse and search the Arma Reforger Workshop. Open an asset to view its details, scenarios, and changelog.</p>
            </div>
        </div>

        <WorkshopBrowser />
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

@media (max-width: 480px) {
    .page-header h1 {
        font-size: 22px;
    }
}
</style>
