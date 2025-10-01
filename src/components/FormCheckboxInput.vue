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
        <div class="toggle-wrapper">
            <input 
                :id="`toggle-${name}`"
                :title="tooltip" 
                class="toggle-checkbox" 
                type="checkbox" 
                :disabled="props.readonly" 
                v-model="model"
            >
            <label :for="`toggle-${name}`" class="toggle-label">
                <span class="toggle-button"></span>
            </label>
        </div>
    </div>
</template>

<style scoped>
.toggle-wrapper {
    justify-self: start;
    display: flex;
    align-items: center;
}

.toggle-checkbox {
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
.toggle-checkbox:checked + .toggle-label {
    background: linear-gradient(135deg, var(--primary-accent) 0%, var(--secondary-accent) 100%);
    border-color: var(--primary-accent);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 12px rgba(74, 158, 255, 0.4);
}

.toggle-checkbox:checked + .toggle-label .toggle-button {
    left: 33px;
    background: linear-gradient(135deg, #ffffff 0%, var(--text-primary) 100%);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
}

.toggle-checkbox:checked + .toggle-label .toggle-button::before {
    content: '✓';
    color: var(--primary-accent);
    font-size: 14px;
    font-weight: bold;
    opacity: 1;
}

/* Disabled state */
.toggle-checkbox:disabled + .toggle-label {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(0.5);
}

.toggle-checkbox:disabled + .toggle-label:hover {
    border-color: var(--border-color);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Focus state for accessibility */
.toggle-checkbox:focus + .toggle-label {
    outline: 2px solid var(--primary-accent);
    outline-offset: 2px;
}

/* Animation on check */
.toggle-checkbox:checked + .toggle-label .toggle-button {
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
</style>
