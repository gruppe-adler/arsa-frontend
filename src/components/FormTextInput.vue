<script setup lang="ts">

import { watch } from "vue";

const props = defineProps({
    readonly: Boolean,
    name: String,
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
    <label class="label">{{ name }}</label>
    <input type="text" :maxlength="length" :size="length" :placeholder="placeholder!" :style="style"
        :disabled="props.readonly" v-model.trim="model" />
    <br />
</template>

<style scoped>
.label {
    margin-left: 10px;
    margin-right: 10px;
}
</style>
