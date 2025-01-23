<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid';
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
    readonly: Boolean,
    name: String,
    tooltip: String,
    optionalParam: Boolean
});
const model = defineModel<string[] | undefined>({ required: true });

const selectId = uuidv4();
const inputId = uuidv4();

const localOptions = ref<string[]>([]);

if (model.value) localOptions.value = Array.from(model.value!);

watch(
    model,
    value => {
        if (value) localOptions.value = Array.from(model.value!);
    },
    { immediate: true }
);

function addItem() {
    const input: HTMLInputElement = document.getElementById(inputId) as HTMLInputElement;
    localOptions.value.push(input.value);
    input.value = '';
    assignNewValue();
}

function removeItem() {
    const select: HTMLSelectElement = document.getElementById(selectId) as HTMLSelectElement;
    localOptions.value.splice(select.selectedIndex, 1);
    assignNewValue();
}

function assignNewValue() {
    setTimeout(() => {
        selectAll();
        if (props.optionalParam && localOptions.value.length === 0) {
            model.value = undefined;
        } else {
            model.value = localOptions.value;
        }
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
                class="multi-select-mod"
                :id="selectId"
                size="5"
                :disabled="props.readonly"
                @focusout="focusout"
                v-model="model"
                multiple
            >
                <option v-for="option in localOptions" :value="option">
                    {{ option }}
                </option>
            </select>
            <div class="modify-group">
                <input class="mod-input" :id="inputId" type="text" :disabled="props.readonly" />
                <button class="form-input-button" type="button" @click="addItem()" :disabled="props.readonly">Add</button>
                <button class="form-input-button" type="button" @click="removeItem()" :disabled="props.readonly">Delete</button>
            </div>
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
</style>
