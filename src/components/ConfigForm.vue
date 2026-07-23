<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import FormTextInput from './FormTextInput.vue';
import FormIpAddressInput from './FormIpAddressInput.vue';
import FormNumberInput from './FormNumberInput.vue';
import FormPasswordInput from './FormPasswordInput.vue';
import FormSelectInput from './FormSelectInput.vue';
import FormMultiSelectInput from './FormMultiSelectInput.vue';
import FormMultiSelectModInput from './FormMultiSelectModInput.vue';
import FormCheckboxInput from './FormCheckboxInput.vue';
import FormJsonInput from './FormJsonInput.vue';
import FormModsInput from './FormModsInput.vue';
import FormStartupParameterInput from './FormStartupParameterInput.vue';
import FormTabs from './FormTabs.vue';
import MissionSelect from './MissionSelect.vue';
import { Branch, Server } from '../api/model';
import FormAdminInput from './FormAdminInput.vue';

const props = defineProps({
    readonly: Boolean,
    tab: { type: String as () => 'settings' | 'mods', default: 'settings' }
});

const server = defineModel<Server>('server', { required: true });
const inputViolationCounter = defineModel<number>('inputViolationCounter', { required: true });

// Starts coupled whenever the two names already match (fresh servers, or existing
// ones where nobody diverged them yet) so they keep following each other by default,
// without silently overwriting a pre-existing intentional difference on load.
const namesCoupled = ref(server.value.name === server.value.config.game.name);

// AddServer/EditServer both mount this with a placeholder `server` and swap in the
// real one asynchronously once it's fetched — recompute against the real data
// instead of leaving the placeholder-derived initial value in place.
watch(
    () => server.value,
    newServer => {
        namesCoupled.value = newServer.name === newServer.config.game.name;
    }
);

watch(
    () => server.value.name,
    name => {
        if (namesCoupled.value) {
            server.value.config.game.name = name;
        }
    }
);

watch(namesCoupled, coupled => {
    if (coupled) {
        server.value.config.game.name = server.value.name;
    }
});

type SettingsSubTab = 'server' | 'advanced';
type ViolationLocation = { tab: 'settings' | 'mods'; subTab?: SettingsSubTab };

// Keyed by a stable field id so a field's violation status stays correct even
// when it unmounts/remounts (e.g. switching tabs) instead of relying on
// increment/decrement calls that can drift out of sync with what's on screen.
const violations = reactive(new Map<string, ViolationLocation>());

function setViolation(id: string, tab: 'settings' | 'mods', subTab: SettingsSubTab | undefined, isViolating: boolean) {
    if (isViolating) {
        violations.set(id, { tab, subTab });
    } else {
        violations.delete(id);
    }
}

watch(() => violations.size, size => (inputViolationCounter.value = size), { immediate: true });

const settingsSubTab = ref<SettingsSubTab>('server');
const settingsSubTabs = [
    { key: 'server', label: 'Basic' },
    { key: 'advanced', label: 'Advanced' }
];

