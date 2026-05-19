<script setup lang="ts">
import {
    SelectRoot,
    SelectTrigger,
    SelectValue,
    SelectPortal,
    SelectContent,
    SelectViewport,
    SelectItem,
    SelectItemText,
    SelectScrollUpButton,
    SelectScrollDownButton,
    SelectGroup,
    SelectItemIndicator
} from 'reka-ui';
import InfoTooltip from './InfoTooltip.vue';

const props = defineProps({
    readonly: Boolean,
    name: String,
    tooltip: String,
    options: {
        type: Array as () => string[],
        required: true
    },
    placeholder: String
});

const model = defineModel<string>({ required: true });
</script>

<template>
    <div class="form-input-container">
        <label class="form-input-label">
            {{ name }}
            <InfoTooltip v-if="tooltip" :content="tooltip" />
        </label>
        <SelectRoot v-model="model" :disabled="props.readonly">
            <SelectTrigger class="select-trigger" :aria-label="`Select ${name}`">
                <SelectValue :placeholder="placeholder" />
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
                <SelectContent class="select-content" :sideOffset="4">
                    <SelectScrollUpButton class="select-scroll-button">
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
                            <path d="m18 15-6-6-6 6" />
                        </svg>
                    </SelectScrollUpButton>

                    <SelectViewport class="select-viewport">
                        <SelectGroup>
                            <SelectItem v-for="option in options" :key="option" class="select-item" :value="option">
                                <SelectItemIndicator class="select-item-indicator">
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >
                                        <path d="M20 6 9 17l-5-5" />
                                    </svg>
                                </SelectItemIndicator>
                                <SelectItemText>{{ option }}</SelectItemText>
                            </SelectItem>
                        </SelectGroup>
                    </SelectViewport>

                    <SelectScrollDownButton class="select-scroll-button">
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
                    </SelectScrollDownButton>
                </SelectContent>
            </SelectPortal>
        </SelectRoot>
    </div>
</template>

<style scoped>
.select-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--line-strong);
    background: var(--bg);
    color: var(--ink);
    font: inherit;
    font-size: 14px;
    border-radius: var(--radius);
    cursor: pointer;
    transition: border-color 80ms ease;
}

.select-trigger:hover {
    border-color: var(--ink-4);
}

.select-trigger:focus {
    outline: none;
    border-color: var(--ink);
}

.select-trigger[data-state='open'] {
    border-color: var(--ink);
}

.select-trigger:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    background: var(--bg-soft);
}

.select-trigger svg {
    flex-shrink: 0;
    transition: transform 200ms ease;
}

.select-trigger[data-state='open'] svg {
    transform: rotate(180deg);
}

.select-content {
    background: var(--bg);
    border: 1px solid var(--line-strong);
    border-radius: var(--radius);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 50;
    overflow: hidden;
}

.select-scroll-button {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 24px;
    cursor: pointer;
    color: var(--ink-3);
    background: var(--bg);
    border: none;
    padding: 0;
    transition: background 80ms ease;
}

.select-scroll-button:hover {
    background: var(--bg-soft);
}

.select-viewport {
    padding: 4px 0;
}

.select-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    outline: none;
    transition: background 80ms ease;
}

.select-item:hover,
.select-item[data-highlighted] {
    background: var(--bg-soft);
}

.select-item[data-state='checked'] {
    background: color-mix(in oklab, var(--indigo), transparent 80%);
}

.select-item-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    color: var(--indigo);
    opacity: 0;
    transition: opacity 80ms ease;
}

.select-item[data-state='checked'] .select-item-indicator {
    opacity: 1;
}
</style>
