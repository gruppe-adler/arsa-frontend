<script setup lang="ts">

import { watch } from 'vue';

const props = defineProps({
    readonly: Boolean,
    name: String,
    tooltip: String,
    minVal: Number,
    maxVal: Number
});

const emit = defineEmits(['violIncr', 'violDecr'])

const model = defineModel<number>({ required: true });

let violation = false;

let style = "";

watch(
    model,
    (value) => {
        if (value < props.minVal! || value > props.maxVal!) {
            style = "background: rgba(255,0,0,0.5);";
            if (!violation) {
                violation = true;
                emit('violIncr');
            }
        } else {
            style = "";
            if (violation) {
                violation = false;
                emit('violDecr');
            }
        }
    },
    { immediate: true }
);

</script>

<template>
    <div class="form-input-container">
        <label class="form-input-label">{{ name }}</label>
        <input :title="tooltip" class="form-custom-input" type="number" :min="minVal" :max="maxVal" step="1" :disabled="props.readonly" :style="style" v-model="model">
    </div>
</template>

<style scoped>
</style>
