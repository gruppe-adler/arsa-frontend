<script setup lang="ts">
import {
    SelectRoot, SelectTrigger, SelectValue, SelectPortal,
    SelectContent, SelectViewport, SelectItem, SelectItemText,
} from 'reka-ui';
import InfoTooltip from './InfoTooltip.vue';

const props = defineProps({
    readonly: Boolean,
    name: String,
    tooltip: String,
    options: Array<string>,
    selectedIndex: Number,
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
            <SelectTrigger class="select-input select-trigger">
                <SelectValue />
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </SelectTrigger>
            <SelectPortal>
                <SelectContent class="select-content" position="popper" :sideOffset="4">
                    <SelectViewport>
                        <SelectItem
                            v-for="opt in options"
                            :key="String(opt)"
                            :value="String(opt)"
                            class="select-item"
                        >
                            <SelectItemText>{{ opt }}</SelectItemText>
                        </SelectItem>
                    </SelectViewport>
                </SelectContent>
            </SelectPortal>
        </SelectRoot>
    </div>
</template>

<style scoped>
</style>
