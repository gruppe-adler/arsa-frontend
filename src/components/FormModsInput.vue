<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid';
import { onMounted, ref, watch } from 'vue';
import { type Mod } from '../utils/interfaces';

import Ajv from 'ajv';
import ajvFormats from 'ajv-formats';
import ajvKeywords from 'ajv-keywords';
import { arsModSchema, arsModsetSchema } from '../utils/json-schema';

const ajv = new Ajv({ allErrors: true, useDefaults: true });
ajvFormats(ajv);
ajvKeywords(ajv);

const validateMod = ajv.compile(arsModSchema);
const validateModset = ajv.compile(arsModsetSchema);

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

watch(
    model,
    value => {
        localMods.value = Array.from(value);
    },
    { immediate: true }
);

function addMod() {
    const modIdInput: HTMLInputElement | null = document.getElementById(modIdInputId) as HTMLInputElement;
    const nameInput: HTMLInputElement | null = document.getElementById(nameInputId) as HTMLInputElement;
    const versionInput: HTMLInputElement | null = document.getElementById(versionInputId) as HTMLInputElement;
    const requiredInput: HTMLInputElement | null = document.getElementById(requiredInputId) as HTMLInputElement;

    let version: string | undefined = versionInput?.value || '';
    if (version === '') version = undefined;

    const required = requiredInput !== null ? requiredInput.checked : true;

    const mod: Mod = {
        modId: modIdInput?.value || '',
        name: nameInput?.value || '',
        version: version,
        required: required
    };

    const valid = validateMod(mod);

    if (!valid) {
        console.log(validateMod.errors);
        alert('JSON Mod validation failed. See browser console for details. Adding Mod aborted.');
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

    let modset: Mod[] = [];

    try {
        modset = JSON.parse(modsetString);
    } catch (error) {
        console.log(error);
        alert('Not valid JSON. See browser console for details');
        return;
    }
    if (modset.length === 0) return;

    const valid = validateModset(modset);

    if (!valid) {
        console.log(validateModset.errors);
        alert('JSON Modset validation failed. See browser console for details. Modset import aborted.');
        return;
    }

    modset.forEach(mod => {
        if (!mod.required) mod.required = true;
        localMods.value.push(mod);
    });

    setTimeout(() => {
        selectAll();
        model.value = localMods.value;
    }, 0);
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
            <select :title="tooltip" class="mod-select" :id="selectId" size="10" :disabled="props.readonly" @focusout="focusout" multiple>
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
