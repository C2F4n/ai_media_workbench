const { test, expect } = require('@playwright/test');
const { serveStatic } = require('./helpers/static.cjs');

async function fixture(page, signedIn = false) {
  await serveStatic(page);
  const state = { signedIn, logins: 0, assets: [] };
  const user = { id: '11111111-1111-4111-8111-111111111111', username: 'fixture_user', displayName: '测试用户', email: 'fixture@example.com', emailVerified: true, createdAt: '2026-10-24T00:00:00Z', updatedAt: '2026-10-24T00:00:00Z' };
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/assets/auth/')) state.assets.push(request.url()); });
  await page.route('**/api/**', route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    const reply = (data, status = 200, code = 'SUCCESS') => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ code, data, details: [] }) });
    if (path === '/api/auth/csrf') return reply({ token: 'fixture', headerName: 'X-CSRF-Token' });
    if (path === '/api/system/capabilities') return reply({ registration: true, mediaTool: false, supportedOperations: [], asrProviders: [], maxUploadBytes: 3221225472, maxDurationMs: 900000 });
    if (path === '/api/users/me') return state.signedIn ? reply(user) : reply(null, 401, 'UNAUTHENTICATED');
    if (path === '/api/users/me/cloud-credentials') return reply([]);
    if (path === '/api/auth/login') { state.logins++; state.signedIn = true; return reply({ user, csrfToken: 'fixture' }); }
    if (path === '/api/auth/logout') { state.signedIn = false; return reply(null); }
    if (request.method() === 'GET' && ['/api/media', '/api/tasks', '/api/operation-plans'].includes(path)) return reply({ items: [], page: 1, pageSize: 10, total: 0 });
    throw new Error('Unexpected fixture request: ' + path);
  });
  return state;
}

