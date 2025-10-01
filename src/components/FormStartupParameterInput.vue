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
    return (props.readonly || !model.value.enabled) ? true : false;
});

</script>

<template>
    <div class="form-input-container">
        <label class="form-input-label">{{ model.parameter }}</label>
        <div class="form-custom-input">
            <div class="toggle-wrapper">
                <input 
                    :id="`toggle-${model.parameter}`"
                    class="startup-parameter-checkbox" 
                    type="checkbox" 
                    :disabled="props.readonly"
                    v-model="model.enabled"
                >
                <label :for="`toggle-${model.parameter}`" class="toggle-label">
                    <span class="toggle-button"></span>
                </label>
            </div>
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
.toggle-wrapper {
    display: flex;
    align-items: center;
    margin-right: 10px;
    flex-shrink: 0;
}

.startup-parameter-checkbox {
    opacity: 0;
    position: absolute;
    pointer-events: none;
}

.toggle-label {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 30px;
    background: linear-gradient(135deg, var(--secondary-bg) 0%, var(--tertiary-bg) 100%);
    border: 2px solid var(--border-color);
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.toggle-label:hover {
    border-color: var(--primary-accent);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 8px rgba(74, 158, 255, 0.3);
}

.toggle-button {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, var(--text-muted) 0%, var(--text-secondary) 100%);
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

.toggle-button::before {
    content: '✕';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    color: var(--primary-bg);
    font-weight: bold;
    opacity: 0.7;
}

/* Checked state */
.startup-parameter-checkbox:checked + .toggle-label {
    background: linear-gradient(135deg, var(--primary-accent) 0%, var(--secondary-accent) 100%);
    border-color: var(--primary-accent);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 12px rgba(74, 158, 255, 0.4);
}

.startup-parameter-checkbox:checked + .toggle-label .toggle-button {
    left: 33px;
    background: linear-gradient(135deg, #ffffff 0%, var(--text-primary) 100%);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
}

.startup-parameter-checkbox:checked + .toggle-label .toggle-button::before {
    content: '✓';
    color: var(--primary-accent);
    font-size: 14px;
    font-weight: bold;
    opacity: 1;
}

/* Disabled state */
.startup-parameter-checkbox:disabled + .toggle-label {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(0.5);
}

.startup-parameter-checkbox:disabled + .toggle-label:hover {
    border-color: var(--border-color);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Focus state for accessibility */
.startup-parameter-checkbox:focus + .toggle-label {
    outline: 2px solid var(--primary-accent);
    outline-offset: 2px;
}

/* Animation on check */
.startup-parameter-checkbox:checked + .toggle-label .toggle-button {
    animation: toggleBounce 0.3s ease;
}

@keyframes toggleBounce {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
    100% {
        transform: scale(1);
    }
}

.startup-parameter-input {
    flex-grow: 1;
}
</style>
