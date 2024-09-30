<script setup lang="ts">

import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useServersStore } from '../stores/servers'
import { ServerConfig } from '../utils/interfaces'

const router = useRouter()

const serversStore = useServersStore()

const name = ref('')

const config: ServerConfig = ref({
  bindAddress: '0.0.0.0',
  bindPort: 2001,
  publicAddress: '',
  publicPort: 2001,
  a2s: {
    address: '',
    port: 17777
  },
  rcon: {
    address: '',
    port: 19999,
    password: 'secret',
    permission: 'monitor',
    maxClients: 16,
    blacklist: [],
    whitelist: []
  },
  game: {
      name: 'name',
      password: 'password',
      passwordAdmin: 'adminPassword',
      admins: [],
      scenarioId: '{ECC61978EDCC2B5A}Missions/23_Campaign.conf',
      maxPlayers: 32,
      visible: true,
      crossPlatform: true,
      supportedPlatforms: [
        "PLATFORM_PC",
        "PLATFORM_XBL"
      ],
      gameProperties: {
        serverMaxViewDistance: 2500,
        serverMinGrassDistance: 50,
        networkViewDistance: 1000,
        disableThirdPerson: true,
        fastValidation: true,
        battlEye: true,
        VONDisableUI: true,
        VONDisableDirectSpeechUI: true,
        missionHeader: {
          m_iPlayerCount: 40,
          m_eEditableGameFlags: 6,
          m_eDefaultGameFlags: 6
        }
      },
      mods: [
        {
          modId: "5E68F6FA97DAB5CD",
          name: "GRAD Undead"
        }
      ]
  },
  operating: {
    lobbyPlayerSynchronise: true
  }
})


function addServer() {
  const server: Server = {
    uuid: '',
    name: name.value,
    config: config.value
  }

  serversStore.add(server)
      .then(() => {
        router.push('/servers-list')
      })
}
//TODO(@y0014984): Add admins and other array entries to form
//TODO:(@y0014984): Add modsRequiredByDefault to config (v1.2.1) and VONCanTransmitCrossFaction, disableCrashReporter, disableNavmeshStreaming, disableServerShutdown, disableAI, playerSaveTime, aiLimit, slotReservationTimeout, joinQueue, maxSize
</script>

