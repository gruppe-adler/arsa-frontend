<script setup lang="ts">

import { ref, watch } from "vue";
import { isIPv4 } from 'is-ip';
import { useServersStore } from '../stores/servers';
import InfoTooltip from './InfoTooltip.vue';

const serversStore = useServersStore();

const props = defineProps({
    readonly: Boolean,
    tooltip: String,
    name: String,
    fieldId: String
});

const emit = defineEmits<{ violation: [isViolating: boolean] }>();

const model = defineModel<string>({ required: true });

const violation = ref(false);

const style = ref("");

watch(
    model,
    (value) => {
        if (!isIPv4(value)) {
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

async function getPublicIp(): Promise<void> {
    model.value = await serversStore.getPublicIp()
}

</script>

<template>
    <div class="form-input-container" :data-field-id="fieldId">
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
