<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { PortGroup } from '../api/model';
import { usePortGroupsStore } from '../stores/portGroups';
import { useServersStore } from '../stores/servers';
import { useSettingsStore } from '../stores/settings';
import FormCheckboxInput from './FormCheckboxInput.vue';
import {
    MAX_GAME_PORT,
    MIN_GAME_PORT,
    a2sPort,
    firewallRanges,
    matchingPortGroup,
    nextGamePort,
    rconPort,
    serversInPortGroup
} from '../utils/portGroups';

const portGroupsStore = usePortGroupsStore();
const serversStore = useServersStore();
const settingsStore = useSettingsStore();

interface Draft {
    name: string;
    gamePort: number;
}

const drafts = reactive(new Map<number, Draft>());
const newGroup = reactive<Draft>({ name: '', gamePort: 2001 });
const busy = ref(false);

function resetNewGroup() {
    newGroup.name = `Group ${portGroupsStore.portGroups.length + 1}`;
    newGroup.gamePort = nextGamePort(portGroupsStore.portGroups);
}

// Keep one editable draft per stored group, without discarding edits in progress.
watch(
    () => portGroupsStore.portGroups,
    groups => {
        const ids = new Set(groups.map(g => g.id));
        for (const id of drafts.keys()) {
            if (!ids.has(id)) {
                drafts.delete(id);
            }
        }
        for (const group of groups) {
            if (!drafts.has(group.id)) {
                drafts.set(group.id, { name: group.name, gamePort: group.gamePort });
            }
        }
    },
    { immediate: true }
);

onMounted(async () => {
    await Promise.all([portGroupsStore.load(true), serversStore.getAll(), settingsStore.load()]).catch(() => {
        // customFetch already showed the error as a toast
    });
    resetNewGroup();
});

/** Returns why the draft can't be saved, or '' when it can. */
function problem(draft: Draft, ownId?: number): string {
    if (!draft.name.trim()) {
        return 'Needs a name';
    }
    if (!Number.isInteger(draft.gamePort) || draft.gamePort < MIN_GAME_PORT || draft.gamePort > MAX_GAME_PORT) {
        return `Game port must be ${MIN_GAME_PORT}–${MAX_GAME_PORT}`;
    }
    for (const other of portGroupsStore.portGroups) {
        if (other.id === ownId) {
            continue;
        }
        if (other.name.trim().toLowerCase() === draft.name.trim().toLowerCase()) {
            return `Name already used`;
        }
        if (Math.abs(other.gamePort - draft.gamePort) < 3) {
            return `Overlaps "${other.name}"`;
        }
    }
    return '';
}

function isDirty(group: PortGroup): boolean {
    const draft = drafts.get(group.id);
    return !!draft && (draft.name !== group.name || draft.gamePort !== group.gamePort);
}

function usedByLabel(group: PortGroup): string {
    const servers = serversInPortGroup(group, serversStore.servers);
    if (servers.length === 0) {
        return 'Unused';
    }
    return servers.map(s => s.name).join(', ');
}

async function run(action: () => Promise<unknown>) {
    busy.value = true;
    try {
        await action();
    } catch {
        // customFetch already showed the error as a toast
    } finally {
        busy.value = false;
    }
}

function addGroup() {
    run(async () => {
        await portGroupsStore.add({ name: newGroup.name.trim(), gamePort: newGroup.gamePort });
        resetNewGroup();
    });
}

function saveGroup(group: PortGroup) {
    const draft = drafts.get(group.id);
    if (!draft) {
        return;
    }
    // The backend moves the group's servers to the new ports, so say which ones.
    const users = serversInPortGroup(group, serversStore.servers);
    if (draft.gamePort !== group.gamePort && users.length) {
        const names = users.map(s => `"${s.name}"`).join(', ');
        const running = users.some(s => s.isRunning) ? ' Running servers use the new ports once they are started again.' : '';
        const question = `Move ${names} to ports ${draft.gamePort}–${draft.gamePort + 2} along with "${group.name}"?${running}`;
        if (!confirm(question)) {
            return;
        }
    }
    run(async () => {
        const updated = await portGroupsStore.update(group.id, { name: draft.name.trim(), gamePort: draft.gamePort });
        if (updated) {
            drafts.set(group.id, { name: updated.name, gamePort: updated.gamePort });
            if (users.length && updated.gamePort !== group.gamePort) {
                await serversStore.getAll();
            }
        }
    });
}

