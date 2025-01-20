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

const showImportModsetDialog = ref(false);
const showExportModsetDialog = ref(false);

const selectId = uuidv4();
const modIdInputId = uuidv4();
const nameInputId = uuidv4();
const versionInputId = uuidv4();
const requiredInputId = uuidv4();
const importModsInputId = uuidv4();
const exportModsInputId = uuidv4();

const localMods = ref<Mod[]>(Array.from(model.value));

function addMod() {
    const modIdInput: HTMLInputElement | null = document.getElementById(modIdInputId) as HTMLInputElement;
    const nameInput: HTMLInputElement | null = document.getElementById(nameInputId) as HTMLInputElement;
    const versionInput: HTMLInputElement | null = document.getElementById(versionInputId) as HTMLInputElement;
    const requiredInput: HTMLInputElement | null = document.getElementById(requiredInputId) as HTMLInputElement;

    const required = requiredInput !== null ? requiredInput.checked : true;

    const mod: Mod = {
        modId: modIdInput?.value || '',
        name: nameInput?.value || '',
        version: versionInput?.value || '',
        required: required
    };

    if (!isValidMod(mod)) {
        alert('Mod is not valid');
        return;
    }

    if (mod.version === '') mod.version = undefined;

    localMods.value.push(mod);
    modIdInput.value = '';
    nameInput.value = '';
    versionInput.value = '';
    requiredInput.checked = true;

    setTimeout(() => {
        selectAll();
        model.value = localMods.value;
    }, 0);
}

function removeMod() {
    const select: HTMLSelectElement = document.getElementById(selectId) as HTMLSelectElement;

    const collection = select.selectedOptions;

    // delete all selected elements starting at the end of the list
    // to prevent wrong indexes because of the shrinking list
    const indices: number[] = [];
    // copy all indices
    for (let i = 0; i < collection.length; i++) {
        indices.push(collection[i].index);
    }
    indices.reverse();

    indices.forEach(i => {
        localMods.value.splice(i, 1);
    });

    setTimeout(() => {
        selectAll();
        model.value = localMods.value;
    }, 0);
}

function importModset() {
    const textarea: HTMLTextAreaElement = document.getElementById(importModsInputId) as HTMLTextAreaElement;
    if (!textarea) return;

    let modsetString = textarea.value;
    if (modsetString.trim() === '') return;

    modsetString = '['.concat(modsetString, ']');

    try {
        const modset: Mod[] = JSON.parse(modsetString);

        if (modset.length === 0) return;

        if (!isValidModset(modset)) return;
        modset.forEach(mod => {
            if (!mod.required) mod.required = true;
            localMods.value.push(mod);
        });

        setTimeout(() => {
            selectAll();
            model.value = localMods.value;
        }, 0);
    } catch (error) {
        console.log(error);
    }
}

function exportModset() {
    // execute in next frame to ensure that the textarea is in DOM
    setTimeout(() => {
        const textarea: HTMLTextAreaElement = document.getElementById(exportModsInputId) as HTMLTextAreaElement;
        if (!textarea) return;

        const json = JSON.stringify(localMods.value, null, 2);

        // remove the '[' ']' at start/end because the Reforger export misses them too
        textarea.value = json.substring(2, json.length - 2);
    }, 0);
}

function isValidModset(modset: Mod[]) {
    try {
        modset.forEach(mod => {
            if (!isValidMod(mod)) throw new Error('isValidModset: mod is not valid');
        });
    } catch (error) {
        console.log(error);

        return false;
    }

    return true;
}

function isValidMod(mod: Mod) {
    try {
        if (!mod.modId) throw new Error('isValidMod: modId missing');
        if (!mod.name) throw new Error('isValidMod: name missing');

        if (typeof mod.modId !== 'string') throw new Error('isValidMod: modId is not string');
        if (typeof mod.name !== 'string') throw new Error('isValidMod: name is not string');

        if (mod.modId.length !== 16) throw new Error('isValidMod: modId has wrong length');
        if (mod.name.length === 0) throw new Error('isValidMod: name is empty string');

        const modIdRegEx = new RegExp('^[0-9,A-F]{16}$');
        if (!modIdRegEx.test(mod.modId)) throw new Error('isValidMod: modId has wrong format');

        if (mod.version) {
            if (typeof mod.version !== 'string') throw new Error('isValidMod: version is not string');

            const modVersionRegEx = new RegExp('^[0-9]+.[0-9]+.[0-9]+$');
            if (!modVersionRegEx.test(mod.version)) throw new Error('isValidMod: version has wrong format');
        }

        if (mod.required) {
            if (typeof mod.required !== 'boolean') throw new Error('isValidMod: required is not boolean');
        }
    } catch (error) {
        console.log(error);

        return false;
    }
    return true;
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
    return `${mod.name}${mod.version ? ' v' + mod.version : ''} (${mod.modId}) ${mod.required ? 'required' : 'not required'}`;
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
            <select
                :title="tooltip"
                class="mod-select"
                :id="selectId"
                size="10"
                :disabled="props.readonly"
                @focusout="focusout"
                v-model="model"
                multiple
            >
                <option v-for="mod in localMods" :value="mod">
                    {{ mod2string(mod) }}
                </option>
            </select>
            <div class="mod-modify-group">
                <label class="form-input-label">modId</label>
                <input :id="modIdInputId" type="text" :disabled="props.readonly" />
                <label class="form-input-label">name</label>
                <input :id="nameInputId" type="text" :disabled="props.readonly" />
                <label class="form-input-label">version (optional)</label>
                <input :id="versionInputId" type="text" :disabled="props.readonly" />
                <label class="form-input-label">required (optional)</label>
                <input :id="requiredInputId" class="checkbox" type="checkbox" checked :disabled="props.readonly" />
                <br />
                <div class="button-group">
                    <button class="form-input-button" type="button" @click="addMod" :disabled="props.readonly">Add Mod</button>
                    <button class="form-input-button" type="button" @click="removeMod" :disabled="props.readonly">Delete Mod(s)</button>
                </div>
                <br />
                <div class="button-group">
                    <button
                        class="form-input-button"
                        type="button"
                        @click="showImportModsetDialog = !showImportModsetDialog"
                        :disabled="props.readonly"
                    >
                        Import Modeset
                    </button>
                    <button
                        class="form-input-button"
                        type="button"
                        @click="
                            showExportModsetDialog = true;
                            exportModset();
                        "
                        :disabled="props.readonly"
                    >
                        Export Modeset
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="importModsDiv" v-if="showImportModsetDialog">
        <textarea :id="importModsInputId" class="importModsTextarea" />
        <button
            class="importModsButton"
            type="button"
            @click="
                importModset();
                showImportModsetDialog = false;
            "
            :disabled="props.readonly"
        >
            Import
        </button>
    </div>
    <div class="exportModsDiv" v-if="showExportModsetDialog">
        <textarea :id="exportModsInputId" class="exportModsTextarea" />
        <button class="exportModsButton" type="button" @click="showExportModsetDialog = false" :disabled="props.readonly">Close</button>
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

.checkbox {
    justify-self: start;
}

.importModsDiv {
    display: grid;
    grid-template-rows: 12fr 1fr;
    background-color: white;
    box-shadow: 3px 3px 6px grey;
}

.importModsTextarea {
    margin: 5px;
    resize: none;
}

.importModsButton {
    margin: 5px;
}

.exportModsDiv {
    display: grid;
    grid-template-rows: 12fr 1fr;
    background-color: white;
    box-shadow: 3px 3px 6px grey;
}

.exportModsTextarea {
    margin: 5px;
    resize: none;
}
</style>
