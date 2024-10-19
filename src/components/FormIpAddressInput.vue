<script setup lang="ts">

import { watch } from "vue";
import { isIPv4 } from 'is-ip';
import { useServersStore } from '../stores/servers';

const serversStore = useServersStore();

const props = defineProps({
    readonly: Boolean,
    tooltip: String,
    name: String
});

const emit = defineEmits(['violIncr', 'violDecr'])

const model = defineModel<string>({ required: true });

let violation = false;

let style = "";

watch(
    model,
    (value) => {
        if (!isIPv4(value)) {
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
            <input :title="tooltip" class="ip-address-input" type="text" :disabled="props.readonly" :style="style" v-model="model">
            <button class="form-input-button" type="button" @click="model = serversStore.publicIp" :disabled="props.readonly">Auto</button>
        </div>
    </div>
</template>

<style scoped>
    .ip-address-input {
        flex-grow: 1;
    }
</style>
