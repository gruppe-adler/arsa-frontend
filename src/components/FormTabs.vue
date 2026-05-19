<script setup lang="ts">
import { TabsRoot, TabsList, TabsTrigger } from 'reka-ui';

export interface Tab {
    key: string;
    label: string;
    disabled?: boolean;
}

const props = defineProps<{ tabs: Tab[]; listClass?: string }>();

const activeTab = defineModel<string>({ required: true });
</script>

<template>
    <TabsRoot :model-value="activeTab" @update:model-value="activeTab = $event">
        <TabsList class="tabs" :class="props.listClass">
            <TabsTrigger
                v-for="tab in props.tabs"
                :key="tab.key"
                class="tab-btn"
                :value="tab.key"
                :disabled="tab.disabled"
                :class="{ active: activeTab === tab.key }"
                >{{ tab.label }}</TabsTrigger
            >
        </TabsList>
    </TabsRoot>
</template>
