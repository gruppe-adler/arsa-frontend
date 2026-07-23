<script setup lang="ts">
import { computed, ref } from 'vue';
import InfoTooltip from './InfoTooltip.vue';

const props = defineProps({
    readonly: Boolean,
    name: String,
    tooltip: String,
    placeholder: String,
    fieldId: String
});

const emit = defineEmits<{ violation: [isViolating: boolean] }>();

const model = defineModel<object>({ required: true });

const missionHeader = ref<string>(JSON.stringify(model.value, null, 2));

let violation = false;

const style = computed<string>(() => {
    let style = '';
    try {
        model.value = JSON.parse(missionHeader.value);
        if (violation) {
            violation = false;
            emit('violation', false);
        }
    } catch {
        style = 'background: rgba(255,0,0,0.5);';
        if (!violation) {
            violation = true;
            emit('violation', true);
        }
    }

    return style;
});
</script>

<template>
    <div class="form-input-container" :data-field-id="fieldId">
        <label class="form-input-label">
            {{ name }}
            <InfoTooltip v-if="tooltip" :content="tooltip" />
        </label>
        <textarea v-model="missionHeader" class="json-input" rows="5" :style="style" :disabled="props.readonly" />
    </div>
</template>

<style scoped>
.json-input {
    resize: none;
    overflow-y: scroll;
}
</style>
