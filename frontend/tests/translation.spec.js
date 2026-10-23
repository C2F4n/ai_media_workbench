const { test, expect } = require('@playwright/test');
const { serveStatic } = require('./helpers/static.cjs');
const { selectTool } = require('./helpers/navigation.cjs');
const fs = require('node:fs');

test.beforeEach(async ({ page }) => { await serveStatic(page); });

// 所有云端和业务API均使用替身，不写开发数据库或调用真实模型。
async function fixture(page, { count = 2, enabled = true, failBatch = 0, holdFirst = false, textLength = 0 } = {}) {
  const mediaId = '22222222-2222-4222-8222-222222222222', transcriptId = '66666666-6666-4666-8666-666666666666';
  const now = '2026-10-23T00:00:00Z';
  const original = Array.from({ length: count }, (_, index) => ({ id: `77777777-7777-4777-8777-${String(index + 1).padStart(12, '0')}`,
    startMs: index * 150, endMs: index * 150 + 100, text: textLength ? '字'.repeat(textLength) : `原文${index + 1}。` }));
  const versions = new Map([[1, structuredClone(original)]]), calls = [], patches = [], burns = [];
  let release; const gate = new Promise(resolve => { release = resolve; }); let task = null;
  const latestVersion = () => Math.max(...versions.keys());
  const transcript = version => ({ id: transcriptId, mediaId, version, language: 'zh-CN', segments: versions.get(version), originalSegments: original, createdAt: now, updatedAt: now });
  const media = { id: mediaId, originalFilename: '翻译测试.mp4', kind: 'VIDEO', status: 'READY', sizeBytes: 123, previewUrl: null,
    metadata: { container: 'mp4', durationMs: 10000, width: 320, height: 180, videoCodec: 'h264', hasAudio: false, audioCodec: null }, createdAt: now, updatedAt: now };
  await page.route('**/api/**', async route => {
    const request = route.request(), url = new URL(request.url()), method = request.method();
    const ok = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ code: 'SUCCESS', data, details: [] }) });
    const error = (code, status) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ code, data: null, details: [] }) });
    if (url.pathname === '/api/auth/csrf') return ok({ token: 'fixture-csrf' });
    if (url.pathname === '/api/users/me') return ok({ id: '11111111-1111-4111-8111-111111111111', username: 'fixture', displayName: '翻译测试', email: 'fixture@example.com', emailVerified: true, createdAt: now });
    if (url.pathname === '/api/system/capabilities') return ok({ mediaTool: true, registration: false, asr: false, asrProviders: [],
      subtitleTranslation: enabled, subtitleCorrection: false, supportedOperations: ['transcode', 'burn_subtitles'],
      textAi: { provider: 'openai', source: 'PERSONAL', model: 'gpt-6-sol', available: enabled } });
    if (url.pathname === '/api/media') return ok({ items: [media], total: 1, page: 1, pageSize: 10 });
    if (url.pathname === '/api/media/' + mediaId) return ok(media);
    if (url.pathname === `/api/media/${mediaId}/transcript`) return ok(transcript(latestVersion()));
    if (url.pathname === `/api/transcripts/${transcriptId}/translations`) {
      const input = request.postDataJSON(); calls.push(input);
      expect(request.headers()['x-csrf-token']).toBe('fixture-csrf'); expect(input.expectedVersion).toBe(latestVersion());
      expect(input.segmentIds.length).toBeLessThanOrEqual(20);
      const source = input.useOriginal ? original : versions.get(input.expectedVersion), segments = input.segmentIds.map(id => source.find(segment => segment.id === id));
      expect(segments.reduce((sum, segment) => sum + Array.from(segment.text).length, 0)).toBeLessThanOrEqual(2000);
      if (holdFirst && calls.length === 1) await gate;
      if (calls.length === failBatch) return error('AI_TRANSLATION_FAILED', 422);
      return ok({ transcriptId, transcriptVersion: input.expectedVersion, targetLanguage: input.targetLanguage,
        segments: segments.map((segment, index) => ({ ...segment, text: `Hello ${index + 1}` })) });
    }
    if (url.pathname === `/api/transcripts/${transcriptId}`) {
      if (method === 'PATCH') {
        const input = request.postDataJSON(); if (input.expectedVersion !== latestVersion()) return error('TRANSCRIPT_VERSION_CONFLICT', 409);
        patches.push(input); versions.set(input.expectedVersion + 1, input.segments); return ok(transcript(latestVersion()));
      }
      return ok(transcript(Number(url.searchParams.get('version')) || latestVersion()));
    }
    if (url.pathname.endsWith('/srt')) {
      const segments = versions.get(Number(url.searchParams.get('version')) || latestVersion());
      return route.fulfill({ status: 200, contentType: 'application/x-subrip;charset=UTF-8', headers: { 'Content-Disposition': 'attachment; filename="translated.srt"' },
        body: segments.map((segment, index) => `${index + 1}\r\n00:00:00,000 --> 00:00:00,100\r\n${segment.text.replace(/\n/g, '\r\n')}\r\n\r\n`).join('') });
    }
    if (url.pathname === '/api/operation-plans' && method === 'POST') {
      const input = request.postDataJSON(); burns.push(input);
      return ok({ id: '33333333-3333-4333-8333-333333333333', version: 1, mediaId, status: 'READY', parameters: input.parameters, questions: [], warnings: [], createdAt: now, updatedAt: now }, 201);
    }
    if (url.pathname.endsWith('/execute')) {
      task = { id: '44444444-4444-4444-8444-444444444444', mediaId, kind: 'MEDIA_PROCESSING', status: 'QUEUED', stage: 'WAITING',
        parameters: burns.at(-1).parameters, outputs: [], createdAt: now }; return ok(task);
    }
    if (url.pathname === '/api/tasks') return ok({ items: task ? [task] : [], total: task ? 1 : 0, page: 1, pageSize: 10 });
    throw new Error('Unexpected fixture request: ' + method + ' ' + url.pathname);
  });
  page.on('dialog', dialog => dialog.accept());
  await page.goto('/'); await expect(page.locator('#media-status')).toHaveText('已就绪');
  await selectTool(page, 'subtitle'); await expect(page.locator('#subtitle-editor')).toBeVisible();
  return { calls, patches, burns, original, versions, release, change: () => versions.set(latestVersion() + 1, structuredClone(original)) };
}

