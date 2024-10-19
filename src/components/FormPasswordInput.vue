<script setup lang="ts">

import { v4 as uuidv4 } from 'uuid';
import { watch } from 'vue';

const props = defineProps({
    readonly: Boolean,
    name: String,
    tooltip: String,
    policyWhitespace: Boolean,
    policyMinimum: Number
});

const emit = defineEmits(['violIncr', 'violDecr'])

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

let violation = false;

let style = "";

watch(
    model,
    (value) => {
        let policyViolation = false;
        if (props.policyWhitespace && (value.split(' ').length > 1)) { policyViolation = true; }
        if (props.policyMinimum && (value.length < props.policyMinimum)) { policyViolation = true; }
        if (policyViolation) {
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
        <div class="form-custom-input">
            <input :title="tooltip" class="password-input" :id="inputId" type="password" autocomplete="off" data-1p-ignore data-lpignore="true" :style="style" :disabled="props.readonly" v-model="model">
            <button class="form-input-button" type="button" @click="togglePasswordVisibility($event)">Show</button>
        </div>
    </div>
</template>

<style scoped>
    .password-input {
        flex-grow: 1;
    }
</style>
