import { defineStore } from 'pinia';
import { AssetDetailResponse, Branch, ScenarioEntry } from '../api/model';
import { getScenariosFromBranch, getWorkshopDetail, updateScenariosFromBranch } from '../api/backend';

interface State {
    scenarios: Map<Branch, ScenarioEntry[]>;
    customScenarios: Map<string, ScenarioEntry[]>;
}

export const useScenarioStore = defineStore('scenarios', {
    state: (): State => {
        return {
            scenarios: new Map<Branch, ScenarioEntry[]>(),
            customScenarios: new Map<Branch, ScenarioEntry[]>()
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
        },

        async getModScenarios(assetID: string): Promise<ScenarioEntry[]> {
            const scenarioEntries = this.customScenarios.get(assetID);
            if (scenarioEntries) {
                return scenarioEntries;
            }

            const assetDetail = (await getWorkshopDetail(assetID)).data as AssetDetailResponse;

            const scenarios = assetDetail.version_detail.scenarios.map(x => {
                return { name: x.name, path: x.gameId } as ScenarioEntry;
            });

            this.customScenarios.set(assetID, scenarios);
            return scenarios;
        }
    }
});
