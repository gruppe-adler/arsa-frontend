<script setup lang="ts">
import { ref, watch } from 'vue';
import InfoTooltip from './InfoTooltip.vue';

const props = defineProps({
    readonly: Boolean,
    name: String,
    tooltip: String,
    minVal: Number,
    maxVal: Number,
    fieldId: String
});

const emit = defineEmits<{ violation: [isViolating: boolean] }>();

const model = defineModel<number>({ required: true });

// Decoupled from `model` so a blank/partial input (e.g. mid-typing "-5") never
// writes a non-numeric value into the number-typed model.
const raw = ref(String(model.value));

watch(model, value => {
    if (Number(raw.value) !== value) {
        raw.value = String(value);
    }
});

const violation = ref(false);

const style = ref('');

watch(
    raw,
    value => {
        const numeric = value === '' ? NaN : Number(value);
        const invalid =
            !Number.isFinite(numeric) ||
            (props.minVal !== undefined && numeric < props.minVal) ||
            (props.maxVal !== undefined && numeric > props.maxVal);

        if (!invalid) {
            model.value = numeric;
        }

        if (invalid) {
            style.value = 'background: rgba(255,0,0,0.5);';
            if (!violation.value) {
                violation.value = true;
                emit('violation', true);
            }
        } else {
            style.value = '';
            if (violation.value) {
                violation.value = false;
                emit('violation', false);
            }
        }
    },
    { immediate: true }
);
</script>

<template>
    <div class="form-input-container" :data-field-id="fieldId">
        <label class="form-input-label">
            {{ name }}
            <InfoTooltip v-if="tooltip" :content="tooltip" />
        </label>
        <input
            v-model="raw"
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
