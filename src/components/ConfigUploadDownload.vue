<script setup lang="ts">
import { ref } from 'vue';
import { Server, ServerConfig } from '../utils/interfaces';
import Ajv from 'ajv';
import ajvFormats from 'ajv-formats';
import ajvKeywords from 'ajv-keywords';
import { arsConfigSchema } from '../utils/json-schema';
import { defaultConfig } from '../utils/defaults';

const ajv = new Ajv({ allErrors: true, useDefaults: true });
ajvFormats(ajv);
ajvKeywords(ajv);
const validate = ajv.compile(arsConfigSchema);

const server = defineModel<Server>('server', { required: true });

function downloadConfig(filename: string, data: any) {
    const blob = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', blob);
    a.setAttribute('download', filename);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

const file = ref<File | null>();
const fileSelector = ref<HTMLInputElement | null>(null);
const hasFile = ref(false);

function onFileChanged($event: Event) {
    const target = $event.target as HTMLInputElement;
    file.value = target?.files?.[0] ?? null;
    hasFile.value = !!file.value;
}

function uploadConfig() {
    if (file.value) {
        file.value.text().then(content => {
            let json: ServerConfig = defaultConfig;
            try {
                json = JSON.parse(content);
            } catch (error) {
                alert('Not valid JSON. See browser console for details.');
                return;
            }
            if (!validate(json)) {
                alert('JSON validation failed. See browser console for details.');
            } else {
                server.value.config = json;
            }
        });
    }
    if (fileSelector.value) fileSelector.value.value = '';
    hasFile.value = false;
    file.value = null;
}
</script>

<template>
  <!-- Download cluster -->
  <div class="btn-group">
    <button class="btn" type="button" @click="downloadConfig('server.json', server)">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Server
    </button>
    <button class="btn" type="button" @click="downloadConfig('config.json', server.config)">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Config
    </button>
  </div>

  <!-- Import cluster -->
  <div class="btn-group">
    <label class="btn import-label" :class="{ 'has-file': hasFile }">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 14 12 9 17 14"/><line x1="12" y1="9" x2="12" y2="21"/></svg>
      {{ hasFile ? file!.name : 'Import config' }}
      <input ref="fileSelector" type="file" accept="application/json" @change="onFileChanged" />
    </label>
    <button class="btn" type="button" :disabled="!hasFile" @click="uploadConfig">Apply</button>
  </div>
</template>

<style scoped>
input[type="file"] { display: none; }

.import-label {
  cursor: pointer;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.import-label.has-file {
  color: var(--indigo);
  border-color: color-mix(in oklab, var(--indigo), transparent 60%);
  background: var(--indigo-soft);
}

@media (max-width: 480px) {
  .import-label { max-width: 100px; }
}
</style>
