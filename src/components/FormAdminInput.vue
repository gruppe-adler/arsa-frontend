<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import FormMultiSelectModInput from './FormMultiSelectModInput.vue';
import { useServersStore } from '../stores/servers';
import { computedAsync } from '@vueuse/core';

const props = defineProps({
    readonly: Boolean,
});
const model = defineModel<string[] | undefined>({ required: true });

const selected = ref<string>();

const serversStore = useServersStore();

// const localOptions = ref<string[]>([]);

// if (model.value) localOptions.value = Array.from(model.value!);

// watch(
//     model,
//     // value => {
//     //     if (value) localOptions.value = Array.from(model.value!);
//     // },
//     // { immediate: true }
// );

const knownPlayers = computedAsync(() => {
    return serversStore.getKnownPlayers() ?? []
})

function addItem() {
    if (!model.value || model.value!.includes(selected.value ?? '')) {
        return;
    }

    model.value = [...model.value, selected.value ?? ''];
}

function removeItem() {
    if (!model.value || !model.value!.includes(selected.value ?? '')) {
        return;
    }

    model.value = model.value.filter(x => x !== selected.value);
}

onMounted(() => {
    // selectAll();
});
</script>

<template>
    <FormMultiSelectModInput :name="'admins'" :tooltip="'default []'"
        :regEx="['^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', '^[0-9]{17}$']"
        :readonly="props.readonly" v-model="model"></FormMultiSelectModInput>
    <div class="form-input-container">
        <label class="form-input-label">Known players</label>
        <div class="modify-group" style="width: 100%;">
            <select v-model="selected" :disabled="props.readonly">
                <option value="">Please select one</option>
                <option v-for="player in knownPlayers" :value="player.identityId">
                    {{ player.name }} ({{ player.identityId }})
                </option>
            </select>
            <button class="form-input-button" type="button" @click="addItem()"
                :disabled="selected === '' || model?.includes(selected ?? '') === true">Add</button>
            <button class="form-input-button" type="button" @click="removeItem()"
                :disabled="selected === '' || !model?.includes(selected ?? '')">Delete</button>
        </div>
    </div>
</template>

<style scoped>
.multi-select-mod {
    width: 100%;
    margin-bottom: 5px;
}

.modify-group {
    display: flex;
}

.mod-input {
    flex-grow: 1;
}

select {
    width: inherit;
}
</style>
