<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { SelectRoot, SelectTrigger, SelectValue, SelectPortal, SelectContent, SelectViewport, SelectItem, SelectItemText } from 'reka-ui';
import InfoTooltip from './InfoTooltip.vue';
import { Server } from '../api/model';
import { usePortGroupsStore } from '../stores/portGroups';
import { useServersStore } from '../stores/servers';
import { useAuthStore } from '../stores/auth';
import { useSettingsStore } from '../stores/settings';
import { applyPortGroup, matchingPortGroup, portGroupLabel, serversInPortGroup } from '../utils/portGroups';

const props = defineProps({
    readonly: Boolean
});

const emit = defineEmits<{ violation: [isViolating: boolean] }>();

const server = defineModel<Server>('server', { required: true });

const portGroupsStore = usePortGroupsStore();
const serversStore = useServersStore();
const auth = useAuthStore();
const isAdmin = computed(() => auth.hasRole(import.meta.env.VITE_API_ADMIN_ROLE));
const settingsStore = useSettingsStore();

onMounted(() => {
    // Both are only needed for labels, so a failed load just leaves them out.
    if (serversStore.servers.length === 0) {
        serversStore.getAll().catch(() => {
            // customFetch already showed the error; labels just leave out the servers
        });
    }
});

const CUSTOM = 'custom';

// Nothing to pick yet: an admin has to add port groups first.
const noGroups = computed(() => portGroupsStore.portGroups.length === 0);

const current = computed(() => matchingPortGroup(server.value.config, portGroupsStore.portGroups));

const selected = computed<string>({
    get: () => (current.value ? String(current.value.id) : CUSTOM),
    set: value => {
        const group = portGroupsStore.portGroups.find(g => String(g.id) === value);
        if (group) {
            applyPortGroup(server.value.config, group);
        }
    }
});

function usedBy(groupId: number): Server[] {
    const group = portGroupsStore.portGroups.find(g => g.id === groupId);
    return group ? serversInPortGroup(group, serversStore.servers, server.value.uuid) : [];
}

// With "only port groups" on, the server can't be saved until it uses a port group.
const missingGroup = computed(() => settingsStore.portGroupsOnly && !noGroups.value && !current.value);
watch(missingGroup, missing => emit('violation', missing), { immediate: true });

const sharedWith = computed(() => (current.value ? usedBy(current.value.id) : []));

const customLabel = computed(() => {
    const config = server.value.config;
    return `Custom (${config.bindPort} / ${config.rcon.port} / ${config.a2s.port})`;
});
</script>

<template>
    <div class="form-input-container">
        <label class="form-input-label">
            port group
            <InfoTooltip
                :content="
                    settingsStore.portGroupsOnly
                        ? 'Predefined ports set up by your admin. Pick one that no other server uses, so they can run at the same time. Game port, RCON = game + 1, A2S = game + 2. This host only allows port groups.'
                        : 'Predefined ports set up by your admin. Pick one that no other server uses, so they can run at the same time. Game port, RCON = game + 1, A2S = game + 2. To set ports by hand, use the Advanced tab.'
                "
            />
        </label>
        <div class="port-group-field">
            <SelectRoot v-model="selected" :disabled="props.readonly || noGroups">
                <SelectTrigger class="select-input select-trigger" :class="{ violating: missingGroup }" data-field-id="portGroup">
                    <SelectValue>{{ noGroups ? 'No port groups set up' : current ? portGroupLabel(current) : customLabel }}</SelectValue>
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
                            <SelectItem
                                v-for="group in portGroupsStore.portGroups"
                                :key="group.id"
                                :value="String(group.id)"
                                class="select-item"
                            >
                                <SelectItemText>{{ portGroupLabel(group) }}</SelectItemText>
                                <span v-if="usedBy(group.id).length" class="used-by">
                                    · used by
                                    {{
                                        usedBy(group.id)
                                            .map(s => s.name)
                                            .join(', ')
                                    }}</span
                                >
                            </SelectItem>
                            <SelectItem v-if="!settingsStore.portGroupsOnly" :value="CUSTOM" class="select-item" disabled>
                                <SelectItemText>Custom ports (set in Advanced)</SelectItemText>
                            </SelectItem>
                        </SelectViewport>
                    </SelectContent>
                </SelectPortal>
            </SelectRoot>
            <p v-if="noGroups" class="port-hint">
                No port groups set up yet, so set the ports in the Advanced tab for now.
                <RouterLink v-if="isAdmin" to="/ars-service">Add port groups in ARS Service</RouterLink>
                <template v-else>Ask an admin to add port groups.</template>
            </p>
            <p v-else-if="current" class="port-hint">
                Game {{ server.config.bindPort }} · RCON {{ server.config.rcon.port }} · A2S {{ server.config.a2s.port }}
            </p>
            <p v-else-if="missingGroup" class="port-hint port-error">
                This host only allows port groups, and these ports don't match one. Pick a port group to save the server.
            </p>
            <p v-else class="port-hint">The ports don't match a port group. Edit them in the Advanced tab, or pick a group.</p>
            <p v-if="sharedWith.length" class="port-hint port-warning">
                Also used by {{ sharedWith.map(s => `"${s.name}"`).join(', ') }} — these servers can't run at the same time.
            </p>
        </div>
    </div>
</template>

<style scoped>
.port-group-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
}
.port-hint {
    margin: 0;
    font-size: 12px;
    color: var(--ink-3);
}
.port-hint a {
    color: var(--indigo);
}
.port-error {
    color: var(--red);
}
.violating {
    border-color: var(--red);
    background: var(--red-soft);
}
.port-warning {
    color: oklch(55% 0.1 75);
}
.used-by {
    color: var(--ink-3);
    font-weight: 400;
}
.select-item[data-disabled] {
    color: var(--ink-4);
    cursor: default;
}
</style>