function revertGroup(group: PortGroup) {
    drafts.set(group.id, { name: group.name, gamePort: group.gamePort });
}

function deleteGroup(group: PortGroup) {
    const users = serversInPortGroup(group, serversStore.servers);
    const blocked = settingsStore.portGroupsOnly
        ? ` Only port groups are allowed, so ${users.length === 1 ? 'it' : 'they'} can't be saved or started until ${users.length === 1 ? 'it picks' : 'they pick'} another group.`
        : '';
    const note = users.length
        ? ` ${users.length} server${users.length === 1 ? '' : 's'} keep${users.length === 1 ? 's' : ''} these ports as custom ports.${blocked}`
        : '';
    if (confirm(`Delete port group "${group.name}" (${group.gamePort}–${a2sPort(group)})?${note}`)) {
        run(() => portGroupsStore.remove(group.id));
    }
}

/** Servers whose ports match no group; they can't be saved or started while only port groups are allowed. */
const customServers = computed(() => serversStore.servers.filter(s => !matchingPortGroup(s.config, portGroupsStore.portGroups)));

const portGroupsOnly = computed<boolean>({
    get: () => settingsStore.portGroupsOnly,
    set: on => {
        if (on && customServers.value.length) {
            const names = customServers.value.map(s => `"${s.name}"`).join(', ');
            const question = `These servers use custom ports and can't be saved or started until they pick a port group: ${names}. Allow only port groups anyway?`;
            if (!confirm(question)) {
                return;
            }
        }
        run(() => settingsStore.update({ portGroupsOnly: on }));
    }
});

// Deleting the last group would leave no ports servers may use.
const isLastRequiredGroup = computed(() => settingsStore.portGroupsOnly && portGroupsStore.portGroups.length === 1);

const newGroupProblem = computed(() => problem(newGroup));
const firewall = computed(() => firewallRanges(portGroupsStore.portGroups));
</script>

<template>
    <div class="card card-wide">
        <div class="card-eyebrow">Network</div>
        <h3>Port groups</h3>
        <p>
            Predefined ports users pick for their servers in the Basic settings, instead of setting three ports by hand. Each group uses the
            game port, RCON on game port + 1 and A2S on game port + 2. When a server can't start because its ports are taken, users can
            switch it to a free group.
        </p>

        <div class="enforce">
            <FormCheckboxInput
                v-model="portGroupsOnly"
                :name="'only allow port groups'"
                :tooltip="'When on, users can\'t set ports by hand: the port fields in the Advanced settings are locked, and servers with custom ports can\'t be saved or started until they pick a port group. Use this to keep servers inside the ports your firewall allows.'"
                :readonly="busy || (!portGroupsOnly && portGroupsStore.portGroups.length === 0)"
            />
            <p v-if="!portGroupsOnly && portGroupsStore.portGroups.length === 0" class="enforce-note">Add a port group first.</p>
            <p v-else-if="portGroupsOnly && customServers.length" class="enforce-note enforce-warning">
                {{ customServers.length }} server{{ customServers.length === 1 ? ' uses' : 's use' }} custom ports and can't be saved or
                started until {{ customServers.length === 1 ? 'it picks' : 'they pick' }} a port group:
                {{ customServers.map(s => s.name).join(', ') }}
            </p>
        </div>

        <div class="table-wrap">
            <table class="pg-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Game</th>
                        <th>RCON</th>
                        <th>A2S</th>
                        <th>Used by</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="group in portGroupsStore.portGroups" :key="group.id">
                        <template v-if="drafts.get(group.id)">
                            <td>
                                <input
                                    v-model="drafts.get(group.id)!.name"
                                    class="input"
                                    maxlength="50"
                                    :aria-label="`Name of ${group.name}`"
                                />
                            </td>
                            <td>
                                <input
                                    v-model.number="drafts.get(group.id)!.gamePort"
                                    class="input port-input"
                                    type="number"
                                    :min="MIN_GAME_PORT"
                                    :max="MAX_GAME_PORT"
                                    :aria-label="`Game port of ${group.name}`"
                                />
                            </td>
                            <td class="mono derived">{{ drafts.get(group.id)!.gamePort + 1 }}</td>
                            <td class="mono derived">{{ drafts.get(group.id)!.gamePort + 2 }}</td>
                            <td class="used-by" :title="usedByLabel(group)">{{ usedByLabel(group) }}</td>
                            <td class="actions">
                                <span v-if="isDirty(group) && problem(drafts.get(group.id)!, group.id)" class="problem">
                                    {{ problem(drafts.get(group.id)!, group.id) }}
                                </span>
                                <template v-if="isDirty(group)">
                                    <button class="btn btn-sm btn-ghost" :disabled="busy" @click="revertGroup(group)">Revert</button>
                                    <button
                                        class="btn btn-sm btn-primary"
                                        :disabled="busy || !!problem(drafts.get(group.id)!, group.id)"
                                        @click="saveGroup(group)"
                                    >
                                        Save
                                    </button>
                                </template>
                                <button
                                    v-else
                                    class="btn btn-sm btn-danger"
                                    :disabled="busy || isLastRequiredGroup"
                                    :title="
                                        isLastRequiredGroup
                                            ? 'Only port groups are allowed, so the last group can\'t be deleted'
                                            : undefined
                                    "
                                    @click="deleteGroup(group)"
                                >
                                    Delete
                                </button>
                            </td>
                        </template>
                    </tr>
                    <tr v-if="portGroupsStore.portGroups.length === 0">
                        <td colspan="6" class="empty">No port groups yet. Users set ports by hand in the Advanced settings.</td>
                    </tr>
                    <tr class="add-row">
                        <td>
                            <input
                                v-model="newGroup.name"
                                class="input"
                                maxlength="50"
                                placeholder="Name"
                                aria-label="Name of the new port group"
                            />
                        </td>
                        <td>
                            <input
                                v-model.number="newGroup.gamePort"
                                class="input port-input"
                                type="number"
                                :min="MIN_GAME_PORT"
                                :max="MAX_GAME_PORT"
                                aria-label="Game port of the new port group"
                            />
                        </td>
                        <td class="mono derived">{{ rconPort(newGroup as PortGroup) }}</td>
                        <td class="mono derived">{{ a2sPort(newGroup as PortGroup) }}</td>
                        <td></td>
                        <td class="actions">
                            <span v-if="newGroupProblem" class="problem">{{ newGroupProblem }}</span>
                            <button class="btn btn-sm btn-primary" :disabled="busy || !!newGroupProblem" @click="addGroup">
                                Add group
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="firewall" class="card-foot">
            <span class="card-foot-note">
                Firewall: allow UDP <span class="mono">{{ firewall }}</span>
            </span>
        </div>
    </div>
