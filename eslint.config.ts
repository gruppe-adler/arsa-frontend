import pluginVue from 'eslint-plugin-vue';
import { globalIgnores } from 'eslint/config';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import pluginVitest from '@vitest/eslint-plugin';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import appPlugin from './eslint-rules';

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
    {
        name: 'app/files-to-lint',
        files: ['**/*.{ts,mts,tsx,vue}']
    },

    globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '*.graphql.d.ts', 'worker-configuration.d.ts', 'src/api/**']),

    pluginVue.configs['flat/recommended'],
    vueTsConfigs.strict,
    vueTsConfigs.stylistic,

    {
        ...pluginVitest.configs.recommended,
        files: ['src/**/__tests__/*']
    },
    skipFormatting,
    {
        name: 'app/config',
        rules: {
            'no-console': 'warn',
            'vue/multi-word-component-names': 'off',
            'vue/no-reserved-component-names': 'off',
            'vue/attribute-hyphenation': ['warn', 'never'],
            'vue/v-on-event-hyphenation': ['warn', 'never'],
            'vue/require-default-prop': 'off'
        }
    },
    {
        name: 'app/test-files',
        files: ['**/*.test.ts', '**/__tests__/**'],
        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off'
        }
    },
    {
        name: 'app/workflow-files',
        files: ['.github/**'],
        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off'
        }
    },
    {
        name: 'app/tools',
        files: ['tools/**'],
        rules: {
            'no-console': 'off'
        }
    },
    {
        files: ['*.vue', '**/*.vue'],
        plugins: { app: appPlugin },
        rules: {
            'app/do-not-use-v-t': 'warn'
        }
    }
);
