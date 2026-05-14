<script setup lang="ts">
const props = defineProps({
    readonly: Boolean,
    name: String,
    tooltip: String
});
const model = defineModel<boolean>({ required: true });
</script>

<template>
    <div class="form-input-container">
        <label class="form-input-label">{{ name }}</label>
        <label class="switch" :title="tooltip" :class="{ 'switch-disabled': props.readonly }">
            <input type="checkbox" :disabled="props.readonly" v-model="model" />
            <span class="switch-track">
                <span class="switch-knob"></span>
            </span>
        </label>
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
}
.switch input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
}
.switch-track {
    position: absolute;
    inset: 0;
    background: var(--line-strong);
    border-radius: 10px;
    transition: background 140ms ease;
}
.switch input:checked ~ .switch-track {
    background: var(--ink);
}
.switch-knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
    transition: transform 140ms ease;
}
.switch input:checked ~ .switch-track .switch-knob {
    transform: translateX(16px);
}
.switch-disabled {
    opacity: 0.45;
    cursor: not-allowed;
}
</style>
