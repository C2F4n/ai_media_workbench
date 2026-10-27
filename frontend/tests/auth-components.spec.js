const { test, expect } = require('@playwright/test');
const { serveStatic } = require('./helpers/static.cjs');
const fs = require('node:fs');
const path = require('node:path');

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

async function fixture(page) {
  await serveStatic(page);
  const state = { signedIn: false, logins: [], sends: [], registrations: [], logoutHeaders: null, csrfReads: 0, login: null, send: null };
  const user = { id: '11111111-1111-4111-8111-111111111111', username: 'fixture_user', displayName: '测试用户', email: 'fixture@example.com', emailVerified: true, createdAt: '2026-10-24T00:00:00Z', updatedAt: '2026-10-24T00:00:00Z' };
  await page.route('**/api/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    const reply = (data, status = 200, code = 'SUCCESS') => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ code, data, details: [] }) });
    if (path === '/api/system/capabilities') return reply({ registration: true, mediaTool: false, supportedOperations: [], asrProviders: [], maxUploadBytes: 3221225472, maxDurationMs: 900000 });
    if (path === '/api/auth/csrf') { state.csrfReads++; return reply({ token: `csrf-${state.csrfReads}`, headerName: 'X-CSRF-Token' }); }
    if (path === '/api/users/me') return state.signedIn ? reply(user) : reply(null, 401, 'UNAUTHENTICATED');
    if (path === '/api/users/me/cloud-credentials') return reply([]);
    if (path === '/api/auth/login') {
      state.logins.push({ body: request.postDataJSON(), headers: request.headers() });
      if (state.login) return state.login(route, reply);
      state.signedIn = true; return reply({ user, csrfToken: 'rotated-after-login' });
    }
    if (path === '/api/auth/logout') { state.logoutHeaders = request.headers(); state.signedIn = false; return reply(null); }
    if (path === '/api/auth/registration-email-code') {
      state.sends.push(request.postDataJSON());
      if (state.send) return state.send(route, reply);
      return reply({ challengeId: '33333333-3333-4333-8333-333333333333', expiresAt: new Date(Date.now() + 600000).toISOString() }, 202);
    }
    if (path === '/api/auth/register') { state.registrations.push(request.postDataJSON()); return reply(user, 201); }
    if (request.method() === 'GET' && ['/api/media', '/api/tasks', '/api/operation-plans'].includes(path)) return reply({ items: [], page: 1, pageSize: 10, total: 0 });
    throw new Error('Unexpected fixture request: ' + path);
  });
  return state;
}

async function loginDraft(page) {
  await page.goto('/');
  await page.locator('#login-username').fill('fixture_user');
  await page.locator('#login-password').fill('Legacy-password-over-sixteen');
}

test('Vue submits login once, preserves rememberMe and uses the rotated CSRF token after login', async ({ page }) => {
  const state = await fixture(page), gate = deferred();
  state.login = async (_route, reply) => { await gate.promise; state.signedIn = true; return reply({ user: { id: '11111111-1111-4111-8111-111111111111', username: 'fixture_user', displayName: '测试用户', email: 'fixture@example.com', emailVerified: true, createdAt: '2026-10-24T00:00:00Z' }, csrfToken: 'rotated-after-login' }); };
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  try {
    await loginDraft(page); await page.locator('#remember-me').check();
    await page.locator('[data-password-target="login-password"]').click();
    await page.evaluate(() => { for (let i = 0; i < 8; i++) document.getElementById('login-form').requestSubmit(); });
    await expect.poll(() => state.logins.length).toBe(1);
    await expect(page.locator('#login-password')).toBeDisabled();
    await expect(page.locator('[data-password-target="login-password"]')).toBeDisabled();
    await expect(page.locator('#register-tab')).toBeDisabled();
    await expect(page.locator('#auth-theme-toggle')).toBeEnabled();
    gate.resolve();
    await expect(page.locator('#account-view')).toBeVisible();
    await expect(page.locator('#login-password')).toHaveValue('');
    await expect(page.locator('#login-password')).toHaveAttribute('type', 'password');
    expect(state.logins[0].body).toEqual({ username: 'fixture_user', password: 'Legacy-password-over-sixteen', rememberMe: true });
    expect(state.logins[0].headers['x-csrf-token']).toBe('csrf-1');
    await page.locator('#header-logout').click(); await expect(page.locator('#auth-view')).toBeVisible();
    expect(state.logoutHeaders['x-csrf-token']).toBe('rotated-after-login');
    await expect(page.locator('#login-password')).toHaveValue('');
    await expect(page.locator('#login-form button[type="submit"]')).toBeEnabled();
    const storage = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }));
    expect(storage).not.toContain('Legacy-password'); expect(storage).not.toContain('rotated-after-login');
    expect(errors).toEqual([]);
  } finally { gate.resolve(); }
});

test('network failures unlock the Vue form without retrying or losing the draft', async ({ page }) => {
  const state = await fixture(page);
  state.login = route => route.abort('failed');
  await loginDraft(page); await page.locator('#login-form button[type="submit"]').click();
  await expect(page.locator('#login-error')).toContainText('暂时无法连接服务');
  await expect(page.locator('#login-password')).toBeEnabled();
  await expect(page.locator('#login-password')).toHaveValue('Legacy-password-over-sixteen');
  expect(state.logins).toHaveLength(1);
  state.login = null;
  await page.locator('#login-form button[type="submit"]').click();
  await expect(page.locator('#account-view')).toBeVisible(); expect(state.logins).toHaveLength(2);
});

