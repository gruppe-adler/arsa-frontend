import { defineStore } from 'pinia';
import { Branch, ScenarioEntry } from '../api/model';
import { getScenariosFromBranch, updateScenariosFromBranch } from '../api/backend';

interface State {
    scenarios: Map<Branch, ScenarioEntry[]>;
}

export const useScenarioStore = defineStore('scenarios', {
    state: (): State => {
        return {
            scenarios: new Map<Branch, ScenarioEntry[]>()
        };
    },
    actions: {
        async updateScenarios(branch: Branch): Promise<void> {
            await updateScenariosFromBranch(branch);
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
        }
    }
});
