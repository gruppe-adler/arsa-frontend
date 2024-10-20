<script setup lang="ts">

import { v4 as uuidv4 } from 'uuid';
import { onMounted, ref } from 'vue';
import { type Mod } from '../utils/interfaces';

const props = defineProps({
    readonly: Boolean,
    name: String,
    tooltip: String
});
const model = defineModel<Mod[]>({ required: true });

const selectId = uuidv4();
const modIdInputId = uuidv4();
const nameInputId = uuidv4();
const versionInputId = uuidv4();

const localMods = ref<Mod[]>(Array.from(model.value));

function addMod() {
    const modIdInput: HTMLInputElement | null = document.getElementById(modIdInputId) as HTMLInputElement;
    const nameInput: HTMLInputElement | null = document.getElementById(nameInputId) as HTMLInputElement;
    const versionInput: HTMLInputElement | null = document.getElementById(versionInputId) as HTMLInputElement;
    localMods.value.push({ modId: modIdInput?.value || '', name: nameInput?.value || '', version: versionInput?.value || '', })
    modIdInput.value = '';
    nameInput.value = '';
    versionInput.value = '';
    setTimeout(() => {selectAll(); model.value = localMods.value}, 0);
}

function removeMod() {
    const select: HTMLSelectElement = document.getElementById(selectId) as HTMLSelectElement;
    localMods.value.splice(select.selectedIndex, 1);
    setTimeout(() => {selectAll(); model.value = localMods.value}, 0);
}

function selectAll() {
    const select: HTMLSelectElement = document.getElementById(selectId) as HTMLSelectElement;
    const collection: HTMLCollectionOf<HTMLOptionElement> = select.options;
    for (let index = 0; index < collection.length; index++) {
        const option: HTMLOptionElement = collection.item(index) as HTMLOptionElement;
        option.selected = true;
    }
}

function mod2string(mod: Mod) {
    return `${mod.name} v${mod.version} (${mod.modId})`;
}

function focusout() {
    // if the focusout is trigged by pressing the remove button then we need
    // time to get the current selection before it's overwritten by selectAll
    
    setTimeout(() => {
        selectAll();
    }, 1_000);
}

onMounted(() => {
    selectAll();
});

</script>

<template>
    <div class="form-input-container">
        <label class="form-input-label">{{ name }}</label>
        <div>
            <select :title="tooltip" class="mod-select" :id="selectId" size="10" :disabled="props.readonly" @focusout="focusout" v-model="model" multiple>
                <option v-for="mod in localMods" :value="mod">
                    {{ mod2string(mod) }}
                </option>
            </select>
            <div class="mod-modify-group">
                <label class="form-input-label">modId</label>
                <input :id="modIdInputId" type="text" :disabled="props.readonly">
                <label class="form-input-label">name</label>
                <input :id="nameInputId" type="text" :disabled="props.readonly">
                <label class="form-input-label">version (optional)</label>
                <input :id="versionInputId" type="text" :disabled="props.readonly">
                <br/>
                <div class="button-group">
                    <button class="form-input-button" type="button" @click="addMod" :disabled="props.readonly">Add</button>
                    <button class="form-input-button" type="button" @click="removeMod" :disabled="props.readonly">Delete</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .mod-select {
        width: 100%;
        margin-bottom: 5px;
    }

    .mod-modify-group {
        display: grid;
        grid-template-columns: 1fr 2fr;
        grid-template-rows: 1fr 1fr 1fr 1fr;
        column-gap: 15px;
        row-gap: 5px;
    }

    .button-group {
        justify-self: end;
    }
</style>
