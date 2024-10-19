<script setup lang="ts">

import { watch } from "vue";

const props = defineProps({
    readonly: Boolean,
    name: String,
    tooltip: String,
    placeholder: String,
    length: Number
});

const emit = defineEmits(['violIncr', 'violDecr'])

const model = defineModel<string>({ required: true });

let violation = false;

let style = "";

watch(
    model,
    (value) => {
        if (value === "") {
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
        <input :title="tooltip" type="text" :maxlength="length" :placeholder="placeholder!" :style="style"
            :disabled="props.readonly" v-model.trim="model" />
    </div>
</template>

<style scoped>
</style>
