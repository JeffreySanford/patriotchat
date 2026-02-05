import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['apps/frontend/src/**/*.spec.ts', 'apps/api/src/**/*.spec.ts'],
    setupFiles: ['apps/frontend/src/test-setup.ts'],
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        pretendToBeVisual: true,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'frontend/src/test-setup.ts',
        '**/*.spec.ts',
        '**/dist',
        '**/out-tsc',
      ],
    },
    testTimeout: 10000,
    threads: {
      useAtomics: true,
    },
  },
  resolve: {
    alias: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      '@': path.resolve(__dirname, './apps/frontend/src') as string,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      '@patriotchat/shared': path.resolve(
        __dirname,
        './libs/shared/src/index.ts',
      ) as string,
    },
  },
});
