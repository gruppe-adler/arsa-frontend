<script setup lang="ts">
import { inject, computed, Ref } from 'vue';

const props = defineProps<{
    title: string
}>();

const selectedTitle = inject<Ref<string>>('selectedTitle');

const isActive = computed(() => selectedTitle?.value === props.title);
</script>

<template>
    <div v-if="isActive" class="tab-content">
        <slot />
    </div>
</template>