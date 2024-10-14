<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { type Mod } from '../utils/interfaces';

const props = defineProps({
    readonly: Boolean,
    name: String
});
const model = defineModel<Mod[]>({ required: true });

const selectId = crypto.randomUUID();
const modIdInputId = crypto.randomUUID();
const nameInputId = crypto.randomUUID();
const versionInputId = crypto.randomUUID();

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
    <label class="label">{{ name }}</label>
    <br/>
    <select class="label" :id="selectId" size="5" style="width: 800px;" :disabled="props.readonly" @focusout="focusout" v-model="model" multiple>
        <option v-for="mod in localMods" :value="mod">
            {{ mod2string(mod) }}
        </option>
    </select>
    <br/>
    <label class="label" >modId</label>
    <input :id="modIdInputId" type="text" :disabled="props.readonly">
    <label class="label" >name</label>
    <input :id="nameInputId" type="text" :disabled="props.readonly">
    <label class="label" >version (optional)</label>
    <input :id="versionInputId" type="text" :disabled="props.readonly">
    <button type="button" @click="addMod" :disabled="props.readonly">Add</button>
    <button type="button" @click="removeMod" :disabled="props.readonly">Delete</button>
</template>

<style scoped>
.label {
    margin-left: 10px;
    margin-right: 10px;
}
</style>
