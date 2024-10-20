<script setup lang="ts">

import { computed, watch } from "vue";
import { StartupParameter } from "../utils/interfaces";

const props = defineProps({
    readonly: Boolean
});

const emit = defineEmits(['violIncr', 'violDecr'])

const model = defineModel<StartupParameter>({ required: true });

let violation = false;

let style = "";

watch(
    model.value,
    (value) => {
        if (value.type === 'number') {
            if (value.value as number < value.minVal! || value.value as number > value.maxVal!) {
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
        }
    },
    { immediate: true }
);

const disabled = computed<boolean>(() => {
    return (props.readonly || model.value.enabled) ? false : true;
});

</script>

<template>
    <div class="form-input-container">
        <label class="form-input-label">{{ model.parameter }}</label>
        <div class="form-custom-input">
            <input class="startup-parameter-checkbox" type="checkbox" :disabled="props.readonly"
                v-model="model.enabled">
            <input class="startup-parameter-input" :title="model.tooltip" type="text" :style="style"
                :disabled="disabled" v-model.trim="model.value" v-if="model.type == 'string'" />
            <input class="startup-parameter-input" :title="model.tooltip" type="number" :min="model.minVal"
                :max="model.maxVal" step="1" :style="style" :disabled="disabled" v-model.trim="model.value"
                v-if="model.type == 'number'" />
            <select class="startup-parameter-input" :title="model.tooltip" :style="style" :disabled="disabled"
                v-model="model.value" v-if="model.type == 'select'">
                <option v-for="option in model.valueList" :value="option">
                    {{ option }}
                </option>
            </select>
        </div>
    </div>
</template>

<style scoped>
.startup-parameter-checkbox {
    margin-right: 10px;
}

.startup-parameter-input {
    flex-grow: 1;
}
</style>
