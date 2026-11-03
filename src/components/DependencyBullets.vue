<script setup lang="ts">
defineProps<{ depIds: string[]; installedIds: Set<string> }>();
</script>

<template>
    <div v-if="depIds.length > 0" class="dep-bullets">
        <span
            v-for="(id, idx) in depIds"
            :key="idx"
            class="dep-bullet"
            :class="installedIds.has(id) ? 'installed' : 'todo'"
            :title="installedIds.has(id) ? 'Dependency already installed' : 'Dependency not yet installed'"
        ></span>
    </div>
</template>

<style scoped>
.dep-bullets {
    position: absolute;
    bottom: 6px;
    left: 6px;
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    max-width: calc(100% - 12px);
}
.dep-bullet {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    box-shadow: 0 0 0 1.5px color-mix(in oklab, black, transparent 40%);
    flex-shrink: 0;
}
.dep-bullet.installed {
    background: var(--green);
}
.dep-bullet.todo {
    background: var(--amber);
}
</style>
