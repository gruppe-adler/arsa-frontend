<script setup lang="ts">

import { v4 as uuidv4 } from 'uuid';
import { onMounted } from 'vue';

const props = defineProps({
    readonly: Boolean,
    name: String,
    options: Array<String>,
    selectedIndex: Number
});
const model = defineModel<string>({ required: true });

const selectId = uuidv4();

onMounted(() => {
    const select: HTMLSelectElement = document.getElementById(selectId) as HTMLSelectElement;
    select.selectedIndex = props.selectedIndex!;
});

</script>

<template>
    <label class="label" >{{ name }}</label>
    <select :id="selectId" :disabled="props.readonly" v-model="model">
        <option v-for="option in options" :value="option">
            {{ option }}
        </option>
    </select>
    <br/>
</template>

<style scoped>
.label {
    margin-left: 10px;
    margin-right: 10px;
}
</style>
