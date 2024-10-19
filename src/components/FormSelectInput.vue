<script setup lang="ts">

import { v4 as uuidv4 } from 'uuid';
import { onMounted } from 'vue';

const props = defineProps({
    readonly: Boolean,
    name: String,
    tooltip: String,
    options: Array<String>,
    selectedIndex: Number
});
const model = defineModel<string>({ required: true });

const selectId = uuidv4();

onMounted(() => {
    const select: HTMLSelectElement = document.getElementById(selectId) as HTMLSelectElement;
    select.selectedIndex = props.selectedIndex!;
});

</script>

<template>
    <div class="form-input-container">
        <label class="form-input-label">{{ name }}</label>
        <select :title="tooltip" :id="selectId" :disabled="props.readonly" v-model="model">
            <option v-for="option in options" :value="option">
                {{ option }}
            </option>
        </select>
    </div>
</template>

<style scoped>
</style>
