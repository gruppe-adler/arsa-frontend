<script setup lang="ts">

import { v4 as uuidv4 } from 'uuid';
import { ref, watch } from 'vue';
import InfoTooltip from './InfoTooltip.vue';

const props = defineProps({
    readonly: Boolean,
    name: String,
    tooltip: String,
    policyWhitespace: Boolean,
    policyMinimum: Number,
    fieldId: String
});

const emit = defineEmits<{ violation: [isViolating: boolean] }>();

const model = defineModel<string>({ required: true });

const inputId = uuidv4();

function togglePasswordVisibility(event: Event) {
    const input: HTMLInputElement = document.getElementById(inputId) as HTMLInputElement;
    const button: HTMLButtonElement = event.target as HTMLButtonElement;
    if(input.type === 'password') { 
        input.type = 'text';
        button.innerText = 'Hide';
    } else {
        input.type = 'password';
        button.innerText = 'Show';
    }
}

const violation = ref(false);

const style = ref("");

watch(
    model,
    (value) => {
        let policyViolation = false;
        if (props.policyWhitespace && (value.split(' ').length > 1)) { policyViolation = true; }
        if (props.policyMinimum && (value.length < props.policyMinimum)) { policyViolation = true; }
        if (policyViolation) {
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
        <div class="form-custom-input">
            <input :id="inputId" v-model="model" class="password-input" type="password" autocomplete="off" data-1p-ignore data-lpignore="true" :style="style" :disabled="props.readonly">
            <button class="form-input-button" type="button" @click="togglePasswordVisibility($event)">Show</button>
        </div>
    </div>
</template>

<style scoped>
    .password-input {
        flex-grow: 1;
    }
</style>
