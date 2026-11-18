const { test, expect } = require('@playwright/test');
const { serveStatic } = require('./helpers/static.cjs');

async function showLanding(page, { registration = true } = {}) {
  const state = { logins: [], registrations: [], sentTo: [], sendCode: null, loginResponse: null };
  const user = {
    id: '11111111-1111-4111-8111-111111111111', username: 'demo_user', displayName: '测试用户',
    email: 'owner@example.com', emailVerified: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
  const challenge = { challengeId: '22222222-2222-4222-8222-222222222222', expiresAt: new Date(Date.now() + 600_000).toISOString() };
  await serveStatic(page);
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    const reply = (data, status = 200, code = 'SUCCESS') => route.fulfill({ status, json: { code, data } });
    if (path === '/api/auth/csrf') return reply({ token: 'landing-token' });
    if (path === '/api/users/me') return state.loginResponse ? reply(user) : reply(null, 401, 'UNAUTHENTICATED');
    if (path === '/api/system/capabilities') return reply({ registration });
    if (path === '/api/auth/login') {
      const data = route.request().postDataJSON();
      state.logins.push(data);
      return state.loginResponse ? reply({ user, csrfToken: 'rotated-token' }) : reply(null, 401, 'INVALID_CREDENTIALS');
    }
    if (path === '/api/auth/registration-email-code') {
      const { email } = route.request().postDataJSON();
      state.sentTo.push(email);
      const status = await state.sendCode?.(email);
      return status === 503 ? reply(null, 503, 'EMAIL_DELIVERY_UNAVAILABLE') : reply(challenge);
    }
    if (path === '/api/auth/register') {
      state.registrations.push(route.request().postDataJSON());
      return reply(user, 201);
    }
    if (path === '/api/users/me/cloud-credentials') return reply([]);
    return reply({ items: [], page: 1, pageSize: 10, total: 0 });
  });
  await page.goto('/');
  await expect(page.locator('#auth-view')).toBeVisible();
  return state;
}

test('the landing page has independent tabs and remembers the theme divider', async ({ page }) => {
  await showLanding(page);
  await expect(page.locator('.auth-typewriter')).toHaveAccessibleName('通向剪辑的道路从这里开始。注册，登录，然后开始使用。');
  const matrix = page.locator('.auth-matrix-trail');
  const screen = page.locator('.auth-phone-screen');
  const matrixHasInk = () => matrix.evaluate(canvas => {
    const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    return data.some((channel, index) => index % 4 === 3 && channel > 0);
  });
  await expect(page.locator('.auth-phone-screen .auth-dock-button')).toHaveCount(4);
  await expect(page.locator('#home-tab')).toHaveAttribute('aria-selected', 'true');
  await expect(matrix).toBeVisible();
  await page.locator('#login-tab').click();
  await expect(page.locator('#login-username')).toBeVisible();
  await expect(matrix).toBeVisible();
  await expect.poll(matrixHasInk).toBe(true);
  await expect(screen).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('#login-username')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#register-email')).toBeVisible();
  await expect(matrix).toBeVisible();
  await expect.poll(matrixHasInk).toBe(true);
  await expect(screen).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('#login-panel')).toBeHidden();
  await page.getByRole('button', { name: '返回主界面' }).click();
  await expect(page.locator('#home-tab')).toBeFocused();
  await expect(matrix).toBeVisible();
  await expect(page.locator('#auth-scene')).toHaveCount(0);
  const slider = page.getByRole('slider', { name: '登录页主题' });
  await expect(slider).toHaveAttribute('aria-valuenow', '100');
  await slider.focus();
  await page.keyboard.press('ArrowLeft');
  await page.reload();
  await expect(slider).toHaveAttribute('aria-valuenow', '95');
});

test('the desktop phone wordmark tilts toward the pointer and returns to its resting position', async ({ page }) => {
  await showLanding(page);
  await expect(page).toHaveTitle('FrameFlow');
  const wordmark = page.getByRole('heading', { name: 'FrameFlow', exact: true });
  const area = page.locator('.auth-wordmark-stage');
  const transform = () => wordmark.evaluate(heading => getComputedStyle(heading).transform);
  const resting = await transform();
  const bounds = await area.boundingBox();
  await page.mouse.move(bounds.x + bounds.width * .82, bounds.y + bounds.height * .25);
  await expect.poll(transform).not.toBe(resting);
  await page.mouse.move(8, 8);
  await expect.poll(transform).toBe(resting);
  await page.locator('#login-tab').click();
  await expect(wordmark).toHaveCount(0);
});

