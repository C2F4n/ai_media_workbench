const { test, expect } = require('@playwright/test');
const { serveStatic } = require('./helpers/static.cjs');
const { selectTool } = require('./helpers/navigation.cjs');

// Intercepted origins exercise the browser's real secure-context rules without a public server.
async function fixture(page, { signedIn = true, requireHttps = false } = {}) {
  await serveStatic(page);
  const mediaId = '22222222-2222-4222-8222-222222222222';
  const planId = '33333333-3333-4333-8333-333333333333';
  const now = '2026-10-26T00:00:00Z';
  const media = { id: mediaId, originalFilename: 'transport.mp4', sizeBytes: 1000, status: 'READY', kind: 'VIDEO', previewUrl: null,
    metadata: { container: 'mp4', durationMs: 20000, width: 1280, height: 720, hasAudio: false }, createdAt: now, updatedAt: now };
  let plan = { id: planId, mediaId, version: 1, status: 'READY', parameters: { operation: 'join_clips', outputFormat: 'mp4',
    audioMode: 'keep', clips: [{ startMs: 1000, endMs: 3000 }, { startMs: 5000, endMs: 8000 }] } };
  const writes = []; let task = null;
  await page.route('**/api/**', async route => {
    const request = route.request(), url = new URL(request.url()), method = request.method();
    const result = (data, status = 200, code = 'SUCCESS') => route.fulfill({ status, contentType: 'application/json',
      body: JSON.stringify({ code, message: '', data, details: [], requestId: 'transport-fixture' }) });
    const list = items => ({ items, page: 1, pageSize: 10, total: items.length });
    if (requireHttps) return result(null, 403, 'HTTPS_REQUIRED');
    if (url.pathname === '/api/system/capabilities') return result({ registration: false, mediaTool: true, asr: false, aiPlans: false,
      supportedOperations: ['transcode', 'join_clips'], maxUploadBytes: 3221225472, maxDurationMs: 900000, asrProviders: [] });
    if (url.pathname === '/api/auth/csrf') return result({ token: 'transport-csrf', headerName: 'X-CSRF-Token' });
    if (url.pathname === '/api/users/me') return result(signedIn ? { id: 'transport-user', username: 'tester', displayName: 'Tester',
      email: 'test@example.com', emailVerified: true, createdAt: now, updatedAt: now } : null, signedIn ? 200 : 401, signedIn ? 'SUCCESS' : 'UNAUTHENTICATED');
    if (url.pathname === '/api/media') return result(list([media]));
    if (url.pathname === `/api/media/${mediaId}`) return result(media);
    if (url.pathname === '/api/users/me/cloud-credentials') return result([]);
    if (url.pathname === '/api/operation-plans' && method === 'GET') return result(list([plan]));
    if (url.pathname === `/api/operation-plans/${planId}` && method === 'PATCH') {
      const body = request.postDataJSON(); writes.push(body);
      expect(request.headers()['x-csrf-token']).toBe('transport-csrf');
      plan = { ...plan, version: plan.version + 1, parameters: body.parameters }; return result(plan);
    }
    if (url.pathname === `/api/operation-plans/${planId}/execute`) {
      writes.push(request.postDataJSON());
      task = { id: '44444444-4444-4444-8444-444444444444', mediaId, planId, planVersion: plan.version,
        kind: 'MEDIA_PROCESSING', parameters: plan.parameters, status: 'SUCCEEDED', stage: 'DONE', progressPercent: 100, outputs: [], createdAt: now };
      return result(task);
    }
    if (url.pathname === '/api/tasks') return result(list(task ? [task] : []));
    if (url.pathname === `/api/tasks/${task?.id}`) return result(task);
    throw new Error(`Unexpected transport request: ${method} ${url.pathname}`);
  });
  return { writes };
}

for (const scenario of [
  { origin: 'http://workbench.test', secure: false, width: 1365 },
  { origin: 'http://workbench.test', secure: false, width: 390 },
  { origin: 'https://workbench.test', secure: true, width: 1365 },
  { origin: 'http://127.0.0.1:8088', secure: true, width: 1365 }
]) {
  test(`join edits and exports without secure-only APIs: ${scenario.origin} at ${scenario.width}px`, async ({ page }) => {
    await page.setViewportSize({ width: scenario.width, height: 900 });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const state = await fixture(page);
    await page.goto(scenario.origin + '/');
    expect(await page.evaluate(() => window.isSecureContext)).toBe(scenario.secure);
    if (!scenario.secure) expect(await page.evaluate(() => typeof crypto.randomUUID)).toBe('undefined');
    await expect(page.locator('#media-status')).toHaveText('已就绪');
    await selectTool(page, 'join');
    await expect(page.locator('#join-clips > li')).toHaveCount(2);
    await page.getByRole('button', { name: '复制片段 1', exact: true }).click();
    await expect(page.locator('#join-clips > li')).toHaveCount(3);
    await page.locator('#join-clips > li').nth(1).locator('input').first().fill('2');
    await expect(page.locator('#join-clips > li').first().locator('input').first()).toHaveValue('1');
    await page.getByRole('button', { name: '下移片段 2', exact: true }).click();
    await page.locator('#add-join-clip').click();
    await expect(page.locator('#join-clips > li')).toHaveCount(4);
    await page.getByRole('button', { name: '移除片段 4', exact: true }).click();
    await page.locator('#export-join').click();
    await expect(page.locator('#action-confirm-dialog')).toBeVisible();
    await page.locator('#accept-action-confirm').click();
    await expect.poll(() => state.writes.length).toBe(2);
    expect(state.writes[0]).toEqual({ expectedVersion: 1, parameters: { operation: 'join_clips', outputFormat: 'mp4', audioMode: 'keep',
      clips: [{ startMs: 1000, endMs: 3000 }, { startMs: 5000, endMs: 8000 }, { startMs: 2000, endMs: 3000 }] } });
    expect(state.writes[1]).toEqual({ expectedVersion: 2 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    await page.locator('#header-account').click();
    await page.locator('#account-cloud-tab').click();
    const credentialWarning = page.locator('#cloud-section [data-transport-warning]');
    if (scenario.secure) await expect(credentialWarning).toBeHidden();
    else await expect(credentialWarning).toBeVisible();
  });

  test(`connection warning follows actual browser security: ${scenario.origin} at ${scenario.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: scenario.width, height: 900 });
    await fixture(page, { signedIn: false });
    await page.goto(scenario.origin + '/');
    await expect(page.locator('#login-form')).toBeVisible();
    const warning = page.locator('#auth-view [data-transport-warning]');
    if (scenario.secure) await expect(warning).toBeHidden();
    else {
      await expect(warning).toBeVisible();
      const bounds = await warning.boundingBox();
      const tabs = await page.locator('#auth-view .tabs').boundingBox();
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(tabs.y);
      await page.screenshot({ path: testInfo.outputPath(`http-warning-${scenario.width}.png`), fullPage: true });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('an HTTPS_REQUIRED API response is explained instead of a generic connection error', async ({ page }) => {
  await fixture(page, { requireHttps: true });
  await page.goto('http://workbench.test/');
  await expect(page.locator('#unavailable-view')).toBeVisible();
  await expect(page.locator('#unavailable-message')).toHaveText('请通过 HTTPS 安全连接访问本站。');
  await expect(page.locator('#login-form')).toBeHidden();
});
