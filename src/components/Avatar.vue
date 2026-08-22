<script setup lang="ts">
import {
    AvatarImage,
    AvatarRoot,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRoot,
    DropdownMenuTrigger
} from 'reka-ui';
import { useAuthStore } from '../stores/auth';
import { ref } from 'vue';

const toggleState = ref(false);

const auth = useAuthStore();

function handleLogout() {
    auth.logout();
}
</script>

<template>
    <div>
        <DropdownMenuRoot v-model:open="toggleState">
            <DropdownMenuTrigger class="IconButton">
                <AvatarRoot class="AvatarRoot">
                    <AvatarImage class="AvatarImage" :src="auth?.user?.picture ?? ''" :alt="auth?.user?.preferred_username" />
                </AvatarRoot>
            </DropdownMenuTrigger>

            <DropdownMenuPortal>
                <DropdownMenuContent
                    class="DropdownMenuContent"
                    side="bottom"
                    align="center"
                    :sideOffset="8"
                    :sideFlip="false"
                    :alignFlip="false"
                >
                    <DropdownMenuLabel class="DropdownMenuLabel">{{ auth?.user?.preferred_username }}</DropdownMenuLabel>
                    <DropdownMenuItem value="Logout" class="DropdownMenuItem" @select="handleLogout">Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenuPortal>
        </DropdownMenuRoot>
    </div>
</template>

<style scoped>
.AvatarRoot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    overflow: hidden;
    user-select: none;
    width: 32px;
    height: 32px;
    border-radius: 100%;
    background-color: var(--bg-soft);
    border: 2px solid var(--line);
}

.AvatarImage {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
}

/* reset */
button {
    all: unset;
}

:deep(.DropdownMenuContent) {
    min-width: 160px;
    max-width: 200px;
    background-color: var(--bg-soft);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 8px;
    box-shadow:
        0px 18px 50px -18px rgba(22, 23, 24, 0.45),
        0px 12px 30px -20px rgba(22, 23, 24, 0.2);
    animation-duration: 400ms;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity;
}
:deep(.DropdownMenuContent[data-side='top']) {
    animation-name: slideDownAndFade;
}
:deep(.DropdownMenuContent[data-side='right']) {
    animation-name: slideLeftAndFade;
}
:deep(.DropdownMenuContent[data-side='bottom']) {
    animation-name: slideUpAndFade;
}
:deep(.DropdownMenuContent[data-side='left']) {
    animation-name: slideRightAndFade;
}

:deep(.DropdownMenuItem) {
    font-size: 13px;
    line-height: 1.4;
    color: var(--ink);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 0 12px;
    position: relative;
    user-select: none;
    outline: none;
    text-align: center;
    cursor: pointer;
    transition:
        background-color 120ms ease,
        color 120ms ease;
}
:deep(.DropdownMenuItem:hover),
:deep(.DropdownMenuItem[data-highlighted]) {
    background-color: var(--grass-5);
    color: var(--grass-11);
}
:deep(.DropdownMenuItem[data-disabled]) {
    color: var(--mauve-8);
    pointer-events: none;
}

:deep(.DropdownMenuLabel) {
    padding: 10px 12px 6px;
    font-size: 12px;
    line-height: 1.4;
    color: var(--mauve-11);
    text-align: center;
    width: 100%;
}

@keyframes slideUpAndFade {
    from {
        opacity: 0;
        transform: translateY(2px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideRightAndFade {
    from {
        opacity: 0;
        transform: translateX(-2px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideDownAndFade {
    from {
        opacity: 0;
        transform: translateY(-2px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideLeftAndFade {
    from {
        opacity: 0;
        transform: translateX(2px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
</style>
