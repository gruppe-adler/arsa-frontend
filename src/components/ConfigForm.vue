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
            <FormTextInput :name="'name'" :tooltip="'max. 100'" @violIncr="violIncr" @violDecr="violDecr"
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
            <FormIpAddressInput :name="'bindAddress'" :tooltip="'default: 0.0.0.0'" @violIncr="violIncr" @violDecr="violDecr" :readonly="props.readonly" v-model="server.config.bindAddress" />
            <FormNumberInput :name="'bindPort'" :tooltip="'1-65535, default: 2001'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="65535" :readonly="props.readonly" v-model="server.config.bindPort" />
            <FormIpAddressInput :name="'publicAddress'" :tooltip="'default: empty'" @violIncr="violIncr" @violDecr="violDecr" :readonly="props.readonly" v-model="server.config.publicAddress" />
            <FormNumberInput :name="'publicPort'" :tooltip="'1-65535, default: 2001'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="65535" :readonly="props.readonly" v-model="server.config.publicPort" />
          </div>
        </div>

        <!-- A2S -->
        <div class="form-section">
          <div class="form-section-head">
            <h2>A2S query</h2>
            <p>Endpoint exposed for Steam's A2S server query protocol.</p>
          </div>
          <div class="field-list">
            <FormIpAddressInput :name="'address'" :tooltip="'required'" @violIncr="violIncr" @violDecr="violDecr" :readonly="props.readonly" v-model="server.config.a2s.address" />
            <FormNumberInput :name="'port'" :tooltip="'1-65535, default: 17777'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="65535" :readonly="props.readonly" v-model="server.config.a2s.port" />
          </div>
        </div>

        <!-- RCON -->
        <div class="form-section">
          <div class="form-section-head">
            <h2>RCON</h2>
            <p>Remote console for live administration. Leave disabled if not in use.</p>
          </div>
          <div class="field-list">
            <FormIpAddressInput :name="'address'" :tooltip="'required'" @violIncr="violIncr" @violDecr="violDecr" :readonly="props.readonly" v-model="server.config.rcon.address" />
            <FormNumberInput :name="'port'" :tooltip="'1-65535, default: 19999'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="65535" :readonly="props.readonly" v-model="server.config.rcon.port" />
            <FormPasswordInput :name="'password'" :tooltip="'required, no spaces, min 3'" @violIncr="violIncr" @violDecr="violDecr" :policyWhitespace="true" :policyMinimum="3" :readonly="props.readonly" v-model="server.config.rcon.password" />
            <FormNumberInput :name="'maxClients'" :tooltip="'1-16, default: 16'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="16" :readonly="props.readonly" v-model="server.config.rcon.maxClients" />
            <FormSelectInput :name="'permission'" :tooltip="'admin or monitor'" :options="['monitor', 'admin']" :selectedIndex="0" :readonly="props.readonly" v-model="server.config.rcon.permission" />
            <FormMultiSelectModInput :name="'blacklist'" :tooltip="'default []'" :readonly="props.readonly" v-model="server.config.rcon.blacklist" />
            <FormMultiSelectModInput :name="'whitelist'" :tooltip="'default []'" :readonly="props.readonly" v-model="server.config.rcon.whitelist" />
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
            <FormTextInput :name="'name'" :tooltip="'max. 100'" @violIncr="violIncr" @violDecr="violDecr" :placeholder="'Server\'s name'" :length="100" :readonly="props.readonly" :pasteValue="server.name" v-model="server.config.game.name" />
            <FormPasswordInput :name="'password'" :tooltip="'default: empty'" @violIncr="violIncr" @violDecr="violDecr" :readonly="props.readonly" v-model="server.config.game.password" />
            <FormPasswordInput :name="'passwordAdmin'" :tooltip="'no spaces, default: empty'" @violIncr="violIncr" @violDecr="violDecr" :policyWhitespace="true" :readonly="props.readonly" v-model="server.config.game.passwordAdmin" />
            <FormMultiSelectModInput :name="'admins'" :tooltip="'default []'" :regEx="['^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', '^[0-9]{17}$']" :readonly="props.readonly" v-model="server.config.game.admins" />
            <FormTextInput :name="'scenarioId'" :tooltip="'needed to start'" @violIncr="violIncr" @violDecr="violDecr" :placeholder="'{59AD59368755F41A}Missions/21_GM_Eden.conf'" :length="100" :readonly="props.readonly" v-model="server.config.game.scenarioId" />
            <FormNumberInput :name="'maxPlayers'" :tooltip="'1-128, default: 64'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="128" :readonly="props.readonly" v-model="server.config.game.maxPlayers" />
            <FormCheckboxInput :name="'visible'" :tooltip="'default: true'" :readonly="props.readonly" v-model="server.config.game.visible" />
            <FormCheckboxInput :name="'crossPlatform'" :tooltip="'default: false'" :readonly="props.readonly" v-model="server.config.game.crossPlatform" />
            <FormMultiSelectInput :name="'supportedPlatforms'" :tooltip="'default: PLATFORM_PC'" :options="['PLATFORM_PC', 'PLATFORM_XBL', 'PLATFORM_PSN']" :readonly="props.readonly" v-model="server.config.game.supportedPlatforms" />
          </div>
        </div>

        <!-- Game Properties -->
        <div class="form-section">
          <div class="form-section-head">
            <h2>Game properties</h2>
            <p>View distance, BattlEye, VON, and other server-side game rules.</p>
          </div>
          <div class="field-list">
            <FormNumberInput :name="'serverMaxViewDistance'" :tooltip="'500-10.000, default: 1.600'" @violIncr="violIncr" @violDecr="violDecr" :minVal="500" :maxVal="10000" :readonly="props.readonly" v-model="server.config.game.gameProperties.serverMaxViewDistance" />
            <FormNumberInput :name="'serverMinGrassDistance'" :tooltip="'0-150, default: 0'" @violIncr="violIncr" @violDecr="violDecr" :minVal="0" :maxVal="150" :readonly="props.readonly" v-model="server.config.game.gameProperties.serverMinGrassDistance" />
            <FormCheckboxInput :name="'fastValidation'" :tooltip="'default: true'" :readonly="props.readonly" v-model="server.config.game.gameProperties.fastValidation" />
            <FormNumberInput :name="'networkViewDistance'" :tooltip="'500-5.000, default: 1.500'" @violIncr="violIncr" @violDecr="violDecr" :minVal="500" :maxVal="1500" :readonly="props.readonly" v-model="server.config.game.gameProperties.networkViewDistance" />
            <FormCheckboxInput :name="'battlEye'" :tooltip="'default: true'" :readonly="props.readonly" v-model="server.config.game.gameProperties.battlEye" />
            <FormCheckboxInput :name="'disableThirdPerson'" :tooltip="'default: false'" :readonly="props.readonly" v-model="server.config.game.gameProperties.disableThirdPerson" />
            <FormCheckboxInput :name="'VONDisableUI'" :tooltip="'default: false'" :readonly="props.readonly" v-model="server.config.game.gameProperties.VONDisableUI" />
            <FormCheckboxInput :name="'VONDisableDirectSpeechUI'" :tooltip="'default: false'" :readonly="props.readonly" v-model="server.config.game.gameProperties.VONDisableDirectSpeechUI" />
            <FormCheckboxInput :name="'VONCanTransmitCrossFaction'" :tooltip="'default: false'" :readonly="props.readonly" v-model="server.config.game.gameProperties.VONCanTransmitCrossFaction" />
            <FormJsonInput :name="'missionHeader'" :tooltip="'JSON, default: {}'" @violIncr="violIncr" @violDecr="violDecr" :placeholder="'{}'" :readonly="props.readonly" v-model="server.config.game.gameProperties.missionHeader" />
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
            <FormCheckboxInput :name="'lobbyPlayerSynchronize'" :tooltip="'default: true'" :readonly="props.readonly" v-model="server.config.operating.lobbyPlayerSynchronise" />
            <FormCheckboxInput :name="'disableCrashReporter'" :tooltip="'default: false'" :readonly="props.readonly" v-model="server.config.operating.disableCrashReporter" />
            <FormMultiSelectModInput :name="'disableNavmeshStreaming'" :tooltip="'default: undefined'" :optional-param="true" :readonly="props.readonly" v-model="server.config.operating.disableNavmeshStreaming" />
            <FormCheckboxInput :name="'disableServerShutdown'" :tooltip="'default: false'" :readonly="props.readonly" v-model="server.config.operating.disableServerShutdown" />
            <FormCheckboxInput :name="'disableAI'" :tooltip="'default: false'" :readonly="props.readonly" v-model="server.config.operating.disableAI" />
            <FormNumberInput :name="'playerSaveTime'" :tooltip="'default: 120'" @violIncr="violIncr" @violDecr="violDecr" :minVal="0" :readonly="props.readonly" v-model="server.config.operating.playerSaveTime" />
            <FormNumberInput :name="'aiLimit'" :tooltip="'0-unlimited, default: -1 = ignored'" @violIncr="violIncr" @violDecr="violDecr" :minVal="-1" :readonly="props.readonly" v-model="server.config.operating.aiLimit" />
            <FormNumberInput :name="'slotReservationTimeout'" :tooltip="'5-300, default: 60'" @violIncr="violIncr" @violDecr="violDecr" :minVal="5" :max-val="300" :readonly="props.readonly" v-model="server.config.operating.slotReservationTimeout" />
            <FormNumberInput :name="'joinQueue.maxSize'" :tooltip="'0-50, default: 0'" @violIncr="violIncr" @violDecr="violDecr" :minVal="0" :max-val="50" :readonly="props.readonly" v-model="server.config.operating.joinQueue.maxSize" />
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
        <FormCheckboxInput :name="'modsRequiredByDefault'" :tooltip="'default: true'" :readonly="props.readonly" v-model="server.config.game.modsRequiredByDefault" />
        <FormModsInput :name="'mods'" :tooltip="'default []'" :readonly="props.readonly" v-model="server.config.game.mods" />
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
