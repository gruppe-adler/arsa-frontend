<script setup lang="ts">

import { ServerConfig } from '../utils/interfaces';
import FormTextInput from './FormTextInput.vue'
import FormIpAddressInput from './FormIpAddressInput.vue';
import FormNumberInput from './FormNumberInput.vue';
import FormPasswordInput from './FormPasswordInput.vue';
import FormSelectInput from './FormSelectInput.vue';
import FormMultiSelectInput from './FormMultiSelectInput.vue';
import FormMultiSelectModInput from './FormMultiSelectModInput.vue';
import FormCheckboxInput from './FormCheckboxInput.vue';
import FormJsonInput from './FormJsonInput.vue';
import FormModsInput from './FormModsInput.vue';

const props = defineProps({ readonly: Boolean })

const config = defineModel<ServerConfig>('config', { required: true });
const name = defineModel<string>('name', { required: true });

const inputViolationCounter = defineModel<number>('inputViolationCounter', { required: true });

function violIncr() {
    inputViolationCounter.value++;
}

function violDecr() {
    inputViolationCounter.value--;
}

</script>

<template>
    <form>
        <p>*=required</p>
        <h2>Server Settings</h2>
            <FormTextInput :name="'name*'" @violIncr="violIncr" @violDecr="violDecr" :placeholder="'Server\'s name'" :length="100" :readonly="props.readonly" v-model="name"></FormTextInput>
        <h3>Config</h3>
            <FormIpAddressInput :name="'bindAddress (default: 0.0.0.0)'" @violIncr="violIncr" @violDecr="violDecr" :readonly="props.readonly" v-model="config.bindAddress"></FormIpAddressInput>
            <FormNumberInput :name="'bindPort (1-65535 default: 2001)'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="65535" :readonly="props.readonly" v-model="config.bindPort"></FormNumberInput>
            <FormIpAddressInput :name="'publicAddress* (default empty)'" @violIncr="violIncr" @violDecr="violDecr" :readonly="props.readonly" v-model="config.publicAddress"></FormIpAddressInput>
            <FormNumberInput :name="'publicPort (1-65535 default: 2001)'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="65535" :readonly="props.readonly" v-model="config.publicPort"></FormNumberInput>
        <h4>A2S</h4>
            <FormIpAddressInput :name="'address* (required)'" @violIncr="violIncr" @violDecr="violDecr" :readonly="props.readonly" v-model="config.a2s.address"></FormIpAddressInput>
            <FormNumberInput :name="'port (1-65535 default: 17777)'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="65535" :readonly="props.readonly" v-model="config.a2s.port"></FormNumberInput>
        <h4>RCON</h4>
            <FormIpAddressInput :name="'address* (required)'" @violIncr="violIncr" @violDecr="violDecr" :readonly="props.readonly" v-model="config.rcon.address"></FormIpAddressInput>
            <FormNumberInput :name="'port (1-65535 default: 19999)'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="65535" :readonly="props.readonly" v-model="config.rcon.port"></FormNumberInput>
            <FormPasswordInput :name="'password (required, no spaces, min 3)'" @violIncr="violIncr" @violDecr="violDecr" :policyWhitespace="true" :policyMinimum="3" :readonly="props.readonly" v-model="config.rcon.password"></FormPasswordInput>
            <FormNumberInput :name="'maxClients (1-16 default: 16)'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="16" :readonly="props.readonly" v-model="config.rcon.maxClients"></FormNumberInput>
            <FormSelectInput :name="'permission (admin or monitor)'" :options="['monitor', 'admin']" :selectedIndex="0" :readonly="props.readonly" v-model="config.rcon.permission"></FormSelectInput>
            <FormMultiSelectModInput :name="'blacklist'" :readonly="props.readonly" v-model="config.rcon.blacklist"></FormMultiSelectModInput>
            <FormMultiSelectModInput :name="'whitelist'" :readonly="props.readonly" v-model="config.rcon.whitelist"></FormMultiSelectModInput>
        <h4>Game</h4>
            <FormTextInput :name="'name (max. 100)'" @violIncr="violIncr" @violDecr="violDecr":placeholder="'Server\'s name'" :length="100" :readonly="props.readonly" v-model="config.game.name"></FormTextInput>
            <FormPasswordInput :name="'password (default: empty)'" @violIncr="violIncr" @violDecr="violDecr" :readonly="props.readonly" v-model="config.game.password"></FormPasswordInput>
            <FormPasswordInput :name="'passwordAdmin (no spaces, default: empty)'" @violIncr="violIncr" @violDecr="violDecr" :policyWhitespace="true" :readonly="props.readonly" v-model="config.game.passwordAdmin"></FormPasswordInput>
            <FormMultiSelectModInput :name="'admins'" :readonly="props.readonly" v-model="config.game.admins"></FormMultiSelectModInput>
            <FormTextInput :name="'scenarioId (needed to start)'" @violIncr="violIncr" @violDecr="violDecr" :placeholder="'{59AD59368755F41A}Missions/21_GM_Eden.conf'" :length="100" :readonly="props.readonly" v-model="config.game.scenarioId"></FormTextInput>
            <FormNumberInput :name="'maxPlayers (1-128 default: 64)'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="128" :readonly="props.readonly" v-model="config.game.maxPlayers"></FormNumberInput>
            <FormCheckboxInput :name="'visible (default: true)'" :readonly="props.readonly" v-model="config.game.visible"></FormCheckboxInput>
            <FormCheckboxInput :name="'crossPlatform (default: false)'" :readonly="props.readonly" v-model="config.game.crossPlatform"></FormCheckboxInput>
            <FormMultiSelectInput :name="'supportedPlatforms (default: PLATFORM_PC, won\'t start with PLATFORM_XBL only)'" :options="['PLATFORM_PC', 'PLATFORM_XBL']" :readonly="props.readonly" v-model="config.game.supportedPlatforms"></FormMultiSelectInput>
        <h5>Properties</h5>
            <FormNumberInput :name="'serverMaxViewDistance (500-10.000 default: 1.600)'" @violIncr="violIncr" @violDecr="violDecr" :minVal="500" :maxVal="10000" :readonly="props.readonly" v-model="config.game.gameProperties.serverMaxViewDistance"></FormNumberInput>
            <FormNumberInput :name="'serverMinGrassDistance (50-150 default: 0=noForceOnClients)'" @violIncr="violIncr" @violDecr="violDecr" :minVal="0" :maxVal="150" :readonly="props.readonly" v-model="config.game.gameProperties.serverMinGrassDistance"></FormNumberInput>
            <FormCheckboxInput :name="'fastValidation (default: true)'" :readonly="props.readonly" v-model="config.game.gameProperties.fastValidation"></FormCheckboxInput>
            <FormNumberInput :name="'networkViewDistance (500-5.000 default: 1.500)'" @violIncr="violIncr" @violDecr="violDecr" :minVal="500" :maxVal="1500" :readonly="props.readonly" v-model="config.game.gameProperties.networkViewDistance"></FormNumberInput>
            <FormCheckboxInput :name="'battlEye (default: true)'" :readonly="props.readonly" v-model="config.game.gameProperties.battlEye"></FormCheckboxInput>
            <FormCheckboxInput :name="'disableThirdPerson (default: false)'" :readonly="props.readonly" v-model="config.game.gameProperties.disableThirdPerson"></FormCheckboxInput>
            <FormCheckboxInput :name="'VONDisableUI (default: false)'" :readonly="props.readonly" v-model="config.game.gameProperties.VONDisableUI"></FormCheckboxInput>
            <FormCheckboxInput :name="'VONDisableDirectSpeechUI (default: false)'" :readonly="props.readonly" v-model="config.game.gameProperties.VONDisableDirectSpeechUI"></FormCheckboxInput>
            <FormCheckboxInput :name="'VONCanTransmitCrossFaction (default: false)'" :readonly="props.readonly" v-model="config.game.gameProperties.VONCanTransmitCrossFaction"></FormCheckboxInput>
            <FormJsonInput :name="'missionHeader (JSON default: empty)'" @violIncr="violIncr" @violDecr="violDecr" :placeholder="'{59AD59368755F41A}Missions/21_GM_Eden.conf'" :readonly="props.readonly" v-model="config.game.gameProperties.missionHeader"></FormJsonInput>
            <FormModsInput :name="'mods (select the ones you want)'" :readonly="props.readonly" v-model="config.game.mods"></FormModsInput>
        <h4>Operating</h4>
        <FormCheckboxInput :name="'lobbyPlayerSynchronize (default: true)'" :readonly="props.readonly" v-model="config.operating.lobbyPlayerSynchronise"></FormCheckboxInput>
        <FormMultiSelectModInput :name="'disableNavmeshStreaming (default: undefined)'" :optional-param="true" :readonly="props.readonly" v-model="config.operating.disableNavmeshStreaming"></FormMultiSelectModInput>
        <FormCheckboxInput :name="'disableServerShutdown (default: false)'" :readonly="props.readonly" v-model="config.operating.disableServerShutdown"></FormCheckboxInput>
        <FormCheckboxInput :name="'disableAI (default: false)'" :readonly="props.readonly" v-model="config.operating.disableAI"></FormCheckboxInput>
        <FormNumberInput :name="'playerSaveTime (default: 120)'" @violIncr="violIncr" @violDecr="violDecr" :minVal="0" :readonly="props.readonly" v-model="config.operating.playerSaveTime"></FormNumberInput>
        <FormNumberInput :name="'aiLimit (0-unlimited default: -1 = ignored)'" @violIncr="violIncr" @violDecr="violDecr" :minVal="-1" :readonly="props.readonly" v-model="config.operating.aiLimit"></FormNumberInput>
        <FormNumberInput :name="'slotReservationTimeout (5-300 default: 60)'" @violIncr="violIncr" @violDecr="violDecr" :minVal="5" :max-val="300" :readonly="props.readonly" v-model="config.operating.slotReservationTimeout"></FormNumberInput>
    </form>
    <p class="warning" v-if="inputViolationCounter > 0">Input Violations: {{ inputViolationCounter }}</p>
</template>

<style scoped>
  .label {
    margin-left: 10px;
    margin-right: 10px;
  }

  .warning {
    color: rgb(255, 0, 0);
  }
</style>