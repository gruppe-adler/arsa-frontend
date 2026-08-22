import { defineConfig } from 'orval';

export default defineConfig({
    backend: {
        input: './openapi.json',
        output: {
            target: './src/api/backend.ts',
            schemas: './src/api/model',
            client: 'fetch',
            formatter: 'prettier',
            // baseUrl: 'http://localhost:3000/',
            override: {
                mutator: {
                    path: './src/utils/fetcher.ts',
                    name: 'customFetch'
                }
            }
        }
    }
});
