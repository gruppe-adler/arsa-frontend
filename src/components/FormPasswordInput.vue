<script setup lang="ts">

import crypto from 'crypto';
import { watch } from 'vue';

const props = defineProps({
    readonly: Boolean,
    name: String,
    policyWhitespace: Boolean,
    policyMinimum: Number
});

const emit = defineEmits(['violIncr', 'violDecr'])

const model = defineModel<string>({ required: true });

const inputId = crypto.randomUUID();

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
    <label class="label">{{ name }}</label>
        <input :id="inputId" type="password" autocomplete="off" data-1p-ignore data-lpignore="true" :style="style" :disabled="props.readonly" v-model="model">
        <button type="button" @click="togglePasswordVisibility($event)">Show</button>
        <br/>
</template>

<style scoped>
.label {
    margin-left: 10px;
    margin-right: 10px;
}
</style>