for (const width of [1365, 390]) test(`bilingual translation previews edits saves exports and burns a separate version at ${width}px`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 1000 }); const state = await fixture(page); const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await expect(page.locator('#start-transcription')).toBeDisabled(); await expect(page.locator('#translate-subtitle')).toBeEnabled();
  await page.locator('#translation-language').selectOption('ja'); await page.locator('#translate-subtitle').click();
  await expect(page.locator('#translation-preview')).toBeVisible(); expect(state.patches).toHaveLength(0);
  await expect(page.locator('#subtitle-error')).toBeHidden();
  expect(state.calls[0]).toMatchObject({ expectedVersion: 1, targetLanguage: 'ja', useOriginal: false });
  await expect(page.locator('#translation-segments output').first()).toHaveText('原文1。\nHello 1');
  await page.getByRole('textbox', { name: '第1段译文', exact: true }).fill('<img src=x onerror="window.fixtureXss=true">翻译');
  expect(await page.evaluate(() => window.fixtureXss)).toBeUndefined();
  await expect(page.locator('#download-srt')).toBeHidden(); await expect(page.locator('#burn-subtitle')).toBeDisabled();
  await expect(page.locator('#subtitle-version')).toBeDisabled();
  await page.locator('#translation-layout').selectOption('translated');
  await expect(page.locator('#translation-segments output').first()).toHaveText('<img src=x onerror="window.fixtureXss=true">翻译');
  await page.locator('#translation-layout').selectOption('bilingual');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: testInfo.outputPath(`bilingual-${width}.png`), fullPage: true, animations: 'disabled' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#save-translation').click(); await expect(page.locator('#subtitle-version')).toHaveValue('2');
  expect(state.versions.get(1)).toEqual(state.original); expect(state.versions.get(2)[0].text).toBe('原文1。\n<img src=x onerror="window.fixtureXss=true">翻译');
  expect(state.versions.get(2)[0].startMs).toBe(state.original[0].startMs); expect(state.versions.get(2)[0].endMs).toBe(state.original[0].endMs);
  const promise = page.waitForEvent('download'); await page.locator('#download-srt').click(); const download = await promise;
  expect(fs.readFileSync(await download.path(), 'utf8')).toContain('原文1。\r\n<img src=x');
  await page.locator('#burn-subtitle').click(); await expect.poll(() => state.burns.length).toBe(1);
  expect(state.burns[0].parameters).toMatchObject({ operation: 'burn_subtitles', transcriptVersion: 2 });
  await page.reload(); await selectTool(page, 'subtitle'); await expect(page.locator('#subtitle-version')).toHaveValue('2');
  await page.locator('#subtitle-version').selectOption('1'); await expect(page.locator('#subtitle-segments textarea').first()).toHaveValue('原文1。');
  expect(errors).toEqual([]);
});

test('translation-only save preserves original recognition for another language without new ASR', async ({ page }) => {
  const state = await fixture(page); await page.locator('#translate-subtitle').click(); await expect(page.locator('#translation-preview')).toBeVisible();
  await page.locator('#translation-layout').selectOption('translated'); await page.locator('#save-translation').click();
  await expect(page.locator('#subtitle-version')).toHaveValue('2'); expect(state.versions.get(2)[0].text).toBe('Hello 1');
  await page.locator('#subtitle-original').check(); await page.locator('#translation-language').selectOption('fr');
  await page.locator('#translate-subtitle').click(); await expect(page.locator('#translation-preview')).toBeVisible();
  expect(state.calls[1]).toMatchObject({ expectedVersion: 2, targetLanguage: 'fr', useOriginal: true });
  await expect(page.locator('#translation-segments output').first()).toHaveText('Hello 1');
});

