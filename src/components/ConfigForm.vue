<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useServersStore } from '../stores/servers'
import { ServerConfig } from '../utils/interfaces';
import { isIPv4 } from 'is-ip';

const emit = defineEmits(['missionHeaderChanged', 'disableNavmeshStreamingChanged'])

const config = defineModel<ServerConfig>('config', { required: true });
const name = defineModel<string>('name', { required: true });

const serversStore = useServersStore();

function checkIpAddress(event: Event) {
    if (!isIPv4((event.target as HTMLInputElement).value)) alert('Not a valid IPv4 address.');
}

interface Option {
    text: string
    value: string
}

interface Options {
    id: string
    options: Option[]
}

const optionsCollection = ref<Options[]>([
        { id: 'rconBlacklist-input', options: []},
        { id: 'rconWhitelist-input', options: []},
        { id: 'gameAdmins-input', options: []},
        { id: 'gameSupportedPlatforms-input', options: [
            { text: 'PLATFORM_PC', value: 'PLATFORM_PC' }, 
            { text: 'PLATFORM_XBL', value: 'PLATFORM_XBL' }
        ]}
    ])

function addModItem( modIdInputId: string, nameInputId: string, versionInputId: string) {
    const modIdInput: HTMLInputElement | null = document.getElementById(modIdInputId) as HTMLInputElement;
    const nameInput: HTMLInputElement | null = document.getElementById(nameInputId) as HTMLInputElement;
    const versionInput: HTMLInputElement | null = document.getElementById(versionInputId) as HTMLInputElement;
    config.value.game.mods.push({ modId: modIdInput?.value || '', name: nameInput?.value || '', version: versionInput?.value || '', })
    modIdInput.value = '';
    nameInput.value = '';
    versionInput.value = '';
}

function removeModItem(selectId: string) {
    const select: HTMLSelectElement = document.getElementById(selectId) as HTMLSelectElement;
    config.value.game.mods.splice(select.selectedIndex, 1);
}

function addItem(selectId: string, inputId: string) {
    const options = optionsCollection.value.filter(i => i.id === selectId)[0].options;
    const input: HTMLInputElement | null = document.getElementById(inputId) as HTMLInputElement;
    options.push({ text: input?.value || '', value: input?.value || '' })
    input.value = '';
/*     // selecting all options doesn't work; I think it's because this function is faster
    // then the ref() sync of the variable to the DOM element, which means, this option isn't there
    // when I want to select it
    const select: HTMLSelectElement | null = document.getElementById(selectId) as HTMLSelectElement;
    for(let i = 0; i < select.options.length; i++)
    {
        console.log((select.options[i] as HTMLOptionElement).value);
        (select.options[i] as HTMLOptionElement).selected = true;
    } */
}

function removeItem(selectId: string) {
    const select: HTMLSelectElement = document.getElementById(selectId) as HTMLSelectElement;
    const options = optionsCollection.value.filter(i => i.id === selectId)[0].options;
    options.splice(select.selectedIndex, 1);
}

function togglePasswordVisibility(inputId: string, event: Event) {
    const input: HTMLInputElement = document.getElementById(inputId) as HTMLInputElement;
    const button: HTMLButtonElement = event.target as HTMLButtonElement;
    if(input.type === 'password') { 
        input.type = 'text';
        button.innerText = 'Hide';
    } else {
        input.type = 'password';
        button.innerText = 'Show';
    }
}

const missionHeader = ref(JSON.stringify(config.value.game.gameProperties.missionHeader));
const disableNavmeshStreaming = ref((config.value.operating.disableNavmeshStreaming === undefined) ? false : true)

onMounted(() => {
    config.value.rcon.blacklist.forEach( blacklistItem => {
        const options = optionsCollection.value.filter(i => i.id === 'rconBlacklist-input')[0].options;
        options.push({ text: blacklistItem, value: blacklistItem })
    });
    config.value.rcon.whitelist.forEach( whitelistItem => {
        const options = optionsCollection.value.filter(i => i.id === 'rconWhitelist-input')[0].options;
        options.push({ text: whitelistItem, value: whitelistItem })
    });
    config.value.game.admins.forEach( adminsItem => {
        const options = optionsCollection.value.filter(i => i.id === 'gameAdmins-input')[0].options;
        options.push({ text: adminsItem, value: adminsItem })
    });
})