</template>

<style scoped>
.card {
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    padding: 28px;
    background: var(--bg);
}
.card-wide {
    grid-column: 1 / -1;
}
.card-eyebrow {
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--ink-3);
    font-weight: 600;
    margin-bottom: 14px;
}
.card h3 {
    font-size: 17px;
    margin: 0 0 6px;
    font-weight: 600;
    letter-spacing: -0.01em;
}
.card p {
    margin: 0 0 20px;
    color: var(--ink-3);
    font-size: 13.5px;
    max-width: 80ch;
}
.card-foot {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--line);
}
.card-foot-note {
    color: var(--ink-3);
    font-size: 12.5px;
}

.enforce {
    margin-bottom: 16px;
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
}
.enforce-note {
    margin: 0 0 11px !important;
    font-size: 12.5px !important;
}
.enforce-warning {
    color: oklch(55% 0.1 75) !important;
}
.table-wrap {
    overflow-x: auto;
}
.pg-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}
.pg-table th {
    text-align: left;
    font-size: 11.5px;
    font-weight: 600;
    color: var(--ink-3);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 0 8px 8px;
    border-bottom: 1px solid var(--line);
}
.pg-table td {
    padding: 8px;
    border-bottom: 1px solid var(--line);
    vertical-align: middle;
}
.pg-table tr:last-child td {
    border-bottom: none;
}
.add-row td {
    background: var(--bg-soft);
}
.input {
    min-width: 120px;
}
.port-input {
    width: 100px;
    min-width: 90px;
}
.derived {
    color: var(--ink-2);
    white-space: nowrap;
}
.used-by {
    color: var(--ink-3);
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.actions {
    text-align: right;
    white-space: nowrap;
}
.actions .btn + .btn {
    margin-left: 4px;
}
.btn-sm {
    padding: 5px 10px;
    font-size: 12px;
}
.problem {
    color: var(--red);
    font-size: 12px;
    margin-right: 8px;
}
.empty {
    color: var(--ink-3);
    text-align: center;
    padding: 20px 8px;
}
</style>
