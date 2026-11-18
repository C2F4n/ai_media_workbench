const { test, expect } = require('@playwright/test');
const { readIndex, serveStatic } = require('./helpers/static.cjs');
const { selectTool } = require('./helpers/navigation.cjs');

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
    if (['/api/media', '/api/tasks', '/api/operation-plans'].includes(url.pathname) && request.method() === 'GET') return reply({ items: [], page: 1, pageSize: 10, total: 0 });
    // 分类默认页可能读取字幕；本用例没有字幕资源时按真实接口返回 404。
    if (route.request().method() === 'GET' && /\/api\/media\/[^/]+\/transcript$/.test(new URL(route.request().url()).pathname))
      return route.fulfill({ status: 404, json: { code: 'TRANSCRIPT_NOT_FOUND', data: null } });
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

test('navigation controls remain locked during logout and a new login resets per-tool phase memory', async ({ page }) => {
  const state = await fixture(page); let release;
  state.logoutGate = new Promise(resolve => { release = resolve; });
  try {
    await page.goto('/'); await selectTool(page, 'convert'); await page.locator('#phase-export-tab').click();
    await page.locator('#workspace-home-sidebar').getByRole('button', { name: '退出登录', exact: true }).click();
    await expect(page.locator('#workspace-tool-tab-trim')).toBeDisabled(); await expect(page.locator('#phase-edit-tab')).toBeDisabled();
    await page.evaluate(() => { document.getElementById('workspace-tool-tab-trim').click(); document.getElementById('phase-edit-tab').click(); });
    await expect(page.locator('#workspace-tool-tab-convert')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#phase-export-tab')).toHaveAttribute('aria-selected', 'true');
    release(); await expect(page.locator('#auth-view')).toBeVisible();
    await expect(page.locator('#auth-notice')).toBeHidden();
    state.signedIn = true;
    await page.evaluate(() => { const channel = new BroadcastChannel('amw-account'); channel.postMessage('account-changed'); channel.close(); });
    await expect(page.locator('#account-view')).toBeVisible();
    await expect(page.locator('#workspace-tool-tab-detect')).toHaveAttribute('aria-selected', 'true'); await expect(page.locator('.media-detect')).toBeVisible();
    await selectTool(page, 'convert'); await expect(page.locator('#phase-edit')).toBeVisible();
    expect(state.writes).toBe(1);
  } finally { release(); }
});

test('an account change in another tab clears the former account navigation and workspace state', async ({ page }) => {
  const state = await fixture(page); await page.goto('/');
  await selectTool(page, 'convert'); await page.locator('#phase-export-tab').click();
  state.user = { ...state.user, id: '22222222-2222-4222-8222-222222222222', displayName: '另一个用户' };
  await page.evaluate(() => { const channel = new BroadcastChannel('amw-account'); channel.postMessage('account-changed'); channel.close(); });
  await expect(page.locator('.workspace-home-identity')).toContainText('另一个用户');
  await expect(page.locator('#workspace-tool-tab-detect')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.media-detect')).toBeVisible();
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
    body: readIndex()
  }));
  await page.goto('/'); await selectTool(page, 'convert'); await page.locator('#phase-export-tab').click();
  await expect(page.locator('#phase-export')).toBeVisible();
  expect(await page.evaluate(() => window.cspViolations)).toEqual([]);
});
