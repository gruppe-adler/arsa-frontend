<script setup lang="ts">
import { ref } from 'vue';
import { Server } from '../utils/interfaces';
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

const props = defineProps({
    readonly: Boolean,
    tab: { type: String as () => 'settings' | 'mods', default: 'settings' }
});

const server = defineModel<Server>('server', { required: true });
const inputViolationCounter = defineModel<number>('inputViolationCounter', { required: true });

function violIncr() { inputViolationCounter.value++; }
function violDecr() { inputViolationCounter.value--; }

const settingsSubTab = ref<'server' | 'game' | 'advanced'>('server');
const settingsSubTabs = [
    { key: 'server',   label: 'Server' },
    { key: 'game',     label: 'Game' },
    { key: 'advanced', label: 'Advanced' },
];
</script>

<template>
  <div class="config-sections">

    <!-- ── Settings tab ── -->
    <template v-if="props.tab === 'settings'">

      <FormTabs :tabs="settingsSubTabs" v-model="settingsSubTab" list-class="sub-tabs" />

      <!-- ── Server sub-tab ── -->
      <template v-if="settingsSubTab === 'server'">

        <!-- Identity -->
        <div class="form-section">
          <div class="form-section-head">
            <h2>Identity</h2>
            <p>The display name for this server within ARSA. Not visible to players in-game.</p>
          </div>
          <div class="field-list">
            <FormTextInput :name="'name'" @violIncr="violIncr" @violDecr="violDecr"
              :placeholder="'Server\'s name'" :length="100" :readonly="props.readonly" v-model="server.name" />
          </div>
        </div>

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
              @violIncr="violIncr" @violDecr="violDecr"
              :readonly="props.readonly"
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
            <FormIpAddressInput :name="'bindAddress'" :tooltip="'Local IP address the server binds to. Use 0.0.0.0 to listen on all interfaces, or a specific IP for one interface. Default: 0.0.0.0'" @violIncr="violIncr" @violDecr="violDecr" :readonly="props.readonly" v-model="server.config.bindAddress" />
            <FormNumberInput :name="'bindPort'" :tooltip="'Local UDP port the server binds to. Must be open in firewall and forwarded if behind NAT. Range: 1-65535, Default: 2001'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="65535" :readonly="props.readonly" v-model="server.config.bindPort" />
            <FormIpAddressInput :name="'publicAddress'" :tooltip="'Public IP address advertised to server browser and players. Leave empty for automatic detection. Required if behind NAT/firewall. Default: auto-detect'" @violIncr="violIncr" @violDecr="violDecr" :readonly="props.readonly" v-model="server.config.publicAddress" />
            <FormNumberInput :name="'publicPort'" :tooltip="'Public UDP port advertised to server browser and players. Should match bindPort or forwarded port if using NAT. Range: 1-65535, Default: 2001'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="65535" :readonly="props.readonly" v-model="server.config.publicPort" />
          </div>
        </div>

        <!-- A2S -->
        <div class="form-section">
          <div class="form-section-head">
            <h2>A2S query</h2>
            <p>Endpoint exposed for Steam's A2S server query protocol.</p>
          </div>
          <div class="field-list">
            <FormIpAddressInput :name="'address'" :tooltip="'IP address for Steam A2S query protocol. Used by server browsers to fetch server info. Use 0.0.0.0 for all interfaces. Required.'" @violIncr="violIncr" @violDecr="violDecr" :readonly="props.readonly" v-model="server.config.a2s.address" />
            <FormNumberInput :name="'port'" :tooltip="'UDP port for Steam A2S query protocol. Must be accessible from internet for server listing. Range: 1-65535, Default: 17777'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="65535" :readonly="props.readonly" v-model="server.config.a2s.port" />
          </div>
        </div>

        <!-- RCON -->
        <div class="form-section">
          <div class="form-section-head">
            <h2>RCON</h2>
            <p>Remote console for live administration. Leave disabled if not in use.</p>
          </div>
          <div class="field-list">
            <FormIpAddressInput :name="'address'" :tooltip="'IP address for RCON (Remote Console) access. Use 127.0.0.1 for localhost only, or 0.0.0.0 for external access. Required.'" @violIncr="violIncr" @violDecr="violDecr" :readonly="props.readonly" v-model="server.config.rcon.address" />
            <FormNumberInput :name="'port'" :tooltip="'TCP port for RCON connections. Used by admin tools to remotely control the server. Range: 1-65535, Default: 19999'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="65535" :readonly="props.readonly" v-model="server.config.rcon.port" />
            <FormPasswordInput :name="'password'" :tooltip="'RCON password for authentication. No spaces allowed, minimum 3 characters. Keep secure as it grants server control. Required.'" @violIncr="violIncr" @violDecr="violDecr" :policyWhitespace="true" :policyMinimum="3" :readonly="props.readonly" v-model="server.config.rcon.password" />
            <FormNumberInput :name="'maxClients'" :tooltip="'Maximum simultaneous RCON connections allowed. Limits how many admins can connect at once. Range: 1-16, Default: 16'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="16" :readonly="props.readonly" v-model="server.config.rcon.maxClients" />
            <FormSelectInput :name="'permission'" :tooltip="'RCON permission level. Monitor: read-only access to view server state. Admin: full control including kick, ban, and config changes.'" :options="['monitor', 'admin']" :selectedIndex="0" :readonly="props.readonly" v-model="server.config.rcon.permission" />
            <FormMultiSelectModInput :name="'blacklist'" :tooltip="'List of IPs or identity IDs blocked from RCON access. Use to ban specific admins or addresses. Default: []'" :readonly="props.readonly" v-model="server.config.rcon.blacklist" />
            <FormMultiSelectModInput :name="'whitelist'" :tooltip="'List of IPs or identity IDs allowed RCON access. When set, only these can connect. Overrides blacklist. Default: []'" :readonly="props.readonly" v-model="server.config.rcon.whitelist" />
          </div>
        </div>

      </template><!-- end server sub-tab -->

      <!-- ── Game sub-tab ── -->
      <template v-if="settingsSubTab === 'game'">

        <!-- Game -->
        <div class="form-section">
          <div class="form-section-head">
            <h2>Game</h2>
            <p>Core game session settings. The name here is what players see in the in-game server browser.</p>
          </div>
          <div class="field-list">
            <FormTextInput :name="'name'" :tooltip="'Server name displayed in the in-game server browser. This is what players see when searching for servers. Max 100 characters.'" @violIncr="violIncr" @violDecr="violDecr" :placeholder="'Server\'s name'" :length="100" :readonly="props.readonly" :pasteValue="server.name" v-model="server.config.game.name" />
            <FormPasswordInput :name="'password'" :tooltip="'Server password required for players to join. Leave empty for public server. Players must enter this to connect.'" @violIncr="violIncr" @violDecr="violDecr" :readonly="props.readonly" v-model="server.config.game.password" />
            <FormPasswordInput :name="'passwordAdmin'" :tooltip="'Admin password for in-game admin login. No spaces allowed. Grants access to admin commands and functions. Leave empty to disable.'" @violIncr="violIncr" @violDecr="violDecr" :policyWhitespace="true" :readonly="props.readonly" v-model="server.config.game.passwordAdmin" />
            <FormMultiSelectModInput :name="'admins'" :tooltip="'List of admin identities (BI UID format: 8-4-4-4-12 hex, or Steam ID: 17 digits). These players have permanent admin rights without password.'" :regEx="['^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', '^[0-9]{17}$']" :readonly="props.readonly" v-model="server.config.game.admins" />
            <FormTextInput :name="'scenarioId'" :tooltip="'Mission scenario to load. Format: {GUID}Path/To/Mission.conf (e.g. {59AD59368755F41A}Missions/21_GM_Eden.conf). Required to start server.'" @violIncr="violIncr" @violDecr="violDecr" :placeholder="'{59AD59368755F41A}Missions/21_GM_Eden.conf'" :length="100" :readonly="props.readonly" v-model="server.config.game.scenarioId" />
            <FormNumberInput :name="'maxPlayers'" :tooltip="'Maximum number of players allowed on the server simultaneously. Higher values require more resources. Range: 1-128, Default: 64'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="128" :readonly="props.readonly" v-model="server.config.game.maxPlayers" />
            <FormCheckboxInput :name="'visible'" :tooltip="'Whether the server appears in the public server browser. Disable for private/unlisted servers. Default: true'" :readonly="props.readonly" v-model="server.config.game.visible" />
            <FormCheckboxInput :name="'crossPlatform'" :tooltip="'Allow crossplay between different platforms (PC, Xbox, PlayStation). Must be supported by all selected platforms. Default: false'" :readonly="props.readonly" v-model="server.config.game.crossPlatform" />
            <FormMultiSelectInput :name="'supportedPlatforms'" :tooltip="'Platforms that can connect to this server. PC: Windows/Linux, XBL: Xbox, PSN: PlayStation. Select multiple for crossplay.'" :options="['PLATFORM_PC', 'PLATFORM_XBL', 'PLATFORM_PSN']" :readonly="props.readonly" v-model="server.config.game.supportedPlatforms" />
          </div>
        </div>

        <!-- Game Properties -->
        <div class="form-section">
          <div class="form-section-head">
            <h2>Game properties</h2>
            <p>View distance, BattlEye, VON, and other server-side game rules.</p>
          </div>
          <div class="field-list">
            <FormNumberInput :name="'serverMaxViewDistance'" :tooltip="'Maximum view distance in meters enforced by server. Limits how far players can see regardless of client settings. Higher = more performance load. Range: 500-10000, Default: 1600'" @violIncr="violIncr" @violDecr="violDecr" :minVal="500" :maxVal="10000" :readonly="props.readonly" v-model="server.config.game.gameProperties.serverMaxViewDistance" />
            <FormNumberInput :name="'serverMinGrassDistance'" :tooltip="'Minimum grass render distance in meters for all players. Prevents players from disabling grass for unfair advantage. 0 = no minimum. Range: 0-150, Default: 0'" @violIncr="violIncr" @violDecr="violDecr" :minVal="0" :maxVal="150" :readonly="props.readonly" v-model="server.config.game.gameProperties.serverMinGrassDistance" />
            <FormCheckboxInput :name="'fastValidation'" :tooltip="'Enable fast validation mode for quicker player data checks. Reduces join time but may be less thorough. Default: true'" :readonly="props.readonly" v-model="server.config.game.gameProperties.fastValidation" />
            <FormNumberInput :name="'networkViewDistance'" :tooltip="'Network bubble radius in meters. Defines how far entities are synchronized to each player. Lower = better performance. Range: 500-5000, Default: 1500'" @violIncr="violIncr" @violDecr="violDecr" :minVal="500" :maxVal="1500" :readonly="props.readonly" v-model="server.config.game.gameProperties.networkViewDistance" />
            <FormCheckboxInput :name="'battlEye'" :tooltip="'Enable BattlEye anti-cheat protection. Highly recommended for public servers. Kicks players without BattlEye client. Default: true'" :readonly="props.readonly" v-model="server.config.game.gameProperties.battlEye" />
            <FormCheckboxInput :name="'disableThirdPerson'" :tooltip="'Force first-person view only. Disables 3rd person camera for tactical/realistic gameplay. Default: false'" :readonly="props.readonly" v-model="server.config.game.gameProperties.disableThirdPerson" />
            <FormCheckboxInput :name="'VONDisableUI'" :tooltip="'Disable Voice-Over-Net UI indicators. Hides all visual feedback for voice chat (speaker icons, etc). Default: false'" :readonly="props.readonly" v-model="server.config.game.gameProperties.VONDisableUI" />
            <FormCheckboxInput :name="'VONDisableDirectSpeechUI'" :tooltip="'Disable direct speech VON UI indicators only. Hides visual feedback for proximity voice chat specifically. Default: false'" :readonly="props.readonly" v-model="server.config.game.gameProperties.VONDisableDirectSpeechUI" />
            <FormCheckboxInput :name="'VONCanTransmitCrossFaction'" :tooltip="'Allow voice communication between enemy factions. Enable for casual play, disable for realism. Default: false'" :readonly="props.readonly" v-model="server.config.game.gameProperties.VONCanTransmitCrossFaction" />
            <FormJsonInput :name="'missionHeader'" :tooltip="'Custom JSON header data passed to the mission. Used for mission-specific configuration. Must be valid JSON object. Default: {}'" @violIncr="violIncr" @violDecr="violDecr" :placeholder="'{}'" :readonly="props.readonly" v-model="server.config.game.gameProperties.missionHeader" />
          </div>
        </div>

      </template><!-- end game sub-tab -->

      <!-- ── Advanced sub-tab ── -->
      <template v-if="settingsSubTab === 'advanced'">

        <!-- Operating -->
        <div class="form-section">
          <div class="form-section-head">
            <h2>Operating</h2>
            <p>Server lifecycle, AI, session-save, and join queue settings.</p>
          </div>
          <div class="field-list">
            <FormCheckboxInput :name="'lobbyPlayerSynchronize'" :tooltip="'Synchronize player data in lobby before joining game. Ensures all players load together. Disable for faster individual joins. Default: true'" :readonly="props.readonly" v-model="server.config.operating.lobbyPlayerSynchronise" />
            <FormCheckboxInput :name="'disableCrashReporter'" :tooltip="'Disable automatic crash report sending to Bohemia Interactive. Enable for privacy or to reduce network traffic. Default: false'" :readonly="props.readonly" v-model="server.config.operating.disableCrashReporter" />
            <FormMultiSelectModInput :name="'disableNavmeshStreaming'" :tooltip="'List of worlds/scenarios to disable AI navmesh streaming for. Can improve performance on static missions. Leave empty for default behavior. Optional parameter.'" :optional-param="true" :readonly="props.readonly" v-model="server.config.operating.disableNavmeshStreaming" />
            <FormCheckboxInput :name="'disableServerShutdown'" :tooltip="'Prevent server from shutting down when last player disconnects. Keep server running 24/7. Useful for persistence. Default: false'" :readonly="props.readonly" v-model="server.config.operating.disableServerShutdown" />
            <FormCheckboxInput :name="'disableAI'" :tooltip="'Disable all AI processing on the server. Removes AI units, improves performance. Use for PvP-only servers. Default: false'" :readonly="props.readonly" v-model="server.config.operating.disableAI" />
            <FormNumberInput :name="'playerSaveTime'" :tooltip="'Auto-save interval in seconds for player data/progress. Lower = more frequent saves, higher load. 0 = save only on disconnect. Default: 120'" @violIncr="violIncr" @violDecr="violDecr" :minVal="0" :readonly="props.readonly" v-model="server.config.operating.playerSaveTime" />
            <FormNumberInput :name="'aiLimit'" :tooltip="'Hard limit on total AI units. 0 = no AI allowed, -1 = ignore this setting (unlimited), positive number = max AI count. Default: -1 (ignored)'" @violIncr="violIncr" @violDecr="violDecr" :minVal="-1" :readonly="props.readonly" v-model="server.config.operating.aiLimit" />
            <FormNumberInput :name="'slotReservationTimeout'" :tooltip="'Seconds a player slot is reserved during connection before timing out. Prevents slot blocking by slow connections. Range: 5-300, Default: 60'" @violIncr="violIncr" @violDecr="violDecr" :minVal="5" :max-val="300" :readonly="props.readonly" v-model="server.config.operating.slotReservationTimeout" />
            <FormNumberInput :name="'joinQueue.maxSize'" :tooltip="'Maximum queue size when server is full. 0 = no queue (reject immediately), 1-50 = queue size. Players wait in queue for open slot. Range: 0-50, Default: 0'" @violIncr="violIncr" @violDecr="violDecr" :minVal="0" :max-val="50" :readonly="props.readonly" v-model="server.config.operating.joinQueue.maxSize" />
          </div>
        </div>

      </template><!-- end advanced sub-tab -->

    </template><!-- end settings tab -->

    <!-- ── Mods tab ── -->
    <template v-if="props.tab === 'mods'">

    <div class="form-section">
      <div class="form-section-head">
        <h2>Mods</h2>
        <p>Mods loaded on this server. Toggle required-by-default for all mods.</p>
      </div>
      <div class="field-list">
        <FormCheckboxInput :name="'modsRequiredByDefault'" :tooltip="'When enabled, all mods are required by default unless individually set to optional. When disabled, mods are optional by default.'" :readonly="props.readonly" v-model="server.config.game.modsRequiredByDefault" />
        <FormModsInput :name="'mods'" :readonly="props.readonly" v-model="server.config.game.mods" />
      </div>
    </div>

    </template><!-- end mods tab -->

    <p class="violation-notice" v-if="inputViolationCounter > 0">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/></svg>
      {{ inputViolationCounter }} input violation{{ inputViolationCounter > 1 ? 's' : '' }} — fix before saving
    </p>
  </div>
</template>

<style scoped>
.config-sections { display: flex; flex-direction: column; }

.sub-tabs {
  margin-bottom: 24px;
}

.violation-notice {
  display: inline-flex; align-items: center; gap: 8px;
  color: var(--red);
  font-size: 13px;
  margin: 24px 0 0;
  padding: 10px 14px;
  border: 1px solid color-mix(in oklab, var(--red), transparent 70%);
  background: var(--red-soft);
  border-radius: var(--radius);
}
</style>
