<script setup lang="ts">

const props = defineProps({
    readonly: Boolean,
    name: String,
    tooltip: String
});
const model = defineModel<boolean>({ required: true });

</script>

<template>
    <div class="form-input-container">
        <label class="form-input-label">{{ name }}</label>
        <input :title="tooltip" class="checkbox" type="checkbox" :disabled="props.readonly" v-model="model">
    </div>
</template>

<style scoped>
    .checkbox {
        justify-self: start;
    }
</style>