test('the dark cube scene follows the theme divider and pauses when animation is unnecessary', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('amw-auth-theme-split', '0'));
  await showLanding(page);
  const scene = page.locator('.auth-dark-cubes');
  await expect(scene).toHaveAttribute('data-renderer', /ready|fallback/, { timeout: 12000 });
  const renderer = await scene.getAttribute('data-renderer');
  const slider = page.getByRole('slider', { name: '登录页主题' });
  if (renderer === 'ready') await expect(scene).toHaveAttribute('data-running', 'true');
  await slider.focus();
  await page.keyboard.press('End');
  await expect(scene).toHaveAttribute('data-running', 'false');
  await page.keyboard.press('Home');
  if (renderer === 'ready') await expect(scene).toHaveAttribute('data-running', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(scene).toHaveAttribute('data-running', 'false');
  await page.locator('#login-tab').click();
  await page.locator('#login-username').fill('demo_user');
  await expect(page.locator('#login-username')).toHaveValue('demo_user');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  if (renderer === 'ready') await expect(scene).toHaveAttribute('data-running', 'true');
  await page.setViewportSize({ width: 390, height: 750 });
  await expect(scene).toHaveCount(0);
});

test('desktop background pointer listeners do not accumulate after mobile layout round trips', async ({ page }) => {
  await page.addInitScript(() => {
    const listeners = new Set();
    const add = window.addEventListener;
    const remove = window.removeEventListener;
    window.activePointerListeners = () => listeners.size;
    window.addEventListener = function(type, listener, options) {
      if (type === 'pointermove') listeners.add(listener);
      return add.call(this, type, listener, options);
    };
    window.removeEventListener = function(type, listener, options) {
      if (type === 'pointermove') listeners.delete(listener);
      return remove.call(this, type, listener, options);
    };
  });
  await showLanding(page);
  await expect(page.locator('.auth-cubes-grid')).toHaveCount(1);
  const desktop = await page.evaluate(() => window.activePointerListeners());
  for (let index = 0; index < 2; index++) {
    await page.setViewportSize({ width: 390, height: 750 });
    await expect(page.locator('.auth-cubes-grid')).toHaveCount(0);
    expect(await page.evaluate(() => window.activePointerListeners())).toBeLessThan(desktop);
    await page.setViewportSize({ width: 1365, height: 900 });
    await expect(page.locator('.auth-cubes-grid')).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => window.activePointerListeners())).toBe(desktop);
  }
});

test('desktop virtual keys type into a phone input and stop repeating delete when released', async ({ page }) => {
  await showLanding(page);
  const input = page.locator('#login-username');
  const trigger = page.getByRole('button', { name: '键盘', exact: true });
  await trigger.click();
  await expect(input).toBeFocused();
  const keyboard = page.getByRole('region', { name: '虚拟键盘' });
  const key = name => keyboard.getByRole('button', { name, exact: true });
  await key('Shift').first().click();
  await key('A').click();
  await key('b').click();
  await expect(input).toHaveValue('Ab');
  await key('退格').click();
  await expect(input).toHaveValue('A');

  await input.fill('abcdefghijklmnopqrstuvwxyz');
  const bounds = await key('退格').boundingBox();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  try {
    await expect.poll(async () => (await input.inputValue()).length).toBeLessThan(24);
  } finally {
    await page.mouse.up();
  }
  const value = await input.inputValue();
  await page.waitForTimeout(150);
  await expect(input).toHaveValue(value);
  await page.mouse.click(7, 7);
  await expect(keyboard).toBeHidden();
});

test('keyboard uses the local sound sprite and mute prevents new playback', async ({ page }) => {
  await page.addInitScript(() => {
    window.keyboardCues = [];
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...args) {
      window.keyboardCues.push(args);
      return start.apply(this, args);
    };
  });
  await showLanding(page);
  const audioResponse = page.waitForResponse('**/assets/auth/keyboard/sound.ogg');
  await page.getByRole('button', { name: '键盘', exact: true }).click();
  expect((await audioResponse).status()).toBe(200);
  const keyboard = page.getByRole('region', { name: '虚拟键盘' });
  const key = keyboard.getByRole('button', { name: 'a', exact: true });
  await expect.poll(async () => {
    await key.click();
    return page.evaluate(() => window.keyboardCues.length);
  }).toBeGreaterThan(0);
  const timings = await page.evaluate(async () => (await (await fetch('/assets/auth/keyboard/config.json')).json()).defines['30']);
  const firstCue = await page.evaluate(() => window.keyboardCues[0]);
  expect(firstCue[1]).toBeCloseTo(timings[0] / 1000, 3);
  const mute = keyboard.getByRole('button', { name: '键盘音效' });
  await mute.click();
  await expect(mute).toHaveAttribute('aria-pressed', 'false');
  const count = await page.evaluate(() => window.keyboardCues.length);
  await key.click();
  expect(await page.evaluate(() => window.keyboardCues.length)).toBe(count);
});

