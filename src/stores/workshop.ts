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
    /** True once a search has completed (success or empty), so the UI can tell "no results" from "not searched yet". */
    hasSearched: boolean;
    /** Set when the last search failed (e.g. backend unreachable); cleared on a successful search. */
    error: boolean;
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
            hasSearched: false,
            error: false,
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
            this.error = false;
            try {
                const result = await getWorkshop(params);
                if (result.status === 200) {
                    this.assets = result.data.assets.rows;
                    this.totalCount = result.data.assets.count;
                    this.searchTerm = params.search ?? '';
                    this.sort = params.sort ?? 'newest';
                    this.page = params.page ?? 1;
                }
            } catch {
                // customFetch already surfaced an error toast; flag it so the
                // browser shows "couldn't reach the service" instead of "no results".
                this.error = true;
                this.assets = [];
                this.totalCount = 0;
            } finally {
                this.hasSearched = true;
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
