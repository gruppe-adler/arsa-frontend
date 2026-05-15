<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui';
import InfoTooltip from './InfoTooltip.vue';

const props = defineProps({
    readonly: Boolean,
    name: String,
    tooltip: String
});
const model = defineModel<boolean>({ required: true });
</script>

<template>
    <div class="form-input-container">
        <label class="form-input-label">
            {{ name }}
            <InfoTooltip v-if="tooltip" :content="tooltip" />
        </label>
        <SwitchRoot
            class="switch"
            :class="{ 'switch-disabled': props.readonly }"
            :disabled="props.readonly"
            :model-value="model"
            @update:model-value="model = $event"
        >
            <SwitchThumb class="switch-track">
                <span class="switch-knob" />
            </SwitchThumb>
        </SwitchRoot>
    </div>
</template>

<style scoped>
.switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 36px;
    height: 20px;
    cursor: pointer;
    flex-shrink: 0;
    background: none;
    border: none;
    padding: 0;
}
.switch-track {
    position: absolute;
    inset: 0;
    background: var(--line-strong);
    border-radius: 10px;
    transition: background 140ms ease;
    display: block;
}
.switch[data-state="checked"] .switch-track {
    background: var(--ink);
}
.switch-knob {
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
.switch[data-state="checked"] .switch-knob {
    transform: translateX(16px);
}
.switch-disabled {
    opacity: 0.45;
    cursor: not-allowed;
}
</style>
