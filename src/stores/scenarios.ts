import { defineStore } from 'pinia';
import { Branch, ScenarioEntry } from '../api/model';
import { getScenariosFromBranch, updateScenariosFromBranch } from '../api/backend';
import { useWorkshopStore } from './workshop';

interface State {
    scenarios: Map<Branch, ScenarioEntry[]>;
    customScenarios: Map<string, ScenarioEntry[]>;
    /** Branches whose vanilla scenario update is running on the backend. */
    updating: Branch[];
}

export const useScenarioStore = defineStore('scenarios', {
    state: (): State => {
        return {
            scenarios: new Map<Branch, ScenarioEntry[]>(),
            customScenarios: new Map<Branch, ScenarioEntry[]>(),
            updating: []
        };
    },
    actions: {
        /**
         * Starts a vanilla scenario update on the backend. Resolves once it has started;
         * the result arrives later as a `scenariosUpdateFinished` websocket message.
         */
        async updateScenarios(branch: Branch): Promise<boolean> {
            try {
                await updateScenariosFromBranch(branch);
            } catch {
                // customFetch already showed an error toast
                return false;
            }
            if (!this.updating.includes(branch)) {
                this.updating.push(branch);
            }
            return true;
        },

        finishUpdate(branch: Branch): void {
            this.updating = this.updating.filter(x => x !== branch);
            // the stored list changed, fetch it again on the next read
            this.scenarios.delete(branch);
        },

        async getScenarios(branch: Branch): Promise<ScenarioEntry[]> {
            const scenarios = this.scenarios.get(branch);
            if (!scenarios) {
                const getScenariosResult = await getScenariosFromBranch(branch);
                if (getScenariosResult.status === 200) {
                    const data = getScenariosResult.data.scenarios;
                    this.scenarios.set(branch, data);
                    return data;
                }
            }
            return scenarios ?? [];
        },

        async getModScenarios(assetID: string): Promise<ScenarioEntry[]> {
            const scenarioEntries = this.customScenarios.get(assetID);
            if (scenarioEntries) {
                return scenarioEntries;
            }

            // Routed through workshopStore so this shares its detail cache
            // instead of re-fetching the same asset a second time.
            const detail = await useWorkshopStore().getDetail(assetID);
            const scenarios = (detail?.version_detail.scenarios ?? []).map(x => ({ name: x.name, path: x.gameId }) as ScenarioEntry);

            this.customScenarios.set(assetID, scenarios);
            return scenarios;
        }
    }
});
