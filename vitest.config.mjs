import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'node',
    include: ['app/**/*.test.js'],
    // Le prove statistiche eseguono molte generazioni e possono essere lente su CPU occupate.
    testTimeout: 20000,
  },
});
