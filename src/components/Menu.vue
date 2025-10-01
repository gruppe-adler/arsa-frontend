<script setup lang="ts">
import WebSocket from './WebSocket.vue';
</script>

<template>
    <div class="menu-container">
        <nav class="menu-nav">
            <RouterLink class="menu-item" to="/servers-list">
                <span class="menu-icon">🖥️</span> Servers List
            </RouterLink>
            <RouterLink class="menu-item" to="/add-server">
                <span class="menu-icon">➕</span> Add Server
            </RouterLink>
            <RouterLink class="menu-item" to="/ars-service">
                <span class="menu-icon">⚙️</span> ARS Service
            </RouterLink>
        </nav>

        <WebSocket />
    </div>
</template>

<style scoped>
.menu-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.menu-nav {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.menu-item {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, rgba(37, 45, 61, 0.8) 0%, rgba(45, 55, 72, 0.8) 100%);
    border: 2px solid rgba(45, 55, 72, 0.6);
    border-radius: 8px;
    color: var(--text-secondary);
    font-weight: 500;
    transition: all 0.3s ease;
    text-decoration: none;
    position: relative;
    overflow: hidden;
}

.menu-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(74, 158, 255, 0.2), transparent);
    transition: left 0.5s ease;
}

.menu-item:hover::before {
    left: 100%;
}

.menu-item:hover {
    background: linear-gradient(135deg, rgba(45, 55, 72, 0.9) 0%, rgba(74, 158, 255, 0.2) 100%);
    border-color: var(--primary-accent);
    color: var(--text-primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 158, 255, 0.3);
}

.menu-item.router-link-active {
    background: linear-gradient(135deg, var(--primary-accent) 0%, var(--secondary-accent) 100%);
    border-color: var(--primary-accent);
    color: white;
    box-shadow: 0 0 20px rgba(74, 158, 255, 0.4);
}

.menu-icon {
    font-size: 1.1rem;
    filter: grayscale(0.3);
}

.menu-item:hover .menu-icon,
.menu-item.router-link-active .menu-icon {
    filter: grayscale(0);
}
</style>
