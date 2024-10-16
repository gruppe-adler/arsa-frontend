<script setup lang="ts">

import crypto from 'crypto';

const props = defineProps({
    readonly: Boolean,
    name: String,
    options: Array<String>
});
const model = defineModel<string[]>({ required: true });

const selectId = crypto.randomUUID();

</script>

<template>
    <label class="label" >{{ name }}</label>
    <br/>
    <select class="label" :id="selectId" size="5" style="width: 275px;" :disabled="props.readonly" v-model="model" multiple>
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
