const { defineConfig } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

let executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
if (!executablePath && process.platform === 'win32' && process.env.LOCALAPPDATA) {
  const cache = path.join(process.env.LOCALAPPDATA, 'ms-playwright');
  if (fs.existsSync(cache)) {
    for (const directory of fs.readdirSync(cache).filter((name) => name.startsWith('chromium_headless_shell-')).sort().reverse()) {
      const candidate = path.join(cache, directory, 'chrome-headless-shell-win64', 'chrome-headless-shell.exe');
      if (fs.existsSync(candidate)) { executablePath = candidate; break; }
    }
  }
}

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  workers: 1,
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.APP_BASE_URL || 'http://127.0.0.1:8088',
    headless: true,
    viewport: { width: 1365, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'off',
    launchOptions: executablePath ? { executablePath } : {}
  }
});
