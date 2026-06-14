import { defineStore } from 'pinia';
import { Asset, AssetDetailResponse, GetWorkshopParams, GetWorkshopSort } from '../api/model';
import { getWorkshop, getWorkshopDetail } from '../api/backend';

const PAGE_SIZE = 20;

interface State {
    assets: Asset[];
    totalCount: number;
    page: number;
    searchTerm: string;
    sort: GetWorkshopSort;
    loading: boolean;
    detailCache: Map<string, AssetDetailResponse>;
}

export const useWorkshopStore = defineStore('workshop', {
    state: (): State => {
        return {
            assets: [],
            totalCount: 0,
            page: 1,
            searchTerm: '',
            sort: 'newest',
            loading: false,
            detailCache: new Map<string, AssetDetailResponse>()
        };
    },

    getters: {
        // Workshop pages are a fixed size upstream; derive page count from the total.
        totalPages(state): number {
            return Math.max(1, Math.ceil(state.totalCount / PAGE_SIZE));
        }
    },

    actions: {
        async runSearch(params: GetWorkshopParams): Promise<void> {
            this.loading = true;
            try {
                const result = await getWorkshop(params);
                if (result.status === 200) {
                    this.assets = result.data.assets.rows;
                    this.totalCount = result.data.assets.count;
                    this.searchTerm = params.search ?? '';
                    this.sort = params.sort ?? 'newest';
                    this.page = params.page ?? 1;
                }
            } finally {
                this.loading = false;
            }
        },

        async getDetail(id: string): Promise<AssetDetailResponse | undefined> {
            const cached = this.detailCache.get(id);
            if (cached) {
                return cached;
            }

            const result = await getWorkshopDetail(id);
            if (result.status === 200) {
                this.detailCache.set(id, result.data);
                return result.data;
            }
            return undefined;
        }
    }
});
