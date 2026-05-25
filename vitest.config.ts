import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    tsconfig: './tsconfig.test.json',
    coverage: {
      provider: 'v8',
      include: ['src/lib/**'],
    },
  },
});
