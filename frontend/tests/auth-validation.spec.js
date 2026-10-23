const { test, expect } = require('@playwright/test');
const { serveStatic } = require('./helpers/static.cjs');

async function fixture(page, authenticated = false) {
  await serveStatic(page);
  const now = '2026-10-23T00:00:00Z';
  const user = { id: '11111111-1111-4111-8111-111111111111', username: 'fixture_user', displayName: '测试用户', email: 'fixture@example.com', emailVerified: true, createdAt: now, updatedAt: now };
  const state = { sends: 0, registrations: [], logins: [], changes: [], registrationError: null, loginError: { code: 'INVALID_CREDENTIALS', status: 401 }, passwordError: null, registration: true };
  await page.route('**/api/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    const ok = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ code: 'SUCCESS', data, details: [] }) });
    const fail = error => route.fulfill({ status: error.status || 422, contentType: 'application/json', body: JSON.stringify({ code: error.code, message: '服务端错误', data: null, details: error.details || [] }) });
    if (path === '/api/auth/csrf') return ok({ token: 'fixture', headerName: 'X-CSRF-Token' });
    if (path === '/api/system/capabilities') return ok({ registration: state.registration, mediaTool: false, supportedOperations: [], asrProviders: [], maxUploadBytes: 3221225472, maxDurationMs: 900000 });
    if (path === '/api/users/me') return authenticated ? ok(user) : fail({ code: 'UNAUTHENTICATED', status: 401 });
    if (path === '/api/users/me/cloud-credentials') return ok([]);
    if (path === '/api/auth/registration-email-code') {
      state.sends++;
      return ok({ challengeId: '33333333-3333-4333-8333-333333333333', expiresAt: new Date(Date.now() + 600000).toISOString() }, 202);
    }
    if (path === '/api/auth/register') {
      state.registrations.push(request.postDataJSON());
      return state.registrationError ? fail(state.registrationError) : ok({ ...user, username: request.postDataJSON().username }, 201);
    }
    if (path === '/api/auth/login') {
      state.logins.push(request.postDataJSON());
      return fail(state.loginError);
    }
    if (path === '/api/users/me/password') {
      state.changes.push(request.postDataJSON());
      return state.passwordError ? fail(state.passwordError) : ok(null);
    }
    if (request.method() === 'GET' && ['/api/media', '/api/tasks', '/api/operation-plans'].includes(path)) return ok({ items: [], page: 1, pageSize: 10, total: 0 });
    throw new Error('Unexpected fixture request: ' + path);
  });
  return state;
}

async function registration(page) {
  await page.goto('/'); await page.locator('#register-tab').click();
  await page.locator('#register-username').fill('valid_user');
  await page.locator('#register-email').fill('valid@example.com');
  await page.locator('#send-email-code').click(); await expect(page.locator('#register-submit')).toBeEnabled();
  await page.locator('#register-email-code').fill('123456');
  await page.locator('#register-password').fill('Abc123');
  await page.locator('#register-confirm-password').fill('Abc123');
}

