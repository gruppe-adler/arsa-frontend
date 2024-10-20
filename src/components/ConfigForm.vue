<script setup lang="ts">

import { Server } from '../utils/interfaces';
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
import FormStartupParameterInput from './FormStartupParameterInput.vue';

const props = defineProps({ readonly: Boolean })

const server = defineModel<Server>('server', { required: true });

const inputViolationCounter = defineModel<number>('inputViolationCounter', { required: true });

function violIncr() {
    inputViolationCounter.value++;
}

function violDecr() {
    inputViolationCounter.value--;
}

</script>

<template>
    <form id="config-form">
        <h2>Server Settings</h2>
            <FormTextInput :name="'name'" :tooltip="'max. 100'" @violIncr="violIncr" @violDecr="violDecr" :placeholder="'Server\'s name'" :length="100" :readonly="props.readonly" v-model="server.name"></FormTextInput>
            <h3>Startup Parameters</h3>
            <ul>
                <FormStartupParameterInput v-for="(_item, idx) in server.startupParameters" v-model="server.startupParameters[idx]" @violIncr="violIncr" @violDecr="violDecr" :readonly="props.readonly"></FormStartupParameterInput>
            </ul>
            <h3>Config</h3>
            <FormIpAddressInput :name="'bindAddress'" :tooltip="'default: 0.0.0.0'" @violIncr="violIncr" @violDecr="violDecr" :readonly="props.readonly" v-model="server.config.bindAddress"></FormIpAddressInput>
            <FormNumberInput :name="'bindPort'" :tooltip="'1-65535, default: 2001'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="65535" :readonly="props.readonly" v-model="server.config.bindPort"></FormNumberInput>
            <FormIpAddressInput :name="'publicAddress'" :tooltip="'default: empty'" @violIncr="violIncr" @violDecr="violDecr" :readonly="props.readonly" v-model="server.config.publicAddress"></FormIpAddressInput>
            <FormNumberInput :name="'publicPort'" :tooltip="'1-65535, default: 2001'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="65535" :readonly="props.readonly" v-model="server.config.publicPort"></FormNumberInput>
        <h4>A2S</h4>
            <FormIpAddressInput :name="'address'" :tooltip="'required'" @violIncr="violIncr" @violDecr="violDecr" :readonly="props.readonly" v-model="server.config.a2s.address"></FormIpAddressInput>
            <FormNumberInput :name="'port'" :tooltip="'1-65535, default: 17777'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="65535" :readonly="props.readonly" v-model="server.config.a2s.port"></FormNumberInput>
        <h4>RCON</h4>
            <FormIpAddressInput :name="'address'" :tooltip="'required'" @violIncr="violIncr" @violDecr="violDecr" :readonly="props.readonly" v-model="server.config.rcon.address"></FormIpAddressInput>
            <FormNumberInput :name="'port'" :tooltip="'1-65535, default: 19999'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="65535" :readonly="props.readonly" v-model="server.config.rcon.port"></FormNumberInput>
            <FormPasswordInput :name="'password'" :tooltip="'required, no spaces, min 3'" @violIncr="violIncr" @violDecr="violDecr" :policyWhitespace="true" :policyMinimum="3" :readonly="props.readonly" v-model="server.config.rcon.password"></FormPasswordInput>
            <FormNumberInput :name="'maxClients'" :tooltip="'1-16, default: 16'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="16" :readonly="props.readonly" v-model="server.config.rcon.maxClients"></FormNumberInput>
            <FormSelectInput :name="'permission'" :tooltip="'admin or monitor'" :options="['monitor', 'admin']" :selectedIndex="0" :readonly="props.readonly" v-model="server.config.rcon.permission"></FormSelectInput>
            <FormMultiSelectModInput :name="'blacklist'" :tooltip="'default []'" :readonly="props.readonly" v-model="server.config.rcon.blacklist"></FormMultiSelectModInput>
            <FormMultiSelectModInput :name="'whitelist'" :tooltip="'default []'" :readonly="props.readonly" v-model="server.config.rcon.whitelist"></FormMultiSelectModInput>
        <h4>Game</h4>
            <FormTextInput :name="'name'" :tooltip="'max. 100'" @violIncr="violIncr" @violDecr="violDecr":placeholder="'Server\'s name'" :length="100" :readonly="props.readonly" v-model="server.config.game.name"></FormTextInput>
            <FormPasswordInput :name="'password'" :tooltip="'default: empty'" @violIncr="violIncr" @violDecr="violDecr" :readonly="props.readonly" v-model="server.config.game.password"></FormPasswordInput>
            <FormPasswordInput :name="'passwordAdmin'" :tooltip="'no spaces, default: empty'" @violIncr="violIncr" @violDecr="violDecr" :policyWhitespace="true" :readonly="props.readonly" v-model="server.config.game.passwordAdmin"></FormPasswordInput>
            <FormMultiSelectModInput :name="'admins'" :tooltip="'default []'" :readonly="props.readonly" v-model="server.config.game.admins"></FormMultiSelectModInput>
            <FormTextInput :name="'scenarioId'" :tooltip="'needed to start'" @violIncr="violIncr" @violDecr="violDecr" :placeholder="'{59AD59368755F41A}Missions/21_GM_Eden.conf'" :length="100" :readonly="props.readonly" v-model="server.config.game.scenarioId"></FormTextInput>
            <FormNumberInput :name="'maxPlayers'" :tooltip="'1-128, default: 64'" @violIncr="violIncr" @violDecr="violDecr" :minVal="1" :maxVal="128" :readonly="props.readonly" v-model="server.config.game.maxPlayers"></FormNumberInput>
            <FormCheckboxInput :name="'visible'" :tooltip="'default: true'" :readonly="props.readonly" v-model="server.config.game.visible"></FormCheckboxInput>
            <FormCheckboxInput :name="'crossPlatform'" :tooltip="'default: false'" :readonly="props.readonly" v-model="server.config.game.crossPlatform"></FormCheckboxInput>
            <FormMultiSelectInput :name="'supportedPlatforms'" :tooltip="'default: PLATFORM_PC, won\'t start with PLATFORM_XBL only'" :options="['PLATFORM_PC', 'PLATFORM_XBL']" :readonly="props.readonly" v-model="server.config.game.supportedPlatforms"></FormMultiSelectInput>
        <h5>Properties</h5>
            <FormNumberInput :name="'serverMaxViewDistance'" :tooltip="'500-10.000, default: 1.600'" @violIncr="violIncr" @violDecr="violDecr" :minVal="500" :maxVal="10000" :readonly="props.readonly" v-model="server.config.game.gameProperties.serverMaxViewDistance"></FormNumberInput>
            <FormNumberInput :name="'serverMinGrassDistance'" :tooltip="'50-150 default: 0=noForceOnClients'" @violIncr="violIncr" @violDecr="violDecr" :minVal="0" :maxVal="150" :readonly="props.readonly" v-model="server.config.game.gameProperties.serverMinGrassDistance"></FormNumberInput>
            <FormCheckboxInput :name="'fastValidation'" :tooltip="'default: true'" :readonly="props.readonly" v-model="server.config.game.gameProperties.fastValidation"></FormCheckboxInput>
            <FormNumberInput :name="'networkViewDistance'" :tooltip="'500-5.000, default: 1.500'" @violIncr="violIncr" @violDecr="violDecr" :minVal="500" :maxVal="1500" :readonly="props.readonly" v-model="server.config.game.gameProperties.networkViewDistance"></FormNumberInput>
            <FormCheckboxInput :name="'battlEye'" :tooltip="'default: true'" :readonly="props.readonly" v-model="server.config.game.gameProperties.battlEye"></FormCheckboxInput>
            <FormCheckboxInput :name="'disableThirdPerson'" :tooltip="'default: false'" :readonly="props.readonly" v-model="server.config.game.gameProperties.disableThirdPerson"></FormCheckboxInput>
            <FormCheckboxInput :name="'VONDisableUI'" :tooltip="'default: false'" :readonly="props.readonly" v-model="server.config.game.gameProperties.VONDisableUI"></FormCheckboxInput>
            <FormCheckboxInput :name="'VONDisableDirectSpeechUI'" :tooltip="'default: false'" :readonly="props.readonly" v-model="server.config.game.gameProperties.VONDisableDirectSpeechUI"></FormCheckboxInput>
            <FormCheckboxInput :name="'VONCanTransmitCrossFaction'" :tooltip="'default: false'" :readonly="props.readonly" v-model="server.config.game.gameProperties.VONCanTransmitCrossFaction"></FormCheckboxInput>
            <FormJsonInput :name="'missionHeader'" :tooltip="'JSON, default: {}'" @violIncr="violIncr" @violDecr="violDecr" :placeholder="'{59AD59368755F41A}Missions/21_GM_Eden.conf'" :readonly="props.readonly" v-model="server.config.game.gameProperties.missionHeader"></FormJsonInput>
            <FormModsInput :name="'mods'" :tooltip="'default []'" :readonly="props.readonly" v-model="server.config.game.mods"></FormModsInput>
        <h4>Operating</h4>
            <FormCheckboxInput :name="'lobbyPlayerSynchronize'" :tooltip="'default: true'" :readonly="props.readonly" v-model="server.config.operating.lobbyPlayerSynchronise"></FormCheckboxInput>
            <FormMultiSelectModInput :name="'disableNavmeshStreaming'" :tooltip="'default: undefined'" :optional-param="true" :readonly="props.readonly" v-model="server.config.operating.disableNavmeshStreaming"></FormMultiSelectModInput>
            <FormCheckboxInput :name="'disableServerShutdown'" :tooltip="'default: false'" :readonly="props.readonly" v-model="server.config.operating.disableServerShutdown"></FormCheckboxInput>
            <FormCheckboxInput :name="'disableAI'" :tooltip="'default: false'" :readonly="props.readonly" v-model="server.config.operating.disableAI"></FormCheckboxInput>
            <FormNumberInput :name="'playerSaveTime'" :tooltip="'default: 120'" @violIncr="violIncr" @violDecr="violDecr" :minVal="0" :readonly="props.readonly" v-model="server.config.operating.playerSaveTime"></FormNumberInput>
            <FormNumberInput :name="'aiLimit'" :tooltip="'0-unlimited, default: -1 = ignored'" @violIncr="violIncr" @violDecr="violDecr" :minVal="-1" :readonly="props.readonly" v-model="server.config.operating.aiLimit"></FormNumberInput>
            <FormNumberInput :name="'slotReservationTimeout'" :tooltip="'5-300, default: 60'" @violIncr="violIncr" @violDecr="violDecr" :minVal="5" :max-val="300" :readonly="props.readonly" v-model="server.config.operating.slotReservationTimeout"></FormNumberInput>
    </form>
    <p class="warning" v-if="inputViolationCounter > 0">Input Violations: {{ inputViolationCounter }}</p>
</template>

<style scoped>
</style>