import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],

    test: {
        // This makes 'describe', 'it', 'expect' available
        // in all test files, just like Jest.
        globals: true,

        // This matches your Jest config (clearMocks: true)
        clearMocks: true,

        // This matches your Jest config (coverageProvider: "v8")
        coverage: {
            provider: 'v8',
        },
    },
});