<script setup lang="ts">
import { computed, watch } from 'vue';
import {
    SwitchRoot,
    SwitchThumb,
    SelectRoot,
    SelectTrigger,
    SelectValue,
    SelectPortal,
    SelectContent,
    SelectViewport,
    SelectItem,
    SelectItemText
} from 'reka-ui';
import InfoTooltip from './InfoTooltip.vue';
import { StartupParameter } from '../api/model';

const props = defineProps({ readonly: Boolean });

const emit = defineEmits(['violIncr', 'violDecr']);

const model = defineModel<StartupParameter>({ required: true });

let violation = false;
let style = '';

watch(
    model.value,
    value => {
        if (value.type === 'number') {
            if ((value.minVal && (value.value as number) < value.minVal) || (value.maxVal && (value.value as number) > value.maxVal)) {
                style = 'background: rgba(255,0,0,0.5);';
                if (!violation) {
                    violation = true;
                    emit('violIncr');
                }
            } else {
                style = '';
                if (violation) {
                    violation = false;
                    emit('violDecr');
                }
            }
        }
    },
    { immediate: true }
);

const disabled = computed<boolean>(() => (props.readonly || !model.value.enabled ? true : false));

function setEnabled(val: boolean) {
    model.value = { ...model.value, enabled: val };
}
</script>

<template>
    <div class="form-input-container">
        <label class="form-input-label">
            {{ model.parameter }}
            <InfoTooltip v-if="model.tooltip" :content="model.tooltip" side="right" align="start" />
        </label>
        <div class="form-custom-input">
            <SwitchRoot
                class="switch sp-switch"
                :disabled="props.readonly"
                :modelValue="model.enabled"
                @update:modelValue="setEnabled($event)"
            >
                <SwitchThumb class="switch-track">
                    <span class="switch-knob" />
                </SwitchThumb>
            </SwitchRoot>

            <input
                v-if="model.type == 'string'"
                v-model.trim="model.value"
                class="startup-parameter-input"
                type="text"
                :style="style"
                :disabled="disabled"
            />
            <input
                v-if="model.type == 'number'"
                v-model.trim="model.value"
                class="startup-parameter-input"
                type="number"
                :min="model.minVal ?? 0"
                :max="model.maxVal ?? 0"
                step="1"
                :style="style"
                :disabled="disabled"
            />

            <SelectRoot v-if="model.type == 'select'" v-model="model.value as string" :disabled="disabled">
                <SelectTrigger class="select-input select-trigger startup-parameter-input" :style="style">
                    <SelectValue />
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </SelectTrigger>
                <SelectPortal>
                    <SelectContent class="select-content" position="popper" :sideOffset="4">
                        <SelectViewport>
                            <SelectItem v-for="opt in model.valueList" :key="opt" :value="opt" class="select-item">
                                <SelectItemText>{{ opt }}</SelectItemText>
                            </SelectItem>
                        </SelectViewport>
                    </SelectContent>
                </SelectPortal>
            </SelectRoot>
        </div>
    </div>
</template>

<style scoped>
.sp-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 36px;
    height: 20px;
    flex-shrink: 0;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    margin-right: 10px;
}
.sp-switch .switch-track {
    position: absolute;
    inset: 0;
    background: var(--line-strong);
    border-radius: 10px;
    transition: background 140ms ease;
    display: block;
}
.sp-switch[data-state='checked'] .switch-track {
    background: var(--ink);
}
.sp-switch .switch-knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--bg);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
    transition: transform 140ms ease;
    display: block;
}
.sp-switch[data-state='checked'] .switch-knob {
    transform: translateX(16px);
}
.sp-switch:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

.startup-parameter-input {
    flex-grow: 1;
}
</style>
