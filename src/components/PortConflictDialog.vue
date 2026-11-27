<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
    DialogRoot,
    DialogPortal,
    DialogOverlay,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose,
    SelectRoot,
    SelectTrigger,
    SelectValue,
    SelectPortal,
    SelectContent,
    SelectViewport,
    SelectItem,
    SelectItemText
} from 'reka-ui';
import { PortConflictReason, PortConflictResponse, PortGroup, ServerConfig } from '../api/model';
import { useServersStore } from '../stores/servers';
import { PORT_ROLES, a2sPort, matchingPortGroup, portGroupLabel, portOf, portRoleLabel, rconPort } from '../utils/portGroups';

const props = defineProps<{
    serverName: string;
    /** The config of the server being started, to tell which port is for what. */
    config: ServerConfig;
    conflict: PortConflictResponse | null;
    busy?: boolean;
}>();

const serversStore = useServersStore();

const emit = defineEmits<{
    close: [];
    switch: [group: PortGroup];
}>();

const selectedId = ref<string>('');

// Switching to the group the server is already on would fail the same way. The backend leaves it
// out already; this keeps the dialog right if it doesn't.
const choices = computed<PortGroup[]>(
    () => props.conflict?.freePortGroups.filter(group => !matchingPortGroup(props.config, [group])) ?? []
);

// Preselect the first free group whenever a new conflict comes in.
watch(
    () => props.conflict,
    () => {
        selectedId.value = choices.value[0] ? String(choices.value[0].id) : '';
    },
    { immediate: true }
);

const notAPortGroup = computed(() => props.conflict?.reason === PortConflictReason.notAPortGroup);

/** Who holds the port, e.g. `"Alpha" (its A2S port)`, or '' when it's free. */
function takenBy(port: number): string {
    const conflict = props.conflict;
    if (!conflict) {
        return '';
    }
    const holders = conflict.conflicts
        .filter(other => other.ports.includes(port))
        .map(other => {
            const config = serversStore.servers.find(s => s.uuid === other.uuid)?.config;
            const role = config ? portRoleLabel(config, port) : '';
            return role ? `"${other.name}" (its ${role} port)` : `"${other.name}"`;
        });
    if (holders.length) {
        return holders.join(', ');
    }
    // Docker reported the port, but no ARSA server holds it.
    return conflict.ports.includes(port) ? 'a program outside ARSA' : '';
}

/** The server's ports, one row per use, with who holds each. */
const portRows = computed(() =>
    PORT_ROLES.map(r => {
        const port = portOf(props.config, r.role);
        return { ...r, port, takenBy: notAPortGroup.value ? '' : takenBy(port) };
    })
);

const selectedGroup = computed(() => choices.value.find(g => String(g.id) === selectedId.value));

function onOpenChange(open: boolean) {
    if (!open) {
        emit('close');
    }
}

function onSwitch() {
    if (selectedGroup.value) {
        emit('switch', selectedGroup.value);
    }
}
</script>

<template>
    <DialogRoot :open="!!conflict" @update:open="onOpenChange">
        <DialogPortal>
            <DialogOverlay class="dialog-overlay" />
            <DialogContent v-if="conflict" class="card dialog-content">
                <DialogTitle class="card-eyebrow">{{ notAPortGroup ? 'Port group required' : 'Ports already in use' }}</DialogTitle>
                <DialogDescription class="dialog-description">
                    <template v-if="notAPortGroup">
                        "{{ serverName }}" can't start: this host only allows port groups, and these ports don't match one.
                    </template>
                    <template v-else>"{{ serverName }}" can't start because some of its ports are already in use.</template>
                </DialogDescription>

                <table class="port-table">
                    <tbody>
                        <tr v-for="row in portRows" :key="row.role" :class="{ taken: row.takenBy }">
                            <th scope="row">
                                {{ row.label }} port
                                <span class="purpose">{{ row.purpose }}</span>
                            </th>
                            <td class="mono">{{ row.port }}</td>
                            <td v-if="!notAPortGroup" class="status">
                                <template v-if="row.takenBy"><span class="dot red"></span>Used by {{ row.takenBy }}</template>
                                <template v-else><span class="dot green"></span>Free</template>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <template v-if="choices.length">
                    <label class="form-input-label" for="port-conflict-group">Switch to a free port group</label>
                    <SelectRoot v-model="selectedId" :disabled="busy">
                        <SelectTrigger id="port-conflict-group" class="select-input select-trigger">
                            <SelectValue>{{ selectedGroup ? portGroupLabel(selectedGroup) : 'Pick a port group' }}</SelectValue>
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </SelectTrigger>
                        <SelectPortal>
                            <SelectContent class="select-content" position="popper" :sideOffset="4">
                                <SelectViewport>
                                    <SelectItem v-for="group in choices" :key="group.id" :value="String(group.id)" class="select-item">
                                        <SelectItemText>{{ portGroupLabel(group) }}</SelectItemText>
                                    </SelectItem>
                                </SelectViewport>
                            </SelectContent>
                        </SelectPortal>
                    </SelectRoot>
                    <p v-if="selectedGroup" class="muted hint">
                        New ports: Game <span class="mono">{{ selectedGroup.gamePort }}</span> · RCON
                        <span class="mono">{{ rconPort(selectedGroup) }}</span> · A2S
                        <span class="mono">{{ a2sPort(selectedGroup) }}</span>. The server switches to them, then starts.
                    </p>
                </template>
                <p v-else class="warning-banner">
                    No free port group left. Stop a running server, or ask an admin to add a port group under ARS Service.
                </p>

                <div class="dialog-actions">
                    <DialogClose class="btn btn-ghost" :disabled="busy">Cancel</DialogClose>
                    <button v-if="choices.length" class="btn btn-primary" :disabled="busy || !selectedGroup" @click="onSwitch">
                        {{ busy ? 'Starting…' : 'Switch and start' }}
                    </button>
                </div>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>

<style scoped>
.dialog-overlay {
    background-color: color-mix(in oklab, var(--bg-sunken), transparent 20%);
    position: fixed;
    inset: 0;
    z-index: 40;
}
.dialog-content {
    background-color: var(--bg);
    border-radius: 6px;
    box-shadow:
        hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
        hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: calc(100vw - 32px);
    max-width: 500px;
    max-height: 85vh;
    overflow-y: auto;
    padding: 25px;
    z-index: 41;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.dialog-content:focus {
    outline: none;
}
.dialog-description {
    margin: 0;
    color: var(--ink-2);
    font-size: 14px;
    line-height: 1.5;
}
.port-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}
.port-table th,
.port-table td {
    padding: 8px 6px;
    border-bottom: 1px solid var(--line);
    text-align: left;
    vertical-align: middle;
}
.port-table tr:last-child th,
.port-table tr:last-child td {
    border-bottom: none;
}
.port-table th {
    font-weight: 500;
    color: var(--ink);
}
.purpose {
    display: block;
    font-weight: 400;
    font-size: 12px;
    color: var(--ink-3);
}
.port-table .status {
    color: var(--ink-3);
}
.port-table .status .dot {
    display: inline-block;
    margin-right: 8px;
    vertical-align: middle;
}
.port-table tr.taken .status {
    color: var(--red);
}
.muted {
    color: var(--ink-3);
    font-size: 12px;
}
.hint {
    margin: 0;
}
.warning-banner {
    margin: 0;
}
.dialog-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 8px;
}
</style>
