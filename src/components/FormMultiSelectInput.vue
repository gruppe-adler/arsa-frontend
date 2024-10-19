<script setup lang="ts">

import { v4 as uuidv4 } from 'uuid';

const props = defineProps({
    readonly: Boolean,
    name: String,
    tooltip: String,
    options: Array<String>
});
const model = defineModel<string[]>({ required: true });

const selectId = uuidv4();

</script>

<template>
    <div class="form-input-container">
        <label class="form-input-label">{{ name }}</label>
        <select :title="tooltip" :id="selectId" size="5" :disabled="props.readonly" v-model="model" multiple>
            <option v-for="option in options" :value="option">
                {{ option }}
            </option>
        </select>
    </div>
</template>

<style scoped>
</style>
