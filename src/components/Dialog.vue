<script setup lang="ts">
import {
    AlertDialogRoot,
    AlertDialogTrigger,
    AlertDialogPortal,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction
} from 'reka-ui';

const props = defineProps({
    disabled: Boolean,
    triggerLabel: String,
    titleLabel: String,
    description: String,
    cancelLabel: String,
    handleLabel: String,
    handleFunction: Function
});
</script>

<template>
    <AlertDialogRoot>
        <AlertDialogTrigger class="btn btn-danger" :disabled="props.disabled"> {{ props.triggerLabel }} </AlertDialogTrigger>
        <AlertDialogPortal class="card">
            <AlertDialogOverlay class="AlertDialogOverlay" />
            <AlertDialogContent class="AlertDialogContent">
                <AlertDialogTitle v-if="props.titleLabel" class="card-eyebrow">{{ props.titleLabel }} </AlertDialogTitle>
                <AlertDialogDescription v-if="props.description" class="AlertDialogDescription">
                    {{ props.description }}
                </AlertDialogDescription>
                <div :style="{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }">
                    <AlertDialogCancel class="btn btn-primary"> {{ props.cancelLabel }} </AlertDialogCancel>
                    <AlertDialogAction
                        class="btn btn-danger"
                        @click="
                            () => {
                                if (props.handleFunction) {
                                    props.handleFunction();
                                }
                            }
                        "
                    >
                        {{ props.handleLabel }}
                    </AlertDialogAction>
                </div>
            </AlertDialogContent>
        </AlertDialogPortal>
    </AlertDialogRoot>
</template>

<style scoped>
.AlertDialogOverlay {
    background-color: var(--bg-sunken);
    position: fixed;
    inset: 0;
    animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

.AlertDialogContent {
    background-color: var(--bg);
    border-radius: 6px;
    box-shadow:
        hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
        hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 500px;
    max-height: 85vh;
    padding: 25px;
    animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
}
.AlertDialogContent:focus {
    outline: none;
}

.AlertDialogTitle {
    margin: 0;
    color: var(--red-soft);
    font-size: 17px;
    font-weight: 500;
}

.AlertDialogDescription {
    margin-bottom: 20px;
    color: var(--ink-2);
    font-size: 15px;
    line-height: 1.5;
}

.Button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    padding: 0 15px;
    font-size: 15px;
    line-height: 1;
    font-weight: 500;
    height: 35px;
}
.Button.green {
    background-color: white;
    color: var(--green);
    box-shadow: 0 2px 10px var(--green-soft);
}
.Button.green:hover {
    background-color: var(--mauve-3);
}
.Button.green:focus {
    box-shadow: 0 0 0 2px black;
}
.Button.red {
    background-color: var(--red);
    color: var(--red-11);
}
.Button.red:hover {
    background-color: var(--red);
}
.Button.red:focus {
    box-shadow: 0 0 0 2px var(--red);
}
.Button.mauve {
    background-color: var(--red-soft);
    color: var(--ink);
}
.Button.mauve:hover {
    background-color: var(--red-soft);
}
.Button.mauve:focus {
    box-shadow: 0 0 0 2px var(--red-soft);
}

@keyframes overlayShow {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes contentShow {
    from {
        opacity: 0;
        transform: translate(-50%, -48%) scale(0.96);
    }
    to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
}
</style>
