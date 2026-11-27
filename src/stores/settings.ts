import { defineStore } from 'pinia';
import { getSettings, putSettings } from '../api/backend';
import { Settings } from '../api/model';

interface State {
    settings: Settings;
}

export const useSettingsStore = defineStore('settings', {
    state: (): State => ({
        settings: { portGroupsOnly: false }
    }),
    getters: {
        /** Servers must use a port group; the port fields can't be edited by hand. */
        portGroupsOnly: (state): boolean => !!state.settings.portGroupsOnly
    },
    actions: {
        async load(): Promise<Settings> {
            this.settings = (await getSettings()).data;
            return this.settings;
        },
        async update(settings: Settings): Promise<Settings> {
            const response = await putSettings(settings);
            if (response.status === 200) {
                this.settings = response.data;
            }
            return this.settings;
        }
    }
});
