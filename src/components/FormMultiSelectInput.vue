<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid';
import InfoTooltip from './InfoTooltip.vue';

const props = defineProps({
    readonly: Boolean,
    name: String,
    tooltip: String,
    options: Array<string>
});
const model = defineModel<string[]>({ required: true });

const selectId = uuidv4();
</script>

<template>
    <div class="form-input-container">
        <label class="form-input-label">
            {{ name }}
            <InfoTooltip v-if="tooltip" :content="tooltip" />
        </label>
        <select :id="selectId" v-model="model" size="5" :disabled="props.readonly" multiple>
            <option v-for="option in options" :key="option" :value="option">
                {{ option }}
            </option>
        </select>
    </div>
</template>

<style scoped></style>
