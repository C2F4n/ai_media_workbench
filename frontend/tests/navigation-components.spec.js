const { test, expect } = require('@playwright/test');
const { serveStatic } = require('./helpers/static.cjs');
const { selectTool } = require('./helpers/navigation.cjs');
const fs = require('node:fs');
const path = require('node:path');

async function fixture(page) {
  await serveStatic(page);
  const user = { id: '11111111-1111-4111-8111-111111111111', username: 'fixture_user', displayName: '导航测试', email: 'fixture@example.com', emailVerified: true, createdAt: '2026-10-24T00:00:00Z' };
  const state = { user, signedIn: true, writes: 0, logoutGate: null };
  await page.route('**/api/**', async route => {
    const request = route.request(), url = new URL(request.url());
    const reply = (data, status = 200, code = 'SUCCESS') => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ code, data, details: [] }) });
    if (request.method() !== 'GET') state.writes++;
    if (url.pathname === '/api/auth/csrf') return reply({ token: 'fixture', headerName: 'X-CSRF-Token' });
    if (url.pathname === '/api/system/capabilities') return reply({ registration: false, mediaTool: true, supportedOperations: ['transcode', 'compress', 'trim', 'mute', 'extract_audio', 'export'], exportFormats: ['mp4'], exportVideoCodecs: ['h264'], maxUploadBytes: 3221225472, maxDurationMs: 900000, asrProviders: [] });
    if (url.pathname === '/api/users/me') return state.signedIn ? reply(state.user) : reply(null, 401, 'UNAUTHENTICATED');
    if (url.pathname === '/api/users/me/cloud-credentials') return reply([]);
    if (url.pathname === '/api/auth/logout') { if (state.logoutGate) await state.logoutGate; state.signedIn = false; return reply(null); }
    if (url.pathname === '/api/auth/login') { state.signedIn = true; return reply({ user: state.user, csrfToken: 'after-login' }); }
    if (['/api/media', '/api/tasks', '/api/operation-plans'].includes(url.pathname) && request.method() === 'GET') return reply({ items: [], page: 1, pageSize: 10, total: 0 });
    throw new Error('Unexpected fixture request: ' + url.pathname);
  });
  return state;
}

test('each tool remembers its own phase, while history hides all media panels without destroying DOM', async ({ page }) => {
  const state = await fixture(page); await page.goto('/');
  await selectTool(page, 'convert'); await page.locator('#phase-export-tab').click();
  await selectTool(page, 'trim'); await expect(page.locator('#phase-edit-tab')).toHaveAttribute('aria-selected', 'true');
  await page.locator('#phase-import-tab').click();
  await selectTool(page, 'convert'); await expect(page.locator('#phase-export')).toBeVisible();
  await selectTool(page, 'history');
  for (const phase of ['import', 'edit', 'export']) {
    await expect(page.locator(`#phase-${phase}`)).toBeHidden();
    expect(await page.locator(`#phase-${phase}`).evaluate(element => element.inert)).toBe(true);
  }
  await selectTool(page, 'trim'); await expect(page.locator('#phase-import')).toBeVisible();
  await page.locator('#phase-edit-tab').click();
  await page.locator('#source-preview').evaluate(element => { window.retainedPreview = element; });
  await selectTool(page, 'detect'); await selectTool(page, 'trim');
  expect(await page.locator('#source-preview').evaluate(element => window.retainedPreview === element)).toBe(true);
  await expect(page.locator('#phase-edit')).toBeVisible(); expect(state.writes).toBe(0);
});

