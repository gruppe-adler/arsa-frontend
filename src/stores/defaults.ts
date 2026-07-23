import { defineStore } from 'pinia';
import { getDefaults, updateDefaults } from '../utils/api';
import { ServerDefaults } from '../api/model';

interface State {
    defaults: ServerDefaults | null;
}

export const useDefaultsStore = defineStore('defaults', {
    state: (): State => {
        return {
            defaults: null
        };
    },
    actions: {
        async get(): Promise<ServerDefaults> {
            this.defaults = await getDefaults();
            return this.defaults;
        },
        async update(defaults: ServerDefaults): Promise<ServerDefaults> {
            this.defaults = await updateDefaults(defaults);
            return this.defaults;
        }
    }
});
