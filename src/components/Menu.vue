<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue';

const navEl = ref<HTMLElement | null>(null);
const showStartFade = ref(false);
const showEndFade = ref(false);

function updateFades() {
    const el = navEl.value;
    if (!el) return;
    showStartFade.value = el.scrollLeft > 1;
    showEndFade.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
}

onMounted(() => {
    nextTick(updateFades);
    navEl.value?.addEventListener('scroll', updateFades, { passive: true });
    window.addEventListener('resize', updateFades);
});
onUnmounted(() => {
    navEl.value?.removeEventListener('scroll', updateFades);
    window.removeEventListener('resize', updateFades);
});
</script>

<template>
    <div class="nav-wrap">
        <nav ref="navEl" class="nav">
            <RouterLink class="nav-link" to="/servers-list">Servers</RouterLink>
            <RouterLink class="nav-link" to="/known-players">Known Players</RouterLink>
            <RouterLink class="nav-link" to="/workshop">Workshop</RouterLink>
            <RouterLink class="nav-link" to="/ars-service">ARS Service</RouterLink>
            <RouterLink class="nav-link" to="/defaults">Defaults</RouterLink>
        </nav>
        <div class="nav-fade nav-fade-start" :class="{ visible: showStartFade }" aria-hidden="true"></div>
        <div class="nav-fade nav-fade-end" :class="{ visible: showEndFade }" aria-hidden="true"></div>
    </div>
</template>

<style scoped>
.nav-wrap {
    position: relative;
    flex: 1;
    min-width: 0;
}
.nav {
    display: flex;
    gap: 4px;
    /* min-width: 0 lets this flex item shrink below its content width instead of
       forcing .topbar-inner (and the whole page) wider than the viewport; the
       overflow-x then scrolls just the nav itself when links still don't fit. */
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
}
.nav::-webkit-scrollbar {
    display: none;
}
.nav-link {
    color: var(--ink-2);
    text-decoration: none;
    padding: 8px 12px;
    border-radius: var(--radius);
    font-weight: 500;
    font-size: 14px;
    white-space: nowrap;
    flex-shrink: 0;
}
.nav-link:hover {
    color: var(--ink);
    background: var(--bg-soft);
}
.nav-link.router-link-active {
    color: var(--ink);
    background: var(--bg-sunken);
}

/* Edge fades hint that the nav scrolls when it's narrower than its content;
   each side only shows once there's actually more to reveal in that direction. */
.nav-fade {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 28px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 120ms ease;
}
.nav-fade.visible {
    opacity: 1;
}
.nav-fade-start {
    left: 0;
    background: linear-gradient(to right, var(--bg), transparent);
}
.nav-fade-end {
    right: 0;
    background: linear-gradient(to left, var(--bg), transparent);
}

@media (max-width: 480px) {
    .nav-link {
        padding: 8px 8px;
        font-size: 13px;
    }
}
</style>
