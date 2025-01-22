<script setup lang="ts">
import WebSocket from './WebSocket.vue';
</script>

<template>
    <div>
        <nav style="float: left">
            <RouterLink class="menu-item" to="/servers-list">Servers List</RouterLink>
            <RouterLink class="menu-item" to="/add-server">Add Server</RouterLink>
            <RouterLink class="menu-item" to="/ars-service">ARS Service</RouterLink>
        </nav>

        <WebSocket />
    </div>
    <br />
</template>

<style scoped>
.menu-item {
    margin-right: 10px;
}
</style>
