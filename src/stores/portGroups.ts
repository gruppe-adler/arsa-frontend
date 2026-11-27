import { defineStore } from 'pinia';
import { deletePortGroup, getPortGroups, postPortGroup, putPortGroup } from '../api/backend';
import { PortGroup, PortGroupRequest } from '../api/model';

interface State {
    portGroups: PortGroup[];
    loaded: boolean;
}

const byGamePort = (a: PortGroup, b: PortGroup) => a.gamePort - b.gamePort;

export const usePortGroupsStore = defineStore('portGroups', {
    state: (): State => ({
        portGroups: [],
        loaded: false
    }),
    actions: {
        async load(force = false): Promise<PortGroup[]> {
            if (!this.loaded || force) {
                this.portGroups = (await getPortGroups()).data;
                this.loaded = true;
            }
            return this.portGroups;
        },
        async add(request: PortGroupRequest): Promise<PortGroup | null> {
            const response = await postPortGroup(request);
            if (response.status !== 200) {
                return null;
            }
            this.portGroups = [...this.portGroups, response.data].sort(byGamePort);
            return response.data;
        },
        async update(id: number, request: PortGroupRequest): Promise<PortGroup | null> {
            const response = await putPortGroup(id, request);
            if (response.status !== 200) {
                return null;
            }
            const updated = response.data;
            this.portGroups = this.portGroups.map(group => (group.id === id ? updated : group)).sort(byGamePort);
            return response.data;
        },
        async remove(id: number): Promise<boolean> {
            const response = await deletePortGroup(id);
            if (response.status !== 200) {
                return false;
            }
            this.portGroups = this.portGroups.filter(group => group.id !== id);
            return true;
        }
    }
});