defineExpose({
    firstViolation: computed(() => {
        const next = violations.entries().next();
        return next.done ? null : { id: next.value[0], ...next.value[1] };
    }),
    focusViolation(id: string, subTab?: SettingsSubTab) {
        if (subTab) {
            settingsSubTab.value = subTab;
        }
        nextTick(() => {
            document.querySelector(`[data-field-id="${CSS.escape(id)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }
});
</script>

<template>
    <div class="config-sections">
        <!-- ── Settings tab ── -->
        <template v-if="props.tab === 'settings'">
            <FormTabs v-model="settingsSubTab" :tabs="settingsSubTabs" listClass="sub-tabs" />

            <!-- ── Server sub-tab ── -->
            <template v-if="settingsSubTab === 'server'">
                <!-- Identity -->
                <div class="form-section">
                    <div class="form-section-head">
                        <h2>Identity</h2>
                        <p>The display name for this server within ARSA, and the name players see in the in-game server browser.</p>
                    </div>
                    <div class="field-list">
                        <FormTextInput
                            v-model="server.name"
                            :name="'name'"
                            :placeholder="'Server\'s name'"
                            :length="100"
                            :readonly="props.readonly"
                            field-id="name"
                            @violation="v => setViolation('name', 'settings', 'server', v)"
                        />
                        <FormCheckboxInput
                            v-model="namesCoupled"
                            :name="'Use for in-game name too'"
                            :tooltip="'When on, the in-game server browser name always matches the ARSA name above. Turn off to set a different in-game name.'"
                            :readonly="props.readonly"
                        />
                        <FormTextInput
                            v-model="server.config.game.name"
                            :name="'name (in-game)'"
                            :tooltip="'Server name displayed in the in-game server browser. This is what players see when searching for servers. Max 100 characters.'"
                            :placeholder="'Server\'s name'"
                            :length="100"
                            :readonly="props.readonly || namesCoupled"
                            :pasteValue="server.name"
                            field-id="game.name"
                            @violation="v => setViolation('game.name', 'settings', 'server', v)"
                        />
                    </div>
                </div>

                <!-- Game -->
                <div class="form-section">
                    <div class="form-section-head">
                        <h2>Game</h2>
                        <p>Core game session settings.</p>
                    </div>
                    <div class="field-list">
                        <FormAdminInput
                            v-model="server.config.game.admins"
                            :name="'admins'"
                            :tooltip="'List of admin identities (BI UID format: 8-4-4-4-12 hex, or Steam ID: 17 digits). These players have permanent admin rights without password.'"
                            :regEx="['^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', '^[0-9]{17}$']"
                            :readonly="props.readonly"
                        />
                        <MissionSelect
                            v-model="server.config.game.scenarioId"
                            :mods="server.config.game.mods"
                            :name="'scenarioId'"
                            :tooltip="'Select a vanilla mission, a workshop mission from the currently configured mods, or type the scenario path manually.'"
                            :readonly="props.readonly"
                            :branch="server.branch"
                        />
                        <FormNumberInput
                            v-model="server.config.game.maxPlayers"
                            :name="'maxPlayers'"
                            :tooltip="'Maximum number of players allowed on the server simultaneously. Higher values require more resources. Range: 1-128, Default: 64'"
                            :minVal="1"
                            :maxVal="128"
                            :readonly="props.readonly"
                            field-id="game.maxPlayers"
                            @violation="v => setViolation('game.maxPlayers', 'settings', 'server', v)"
                        />
                        <FormCheckboxInput
                            v-model="server.config.game.visible"
                            :name="'visible'"
                            :tooltip="'Whether the server appears in the public server browser. Disable for private/unlisted servers. Default: true'"
                            :readonly="props.readonly"
                        />
                    </div>
                </div>

                <!-- Branch -->
                <div class="form-section">
                    <div class="form-section-head">
                        <h2>Branch</h2>
                        <p>Server branch</p>
                    </div>
                    <div class="field-list">
                        <FormSelectInput
                            v-model="server.branch"
                            :options="Object.values(Branch)"
                            :name="'branch'"
                            :tooltip="'Server branch'"
                            :readonly="props.readonly"
                        />
                    </div>
                </div> </template
            ><!-- end server sub-tab -->

            <!-- ── Advanced sub-tab ── -->
            <template v-if="settingsSubTab === 'advanced'">
                <!-- Startup Parameters -->
                <div class="form-section">
                    <div class="form-section-head">
                        <h2>Startup parameters</h2>
                        <p>Command-line flags passed to the ARS process. Toggle a parameter to include it in the launch command.</p>
                    </div>
                    <div class="field-list">
                        <FormStartupParameterInput
                            v-for="(_item, idx) in server.startupParameters"
                            :key="idx"
                            v-model="server.startupParameters[idx]"
                            :readonly="props.readonly"
                            :field-id="'startup.' + _item.parameter"
                            @violation="v => setViolation('startup.' + _item.parameter, 'settings', 'advanced', v)"
                        />
                    </div>
                </div>

                <!-- Network -->
                <div class="form-section">
                    <div class="form-section-head">
                        <h2>Network — bind &amp; public</h2>
                        <p>The interface ARS binds to locally, and the address advertised to the server browser.</p>
                    </div>
                    <div class="field-list">
                        <FormIpAddressInput
                            v-model="server.config.bindAddress"
                            :name="'bindAddress'"
                            :tooltip="'Local IP address the server binds to. Use 0.0.0.0 to listen on all interfaces, or a specific IP for one interface. Default: 0.0.0.0'"
                            :readonly="props.readonly"
                            field-id="network.bindAddress"
                            @violation="v => setViolation('network.bindAddress', 'settings', 'advanced', v)"
                        />
                        <FormNumberInput
                            v-model="server.config.bindPort"
                            :name="'bindPort'"
                            :tooltip="'Local UDP port the server binds to. Must be open in firewall and forwarded if behind NAT. Range: 1-65535, Default: 2001'"
                            :minVal="1"
                            :maxVal="65535"
                            :readonly="props.readonly"
                            field-id="network.bindPort"
                            @violation="v => setViolation('network.bindPort', 'settings', 'advanced', v)"
                        />
                        <FormIpAddressInput
                            v-model="server.config.publicAddress"
                            :name="'publicAddress'"
                            :tooltip="'Public IP address advertised to server browser and players. Leave empty for automatic detection. Required if behind NAT/firewall. Default: auto-detect'"
                            :readonly="props.readonly"
                            field-id="network.publicAddress"
                            @violation="v => setViolation('network.publicAddress', 'settings', 'advanced', v)"
                        />
                        <FormNumberInput
                            v-model="server.config.publicPort"
                            :name="'publicPort'"
                            :tooltip="'Public UDP port advertised to server browser and players. Should match bindPort or forwarded port if using NAT. Range: 1-65535, Default: 2001'"
                            :minVal="1"
                            :maxVal="65535"
                            :readonly="props.readonly"
                            field-id="network.publicPort"
                            @violation="v => setViolation('network.publicPort', 'settings', 'advanced', v)"
                        />
                    </div>
                </div>

                <!-- A2S -->
                <div class="form-section">
                    <div class="form-section-head">
                        <h2>A2S query</h2>
                        <p>Endpoint exposed for Steam's A2S server query protocol.</p>
                    </div>
                    <div class="field-list">
                        <FormIpAddressInput
                            v-model="server.config.a2s.address"
                            :name="'address'"
                            :tooltip="'IP address for Steam A2S query protocol. Used by server browsers to fetch server info. Use 0.0.0.0 for all interfaces. Required.'"
                            :readonly="props.readonly"
                            field-id="a2s.address"
                            @violation="v => setViolation('a2s.address', 'settings', 'advanced', v)"
                        />
                        <FormNumberInput
                            v-model="server.config.a2s.port"
                            :name="'port'"
                            :tooltip="'UDP port for Steam A2S query protocol. Must be accessible from internet for server listing. Range: 1-65535, Default: 17777'"
                            :minVal="1"
                            :maxVal="65535"
                            :readonly="props.readonly"
                            field-id="a2s.port"
                            @violation="v => setViolation('a2s.port', 'settings', 'advanced', v)"
                        />
                    </div>
                </div>

                <!-- RCON -->
                <div class="form-section">
                    <div class="form-section-head">
                        <h2>RCON</h2>
                        <p>Remote console for live administration. Leave disabled if not in use.</p>
                    </div>
                    <div class="field-list">
                        <FormIpAddressInput
                            v-model="server.config.rcon.address"
                            :name="'address'"
                            :tooltip="'IP address for RCON (Remote Console) access. Use 127.0.0.1 for localhost only, or 0.0.0.0 for external access. Required.'"
                            :readonly="props.readonly"
                            field-id="rcon.address"
                            @violation="v => setViolation('rcon.address', 'settings', 'advanced', v)"
                        />
                        <FormNumberInput
                            v-model="server.config.rcon.port"
                            :name="'port'"
                            :tooltip="'TCP port for RCON connections. Used by admin tools to remotely control the server. Range: 1-65535, Default: 19999'"
                            :minVal="1"
                            :maxVal="65535"
                            :readonly="props.readonly"
                            field-id="rcon.port"
                            @violation="v => setViolation('rcon.port', 'settings', 'advanced', v)"
                        />
                        <FormPasswordInput
                            v-model="server.config.rcon.password"
                            :name="'password'"
                            :tooltip="'RCON password for authentication. No spaces allowed, minimum 3 characters. Keep secure as it grants server control. Required.'"
                            :policyWhitespace="true"
                            :policyMinimum="3"
                            :readonly="props.readonly"
                            field-id="rcon.password"
                            @violation="v => setViolation('rcon.password', 'settings', 'advanced', v)"
                        />
                        <FormNumberInput
                            v-model="server.config.rcon.maxClients"
                            :name="'maxClients'"
                            :tooltip="'Maximum simultaneous RCON connections allowed. Limits how many admins can connect at once. Range: 1-16, Default: 16'"
                            :minVal="1"
                            :maxVal="16"
                            :readonly="props.readonly"
                            field-id="rcon.maxClients"
                            @violation="v => setViolation('rcon.maxClients', 'settings', 'advanced', v)"
                        />
                        <FormSelectInput
                            v-model="server.config.rcon.permission"
                            :name="'permission'"
                            :tooltip="'RCON permission level. Monitor: read-only access to view server state. Admin: full control including kick, ban, and config changes.'"
                            :options="['monitor', 'admin']"
                            :selectedIndex="0"
                            :readonly="props.readonly"
                        />
                        <FormMultiSelectModInput
                            v-model="server.config.rcon.blacklist"
                            :name="'blacklist'"
                            :tooltip="'List of IPs or identity IDs blocked from RCON access. Use to ban specific admins or addresses. Default: []'"
                            :readonly="props.readonly"
                        />
                        <FormMultiSelectModInput
                            v-model="server.config.rcon.whitelist"
                            :name="'whitelist'"
                            :tooltip="'List of IPs or identity IDs allowed RCON access. When set, only these can connect. Overrides blacklist. Default: []'"
                            :readonly="props.readonly"
                        />
                    </div>
                </div>

                <!-- Passwords & platforms -->
                <div class="form-section">
                    <div class="form-section-head">
                        <h2>Passwords &amp; platforms</h2>
                        <p>Join/admin passwords and which platforms may connect.</p>
                    </div>
                    <div class="field-list">
                        <FormPasswordInput
                            v-model="server.config.game.password"
                            :name="'password'"
                            :tooltip="'Server password required for players to join. Leave empty for public server. Players must enter this to connect.'"
                            :readonly="props.readonly"
                            field-id="game.password"
                            @violation="v => setViolation('game.password', 'settings', 'advanced', v)"
                        />
                        <FormPasswordInput
                            v-model="server.config.game.passwordAdmin"
                            :name="'passwordAdmin'"
                            :tooltip="'Admin password for in-game admin login. No spaces allowed. Grants access to admin commands and functions. Leave empty to disable.'"
                            :policyWhitespace="true"
                            :readonly="props.readonly"
                            field-id="game.passwordAdmin"
                            @violation="v => setViolation('game.passwordAdmin', 'settings', 'advanced', v)"
                        />
                        <FormCheckboxInput
                            v-model="server.config.game.crossPlatform"
                            :name="'crossPlatform'"
                            :tooltip="'Allow crossplay between different platforms (PC, Xbox, PlayStation). Must be supported by all selected platforms. Default: false'"
                            :readonly="props.readonly"
                        />
                        <FormMultiSelectInput
                            v-model="server.config.game.supportedPlatforms"
                            :name="'supportedPlatforms'"
                            :tooltip="'Platforms that can connect to this server. PC: Windows/Linux, XBL: Xbox, PSN: PlayStation. Select multiple for crossplay.'"
                            :options="['PLATFORM_PC', 'PLATFORM_XBL', 'PLATFORM_PSN']"
                            :readonly="props.readonly"
                        />
                    </div>
                </div>

                <!-- Game Properties -->
                <div class="form-section">
                    <div class="form-section-head">
                        <h2>Game properties</h2>
                        <p>View distance, BattlEye, VON, and other server-side game rules.</p>
                    </div>
                    <div class="field-list">
                        <FormNumberInput
                            v-model="server.config.game.gameProperties.serverMaxViewDistance"
                            :name="'serverMaxViewDistance'"
                            :tooltip="'Maximum view distance in meters enforced by server. Limits how far players can see regardless of client settings. Higher = more performance load. Range: 500-10000, Default: 1600'"
                            :minVal="500"
                            :maxVal="10000"
                            :readonly="props.readonly"
                            field-id="gameProperties.serverMaxViewDistance"
                            @violation="v => setViolation('gameProperties.serverMaxViewDistance', 'settings', 'advanced', v)"
                        />
                        <FormNumberInput
                            v-model="server.config.game.gameProperties.serverMinGrassDistance"
                            :name="'serverMinGrassDistance'"
                            :tooltip="'Minimum grass render distance in meters for all players. Prevents players from disabling grass for unfair advantage. 0 = no minimum. Range: 0-150, Default: 0'"
                            :minVal="0"
                            :maxVal="150"
                            :readonly="props.readonly"
                            field-id="gameProperties.serverMinGrassDistance"
                            @violation="v => setViolation('gameProperties.serverMinGrassDistance', 'settings', 'advanced', v)"
                        />
                        <FormCheckboxInput
                            v-model="server.config.game.gameProperties.fastValidation"
                            :name="'fastValidation'"
                            :tooltip="'Enable fast validation mode for quicker player data checks. Reduces join time but may be less thorough. Default: true'"
                            :readonly="props.readonly"
                        />
                        <FormNumberInput
                            v-model="server.config.game.gameProperties.networkViewDistance"
                            :name="'networkViewDistance'"
                            :tooltip="'Network bubble radius in meters. Defines how far entities are synchronized to each player. Lower = better performance. Range: 500-5000, Default: 1500'"
                            :minVal="500"
                            :maxVal="1500"
                            :readonly="props.readonly"
                            field-id="gameProperties.networkViewDistance"
                            @violation="v => setViolation('gameProperties.networkViewDistance', 'settings', 'advanced', v)"
                        />
                        <FormCheckboxInput
                            v-model="server.config.game.gameProperties.battlEye"
                            :name="'battlEye'"
                            :tooltip="'Enable BattlEye anti-cheat protection. Highly recommended for public servers. Kicks players without BattlEye client. Default: true'"
                            :readonly="props.readonly"
                        />
                        <FormCheckboxInput
                            v-model="server.config.game.gameProperties.disableThirdPerson"
                            :name="'disableThirdPerson'"
                            :tooltip="'Force first-person view only. Disables 3rd person camera for tactical/realistic gameplay. Default: false'"
                            :readonly="props.readonly"
                        />
                        <FormCheckboxInput
                            v-model="server.config.game.gameProperties.VONDisableUI"
                            :name="'VONDisableUI'"
                            :tooltip="'Disable Voice-Over-Net UI indicators. Hides all visual feedback for voice chat (speaker icons, etc). Default: false'"
                            :readonly="props.readonly"
                        />
                        <FormCheckboxInput
                            v-model="server.config.game.gameProperties.VONDisableDirectSpeechUI"
                            :name="'VONDisableDirectSpeechUI'"
                            :tooltip="'Disable direct speech VON UI indicators only. Hides visual feedback for proximity voice chat specifically. Default: false'"
                            :readonly="props.readonly"
                        />
                        <FormCheckboxInput
                            v-model="server.config.game.gameProperties.VONCanTransmitCrossFaction"
                            :name="'VONCanTransmitCrossFaction'"
                            :tooltip="'Allow voice communication between enemy factions. Enable for casual play, disable for realism. Default: false'"
                            :readonly="props.readonly"
                        />
                        <FormJsonInput
                            v-model="server.config.game.gameProperties.missionHeader!"
                            :name="'missionHeader'"
                            :tooltip="'Custom JSON header data passed to the mission. Used for mission-specific configuration. Must be valid JSON object. Default: {}'"
                            :placeholder="'{}'"
                            :readonly="props.readonly"
                            field-id="gameProperties.missionHeader"
                            @violation="v => setViolation('gameProperties.missionHeader', 'settings', 'advanced', v)"
                        />
                    </div>
                </div>

                <!-- Operating -->
                <div class="form-section">
                    <div class="form-section-head">
                        <h2>Operating</h2>
                        <p>Server lifecycle, AI, session-save, and join queue settings.</p>
                    </div>
                    <div class="field-list">
                        <FormCheckboxInput
                            v-model="server.config.operating.lobbyPlayerSynchronise"
                            :name="'lobbyPlayerSynchronize'"
                            :tooltip="'Synchronize player data in lobby before joining game. Ensures all players load together. Disable for faster individual joins. Default: true'"
                            :readonly="props.readonly"
                        />
                        <FormCheckboxInput
                            v-model="server.config.operating.disableCrashReporter"
                            :name="'disableCrashReporter'"
                            :tooltip="'Disable automatic crash report sending to Bohemia Interactive. Enable for privacy or to reduce network traffic. Default: false'"
                            :readonly="props.readonly"
                        />
                        <FormMultiSelectModInput
                            v-model="server.config.operating.disableNavmeshStreaming"
                            :name="'disableNavmeshStreaming'"
                            :tooltip="'List of worlds/scenarios to disable AI navmesh streaming for. Can improve performance on static missions. Leave empty for default behavior. Optional parameter.'"
                            :optionalParam="true"
                            :readonly="props.readonly"
                        />
                        <FormCheckboxInput
                            v-model="server.config.operating.disableServerShutdown"
                            :name="'disableServerShutdown'"
                            :tooltip="'Prevent server from shutting down when last player disconnects. Keep server running 24/7. Useful for persistence. Default: false'"
                            :readonly="props.readonly"
                        />
                        <FormCheckboxInput
                            v-model="server.config.operating.disableAI"
                            :name="'disableAI'"
                            :tooltip="'Disable all AI processing on the server. Removes AI units, improves performance. Use for PvP-only servers. Default: false'"
                            :readonly="props.readonly"
                        />
                        <FormNumberInput
                            v-model="server.config.operating.playerSaveTime"
                            :name="'playerSaveTime'"
                            :tooltip="'Auto-save interval in seconds for player data/progress. Lower = more frequent saves, higher load. 0 = save only on disconnect. Default: 120'"
                            :minVal="0"
                            :readonly="props.readonly"
                            field-id="operating.playerSaveTime"
                            @violation="v => setViolation('operating.playerSaveTime', 'settings', 'advanced', v)"
                        />
                        <FormNumberInput
                            v-model="server.config.operating.aiLimit"
                            :name="'aiLimit'"
                            :tooltip="'Hard limit on total AI units. 0 = no AI allowed, -1 = ignore this setting (unlimited), positive number = max AI count. Default: -1 (ignored)'"
                            :minVal="-1"
                            :readonly="props.readonly"
                            field-id="operating.aiLimit"
                            @violation="v => setViolation('operating.aiLimit', 'settings', 'advanced', v)"
                        />
                        <FormNumberInput
                            v-model="server.config.operating.slotReservationTimeout"
                            :name="'slotReservationTimeout'"
                            :tooltip="'Seconds a player slot is reserved during connection before timing out. Prevents slot blocking by slow connections. Range: 5-300, Default: 60'"
                            :minVal="5"
                            :maxVal="300"
                            :readonly="props.readonly"
                            field-id="operating.slotReservationTimeout"
                            @violation="v => setViolation('operating.slotReservationTimeout', 'settings', 'advanced', v)"
                        />
                        <FormNumberInput
                            v-model="server.config.operating.joinQueue.maxSize"
                            :name="'joinQueue.maxSize'"
                            :tooltip="'Maximum queue size when server is full. 0 = no queue (reject immediately), 1-50 = queue size. Players wait in queue for open slot. Range: 0-50, Default: 0'"
                            :minVal="0"
                            :maxVal="50"
                            :readonly="props.readonly"
                            field-id="operating.joinQueue.maxSize"
                            @violation="v => setViolation('operating.joinQueue.maxSize', 'settings', 'advanced', v)"
                        />
                    </div>
                </div> </template
            ><!-- end advanced sub-tab --> </template
        ><!-- end settings tab -->

        <!-- ── Mods tab ── -->
        <template v-if="props.tab === 'mods'">
            <div class="form-section">
                <div class="form-section-head">
                    <h2>Mods</h2>
                    <p>Mods loaded on this server. Toggle required-by-default for all mods.</p>
                </div>
                <div class="field-list">
                    <FormCheckboxInput
                        v-model="server.config.game.modsRequiredByDefault"
                        :name="'modsRequiredByDefault'"
                        :tooltip="'When enabled, all mods are required by default unless individually set to optional. When disabled, mods are optional by default.'"
                        :readonly="props.readonly"
                    />
                    <FormModsInput
                        v-model="server.config.game.mods"
                        :name="'mods'"
                        :readonly="props.readonly"
                        @set-scenario="server.config.game.scenarioId = $event"
                    />
                </div>
            </div> </template
        ><!-- end mods tab -->

        <p v-if="inputViolationCounter > 0" class="violation-notice">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 9v4M12 17h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            </svg>
            {{ inputViolationCounter }} input violation{{ inputViolationCounter > 1 ? 's' : '' }} — fix before saving
        </p>
    </div>
</template>

<style scoped>
.config-sections {
    display: flex;
    flex-direction: column;
}

.sub-tabs {
    margin-bottom: 24px;
}

.violation-notice {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--red);
    font-size: 13px;
    margin: 24px 0 0;
    padding: 10px 14px;
    border: 1px solid color-mix(in oklab, var(--red), transparent 70%);
    background: var(--red-soft);
    border-radius: var(--radius);
}
</style>