for (const width of [1920, 1365, 800, 390, 320]) test(`film photos render beside or above the auth forms without overlap at ${width}px`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 900 });
  await page.clock.install();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const state = await fixture(page); await page.goto('/'); await expect(page.locator('#auth-view')).toBeVisible();
  await expect.poll(() => page.locator('.auth-slide img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
  const gallery = await page.locator('#auth-gallery').boundingBox(), form = await page.locator('.auth-form-pane').boundingBox();
  await expect(page.locator('.app-header')).toBeHidden();
  expect(gallery.y).toBe(0);
  if (width > 900) expect(gallery.height).toBe(900);
  if (width > 900) expect(form.x).toBeGreaterThanOrEqual(gallery.x + gallery.width);
  else {
    expect(form.y).toBeGreaterThanOrEqual(gallery.y + gallery.height);
    expect(form.y).toBeLessThanOrEqual(gallery.y + gallery.height + 1);
  }
  await expect(page.locator('#auth-gallery')).toHaveText('');
  await expect(page.locator('#auth-gallery :is(button, a, figcaption)')).toHaveCount(0);
  const variation = await page.locator('.auth-slide img').first().evaluate(image => {
    const canvas = document.createElement('canvas'); canvas.width = 80; canvas.height = 60;
    const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0, 80, 60);
    const data = ctx.getImageData(0, 0, 80, 60).data;
    let min = 255, max = 0;
    for (let i = 0; i < data.length; i += 4) { min = Math.min(min, data[i]); max = Math.max(max, data[i]); }
    return max - min;
  });
  expect(variation).toBeGreaterThan(80);
  await page.screenshot({ path: testInfo.outputPath(`login-${width}.png`), fullPage: true, animations: 'disabled' });
  await page.clock.fastForward(6100);
  await expect(page.locator('#auth-gallery')).toHaveAttribute('data-slide', '1');
  await expect(page.locator('.auth-slide').nth(0)).toBeHidden();
  await page.locator('#register-tab').click(); await expect(page.locator('#register-panel')).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath(`register-${width}.png`), fullPage: true, animations: 'disabled' });
  expect(state.assets).toHaveLength(3);
  expect(state.assets.every(url => new URL(url).origin === new URL(page.url()).origin)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('automatic slides loop forward without controls, pause on hover and resume on leave', async ({ page }) => {
  await page.clock.install(); await fixture(page); await page.goto('/'); await expect(page.locator('#auth-view')).toBeVisible();
  await expect.poll(() => page.locator('.auth-slide img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
  await page.clock.fastForward(6100); await expect(page.locator('#auth-gallery')).toHaveAttribute('data-slide', '1');
  await page.clock.fastForward(6100); await expect(page.locator('#auth-gallery')).toHaveAttribute('data-slide', '2');
  await page.clock.fastForward(6100); await expect(page.locator('#auth-gallery')).toHaveAttribute('data-slide', '0');
  await expect(page.locator('.auth-slide:not([hidden])')).toHaveCount(1);
  await page.mouse.move(100, 100); await page.clock.fastForward(20000); await expect(page.locator('#auth-gallery')).toHaveAttribute('data-slide', '0');
  await page.mouse.move(1200, 100); await page.clock.fastForward(6100); await expect(page.locator('#auth-gallery')).toHaveAttribute('data-slide', '1');
  await expect(page.locator('#auth-gallery')).toHaveText('');
});

test('reduced motion shows a static photo and changing the preference stops an active transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.clock.install(); await fixture(page); await page.goto('/');
  await expect.poll(() => page.locator('.auth-slide img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
  await page.clock.fastForward(20000); await expect(page.locator('#auth-gallery')).toHaveAttribute('data-slide', '0');
  await page.evaluate(() => {
    window.galleryMotionEvents = 0;
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => window.galleryMotionEvents++);
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(() => page.evaluate(() => window.galleryMotionEvents)).toBe(1);
  await page.clock.fastForward(6100); await expect(page.locator('#auth-gallery')).toHaveAttribute('data-slide', '1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.evaluate(() => window.galleryMotionEvents)).toBe(2);
  await page.clock.fastForward(20000); await expect(page.locator('#auth-gallery')).toHaveAttribute('data-slide', '1');
  expect(await page.locator('#auth-gallery').evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  await expect(page.locator('.auth-slide:not([hidden])')).toHaveCount(1);
});

test('authenticated visits do not load photos, logout enables them and login stops hidden autoplay', async ({ page }) => {
  await page.clock.install(); const state = await fixture(page, true); await page.goto('/'); await expect(page.locator('#account-view')).toBeVisible();
  expect(state.assets).toHaveLength(0); expect(await page.locator('.auth-slide img[src]').count()).toBe(0);
  await page.locator('#header-logout').click(); await expect(page.locator('#auth-view')).toBeVisible();
  await expect.poll(() => state.assets.length).toBe(3);
  await page.locator('#login-username').fill('fixture_user'); await page.locator('#login-password').fill('Abc123');
  await page.locator('#login-form button[type="submit"]').click(); await expect(page.locator('#account-view')).toBeVisible();
  const index = await page.locator('#auth-gallery').getAttribute('data-slide'); await page.clock.fastForward(20000);
  await expect(page.locator('#auth-gallery')).toHaveAttribute('data-slide', index); expect(state.logins).toBe(1);
  expect(await page.locator('#auth-gallery').evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
});

test('a failed photo uses a text-free fallback without blocking login', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await fixture(page); await page.route('**/assets/auth/studio-desk.webp', route => route.fulfill({ status: 404, body: '' }));
  await page.goto('/'); await expect(page.locator('.auth-slide').first().locator('.auth-image-fallback')).toBeVisible();
  await expect(page.locator('#auth-gallery')).toHaveText('');
  await page.locator('#login-username').fill('fixture_user'); await page.locator('#login-password').fill('Abc123');
  await page.locator('#login-form button[type="submit"]').click(); await expect(page.locator('#account-view')).toBeVisible();
  expect(errors).toEqual([]);
});

for (const width of [1365, 390]) test(`auth theme switches without losing drafts and persists at ${width}px`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await fixture(page); await page.goto('/'); await expect(page.locator('#auth-view')).toBeVisible();
  await expect.poll(() => page.locator('.auth-slide img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
  const toggle = page.locator('#auth-theme-toggle');
  await expect(toggle).toHaveAccessibleName('切换到暗色模式');
  const box = await toggle.boundingBox();
  expect(box.x + box.width).toBeLessThanOrEqual(width - 12); expect(box.y).toBeLessThanOrEqual(20);
  await page.locator('#login-username').fill('fixture_user');
  await page.locator('#login-password').fill('Abc123');
  await page.screenshot({ path: testInfo.outputPath(`theme-light-${width}.png`), fullPage: true });
  await toggle.click(); await expect(page.locator('#auth-view')).toHaveAttribute('data-theme', 'dark');
  await expect(toggle).toHaveAccessibleName('切换到亮色模式'); await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#auth-view')).toHaveCSS('background-color', 'rgb(27, 29, 33)');
  await expect(page.locator('#login-username')).toHaveCSS('background-color', 'rgb(38, 42, 47)');
  await expect(page.locator('#login-password')).toHaveValue('Abc123');
  await page.locator('[data-password-target="login-password"]').click();
  await expect(page.locator('#login-password')).toHaveAttribute('type', 'text');
  await page.screenshot({ path: testInfo.outputPath(`theme-dark-${width}.png`), fullPage: true });
  await page.locator('#register-tab').click(); await expect(page.locator('#auth-view')).toHaveAttribute('data-theme', 'dark');
  await page.locator('#register-username').fill('!'); await page.locator('#register-email').focus();
  await expect(page.locator('#register-username')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#register-username')).toHaveCSS('background-color', 'rgb(52, 35, 41)');
  await page.screenshot({ path: testInfo.outputPath(`register-dark-${width}.png`), fullPage: true });
  await page.locator('#login-tab').click(); await expect(page.locator('#login-username')).toHaveValue('fixture_user');
  expect(await page.evaluate(() => localStorage.getItem('amw-auth-theme'))).toBe('dark');
  await page.reload(); await expect(page.locator('#auth-view')).toBeVisible();
  await expect(page.locator('#auth-view')).toHaveAttribute('data-theme', 'dark');
  await toggle.click(); await expect(page.locator('#auth-view')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('#login-username')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('system theme is the default until a manual preference is saved', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' }); await fixture(page); await page.goto('/');
  await expect(page.locator('#auth-view')).toBeVisible(); await expect(page.locator('#auth-view')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' }); await expect(page.locator('#auth-view')).toHaveAttribute('data-theme', 'light');
  await page.locator('#auth-theme-toggle').click(); await page.emulateMedia({ colorScheme: 'dark' });
  await page.emulateMedia({ colorScheme: 'light' }); await expect(page.locator('#auth-view')).toHaveAttribute('data-theme', 'dark');
});

test('theme switching still works when browser storage is disabled', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage disabled'); } }); });
  await fixture(page); await page.goto('/'); await expect(page.locator('#auth-view')).toBeVisible();
  await page.locator('#auth-theme-toggle').click(); await expect(page.locator('#auth-view')).toHaveAttribute('data-theme', 'dark');
  await page.locator('#auth-theme-toggle').click(); await expect(page.locator('#auth-view')).toHaveAttribute('data-theme', 'light');
  expect(errors).toEqual([]);
});

test('dark auth does not change workbench navigation or prevent toggling during login', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' }); await fixture(page); await page.goto('/');
  await expect(page.locator('#auth-view')).toBeVisible(); await page.locator('#auth-theme-toggle').click();
  let releaseLogin;
  const pending = new Promise(resolve => { releaseLogin = resolve; });
  await page.route('**/api/auth/login', async route => { await pending; await route.fallback(); });
  await page.locator('#login-username').fill('fixture_user'); await page.locator('#login-password').fill('Abc123');
  await page.locator('#login-form button[type="submit"]').click();
  await expect(page.locator('#login-username')).toBeDisabled(); await expect(page.locator('#auth-theme-toggle')).toBeEnabled();
  await page.locator('#auth-theme-toggle').click(); await page.locator('#auth-theme-toggle').click();
  releaseLogin(); await expect(page.locator('#account-view')).toBeVisible();
  await expect(page.locator('.app-header')).toBeVisible(); await expect(page.locator('#auth-theme-toggle')).toBeHidden();
  await expect(page.locator('.app-header')).toHaveCSS('background-color', 'rgb(237, 242, 252)');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'normal');
  await page.locator('#header-logout').click(); await expect(page.locator('#auth-view')).toBeVisible();
  await expect(page.locator('.app-header')).toBeHidden(); await expect(page.locator('#auth-view')).toHaveAttribute('data-theme', 'dark');
});

for (const [width, height] of [[1920, 900], [1365, 900], [800, 900], [390, 844], [320, 568], [844, 390]]) {
  test(`auth headings stay anchored while only the form slides and scrolls at ${width}x${height}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height }); await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await fixture(page); await page.goto('/'); await expect(page.locator('#auth-view')).toBeVisible();
    await expect.poll(() => page.locator('.auth-slide img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
    await page.locator('#login-username').fill('draft_user');
    const title = await page.locator('.auth-title').boundingBox(), tabs = await page.locator('#auth-view .tabs').boundingBox();
    const checkAnchors = async () => {
      expect(await page.locator('.auth-title').boundingBox()).toEqual(title);
      expect(await page.locator('#auth-view .tabs').boundingBox()).toEqual(tabs);
      expect(await page.evaluate(() => scrollY)).toBe(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    };
    const switchWithAnimation = async mode => page.evaluate(mode => {
      document.getElementById(mode + '-tab').click();
      const panel = document.getElementById(mode + '-panel'), animations = panel.getAnimations();
      const frames = animations[0]?.effect.getKeyframes();
      animations.forEach(animation => animation.pause());
      return frames;
    }, mode);
    const finishAnimation = async mode => {
      await page.locator('#' + mode + '-panel').evaluate(panel => panel.getAnimations().forEach(animation => animation.finish()));
      await expect.poll(() => page.locator('#' + mode + '-panel').evaluate(panel => panel.getAnimations().length)).toBe(0);
    };
    const registerFrames = await switchWithAnimation('register');
    expect(registerFrames[0].transform).toBe('translateX(24px)'); expect(registerFrames[1].opacity).toBe('1');
    await expect(page.locator('#login-panel')).toBeHidden(); await expect(page.locator('#login-panel')).toHaveAttribute('inert', '');
    await checkAnchors(); await finishAnimation('register'); await checkAnchors();
    await page.locator('#register-name').fill('registration draft');
    await page.locator('#register-confirm-password').scrollIntoViewIfNeeded();
    await expect(page.locator('#register-confirm-password')).toBeInViewport();
    expect(await page.locator('#auth-form-scroll').evaluate(element => element.scrollTop)).toBeGreaterThan(0);
    await checkAnchors();
    await page.locator('#register-username').fill('!'); await page.locator('#register-email').focus();
    await expect(page.locator('#register-username')).toHaveAttribute('aria-invalid', 'true'); await checkAnchors();
    await page.screenshot({ path: testInfo.outputPath(`anchored-register-${width}x${height}.png`), fullPage: true, animations: 'disabled' });
    const loginFrames = await switchWithAnimation('login'); expect(loginFrames[0].transform).toBe('translateX(-24px)');
    await checkAnchors(); await finishAnimation('login');
    expect(await page.locator('#auth-form-scroll').evaluate(element => element.scrollTop)).toBe(0);
    await expect(page.locator('#login-username')).toHaveValue('draft_user');
    await page.locator('#login-tab').focus(); await page.keyboard.press('ArrowRight');
    await expect(page.locator('#register-tab')).toBeFocused(); await expect(page.locator('#register-tab')).toHaveAttribute('tabindex', '0');
    await finishAnimation('register'); await expect(page.locator('#register-name')).toHaveValue('registration draft'); await checkAnchors();
    await page.screenshot({ path: testInfo.outputPath(`anchored-register-top-${width}x${height}.png`), fullPage: true, animations: 'disabled' });
    expect(errors).toEqual([]);
  });
}

test('rapid auth switches cancel old animations and reduced motion disables form and indicator animation', async ({ page }) => {
  await fixture(page); await page.goto('/'); await expect(page.locator('#auth-view')).toBeVisible();
  await page.evaluate(() => {
    for (let index = 0; index < 15; index++) document.getElementById(index % 2 ? 'login-tab' : 'register-tab').click();
  });
  await expect(page.locator('#auth-view')).toHaveAttribute('data-mode', 'register');
  await expect(page.locator('#register-panel')).toBeVisible(); await expect(page.locator('#login-panel')).toBeHidden();
  await expect.poll(() => page.locator('#register-panel').evaluate(panel => panel.getAnimations().length)).toBe(0);
  await page.locator('#register-tab').click(); expect(await page.locator('#register-panel').evaluate(panel => panel.getAnimations().length)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  await page.locator('#login-tab').click();
  expect(await page.locator('#login-panel').evaluate(panel => panel.getAnimations().length)).toBe(0);
  expect(await page.locator('#auth-view .tabs').evaluate(element => getComputedStyle(element, '::after').transitionDuration)).toBe('0s');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(false);
  await page.evaluate(() => { document.getElementById('register-tab').click(); document.getElementById('register-panel').getAnimations().forEach(animation => animation.pause()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.locator('#register-panel').evaluate(panel => panel.getAnimations().length)).toBe(0);
  await expect(page.locator('#register-panel')).toBeVisible();
});