<template>
    <form>
      <h1 id="head">Add Server</h1>
      <label id="name-label" for="name-input">name</label>
      <input id="name-input" type="text" name="name" placeholder="Server's name" v-model="name">
      <br/>
      <label id="bindAddress-label" for="bindAddress-input">bindAddress (default: 0.0.0.0)</label>
      <input id="bindAddress-input" type="text" name="bindAddress" v-model="config.bindAddress">
      <br/>
      <label id="bindPort-label" for="bindPort-input">bindPort (1-65535 default: 2001)</label>
      <input id="bindPort-input" type="number" min="1" max="65535" step="1" name="bindPort" v-model="config.bindPort">
      <br/>
      <label id="publicAddress-label" for="publicAddress-input">publicAddress (default empty)</label>
      <input id="publicAddress-input" type="text" name="publicAddress" v-model="config.publicAddress">
      <br/>
      <label id="publicPort-label" for="publicPort-input">publicPort (1-65535 default: 2001)</label>
      <input id="publicPort-input" type="number" min="1" max="65535" step="1" name="publicPort" v-model="config.publicPort">
      <br/>
      <label id="a2sAddress-label" for="a2sAddress-input">a2sAddress (default: empty)</label>
      <input id="a2sAddress-input" type="text" name="a2sAddress" v-model="config.a2s.address">
      <br/>
      <label id="a2sPort-label" for="a2sPort-input">a2sPort (1-65535 default: 17777)</label>
      <input id="a2sPort-input" type="number" min="1" max="65535" step="1" name="a2sPort" v-model="config.a2s.port">
      <br/>
      <label id="rconAddress-label" for="rconAddress-input">rconAddress (default: empty)</label>
      <input id="rconAddress-input" type="text" name="rconAddress" v-model="config.rcon.address">
      <br/>
      <label id="rconPort-label" for="rconPort-input">rconPort (1-65535 default: 19999)</label>
      <input id="rconPort-input" type="number" min="1" max="65535" step="1" name="rconPort" v-model="config.rcon.port">
      <br/>
      <label id="rconPassword-label" for="rconPassword-input">rconPassword (required, no spaces, min 3)</label>
      <input id="rconPassword-input" type="text" name="rconPassword" v-model="config.rcon.password">
      <br/>
      <label id="rconPermission-label" for="rconPermission-input">rconPermission (admin or monitor)</label>
      <input id="rconPermission-input" type="text" name="rconPermission" v-model="config.rcon.permission">
      <br/>
      <label id="rconMaxClients-label" for="rconMaxClients-input">rconMaxClients (1-16 default: 16)</label>
      <input id="rconMaxClients-input" type="number" min="1" max="16" step="1" name="rconMaxClients" v-model="config.rcon.maxClients">
      <br/>
      <label id="gameName-label" for="gameName-input">gameName (max. 100)</label>
      <input id="gameName-input" type="text" name="gameName" maxlength="100" v-model="config.game.name">
      <br/>
      <label id="gamePassword-label" for="gamePassword-input">gamePassword (default: empty)</label>
      <input id="gamePassword-input" type="text" name="gamePassword" v-model="config.game.password">
      <br/>
      <label id="gamePasswordAdmin-label" for="gamePasswordAdmin-input">gamePasswordAdmin (default: empty)</label>
      <input id="gamePasswordAdmin-input" type="text" name="gamePasswordAdmin" v-model="config.game.passwordAdmin">
      <br/>
      <label id="gameScenarioId-label" for="gameScenarioId-input">gameScenarioId (needed to start)</label>
      <input id="gameScenarioId-input" type="text" name="gameScenarioId" v-model="config.game.scenarioId">
      <br/>
      <label id="gameMaxPlayers-label" for="gameMaxPlayers-input">gameMaxPlayers (1-128 default: 64)</label>
      <input id="gameMaxPlayers-input" type="number" min="1" max="128" step="1" name="gameMaxPlayers" v-model="config.game.maxPlayers">
      <br/>
      <label id="gameVisible-label" for="gameVisible-input">gameVisible (default: true)</label>
      <input id="gameVisible-input" type="checkbox" name="gameVisible" v-model="config.game.visible">
      <br/>
      <label id="gameCrossPlatform-label" for="gameCrossPlatform-input">gameCrossPlatform (default: false)</label>
      <input id="gameCrossPlatform-input" type="checkbox" name="gameCrossPlatform" v-model="config.game.crossPlatform">
      <br/>
      <label id="gameGamePropertiesServerMaxViewDistance-label" for="gameGamePropertiesServerMaxViewDistance-input">gameGamePropertiesServerMaxViewDistance (500-10.000 default: 1.600)</label>
      <input id="gameGamePropertiesServerMaxViewDistance-input" type="number" min="500" max="10000" step="10" name="gameGamePropertiesServerMaxViewDistance" v-model="config.game.gameProperties.serverMaxViewDistance">
      <br/>
      <label id="gameGamePropertiesServerMinGrassDistance-label" for="gameGamePropertiesServerMinGrassDistance-input">gameGamePropertiesServerMinGrassDistance (50-150 default: 0=noForceOnClients)</label>
      <input id="gameGamePropertiesServerMinGrassDistance-input" type="number" min="0" max="150" step="1" name="gameGamePropertiesServerMinGrassDistance" v-model="config.game.gameProperties.serverMinGrassDistance">
      <br/>
      <label id="gameGamePropertiesNetworkViewDistance-label" for="gameGamePropertiesNetworkViewDistance-input">gameGamePropertiesNetworkViewDistance (500-5.000 default: 1.500)</label>
      <input id="gameGamePropertiesNetworkViewDistance-input" type="number" min="500" max="5000" step="1" name="gameGamePropertiesNetworkViewDistance" v-model="config.game.gameProperties.networkViewDistance">
      <br/>
      <label id="gameGamePropertiesDisableThirdPerson-label" for="gameGamePropertiesDisableThirdPerson-input">gameGamePropertiesDisableThirdPerson (default: false)</label>
      <input id="gameGamePropertiesDisableThirdPerson-input" type="checkbox" name="gameGamePropertiesDisableThirdPerson" v-model="config.game.gameProperties.disableThirdPerson">
      <br/>
      <label id="gameGamePropertiesFastValidation-label" for="gameGamePropertiesFastValidation-input">gameGamePropertiesFastValidation (default: true)</label>
      <input id="gameGamePropertiesFastValidation-input" type="checkbox" name="gameGamePropertiesFastValidation" v-model="config.game.gameProperties.fastValidation">
      <br/>
      <label id="gameGamePropertiesBattleEye-label" for="gameGamePropertiesBattleEye-input">gameGamePropertiesBattleEye (default: true)</label>
      <input id="gameGamePropertiesBattleEye-input" type="checkbox" name="gameGamePropertiesBattleEye" v-model="config.game.gameProperties.battlEye">
      <br/>
      <label id="gameGamePropertiesVONDisableUI-label" for="gameGamePropertiesVONDisableUI-input">gameGamePropertiesVONDisableUI (default: false)</label>
      <input id="gameGamePropertiesVONDisableUI-input" type="checkbox" name="gameGamePropertiesVONDisableUI" v-model="config.game.gameProperties.VONDisableUI">
      <br/>
      <label id="gameGamePropertiesVONDisableDirectSpeechUI-label" for="gameGamePropertiesVONDisableDirectSpeechUI-input">gameGamePropertiesVONDisableDirectSpeechUI (default: false)</label>
      <input id="gameGamePropertiesVONDisableDirectSpeechUI-input" type="checkbox" name="gameGamePropertiesVONDisableDirectSpeechUI" v-model="config.game.gameProperties.VONDisableDirectSpeechUI">
      <br/>
      <label id="operatingLobbyPlayerSynchronize-label" for="operatingLobbyPlayerSynchronize-input">operatingLobbyPlayerSynchronize (default: true)</label>
      <input id="operatingLobbyPlayerSynchronize-input" type="checkbox" name="operatingLobbyPlayerSynchronize" v-model="config.operating.lobbyPlayerSynchronise">
      <br/>
      <button id="add-button" type="button" @click="addServer()">Add</button>
    </form>
</template>

<style scoped>
</style>