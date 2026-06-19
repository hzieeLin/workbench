import { defineConfig } from '@playwright/test'
import { existsSync } from 'fs'

const windowsEdge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:5174',
    channel: process.platform === 'win32' && existsSync(windowsEdge) ? 'msedge' : undefined,
  },
  webServer: {
    command: 'npm run e2e:serve',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
