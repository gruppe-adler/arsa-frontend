<script setup lang="ts">
import { watch } from 'vue';
import InfoTooltip from './InfoTooltip.vue';

const props = defineProps({
    readonly: Boolean,
    name: String,
    tooltip: String,
    minVal: Number,
    maxVal: Number
});

const emit = defineEmits(['violIncr', 'violDecr']);

const model = defineModel<number>({ required: true });

let violation = false;

let style = '';

watch(
    model,
    value => {
        if ((props.minVal && value < props.minVal) || (props.maxVal && value > props.maxVal)) {
            style = 'background: rgba(255,0,0,0.5);';
            if (!violation) {
                violation = true;
                emit('violIncr');
            }
        } else {
            style = '';
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
        <label class="form-input-label">
            {{ name }}
            <InfoTooltip v-if="tooltip" :content="tooltip" />
        </label>
        <input
            v-model="model"
            class="form-custom-input"
            type="number"
            :min="minVal"
            :max="maxVal"
            step="1"
            :disabled="props.readonly"
            :style="style"
        />
    </div>
</template>

<style scoped></style>