test('the migrated form keeps the existing single CSRF refresh retry, not an unlimited retry', async ({ page }) => {
  const state = await fixture(page);
  state.login = (_route, reply) => reply(null, 403, 'CSRF_INVALID');
  await loginDraft(page); await page.locator('#login-form button[type="submit"]').click();
  await expect(page.locator('#login-error')).toHaveText('安全验证已过期，请重新提交。');
  await expect(page.locator('#login-form button[type="submit"]')).toBeEnabled();
  expect(state.logins).toHaveLength(2); expect(state.csrfReads).toBe(2);
  expect(state.logins.map(item => item.headers['x-csrf-token'])).toEqual(['csrf-1', 'csrf-2']);
  expect(state.logins[0].body).toEqual(state.logins[1].body);
});

test('cooldowns follow the normalized email and survive auth tab switches without mixing challenges', async ({ page }) => {
  const state = await fixture(page); await page.clock.install();
  await page.goto('/'); await page.locator('#register-tab').click();
  await page.locator('#register-email').fill('First@example.com'); await page.locator('#send-email-code').click();
  await expect(page.locator('#email-code-label')).toHaveText('20秒后重发');
  await page.locator('#register-email-code').fill('123456');
  await page.locator('#login-tab').click(); await page.locator('#register-tab').click();
  await expect(page.locator('#register-email-code')).toHaveValue('123456');
  await expect(page.locator('#send-email-code')).toBeDisabled();
  await page.locator('#register-email').fill('second@example.com');
  await expect(page.locator('#register-submit')).toBeDisabled();
  await expect(page.locator('#register-email-code')).toHaveValue('');
  await expect(page.locator('#send-email-code')).toBeEnabled();
  await page.locator('#send-email-code').click(); await expect(page.locator('#register-submit')).toBeEnabled();
  await page.locator('#register-email').fill('FIRST@example.com');
  await expect(page.locator('#send-email-code')).toBeDisabled();
  await expect(page.locator('#register-submit')).toBeDisabled();
  expect(state.sends).toEqual([{ email: 'first@example.com' }, { email: 'second@example.com' }]);
  await page.clock.fastForward(21000); await expect(page.locator('#send-email-code')).toBeEnabled();
});

test('a late verification response cannot bind a challenge to a changed email', async ({ page }) => {
  const state = await fixture(page), gate = deferred();
  state.send = async (_route, reply) => { await gate.promise; return reply({ challengeId: '33333333-3333-4333-8333-333333333333', expiresAt: new Date(Date.now() + 600000).toISOString() }, 202); };
  try {
    await page.goto('/'); await page.locator('#register-tab').click();
    await page.locator('#register-email').fill('first@example.com');
    await page.evaluate(() => { for (let i = 0; i < 8; i++) document.getElementById('send-email-code').click(); });
    await expect.poll(() => state.sends.length).toBe(1);
    await expect(page.locator('#register-email')).toBeDisabled();
    // Simulate an external autofill update while the original request is in flight.
    await page.locator('#register-email').evaluate(input => { input.value = 'second@example.com'; input.dispatchEvent(new Event('input', { bubbles: true })); });
    gate.resolve();
    await expect(page.locator('#register-email')).toBeEnabled();
    await expect(page.locator('#register-submit')).toBeDisabled();
    await expect(page.locator('#email-code-notice')).toBeHidden();
    await expect(page.locator('#send-email-code')).toBeEnabled();
    await page.locator('#register-email').fill('first@example.com');
    await expect(page.locator('#send-email-code')).toBeDisabled();
    expect(state.sends).toHaveLength(1);
  } finally { gate.resolve(); }
});

test('authentication components work under the production CSP without inline scripts or unsafe-eval', async ({ page }) => {
  const state = await fixture(page);
  state.login = (_route, reply) => reply(null, 401, 'INVALID_CREDENTIALS');
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.cspViolations = [];
    document.addEventListener('securitypolicyviolation', event => window.cspViolations.push(event.violatedDirective));
  });
  await page.route('**/', route => route.fulfill({
    status: 200, contentType: 'text/html',
    headers: { 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; media-src 'self' blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
    body: fs.readFileSync(path.resolve(__dirname, '../../src/main/resources/static/index.html'))
  }));
  await loginDraft(page); await page.locator('#login-form button[type="submit"]').click();
  await expect(page.locator('#login-error')).toHaveText('用户名或密码不正确。');
  await page.locator('#register-tab').click(); await expect(page.locator('#register-panel')).toBeVisible();
  await page.locator('#register-email').fill('invalid'); await page.locator('#send-email-code').click();
  await expect(page.locator('#register-email-error')).toContainText('请输入有效的邮箱地址');
  expect(state.sends).toHaveLength(0); expect(errors).toEqual([]);
  expect(await page.evaluate(() => window.cspViolations)).toEqual([]);
});
