<script setup lang="ts">

import { watch } from "vue";
import { isIPv4 } from 'is-ip';
import { useServersStore } from '../stores/servers';
import InfoTooltip from './InfoTooltip.vue';

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

async function getPublicIp(): Promise<void> {
    model.value = await serversStore.getPublicIp()
}

</script>

<template>
    <div class="form-input-container">
        <label class="form-input-label">
            {{ name }}
            <InfoTooltip v-if="tooltip" :content="tooltip" />
        </label>
        <div class="form-custom-input">
            <input
v-model="model" class="ip-address-input" type="text" :disabled="props.readonly"
                :style="style">
            <button
class="form-input-button" type="button" :disabled="props.readonly"
                @click="getPublicIp">Auto</button>
        </div>
    </div>
</template>

<style scoped>
.ip-address-input {
    flex-grow: 1;
}
</style>
