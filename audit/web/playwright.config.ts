import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

const chromePath = process.env.CHROME_PATH || (existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  timeout: 45_000,
  use: {
    baseURL: process.env.AUDIT_TEST_BASE || 'http://127.0.0.1:4174/',
    ...(chromePath ? { launchOptions: { executablePath: chromePath } } : {})
  },
  webServer: process.env.AUDIT_TEST_BASE
    ? undefined
    : {
        command: 'npx vite preview --host 127.0.0.1 --port 4174 --strictPort',
        url: 'http://127.0.0.1:4174/',
        reuseExistingServer: !process.env.CI,
        timeout: 30_000
      }
});
