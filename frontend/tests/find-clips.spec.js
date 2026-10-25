const { test, expect } = require('@playwright/test');
const { acceptCloudCalls, handleActionConfirmations } = require('./helpers/cloud-confirmation.cjs');
test.beforeEach(async ({ page }) => handleActionConfirmations(page));
test.beforeEach(async ({ page }) => acceptCloudCalls(page));
const { serveStatic } = require('./helpers/static.cjs');
test.beforeEach(async ({ page }) => { await serveStatic(page); });
const { selectTool } = require('./helpers/navigation.cjs');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

let directory, video;
test.beforeEach(({ page }) => { page.on('dialog', (dialog) => dialog.accept()); });
test.beforeAll(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'amw-find-e2e-'));
  const file = path.join(directory, 'preview.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'testsrc2=s=320x180:r=20:d=5', '-an',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-y', file], { timeout: 15000, stdio: 'ignore' });
  video = fs.readFileSync(file);
});
test.afterAll(() => {
  if (directory && path.dirname(path.resolve(directory)) === path.resolve(os.tmpdir())
      && path.basename(directory).startsWith('amw-find-e2e-')) fs.rmSync(directory, { recursive: true, force: true });
});

// Isolated API fixture and real local MP4 playback, not real cloud accuracy or billing verification.
async function fixture(page, { enabled = true, existing = true, preview = true, join = false } = {}) {
  const mediaId = '22222222-2222-4222-8222-222222222222', transcriptId = '66666666-6666-4666-8666-666666666666';
  const now = '2026-10-20T00:00:00Z';
  const segment = { id: '77777777-7777-4777-8777-777777777777', startMs: 1000, endMs: 2000,
    text: '<img src=x onerror="window.fixtureXss=true">产品使用限制。' };
  let transcript = { id: transcriptId, mediaId, version: 1, language: 'zh-CN', segments: [segment], originalSegments: [segment], createdAt: now, updatedAt: now };
  const calls = [], inputs = [];
  const media = { id: mediaId, originalFilename: '使用说明.mp4', sizeBytes: video.length, kind: 'VIDEO', status: 'READY',
    previewUrl: preview ? '/api/media/' + mediaId + '/preview' : null,
    metadata: { container: 'mp4', durationMs: 5000, width: 320, height: 180, videoCodec: 'h264', hasAudio: false, audioCodec: null }, createdAt: now, updatedAt: now };
  let empty = false, latestReads = 0;
  await page.route('**/api/**', async (route) => {
    const req = route.request(), url = new URL(req.url()), method = req.method(); calls.push(method + ' ' + url.pathname);
    const ok = (data) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 'SUCCESS', message: '成功', data, requestId: 'fixture', details: [] }) });
    if (url.pathname === '/api/system/capabilities') return ok({ registration: false, emailVerification: false, passwordRecovery: false,
      aiPlans: false, asr: false, semanticSearch: enabled, clipRecommendations: enabled, subtitleCorrection: false,
      mediaTool: true, maxUploadBytes: 1073741824, maxDurationMs: 900000, supportedOperations: ['transcode', 'trim', ...(join ? ['join_clips'] : [])], asrProviders: [] });
    if (url.pathname === '/api/auth/csrf') return ok({ token: 'fixture-csrf', headerName: 'X-CSRF-Token' });
    if (url.pathname === '/api/users/me') return ok({ id: '11111111-1111-4111-8111-111111111111', username: 'fixture', displayName: '片段测试', email: 'fixture@example.com', emailVerified: true, createdAt: now, updatedAt: now });
    if (url.pathname === '/api/media') return ok({ items: [media], page: 1, pageSize: 10, total: 1 });
    if (url.pathname === '/api/media/' + mediaId) return ok(media);
    if (url.pathname.endsWith('/preview')) return route.fulfill({ status: 200, contentType: 'video/mp4', body: video });
    if (url.pathname.endsWith('/transcript')) {
      latestReads++;
      if (!existing) return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ code: 'RESOURCE_NOT_FOUND', data: null, details: [] }) });
      return ok(transcript);
    }
    if (url.pathname.endsWith('/search') || url.pathname.endsWith('/clip-recommendations')) {
      expect(method).toBe('POST'); expect(req.headers()['x-csrf-token']).toBe('fixture-csrf');
      const input = req.postDataJSON(); inputs.push(input);
      expect(input.transcriptId).toBe(transcript.id); expect(input.transcriptVersion).toBe(transcript.version);
      const common = { mediaId, transcriptId: transcript.id, transcriptVersion: transcript.version };
      if (url.pathname.endsWith('/search')) return ok({ ...common, matches: empty ? [] : [{ startMs: 1000, endMs: 2000, score: 0.9, evidence: [segment] }], message: empty ? '未找到有字幕依据的相关内容。' : null });
      return ok({ ...common, clips: [{ title: '使用限制', reason: '说明了产品限制。', startMs: 1000, endMs: 2000, evidence: [segment] }], message: null });
    }
    if (url.pathname === '/api/operation-plans' || url.pathname === '/api/tasks') {
      expect(method).toBe('GET'); return ok({ items: [], page: 1, pageSize: 10, total: 0 });
    }
    throw new Error('Unexpected fixture request: ' + method + ' ' + url.pathname);
  });
  return { calls, inputs, setEmpty: () => { empty = true; }, version: (value) => { transcript = { ...transcript, version: value }; },
    replace: () => { transcript = { ...transcript, id: '88888888-8888-4888-8888-888888888888', version: 1 }; }, reads: () => latestReads };
}