for (const width of [1365, 390]) test(`registration identifies each field, focuses the first error and clears corrected errors at ${width}px`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 900 });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const state = await fixture(page); await registration(page);
  await expect(page.locator('#register-password-help')).toContainText('至少3个不同字符');
  await page.locator('#register-username').fill('中文 name');
  await page.locator('#register-name').fill('a'.repeat(51));
  await page.locator('#register-email-code').fill('12');
  await page.locator('#register-password').fill('Ab12!');
  await page.locator('#register-confirm-password').fill('different');
  await page.locator('#register-submit').click();
  await expect(page.locator('#register-username')).toBeFocused();
  await expect(page.locator('#register-username-error')).toContainText('4–32位英文字母');
  await expect(page.locator('#register-name-error')).toHaveText('昵称最多50个字符。');
  await expect(page.locator('#register-email-code-error')).toHaveText('邮箱验证码需要6位数字。');
  await expect(page.locator('#register-password-error')).toHaveText('密码需要6–16个字符。');
  await expect(page.locator('#register-confirm-password-error')).toHaveText('两次输入的密码不一致。');
  expect(state.registrations).toHaveLength(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath(`registration-errors-${width}.png`), fullPage: true });
  await page.locator('#register-username').fill('valid_user');
  await expect(page.locator('#register-username-error')).toBeHidden();
  await expect(page.locator('#register-username')).not.toHaveAttribute('aria-invalid');
  await expect(page.locator('#register-password')).toHaveAttribute('aria-invalid', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('new password checks cover weak values and Unicode lengths without applying the rule to login', async ({ page }) => {
  const state = await fixture(page); await registration(page);
  for (const value of ['Ab12!', 'Abcd1234Efgh56789', 'aaaaaa', 'ababab', '      ', 'passwordpassword']) {
    await page.locator('#register-password').fill(value); await page.locator('#register-confirm-password').fill(value);
    await page.locator('#register-submit').click();
    await expect(page.locator('#register-password')).toHaveAttribute('aria-invalid', 'true');
    expect(state.registrations).toHaveLength(0);
  }
  state.registrationError = { code: 'EMAIL_VERIFICATION_INVALID' };
  for (const value of ['abcdef', 'Abcd1234Efgh5678', '\uD83D\uDE00'.repeat(13) + 'Ab1']) {
    await page.locator('#register-password').fill(value); await page.locator('#register-confirm-password').fill(value);
    await page.locator('#register-submit').click();
    await expect.poll(() => state.registrations.at(-1)?.password).toBe(value);
    await expect(page.locator('#register-email-code')).toBeFocused();
  }
  await page.locator('#login-tab').click();
  await page.locator('#login-username').fill('valid_user');
  const legacy = 'Legacy-password-over-sixteen';
  await page.locator('#login-password').fill(legacy);
  await page.locator('#login-form button[type="submit"]').click();
  await expect(page.locator('#login-error')).toHaveText('用户名或密码不正确。');
  expect(state.logins[0].password).toBe(legacy);
});

test('confirmation errors update when either password changes and successful registration resets errors', async ({ page }) => {
  const state = await fixture(page); await registration(page);
  await page.locator('#register-confirm-password').fill('Abc124'); await page.locator('#register-submit').click();
  await expect(page.locator('#register-confirm-password')).toBeFocused();
  await page.locator('#register-confirm-password').fill('Abc123');
  await expect(page.locator('#register-confirm-password-error')).toBeHidden();
  await page.locator('#register-password').fill('Abc125');
  await expect(page.locator('#register-confirm-password-error')).toBeVisible();
  await page.locator('#register-confirm-password').fill('Abc125');
  await page.locator('[data-password-target="register-password"]').click();
  await expect(page.locator('#register-password')).toHaveAttribute('type', 'text');
  await page.locator('#register-submit').click();
  await expect(page.locator('#auth-notice')).toHaveText('注册成功，请登录。');
  expect(state.registrations).toHaveLength(1); expect(state.registrations[0]).not.toHaveProperty('confirmPassword');
  await expect(page.locator('#login-password')).toBeFocused();
  await expect(page.locator('#register-password')).toHaveValue('');
  await expect(page.locator('#register-password')).toHaveAttribute('type', 'password');
  expect(await page.locator('#auth-view [aria-invalid="true"]').count()).toBe(0);
});

test('server field details render safely, persist until edits and ignore credential enumeration details', async ({ page }) => {
  const state = await fixture(page); await registration(page);
  const message = '用户名格式不正确：<img src=x onerror="window.injected=true">';
  state.registrationError = { code: 'INVALID_PARAMETERS', details: [{ field: 'username', message }] };
  await page.locator('#register-submit').click();
  await expect(page.locator('#register-username-error')).toHaveText(message); await expect(page.locator('#register-username')).toBeFocused();
  await page.locator('#register-name').focus();
  await expect(page.locator('#register-username-error')).toHaveText(message);
  expect(await page.locator('#register-username-error img').count()).toBe(0); expect(await page.evaluate(() => window.injected)).toBeUndefined();
  await page.locator('#register-username').fill('updated_user'); await expect(page.locator('#register-username-error')).toBeHidden();
  await page.locator('#login-tab').click();
  await page.locator('#login-username').fill('!'); await page.locator('#login-password').fill('Abc123');
  await page.locator('#login-form button[type="submit"]').click(); await expect(page.locator('#login-username')).toBeFocused();
  expect(state.logins).toHaveLength(0);
  state.loginError.details = [{ field: 'username', message: 'This account does not exist' }];
  await page.locator('#login-username').fill('valid_user'); await page.locator('#login-form button[type="submit"]').click();
  await expect(page.locator('#login-error')).toHaveText('用户名或密码不正确。');
  await expect(page.locator('#login-username-error')).toBeHidden(); await expect(page.locator('#login-password-error')).toBeHidden();
});

test('invalid mail is explained without requests and changed mail invalidates the old verification', async ({ page }) => {
  const state = await fixture(page); await page.goto('/'); await page.locator('#register-tab').click();
  for (const value of ['', 'not-an-email', '用户@example.com']) {
    await page.locator('#register-email').fill(value); await page.locator('#send-email-code').click();
    await expect(page.locator('#register-email')).toBeFocused(); await expect(page.locator('#register-email-error')).toBeVisible();
    expect(state.sends).toBe(0); await expect(page.locator('#send-email-code')).toBeEnabled();
  }
  await page.locator('#register-email').fill('valid@example.com'); await page.locator('#send-email-code').click();
  await expect(page.locator('#register-submit')).toBeEnabled();
  await page.locator('#register-email-code').fill('123456'); await page.locator('#register-email').fill('changed@example.com');
  await expect(page.locator('#register-submit')).toBeDisabled(); await expect(page.locator('#register-email-code')).toHaveValue('');
});

test('password changes use the same field feedback and retain form values after a rejected current password', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 900 });
  const state = await fixture(page, true); await page.goto('/'); await page.locator('#header-account').click(); await page.locator('#account-security-tab').click();
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

test('closed registration remains disabled with an explicit explanation and login stays available', async ({ page }) => {
  const state = await fixture(page); state.registration = false; await page.goto('/');
  await expect(page.locator('#login-form button[type="submit"]')).toBeEnabled();
  await page.locator('#register-tab').click(); await expect(page.locator('#register-unavailable')).toHaveText('当前暂未开放注册。');
  await expect(page.locator('#send-email-code')).toBeDisabled(); await expect(page.locator('#register-submit')).toBeDisabled();
  expect(state.sends).toBe(0); expect(state.registrations).toHaveLength(0);
});
