<script setup lang="ts">

const props = defineProps({
    readonly: Boolean,
    name: String
});
const model = defineModel<boolean>({ required: true });

</script>

<template>
    <label class="label">{{ name }}</label>
    <input type="checkbox" :disabled="props.readonly" v-model="model">
    <br/>
</template>

<style scoped>
.label {
    margin-left: 10px;
    margin-right: 10px;
}
</style>
