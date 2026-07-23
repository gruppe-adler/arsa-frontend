<script setup lang="ts">
import { ref, watch } from "vue";
import InfoTooltip from './InfoTooltip.vue';

const props = defineProps({
    readonly: Boolean,
    name: String,
    tooltip: String,
    placeholder: String,
    length: Number,
    pasteValue: String,
    fieldId: String,
});

const emit = defineEmits<{ violation: [isViolating: boolean] }>();

const model = defineModel<string>({ required: true });

const violation = ref(false);
const style = ref("");

watch(
    model,
    (value) => {
        if (value === "") {
            style.value = "background: rgba(255,0,0,0.5);";
            if (!violation.value) {
                violation.value = true;
                emit('violation', true);
            }
        } else {
            style.value = "";
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
        <div v-if="props.pasteValue !== undefined" class="text-input-row">
            <input
v-model.trim="model" type="text" :maxlength="length" :placeholder="placeholder!"
                :style="style" :disabled="props.readonly" />
            <button
                v-if="!props.readonly"
                class="btn btn-ghost"
                type="button"
                :title="'Use: ' + props.pasteValue"
                @click="model = props.pasteValue!"
            >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
                Use identity
            </button>
        </div>
        <input
v-else v-model.trim="model" type="text" :maxlength="length" :placeholder="placeholder!"
            :style="style" :disabled="props.readonly" />
    </div>
</template>

<style scoped>
.text-input-row {
    display: flex;
    gap: 8px;
    align-items: center;
}
.text-input-row input {
    flex: 1;
}
</style>