test('rapid tool switches leave exactly one selection and the last matching phase; motion changes cancel animations', async ({ page }) => {
  const state = await fixture(page); await page.goto('/');
  await expect(page.locator('#detect-tool')).toBeVisible();
  await page.evaluate(() => {
    window.toolSlides = 0;
    const stage = document.getElementById('tool-stage'), original = stage.animate.bind(stage);
    stage.animate = (...args) => { window.toolSlides++; return original(...args); };
    for (const tool of ['convert', 'trim', 'detect', 'compress', 'mute', 'convert']) document.getElementById(tool + '-tool').click();
  });
  expect(await page.evaluate(() => window.toolSlides)).toBe(6);
  await expect(page.locator('.tool-choice[aria-current="page"]')).toHaveCount(1);
  await expect(page.locator('#convert-tool')).toHaveClass(/active/);
  await expect(page.locator('#phase-edit')).toBeVisible();
  await expect.poll(() => page.locator('#tool-stage').evaluate(element => element.getAnimations().length)).toBe(0);
  await page.evaluate(() => { document.getElementById('trim-tool').click(); document.getElementById('tool-stage').getAnimations().forEach(animation => animation.pause()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.locator('#tool-stage').evaluate(element => element.getAnimations().length)).toBe(0);
  await page.locator('#phase-import-tab').click();
  expect(await page.locator('#phase-import').evaluate(element => element.getAnimations().length)).toBe(0);
  expect(state.writes).toBe(0);
});

test('mobile drawer traps keyboard focus, returns focus on close and restores desktop layout on resize', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await fixture(page); await page.goto('/');
  await page.locator('#toggle-sidebar').click(); await expect(page.locator('#detect-tool')).toBeFocused();
  await page.locator('#close-sidebar').focus(); await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#history-tool')).toBeFocused();
  await page.keyboard.press('Tab'); await expect(page.locator('#close-sidebar')).toBeFocused();
  await page.keyboard.press('Escape'); await expect(page.locator('#toggle-sidebar')).toBeFocused();
  await expect(page.locator('#tool-content')).not.toHaveAttribute('inert');
  await page.locator('#toggle-sidebar').click();
  await page.locator('#ai-group-toggle').click(); await expect(page.locator('#ai-group-body')).toHaveAttribute('inert', '');
  await page.setViewportSize({ width: 1365, height: 900 });
  await expect(page.locator('#sidebar-backdrop')).toBeHidden(); await expect(page.locator('#tool-sidebar')).toBeVisible();
  await expect(page.locator('#tool-sidebar')).toHaveAttribute('role', 'complementary');
  expect(await page.locator('#tool-content').evaluate(element => element.inert)).toBe(false);
});

for (const storage of ['corrupt', 'disabled']) test(`navigation works with ${storage} browser storage without persisting tool/media state`, async ({ page }) => {
  const state = await fixture(page);
  await page.addInitScript(mode => {
    if (mode === 'disabled') {
      for (const name of ['getItem', 'setItem']) Object.defineProperty(Storage.prototype, name, { value() { throw new DOMException('Storage blocked', 'SecurityError'); } });
    } else {
      localStorage.setItem('amw-navigation', '{invalid-json');
      localStorage.setItem('amw-tool-groups', JSON.stringify({ regular: 'false', ai: false, history: 123 }));
    }
  }, storage);
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/'); await expect(page.locator('#detect-tool')).toBeVisible();
  await page.locator('#ai-group-toggle').click();
  await page.locator('#regular-group-toggle').click(); await expect(page.locator('#regular-group-body')).toHaveAttribute('inert', '');
  await page.locator('#regular-group-toggle').click(); await page.locator('#convert-tool').click();
  await page.locator('#phase-export-tab').click(); await page.locator('#pin-sidebar').click();
  await page.keyboard.press('Escape'); await expect(page.locator('#toggle-sidebar')).toBeFocused();
  if (storage !== 'disabled') {
    const preferences = await page.evaluate(() => ({ navigation: JSON.parse(localStorage.getItem('amw-navigation')), groups: JSON.parse(localStorage.getItem('amw-tool-groups')) }));
    expect(preferences.navigation).toEqual({ pinned: false, open: false });
    expect(preferences.groups).toEqual({ regular: true, ai: true, history: true });
  }
  expect(state.writes).toBe(0); expect(errors).toEqual([]);
});

test('navigation controls remain locked during logout and a new login resets per-tool phase memory', async ({ page }) => {
  const state = await fixture(page); let release;
  state.logoutGate = new Promise(resolve => { release = resolve; });
  try {
    await page.goto('/'); await selectTool(page, 'convert'); await page.locator('#phase-export-tab').click();
    await page.locator('#header-logout').click();
    await expect(page.locator('#trim-tool')).toBeDisabled(); await expect(page.locator('#phase-edit-tab')).toBeDisabled();
    await expect(page.locator('#toggle-sidebar')).toBeDisabled();
    await page.evaluate(() => { document.getElementById('trim-tool').click(); document.getElementById('phase-edit-tab').click(); });
    await expect(page.locator('#convert-tool')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('#phase-export-tab')).toHaveAttribute('aria-selected', 'true');
    release(); await expect(page.locator('#auth-view')).toBeVisible();
    await page.locator('#login-username').fill('fixture_user'); await page.locator('#login-password').fill('Abc123');
    await page.locator('#login-form button[type="submit"]').click(); await expect(page.locator('#account-view')).toBeVisible();
    await expect(page.locator('#detect-tool')).toHaveAttribute('aria-current', 'page'); await expect(page.locator('#phase-import')).toBeVisible();
    await selectTool(page, 'convert'); await expect(page.locator('#phase-edit')).toBeVisible();
    expect(state.writes).toBe(2);
  } finally { release(); }
});

test('an account change in another tab clears the former account navigation and workspace state', async ({ page }) => {
  const state = await fixture(page); await page.goto('/');
  await selectTool(page, 'convert'); await page.locator('#phase-export-tab').click();
  state.user = { ...state.user, id: '22222222-2222-4222-8222-222222222222', displayName: '另一个用户' };
  await page.evaluate(() => { const channel = new BroadcastChannel('amw-account'); channel.postMessage('account-changed'); channel.close(); });
  await expect(page.locator('#workspace-user')).toHaveText('另一个用户');
  await expect(page.locator('#detect-tool')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('#phase-import')).toBeVisible();
  await selectTool(page, 'convert'); await expect(page.locator('#phase-edit')).toBeVisible();
  expect(state.writes).toBe(0);
});

test('Vue sidebar and phase navigation work under the production CSP', async ({ page }) => {
  await fixture(page);
  await page.addInitScript(() => {
    window.cspViolations = [];
    document.addEventListener('securitypolicyviolation', event => window.cspViolations.push(event.violatedDirective));
  });
  await page.route('**/', route => route.fulfill({ status: 200, contentType: 'text/html',
    headers: { 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; media-src 'self' blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
    body: fs.readFileSync(path.resolve(__dirname, '../../src/main/resources/static/index.html'))
  }));
  await page.goto('/'); await selectTool(page, 'convert'); await page.locator('#phase-export-tab').click();
  await expect(page.locator('#phase-export')).toBeVisible();
  await page.locator('#regular-group-toggle').click(); await expect(page.locator('#tool-indicator')).toBeHidden();
  expect(await page.evaluate(() => window.cspViolations)).toEqual([]);
});