test('touch layout shows only phone content and focuses the native keyboard target', async ({ browser }, testInfo) => {
  const page = await browser.newPage({
    baseURL: testInfo.project.use.baseURL, viewport: { width: 390, height: 750 }, isMobile: true, hasTouch: true,
  });
  try {
    await showLanding(page);
    const auth = page.locator('#auth-view');
    await expect(auth).toHaveClass(/auth-phone-only/);
    await expect(auth.locator('.auth-intro, .auth-cubes-grid, .auth-dark-cubes, .auth-gallery, .auth-corner-welcome')).toHaveCount(0);
    await expect(auth.getByRole('heading', { name: 'FrameFlow' })).toBeVisible();
    await expect(auth.locator('#auth-theme-toggle')).toBeHidden();
    const phone = auth.locator('.auth-phone');
    await expect(phone).toHaveCSS('width', '390px');
    await expect(phone).toHaveCSS('border-top-width', '0px');
    const input = page.locator('#login-username');
    await page.getByRole('button', { name: '键盘', exact: true }).tap();
    await expect(input).toBeFocused();
    await expect(page.getByRole('region', { name: '虚拟键盘' })).toHaveCount(0);
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(auth).toHaveClass(/auth-phone-only/);
    await expect(phone).toHaveCSS('width', '844px');
    await expect(input).toBeFocused();
    await page.locator('#register-tab').tap();
    await expect(page.locator('#register-email')).toBeVisible();
  } finally {
    await page.close();
  }
});

test('login validates fields, submits rememberMe, and opens the workbench on success', async ({ page }) => {
  const state = await showLanding(page);
  await page.locator('#login-tab').click();
  const submit = page.locator('#login-form button[type=submit]');
  const username = page.locator('#login-username');
  const password = page.locator('#login-password');
  await submit.click();
  await expect(username).toBeFocused();
  await expect(page.locator('#login-username-error')).toHaveText('请输入用户名。');
  await username.fill('demo_user');
  await password.fill('DemoPwd123!');
  await page.getByLabel('保持登录').check();
  await submit.click();
  const loginError = page.locator('#login-form [role=alert]');
  await expect(loginError).toHaveText('用户名或密码不正确。');
  await expect(loginError).toHaveCSS('font-family', await password.evaluate(input => getComputedStyle(input).fontFamily));
  await expect(loginError).toHaveCSS('font-size', '13px');
  await expect(password).toBeFocused();
  state.loginResponse = true;
  await submit.click();
  await expect(page.locator('#account-view')).toBeVisible();
  await expect(password).toHaveValue('');
  expect(state.logins).toEqual(Array(2).fill({ username: 'demo_user', password: 'DemoPwd123!', rememberMe: true }));
});

test('registration retries a mail failure and uses the challenge to register and return to login', async ({ page }) => {
  const state = await showLanding(page);
  await page.locator('#register-tab').click();
  const send = page.getByRole('button', { name: '发送验证码', exact: true });
  await page.locator('#register-username').fill('demo_user');
  await page.locator('#register-email').fill('OWNER@example.com');
  state.sendCode = () => state.sentTo.length === 1 ? 503 : 200;
  await send.click();
  await expect(page.locator('#register-form [role=alert]')).toHaveText('验证邮件暂时无法发送，请稍后重试。');
  await expect(send).toBeEnabled();
  await send.click();
  await expect(page.locator('#register-code')).toBeFocused();
  await expect(page.locator('#send-email-code')).toBeDisabled();
  await page.locator('#register-code').fill('123456');
  await page.locator('#register-password').fill('DemoPwd123!');
  await page.locator('#register-confirmation').fill('DemoPwd123!');
  await page.locator('#register-form button[type=submit]').click();
  await expect(page.locator('#login-panel [role=status]')).toHaveText('注册成功，请登录。');
  await expect(page.locator('#login-username')).toHaveValue('demo_user');
  expect(state.sentTo).toEqual(['owner@example.com', 'owner@example.com']);
  expect(state.registrations).toEqual([{
    username: 'demo_user', email: 'owner@example.com', password: 'DemoPwd123!', emailCode: '123456',
    emailChallengeId: '22222222-2222-4222-8222-222222222222'
  }]);
});

test('registration can be closed while the login form stays available', async ({ page }) => {
  await showLanding(page, { registration: false });
  await page.locator('#register-tab').click();
  await expect(page.locator('#register-panel')).toHaveText(/当前暂未开放注册/);
  await expect(page.locator('#register-form')).toHaveCount(0);
  await page.locator('#login-tab').click();
  await expect(page.locator('#login-form')).toBeVisible();
});

test('an email changed during delivery cannot use the late challenge', async ({ page }) => {
  const state = await showLanding(page);
  let release;
  const delivery = new Promise(resolve => { release = resolve; });
  state.sendCode = () => delivery;
  await page.locator('#register-tab').click();
  await page.locator('#register-email').fill('old@example.com');
  await page.locator('#send-email-code').click();
  await expect(page.locator('#send-email-code')).toHaveText('发送中…');
  await page.locator('#register-email').fill('new@example.com');
  release(200);
  await expect(page.locator('#send-email-code')).toBeEnabled();
  await expect(page.locator('#register-form [role=status]')).toHaveCount(0);
  await page.locator('#register-code').fill('123456');
  await page.locator('#register-form button[type=submit]').click();
  await expect(page.locator('#register-code-error')).toHaveText('请先获取当前邮箱的验证码。');
  expect(state.registrations).toHaveLength(0);
});
