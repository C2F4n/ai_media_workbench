const { test, expect } = require('@playwright/test');
const { serveStatic } = require('./helpers/static.cjs');

test.beforeEach(async ({ page }) => { await serveStatic(page); });

async function workspace(page) {
  const now = '2026-10-21T00:00:00Z';
  await page.route('**/api/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    const data = path === '/api/auth/csrf' ? { token: 'fixture-csrf', headerName: 'X-CSRF-Token' }
      : path === '/api/system/capabilities' ? { registration: false, mediaTool: true, aiPlans: true, asr: true,
        semanticSearch: true, clipRecommendations: true, subtitleCorrection: false, asrProviders: ['tencent', 'aliyun'],
        supportedOperations: ['transcode', 'compress', 'trim', 'mute', 'join_clips', 'extract_audio', 'burn_subtitles', 'export'],
        exportFormats: ['mp4', 'webm', 'mp3'], exportVideoCodecs: ['h264', 'vp9'], maxUploadBytes: 1073741824, maxDurationMs: 900000 }
      : path === '/api/users/me' ? { id: '11111111-1111-4111-8111-111111111111', username: 'fixture', displayName: '导航测试', email: 'fixture@example.com', emailVerified: true, createdAt: now, updatedAt: now }
      : path === '/api/users/me/cloud-credentials' ? []
      : { items: [], page: 1, pageSize: 10, total: 0 };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 'SUCCESS', data, details: [] }) });
  });
  await page.goto('/'); await expect(page.locator('#workbench-panel')).toBeVisible();
}

test('vertical navigation labels API dependencies, slides in both directions and remembers docking', async ({ page }, testInfo) => {
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await workspace(page);
  const positions = await page.locator('.tool-choice').evaluateAll((items) => items.map((e) => ({ x: e.getBoundingClientRect().x, y: e.getBoundingClientRect().y })));
  expect(new Set(positions.map((p) => p.x)).size).toBe(1);
  expect(positions.every((p, i) => !i || p.y > positions[i - 1].y)).toBe(true);
  await expect(page.locator('#dependency-services')).toContainText('本机 ffprobe');
  await expect(page.locator('#dependency-services')).toContainText('不需要 API Key');
  await page.evaluate(() => {
    window.slideFrames = []; const stage = document.getElementById('tool-stage'), original = stage.animate.bind(stage);
    stage.animate = (frames, options) => { window.slideFrames.push(frames[0].transform); return original(frames, options); };
  });
  await page.locator('#convert-tool').click(); await page.locator('#detect-tool').click();
  expect(await page.evaluate(() => window.slideFrames)).toEqual(['translateY(18px)', 'translateY(-18px)']);
  await page.locator('#subtitle-tool').click(); await expect(page.locator('#dependency-services')).toContainText('腾讯云');
  await expect(page.locator('#dependency-services')).toContainText('未配置');
  await page.locator('#asr-provider').selectOption('aliyun'); await expect(page.locator('#dependency-services')).toContainText('Paraformer');
  await expect(page.locator('#dependency-services')).toContainText('DeepSeek'); await expect(page.locator('#dependency-services')).toContainText('编辑 / SRT');
  await page.locator('#ai-tool').click(); await expect(page.locator('#dependency-kind')).toHaveText('云端 API');
  await expect(page.locator('#dependency-detail')).toContainText('不上传原视频');
  await expect.poll(async () => page.evaluate(() => Math.abs(document.getElementById('tool-indicator').getBoundingClientRect().top - document.getElementById('ai-tool').getBoundingClientRect().top))).toBeLessThan(1);
  await page.locator('#toggle-sidebar').click(); await expect(page.locator('#tool-sidebar')).not.toBeVisible();
  await page.reload(); await expect(page.locator('#toggle-sidebar')).toHaveAttribute('aria-expanded', 'false');
  await page.locator('#toggle-sidebar').click(); await page.locator('#pin-sidebar').click();
  await expect(page.locator('#sidebar-backdrop')).toBeVisible(); expect(await page.locator('#tool-content').evaluate((e) => e.inert)).toBe(true);
  await page.locator('#trim-tool').click(); await expect(page.locator('#sidebar-backdrop')).toBeHidden();
  await expect(page.locator('#dependency-title')).toHaveText('视频裁切'); await expect(page.locator('#toggle-sidebar')).toBeFocused();
  await page.locator('#toggle-sidebar').click(); await page.locator('#pin-sidebar').click();
  await expect(page.locator('#sidebar-backdrop')).toBeHidden(); await expect(page.locator('#pin-sidebar')).toHaveAttribute('aria-pressed', 'true');
  for (const width of [1365, 1001]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('sidebar-desktop-' + width + '.png'), fullPage: true });
  }
  expect(errors).toEqual([]);
});

test('mobile drawer closes on selection, backdrop or Escape and links to cloud configuration', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 }); await workspace(page);
  await expect(page.locator('#toggle-sidebar')).toHaveAttribute('aria-expanded', 'false');
  await page.locator('#toggle-sidebar').click(); await expect(page.locator('#tool-sidebar')).toHaveAttribute('aria-modal', 'true');
  await expect(page.locator('#detect-tool')).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath('sidebar-mobile-open.png'), fullPage: true });
  await page.locator('#find-tool').click(); await expect(page.locator('#toggle-sidebar')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#dependency-services')).toContainText('DeepSeek');
  await page.locator('#dependency-settings').click(); await expect(page.locator('#account-panel')).toBeVisible();
  await expect(page.locator('#cloud-section')).toBeInViewport();
  await page.locator('#back-workbench').click(); await expect(page.locator('#dependency-title')).toHaveText('找片段');
  await page.locator('#toggle-sidebar').click(); await page.keyboard.press('Escape'); await expect(page.locator('#toggle-sidebar')).toBeFocused();
  await page.locator('#toggle-sidebar').click(); await page.locator('#sidebar-backdrop').click({ position: { x: 378, y: 240 } });
  await expect(page.locator('#sidebar-backdrop')).toBeHidden();
  for (const width of [800, 390]) {
    await page.setViewportSize({ width, height: 844 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('sidebar-closed-' + width + '.png'), fullPage: true });
  }
});

test('reduced motion preference disables the tool slide animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await workspace(page);
  await page.locator('#convert-tool').click(); await page.locator('#subtitle-tool').click();
  expect(await page.locator('#tool-stage').evaluate((e) => e.getAnimations().length)).toBe(0);
  expect(await page.locator('#tool-indicator').evaluate((e) => e.getAnimations().length)).toBe(0);
});
