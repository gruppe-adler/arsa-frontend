<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps({
    readonly: Boolean,
    name: String,
    optionalParam: Boolean
});
const model = defineModel<string[] | undefined>({ required: true });

const selectId = crypto.randomUUID();
const inputId = crypto.randomUUID();

const localOptions = ref<string[]>([]);
if (model.value) { 
    localOptions.value = Array.from(model.value!)
}

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
            model.value = localOptions.value
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
    <label class="label" >{{ name }}</label>
    <br/>
    <select class="label" :id="selectId" size="5" style="width: 275px;" :disabled="props.readonly" @focusout="focusout" v-model="model" multiple>
        <option v-for="option in localOptions" :value="option">
            {{ option }}
        </option>
    </select>
    <br/>
    <input class="label" :id="inputId" type="text" :disabled="props.readonly">
    <button type="button" @click="addItem()" :disabled="props.readonly">Add</button>
    <button type="button" @click="removeItem()" :disabled="props.readonly">Delete</button>
    <br/>
</template>

<style scoped>
.label {
    margin-left: 10px;
    margin-right: 10px;
}
</style>
