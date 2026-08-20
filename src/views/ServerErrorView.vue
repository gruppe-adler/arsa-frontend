And here's the Vue component: vue<!-- src/views/ServerErrorView.vue -->
<template>
    <div class="error-page">
        <p class="error-code">Error {{ code }}</p>
        <h1>{{ header }}</h1>
        <p class="description">
            {{ description }}
        </p>

        <div class="actions">
            <button @click="reload"><i class="ti ti-refresh" /> Try again</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const code = route.query.code ?? '500';
const header = route.query.header ?? 'An unexpected error occurred.';
const description = route.query.description ?? 'An unexpected error occurred.';

function reload() {
    router.push('/');
}
</script>

<style scoped>
.error-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    text-align: center;
    padding: 3rem 1rem;
}

.error-code {
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #d63b3b;
    margin: 0 0 0.5rem;
}

h1 {
    font-size: 1.5rem;
    font-weight: 500;
    margin: 0 0 0.75rem;
}

.description {
    color: #6b7280;
    max-width: 380px;
    line-height: 1.7;
    margin: 0 0 2rem;
}

.actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
}

button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 1.25rem;
    height: 36px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.15s;
}

button:hover {
    background: #f9fafb;
}
</style>
