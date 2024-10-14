<script setup lang="ts">

import { watch } from "vue";
import { isIPv4 } from 'is-ip';
import { useServersStore } from '../stores/servers';

const serversStore = useServersStore();

const props = defineProps({
    readonly: Boolean,
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
    <label class="label">{{ name }}</label>
    <input type="text" :disabled="props.readonly" :style="style" v-model="model">
    <button type="button" @click="model = serversStore.publicIp" :disabled="props.readonly">Auto</button>
    <br/>
</template>

<style scoped>
.label {
    margin-left: 10px;
    margin-right: 10px;
}
</style>
