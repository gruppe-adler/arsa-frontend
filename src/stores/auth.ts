import { defineStore } from 'pinia';
import { getUserClaims, performLogin, performLogout } from '../utils/api';
import { Claims } from '../api/model';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as Claims | null
    }),
    getters: {
        isAuthenticated(state): boolean {
            return !!state.user && !this.isExpired && this.hasRole('adler');
        },
        roles(state): string[] {
            return state.user?.realm_access?.roles ?? [];
        },
        hasRole(state) {
            return (role: string) => (state.user?.realm_access?.roles ?? []).includes(role);
        },
        isExpired(state): boolean {
            const exp = state.user?.exp;
            if (typeof exp === 'number') {
                const nowInSeconds = Math.floor(Date.now() / 1000);
                return exp < nowInSeconds;
            }
            return true;
        }
    },
    actions: {
        async init() {
            try {
                this.user = await getUserClaims();
            } catch {}
        },
        async login() {
            await performLogin();
        },
        async logout() {
            await performLogout();
        }
        // getToken
    }
});
