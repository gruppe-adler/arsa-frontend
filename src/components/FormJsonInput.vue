<script setup lang="ts">

import { computed, ref } from "vue";

const props = defineProps({
    readonly: Boolean,
    name: String,
    tooltip: String,
    placeholder: String
});

const emit = defineEmits(['violIncr', 'violDecr'])

const model = defineModel<object>({ required: true });

const missionHeader = ref<string>(JSON.stringify(model.value, null, 2));

let violation = false;

const style = computed<string>(() => {
    let style = '';
    try {
        model.value = JSON.parse(missionHeader.value);
        if (violation) {
            violation = false;
            emit('violDecr');
        }
    }
    catch (e) {
        style = "background: rgba(255,0,0,0.5);";
        if (!violation) {
            violation = true;
            emit('violIncr');
        }
    }

    return style;
});

</script>

<template>
    <div class="form-input-container">
        <label class="form-input-label">{{ name }}</label>
        <textarea :title="tooltip" class="json-input" rows="5" :style="style" :disabled="props.readonly" v-model="missionHeader" />
    </div>
</template>

<style scoped>
    .json-input {
        resize: none;
        overflow-y: scroll;
    }
</style>