</script>

<template>
    <form>
        <p>*=required</p>
        <h2>Server Settings</h2>
        <label class="label" id="name-label" for="name-input">name*</label>
        <input id="name-input" type="text" name="name" maxlength="100" size="100" placeholder="Server's name" v-model="name">
        <h3>Config</h3>
        <label class="label" id="bindAddress-label" for="bindAddress-input">bindAddress (default: 0.0.0.0)</label>
        <input id="bindAddress-input" type="text" name="bindAddress" @change="checkIpAddress" v-model="config.bindAddress">
        <button type="button" @click="config.bindAddress = serversStore.publicIp">Auto</button>
        <br/>
        <label class="label" id="bindPort-label" for="bindPort-input">bindPort (1-65535 default: 2001)</label>
        <input id="bindPort-input" type="number" min="1" max="65535" step="1" name="bindPort" v-model="config.bindPort">
        <br/>
        <label class="label" id="publicAddress-label" for="publicAddress-input">publicAddress* (default empty)</label>
        <input id="publicAddress-input" type="text" name="publicAddress" @change="checkIpAddress" v-model="config.publicAddress">
        <button type="button" @click="config.publicAddress = serversStore.publicIp">Auto</button>
        <br/>
        <label class="label" id="publicPort-label" for="publicPort-input">publicPort (1-65535 default: 2001)</label>
        <input id="publicPort-input" type="number" min="1" max="65535" step="1" name="publicPort" v-model="config.publicPort">
        <h4>A2S</h4>
        <label class="label" id="a2sAddress-label" for="a2sAddress-input">address* (required)</label>
        <input id="a2sAddress-input" type="text" name="a2sAddress" @change="checkIpAddress" v-model="config.a2s.address">
        <button type="button" @click="config.a2s.address = serversStore.publicIp">Auto</button>
        <br/>
        <label class="label" id="a2sPort-label" for="a2sPort-input">port (1-65535 default: 17777)</label>
        <input id="a2sPort-input" type="number" min="1" max="65535" step="1" name="a2sPort" v-model="config.a2s.port">
        <h4>RCON</h4>
        <label class="label" id="rconAddress-label" for="rconAddress-input">address* (required)</label>
        <input id="rconAddress-input" type="text" name="rconAddress" @change="checkIpAddress" v-model="config.rcon.address">
        <button type="button" @click="config.rcon.address = serversStore.publicIp">Auto</button>
        <br/>
        <label class="label" id="rconPort-label" for="rconPort-input">port (1-65535 default: 19999)</label>
        <input id="rconPort-input" type="number" min="1" max="65535" step="1" name="rconPort" v-model="config.rcon.port">
        <br/>
        <label class="label" id="rconPassword-label" for="rconPassword-input">password (required, no spaces, min 3)</label>
        <input id="rconPassword-input" type="password" autocomplete="off" name="rconPassword" v-model="config.rcon.password">
        <button type="button" @click="togglePasswordVisibility('rconPassword-input', $event)">Show</button>
        <br/>
        <label class="label" id="rconMaxClients-label" for="rconMaxClients-input">maxClients (1-16 default: 16)</label>
        <input id="rconMaxClients-input" type="number" min="1" max="16" step="1" name="rconMaxClients" v-model="config.rcon.maxClients">
        <br/>
        <label class="label" id="rconPermission-label" for="rconPermission-input">permission (admin or monitor)</label>
        <select id="rconPermission-input" name="rconPermission" v-model="config.rcon.permission">
            <option value="monitor" selected>monitor</option>
            <option value="admin">admin</option>
        </select>
        <br/>
        <label class="label" id="rconBlacklist-label" for="rconBlacklist-input">blacklist (select the ones you want)</label>
        <br/>
        <select id="rconBlacklist-input" name="rconBlacklist" size="5" style="width: 275px;" v-model="config.rcon.blacklist" multiple>
            <option v-for="option in optionsCollection.filter(i => i.id === 'rconBlacklist-input')[0].options" :value="option.value">
                {{ option.text }}
            </option>
        </select>
        <br/>
        <input id="rconBlacklistAdd-input" type="text">
        <button type="button" @click="addItem('rconBlacklist-input', 'rconBlacklistAdd-input')">Add</button>
        <button type="button" @click="removeItem('rconBlacklist-input')">Delete</button>
        <br/>
        <label class="label" id="rconWhitelist-label" for="rconWhitelist-input">whitelist (select the ones you want)</label>
        <br/>
        <select id="rconWhitelist-input" name="rconWhitelist" size="5" style="width: 275px;" v-model="config.rcon.whitelist" multiple>
            <option v-for="option in optionsCollection.filter(i => i.id === 'rconWhitelist-input')[0].options" :value="option.value">
                {{ option.text }}
            </option>
        </select>
        <br/>
        <input id="rconWhitelistAdd-input" type="text">
        <button type="button" @click="addItem('rconWhitelist-input', 'rconWhitelistAdd-input')">Add</button>
        <button type="button" @click="removeItem('rconWhitelist-input')">Delete</button>
        <h4>Game</h4>
        <label class="label" id="gameName-label" for="gameName-input">name (max. 100)</label>
        <input id="gameName-input" type="text" name="gameName" maxlength="100" size="100" v-model="config.game.name">
        <br/>
        <label class="label" id="gamePassword-label" for="gamePassword-input">password (default: empty)</label>
        <input id="gamePassword-input" type="password" autocomplete="off" name="gamePassword" v-model="config.game.password">
        <button type="button" @click="togglePasswordVisibility('gamePassword-input', $event)">Show</button>
        <br/>
        <label class="label" id="gamePasswordAdmin-label" for="gamePasswordAdmin-input">passwordAdmin (no spaces, default: empty)</label>
        <input id="gamePasswordAdmin-input" type="password" autocomplete="off" name="gamePasswordAdmin" v-model="config.game.passwordAdmin">
        <button type="button" @click="togglePasswordVisibility('gamePasswordAdmin-input', $event)">Show</button>
        <br/>
        <label class="label" id="gameAdmins-label" for="gameAdmins-input">admins (select the ones you want)</label>
        <br/>
        <select id="gameAdmins-input" name="admins" size="5" style="width: 275px;" v-model="config.game.admins" multiple>
            <option v-for="option in optionsCollection.filter(i => i.id === 'gameAdmins-input')[0].options" :value="option.value">
                {{ option.text }}
            </option>
        </select>
        <br/>
        <input id="adminsAdd-input" type="text">
        <button type="button" @click="addItem('gameAdmins-input', 'adminsAdd-input')">Add</button>
        <button type="button" @click="removeItem('gameAdmins-input')">Delete</button>
        <br/>
        <label class="label" id="gameScenarioId-label" for="gameScenarioId-input">scenarioId (needed to start)</label>
        <input id="gameScenarioId-input" type="text" name="gameScenarioId" size="100" v-model="config.game.scenarioId">
        <br/>
        <label class="label" id="gameMaxPlayers-label" for="gameMaxPlayers-input">maxPlayers (1-128 default: 64)</label>
        <input id="gameMaxPlayers-input" type="number" min="1" max="128" step="1" name="gameMaxPlayers" v-model="config.game.maxPlayers">
        <br/>
        <label class="label" id="gameVisible-label" for="gameVisible-input">visible (default: true)</label>
        <input id="gameVisible-input" type="checkbox" name="gameVisible" v-model="config.game.visible">
        <br/>
        <label class="label" id="gameCrossPlatform-label" for="gameCrossPlatform-input">crossPlatform (default: false)</label>
        <input id="gameCrossPlatform-input" type="checkbox" name="gameCrossPlatform" v-model="config.game.crossPlatform">
        <br/>
        <label class="label" id="gameSupportedPlatforms-label" for="gameSupportedPlatforms-input">supportedPlatforms (won't start with PLATFORM_XBL only)</label>
        <br/>
        <select id="gameSupportedPlatforms-input" name="supportedPlatforms" size="5" style="width: 275px;" v-model="config.game.supportedPlatforms" multiple>
            <option v-for="option in optionsCollection.filter(i => i.id === 'gameSupportedPlatforms-input')[0].options" :value="option.value">
                {{ option.text }}
            </option>
        </select>
        <h5>Properties</h5>
        <label class="label" id="gameGamePropertiesServerMaxViewDistance-label" for="gameGamePropertiesServerMaxViewDistance-input">serverMaxViewDistance (500-10.000 default: 1.600)</label>
        <input id="gameGamePropertiesServerMaxViewDistance-input" type="number" min="500" max="10000" step="10" name="gameGamePropertiesServerMaxViewDistance" v-model="config.game.gameProperties.serverMaxViewDistance">
        <br/>
        <label class="label" id="gameGamePropertiesServerMinGrassDistance-label" for="gameGamePropertiesServerMinGrassDistance-input">serverMinGrassDistance (50-150 default: 0=noForceOnClients)</label>
        <input id="gameGamePropertiesServerMinGrassDistance-input" type="number" min="0" max="150" step="1" name="gameGamePropertiesServerMinGrassDistance" v-model="config.game.gameProperties.serverMinGrassDistance">
        <br/>
        <label class="label" id="gameGamePropertiesFastValidation-label" for="gameGamePropertiesFastValidation-input">fastValidation (default: true)</label>
        <input id="gameGamePropertiesFastValidation-input" type="checkbox" name="gameGamePropertiesFastValidation" v-model="config.game.gameProperties.fastValidation">
        <br/>
        <label class="label" id="gameGamePropertiesNetworkViewDistance-label" for="gameGamePropertiesNetworkViewDistance-input">networkViewDistance (500-5.000 default: 1.500)</label>
        <input id="gameGamePropertiesNetworkViewDistance-input" type="number" min="500" max="5000" step="1" name="gameGamePropertiesNetworkViewDistance" v-model="config.game.gameProperties.networkViewDistance">
        <br/>
        <label class="label" id="gameGamePropertiesBattlEye-label" for="gameGamePropertiesBattlEye-input">battlEye (default: true)</label>
        <input id="gameGamePropertiesBattlEye-input" type="checkbox" name="gameGamePropertiesBattlEye" v-model="config.game.gameProperties.battlEye">
        <br/>
        <label class="label" id="gameGamePropertiesDisableThirdPerson-label" for="gameGamePropertiesDisableThirdPerson-input">disableThirdPerson (default: false)</label>
        <input id="gameGamePropertiesDisableThirdPerson-input" type="checkbox" name="gameGamePropertiesDisableThirdPerson" v-model="config.game.gameProperties.disableThirdPerson">
        <br/>
        <label class="label" id="gameGamePropertiesVONDisableUI-label" for="gameGamePropertiesVONDisableUI-input">VONDisableUI (default: false)</label>
        <input id="gameGamePropertiesVONDisableUI-input" type="checkbox" name="gameGamePropertiesVONDisableUI" v-model="config.game.gameProperties.VONDisableUI">
        <br/>
        <label class="label" id="gameGamePropertiesVONDisableDirectSpeechUI-label" for="gameGamePropertiesVONDisableDirectSpeechUI-input">VONDisableDirectSpeechUI (default: false)</label>
        <input id="gameGamePropertiesVONDisableDirectSpeechUI-input" type="checkbox" name="gameGamePropertiesVONDisableDirectSpeechUI" v-model="config.game.gameProperties.VONDisableDirectSpeechUI">
        <br/>
        <label class="label" id="gameGamePropertiesVONCanTransmitCrossFaction-label" for="gameGamePropertiesVONCanTransmitCrossFaction-input">VONCanTransmitCrossFaction (default: false)</label>
        <input id="gameGamePropertiesVONCanTransmitCrossFaction-input" type="checkbox" name="gameGamePropertiesVONCanTransmitCrossFaction" v-model="config.game.gameProperties.VONCanTransmitCrossFaction">
        <br/>
        <label class="label" id="gameGamePropertiesMissionHeader-label" for="gameGamePropertiesMissionHeader-input">missionHeader (JSON default: empty)</label>
        <input id="gameGamePropertiesMissionHeader-input" type="text" name="gameGamePropertiesMissionHeader" size="100" @change="$emit('missionHeaderChanged', missionHeader)" v-model="missionHeader">
        <h5>Mods</h5>
        <label class="label" id="gameMods-label" for="gameMods-input">mods (select the ones you want)</label>
        <br/>
        <select id="gameMods-input" name="mods" size="5" style="width: 800px;" multiple>
            <option v-for="mod in config.game.mods" :value="mod">
                {{ mod.name }} v{{ mod.version }} ({{ mod.modId }})
            </option>
        </select>
        <br/>
        <label class="label" id="modsModIdAdd-label" for="modsModIdAdd-input">modId</label>
        <input id="modsModIdAdd-input" type="text">
        <label class="label" id="modName-label" for="modName-input">name</label>
        <input id="modName-input" type="text">
        <label class="label" id="modVersion-label" for="modVersion-input">version (optional)</label>
        <input id="modVersion-input" type="text">
        <button type="button" @click="addModItem('modsModIdAdd-input', 'modName-input', 'modVersion-input')">Add</button>
        <button type="button" @click="removeModItem('gameMods-input')">Delete</button>
        <h4>Operating</h4>
        <label class="label" id="operatingLobbyPlayerSynchronize-label" for="operatingLobbyPlayerSynchronize-input">lobbyPlayerSynchronize (default: true)</label>
        <input id="operatingLobbyPlayerSynchronize-input" type="checkbox" name="operatingLobbyPlayerSynchronize" v-model="config.operating.lobbyPlayerSynchronise">
        <br/>
        <label class="label" id="operatingDisableNavmeshStreaming-label" for="operatingDisableNavmeshStreaming-input">disableNavmeshStreaming (default: false)</label>
        <input id="operatingDisableNavmeshStreaming-input" type="checkbox" name="operatingDisableNavmeshStreaming" @change="$emit('disableNavmeshStreamingChanged', disableNavmeshStreaming)" v-model="disableNavmeshStreaming">
        <br/>
        <label class="label" id="operatingDisableServerShutdown-label" for="operatingDisableServerShutdown-input">disableServerShutdown (default: false)</label>
        <input id="operatingDisableServerShutdown-input" type="checkbox" name="operatingDisableServerShutdown" v-model="config.operating.disableServerShutdown">
        <br/>
        <label class="label" id="operatingDisableAI-label" for="operatingDisableAI-input">disableAI (default: false)</label>
        <input id="operatingDisableAI-input" type="checkbox" name="operatingDisableAI" v-model="config.operating.disableAI">
        <br/>
        <label class="label" id="operatingPlayerSaveTime-label" for="operatingPlayerSaveTime-input">playerSaveTime (default: 120)</label>
        <input id="operatingPlayerSaveTime-input" type="number" min="0" step="1" name="operatingPlayerSaveTime" v-model="config.operating.playerSaveTime">
        <br/>
        <label class="label" id="operatingAiLimit-label" for="operatingAiLimit-input">aiLimit (0-unlimited default: -1 = ignored)</label>
        <input id="operatingAiLimit-input" type="number" min="-1" step="1" name="operatingAiLimit" v-model="config.operating.aiLimit">
        <br/>
        <label class="label" id="operatingSlotReservationTimeout-label" for="operatingSlotReservationTimeout-input">slotReservationTimeout (5-300 default: 60)</label>
        <input id="operatingSlotReservationTimeout-input" type="number" min="5" max="300" step="1" name="operatingSlotReservationTimeout" v-model="config.operating.slotReservationTimeout">
    </form>
</template>

<style scoped>
  .label {
    margin-left: 10px;
    margin-right: 10px;
  }
</style>