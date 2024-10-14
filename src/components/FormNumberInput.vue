<script setup lang="ts">

import { watch } from 'vue';

const props = defineProps({
    readonly: Boolean,
    name: String,
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
    <label class="label">{{ name }}</label>
    <input type="number" :min="minVal" :max="maxVal" step="1" :disabled="props.readonly" :style="style" v-model="model">
    <br/>
</template>

<style scoped>
.label {
    margin-left: 10px;
    margin-right: 10px;
}
</style>
