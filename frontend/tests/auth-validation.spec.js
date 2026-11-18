const { test, expect } = require('@playwright/test');
const { serveStatic } = require('./helpers/static.cjs');

async function fixture(page) {
  await serveStatic(page);
  const now = '2026-10-23T00:00:00Z';
  const user = { id: '11111111-1111-4111-8111-111111111111', username: 'fixture_user', displayName: '测试用户', email: 'fixture@example.com', emailVerified: true, createdAt: now, updatedAt: now };
  const state = { changes: [], passwordError: null };
  await page.route('**/api/**', route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    const ok = data => route.fulfill({ json: { code: 'SUCCESS', data, details: [] } });
    if (path === '/api/auth/csrf') return ok({ token: 'fixture', headerName: 'X-CSRF-Token' });
    if (path === '/api/system/capabilities') return ok({ registration: true, mediaTool: false });
    if (path === '/api/users/me') return ok(user);
    if (path === '/api/users/me/cloud-credentials') return ok([]);
    if (path === '/api/users/me/password') {
      state.changes.push(request.postDataJSON());
      const error = state.passwordError;
      return error ? route.fulfill({ status: error.status, json: { code: error.code, details: [] } }) : ok(null);
    }
    if (request.method() === 'GET' && ['/api/media', '/api/tasks', '/api/operation-plans'].includes(path)) {
      return ok({ items: [], page: 1, pageSize: 10, total: 0 });
    }
    // 分类默认页可能读取字幕；本用例没有字幕资源时按真实接口返回 404。
    if (route.request().method() === 'GET' && /\/api\/media\/[^/]+\/transcript$/.test(new URL(route.request().url()).pathname))
      return route.fulfill({ status: 404, json: { code: 'TRANSCRIPT_NOT_FOUND', data: null } });
    throw new Error('Unexpected fixture request: ' + path);
  });
  return state;
}


test('password changes use the same field feedback and retain form values after a rejected current password', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 900 });
  const state = await fixture(page); await page.goto('/'); await page.locator('#workspace-home-sidebar').getByRole('button', { name: '个人资料', exact: true }).click(); await page.locator('#account-security-tab').click();
  await page.locator('#current-password').fill('Abc123'); await page.locator('#new-password').fill('Abc123'); await page.locator('#confirm-new-password').fill('Abc123');
  await page.locator('#password-form button[type="submit"]').click();
  await expect(page.locator('#new-password-error')).toHaveText('新密码不能与当前密码相同。');
  expect(state.changes).toHaveLength(0);
  const legacy = 'Legacy-password-over-sixteen';
  await page.locator('#current-password').fill(legacy); await page.locator('#new-password').fill('Abc124'); await page.locator('#confirm-new-password').fill('Abc124');
  state.passwordError = { code: 'CURRENT_PASSWORD_INVALID', status: 403 };
  await page.locator('#password-form button[type="submit"]').click();
  await expect(page.locator('#current-password-error')).toHaveText('当前密码不正确。'); await expect(page.locator('#current-password')).toBeFocused();
  await expect(page.locator('#new-password')).toHaveValue('Abc124'); expect(state.changes[0].currentPassword).toBe(legacy);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('change-password-errors-mobile.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