test('batch failure does not expose partial translation or write a version and never retries automatically', async ({ page }) => {
  const state = await fixture(page, { count: 21, failBatch: 2 }); await page.locator('#translate-subtitle').click();
  await expect(page.locator('#subtitle-error')).toContainText('字幕翻译结果无效');
  expect(state.calls).toHaveLength(2); expect(state.calls[0].segmentIds).toHaveLength(20); expect(state.calls[1].segmentIds).toHaveLength(1);
  expect(state.patches).toHaveLength(0); expect(state.versions.size).toBe(1);
  await expect(page.locator('#translation-preview')).toBeHidden(); await expect(page.locator('#download-srt')).toBeVisible();
});

test('stopping a pending batch prevents all following paid calls and discards partial suggestions', async ({ page }) => {
  const state = await fixture(page, { count: 21, holdFirst: true }); await page.locator('#translate-subtitle').click();
  await expect.poll(() => state.calls.length).toBe(1); await expect(page.locator('#cancel-translation')).toBeEnabled();
  await page.locator('#cancel-translation').click(); state.release();
  await expect(page.locator('#translation-state')).toContainText('已停止'); expect(state.calls).toHaveLength(1); expect(state.patches).toHaveLength(0);
  await expect(page.locator('#translation-preview')).toBeHidden(); await expect(page.locator('#translate-subtitle')).toBeEnabled();
});

test('stale versions cannot apply a translation and refreshing explicitly discards its draft', async ({ page }) => {
  const state = await fixture(page); await page.locator('#translate-subtitle').click(); await expect(page.locator('#translation-preview')).toBeVisible();
  state.change(); await page.locator('#save-translation').click(); await expect(page.locator('#subtitle-error')).toContainText('字幕已变更');
  expect(state.patches).toHaveLength(0); await expect(page.locator('#translation-preview')).toBeVisible();
  await page.locator('#refresh-subtitle').click(); await expect(page.locator('#translation-preview')).toBeHidden(); await expect(page.locator('#subtitle-version')).toHaveValue('2');
});

test('translation honors the text-size batch boundary and rejects invalid edited bilingual text before writing', async ({ page }) => {
  const state = await fixture(page, { count: 3, textLength: 1000 }); await page.locator('#translate-subtitle').click();
  await expect(page.locator('#translation-preview')).toBeVisible(); expect(state.calls.map(call => call.segmentIds.length)).toEqual([2, 1]);
  await page.getByRole('textbox', { name: '第1段译文', exact: true }).fill('x'.repeat(1100)); await page.locator('#save-translation').click();
  await expect(page.locator('#subtitle-error')).toContainText('合计最多 2000'); expect(state.patches).toHaveLength(0);
  await page.locator('#translation-layout').selectOption('translated'); await page.locator('#save-translation').click();
  await expect(page.locator('#subtitle-version')).toHaveValue('2'); expect(state.patches).toHaveLength(1);
});

test('unavailable text AI and unsaved subtitles do not prevent ordinary editing or export', async ({ page }) => {
  await fixture(page, { enabled: false }); await expect(page.locator('#translate-subtitle')).toBeDisabled();
  await expect(page.locator('#download-srt')).toBeVisible(); await expect(page.locator('#subtitle-segments textarea').first()).toBeEnabled();
  await page.locator('#subtitle-segments textarea').first().fill('手动修改'); await expect(page.locator('#save-subtitle')).toBeEnabled();
  await expect(page.locator('#translate-subtitle')).toBeDisabled();
});

test('discard restores the saved editor and export without writing a translation', async ({ page }) => {
  const state = await fixture(page); await page.locator('#translate-subtitle').click(); await expect(page.locator('#translation-preview')).toBeVisible();
  await page.locator('#discard-translation').click(); await expect(page.locator('#translation-preview')).toBeHidden();
  await expect(page.locator('#subtitle-error')).toBeHidden(); await expect(page.locator('#download-srt')).toBeVisible();
  await expect(page.locator('#subtitle-segments textarea').first()).toHaveValue('原文1。'); expect(state.patches).toHaveLength(0);
  await expect(page.locator('#translate-subtitle')).toBeEnabled();
});

test('oversized translation runs are rejected before any paid calls', async ({ page }) => {
  const state = await fixture(page, { count: 61, textLength: 2000 }); await page.locator('#translate-subtitle').click();
  await expect(page.locator('#subtitle-error')).toContainText('60 批'); expect(state.calls).toHaveLength(0); expect(state.patches).toHaveLength(0);
});
