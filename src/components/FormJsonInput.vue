<script setup lang="ts">

import { computed, ref } from "vue";

const props = defineProps({
    readonly: Boolean,
    name: String,
    placeholder: String
});

const emit = defineEmits(['violIncr', 'violDecr'])

const model = defineModel<object>({ required: true });

const missionHeader = ref<string>(JSON.stringify(model.value));

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
    <label class="label">{{ name }}</label>
    <br />  
    <input class="label" type="text" size="100" :style="style" :disabled="props.readonly" v-model="missionHeader" />
    <br />
</template>

<style scoped>
.label {
    margin-left: 10px;
    margin-right: 10px;
}
</style>
