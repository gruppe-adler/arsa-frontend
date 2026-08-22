<script setup lang="ts">
import {
    ComboboxRoot,
    ComboboxAnchor,
    ComboboxInput,
    ComboboxContent,
    ComboboxViewport,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxItemIndicator
} from 'reka-ui';

const props = defineProps({
    readonly: Boolean,
    name: String,
    tooltip: String,
    options: {
        type: Array as () => string[],
        required: true
    },
    placeholder: {
        type: String,
        default: 'Search...'
    }
});

const model = defineModel<string>({ required: true });
</script>

<template>
    <div>
        <ComboboxRoot v-model="model" class="combobox-root" :disabled="props.readonly">
            <ComboboxAnchor class="combobox-anchor">
                <ComboboxInput class="combobox-input" :placeholder="placeholder" />
            </ComboboxAnchor>

            <ComboboxContent class="combobox-content" position="popper" :sideOffset="4">
                <ComboboxViewport class="combobox-viewport">
                    <ComboboxEmpty class="combobox-empty">No results found</ComboboxEmpty>

                    <ComboboxItem v-for="option in options" :key="option" :value="option" class="combobox-item">
                        <ComboboxItemIndicator class="combobox-item-indicator">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </ComboboxItemIndicator>
                        {{ option }}
                    </ComboboxItem>
                </ComboboxViewport>
            </ComboboxContent>
        </ComboboxRoot>
    </div>
</template>

<style scoped>
.combobox-root {
    position: relative;
    width: 100%;
}

.combobox-anchor {
    display: flex;
    align-items: center;
    height: 32px;
    gap: 8px;
    background-color: var(--bg);
    border: 1px solid var(--gray-7);
    border-radius: 4px;
    font-size: 13px;
}

.combobox-anchor:focus-within {
    border-color: var(--blue-8);
    outline: none;
}

.combobox-anchor:hover:not(:disabled) {
    border-color: var(--gray-8);
}

.combobox-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--gray-12);
    font-size: 13px;
}

.combobox-input::placeholder {
    color: var(--gray-9);
}

.combobox-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    cursor: pointer;
    color: var(--gray-10);
}

.combobox-content {
    z-index: 50;
    border: 1px solid var(--gray-7);
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    border: black 2px solid;
}

.combobox-viewport {
    padding: 4px 0;
    max-height: 200px;
    overflow-y: auto;
}

.combobox-empty {
    padding: 8px 12px;
    text-align: center;
    font-size: 12px;
    color: var(--gray-10);
    width: var(--reka-combobox-anchor-width);
}

.combobox-item {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 32px;
    padding: 0 12px;
    cursor: pointer;
    font-size: 13px;
    color: var(--gray-12);
    user-select: none;
    width: var(--reka-popper-anchor-width);
    border: 1px solid var(--line-strong);
    border-radius: 4px;
    background: var(--bg);
}

.combobox-item[data-highlighted] {
    background-color: var(--bg-soft);
}

.combobox-item[data-state='checked'] {
    background-color: var(--bg-soft);
}

.combobox-item-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: var(--blue-10);
}

.combobox-item:not([data-state='checked']) .combobox-item-indicator {
    visibility: hidden;
}
</style>