async function open(page) {
  await page.goto('/'); await expect(page.locator('#media-status')).toHaveText('已就绪');
  await selectTool(page, 'find'); await expect(page.locator('#find-state')).toHaveText('字幕 v1');
  await page.locator('#find-query').fill('产品限制');
  await page.locator('#find-submit').click(); await expect(page.locator('#find-results > li')).toHaveCount(1);
}

test('saved subtitle evidence previews a real interval and is carried into explicit trim without starting a task', async ({ page }, testInfo) => {
  const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  const app = await fixture(page); await open(page);
  expect(app.inputs[0]).toMatchObject({ query: '产品限制', transcriptVersion: 1, limit: 10 });
  await expect(page.locator('#find-results blockquote')).toContainText('<img src=x');
  await expect(page.locator('#find-results img')).toHaveCount(0);
  expect(await page.evaluate(() => window.fixtureXss)).toBeUndefined();
  for (const viewport of [{ width: 1365, height: 1000 }, { width: 800, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('#find-section').scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath('find-' + viewport.width + '.png'), fullPage: true });
  }
  await page.getByRole('button', { name: '预览片段 1', exact: true }).click();
  const player = page.locator('#find-preview');
  await expect.poll(() => player.evaluate((node) => node.currentTime)).toBeGreaterThan(1.15);
  await expect.poll(() => player.evaluate((node) => node.paused)).toBe(true);
  const stopped = await player.evaluate((node) => node.currentTime); expect(stopped).toBeGreaterThanOrEqual(2); expect(stopped).toBeLessThan(2.5);
  await expect(page.locator('#find-preview-error')).toBeHidden();
  const reads = app.reads(); await page.getByRole('button', { name: '裁切片段 1', exact: true }).click();
  await expect(page.locator('#trim-start')).toHaveValue('1'); await expect(page.locator('#trim-end')).toHaveValue('2');
  await expect(page.locator('#start-conversion')).toBeEnabled(); expect(app.reads()).toBe(reads + 1);
  expect(app.calls.filter((value) => value.startsWith('POST /api/operation-plans') || value.startsWith('POST /api/tasks'))).toEqual([]);
  expect(await player.evaluate((node) => node.paused)).toBe(true); expect(errors).toEqual([]);
});

test('recommendations bind duration and version; edits, re-recognition and empty searches invalidate old results', async ({ page }) => {
  const app = await fixture(page); await open(page);
  app.version(2); await page.getByRole('button', { name: '裁切片段 1', exact: true }).click();
  await expect(page.locator('#find-error')).toContainText('字幕已变更'); await expect(page.locator('#find-results > li')).toHaveCount(0);
  await page.locator('#find-submit').click(); await expect(page.locator('#find-results > li')).toHaveCount(1);
  app.replace(); await page.getByRole('button', { name: '裁切片段 1', exact: true }).click();
  await expect(page.locator('#find-results > li')).toHaveCount(0);
  await page.locator('input[name="find-mode"][value="recommend"]').check();
  await expect(page.locator('#find-limit')).toHaveValue('3');
  await page.locator('#find-budget').fill('4'); await page.locator('#find-submit').click();
  await expect(page.locator('#find-results')).toContainText('使用限制');
  expect(app.inputs.at(-1)).toMatchObject({ transcriptVersion: 1, maxTotalDurationMs: 4000, limit: 3 });
  await page.locator('#find-query').fill('别的目标'); await expect(page.locator('#find-results > li')).toHaveCount(0);
  await expect(page.locator('#find-preview')).not.toHaveAttribute('src', /./);
  await page.locator('input[name="find-mode"][value="search"]').check(); app.setEmpty();
  await page.locator('#find-submit').click(); await expect(page.locator('#find-result-state')).toHaveText('未找到有字幕依据的相关内容。');
  await expect(page.locator('#find-results > li')).toHaveCount(0);
});

test('finding a clip adds its checked range to the ordered join editor without executing', async ({ page }) => {
  const app = await fixture(page, { join: true }); await open(page);
  await page.getByRole('button', { name: '加入拼接 1', exact: true }).click();
  await expect(page.locator('#join-section')).toBeVisible(); await expect(page.locator('#join-clips > li')).toHaveCount(1);
  await expect(page.locator('#join-clips input').first()).toHaveValue('1'); await expect(page.locator('#join-clips input').nth(1)).toHaveValue('2');
  expect(app.calls.filter((value) => value.startsWith('POST /api/operation-plans'))).toEqual([]);
});

test('missing credentials or subtitles close analysis and incompatible originals close only preview', async ({ page }) => {
  await fixture(page, { enabled: false }); await page.goto('/'); await expect(page.locator('#media-status')).toHaveText('已就绪');
  await selectTool(page, 'find'); await expect(page.locator('#find-state')).toHaveText('AI 服务尚未配置。');
  await expect(page.locator('#find-submit')).toBeDisabled();
  await page.unroute('**/api/**'); await fixture(page, { existing: false }); await page.reload();
  await expect(page.locator('#media-status')).toHaveText('已就绪'); await selectTool(page, 'find');
  await expect(page.locator('#find-state')).toHaveText('当前素材暂无字幕。'); await expect(page.locator('#find-submit')).toBeDisabled();
  await page.unroute('**/api/**'); await fixture(page, { preview: false }); await open(page);
  await expect(page.getByRole('button', { name: '预览片段 1', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '裁切片段 1', exact: true })).toBeEnabled();
});
