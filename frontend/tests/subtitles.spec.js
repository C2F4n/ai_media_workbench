const { test, expect } = require('@playwright/test');
const fs = require('node:fs');

// Isolated browser contract fixture, not evidence of real cloud recognition or billing.
async function fixture(page, enabled = true, existing = false) {
  const id = '22222222-2222-4222-8222-222222222222';
  const transcriptId = '66666666-6666-4666-8666-666666666666';
  const createdAt = '2026-10-20T00:00:00Z';
  const original = [{ id: '77777777-7777-4777-8777-777777777777', startMs: 100, endMs: 1100, text: '测试字幕。' },
    { id: '99999999-9999-4999-8999-999999999999', startMs: 2000, endMs: 4000, text: '第二段。' }];
  const media = { id, originalFilename: '字幕测试.mp4', sizeBytes: 12345, kind: 'VIDEO', status: 'READY', previewUrl: null,
    metadata: { container: 'mov,mp4', durationMs: 5000, width: 160, height: 90, videoCodec: 'h264', hasAudio: true, audioCodec: 'aac' }, createdAt, updatedAt: createdAt };
  const versions = new Map();
  const store = (version, segments) => versions.set(version, { id: transcriptId, mediaId: id, version, language: 'zh-CN', segments, originalSegments: original, createdAt, updatedAt: createdAt });
  if (existing) store(1, structuredClone(original));
  let task = null, polls = 0, writes = 0;
  const calls = [];
  await page.route('**/api/**', async (route) => {
    const request = route.request(), url = new URL(request.url()), method = request.method();
    calls.push(method + ' ' + url.pathname);
    const ok = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ code: 'SUCCESS', message: '成功', data, requestId: 'fixture', details: [] }) });
    const missing = () => route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ code: 'RESOURCE_NOT_FOUND', data: null, details: [] }) });
    if (url.pathname === '/api/system/capabilities') return ok({ registration: false, emailVerification: false, passwordRecovery: false, aiPlans: false, asr: enabled,
      semanticSearch: false, clipRecommendations: false, mediaTool: true, maxUploadBytes: 1073741824, maxDurationMs: 900000,
      supportedOperations: ['transcode'], asrProviders: enabled ? ['tencent', 'aliyun'] : [], subtitleCorrection: enabled });
    if (url.pathname === '/api/auth/csrf') return ok({ token: 'fixture-csrf', headerName: 'X-CSRF-Token' });
    if (url.pathname === '/api/users/me') return ok({ id: '11111111-1111-4111-8111-111111111111', username: 'fixture', displayName: '字幕测试', email: 'fixture@example.com', emailVerified: true, createdAt, updatedAt: createdAt });
    if (url.pathname === '/api/media') return ok({ items: [media], page: 1, pageSize: 10, total: 1 });
    if (url.pathname === '/api/media/' + id) return ok(media);
    if (url.pathname.endsWith('/transcriptions') && method === 'POST') {
      writes++; expect(request.postDataJSON()).toEqual({ language: 'zh-CN', force: versions.size > 0, provider: 'aliyun' });
      expect(request.headers()['x-csrf-token']).toBe('fixture-csrf');
      task = { id: '44444444-4444-4444-8444-444444444444', mediaId: id, kind: 'TRANSCRIPTION', sourceId: id, sourceVersion: null,
        planId: null, planVersion: null, parameters: null, status: 'QUEUED', stage: 'WAITING', progressPercent: null, outputs: [], transcript: null, error: null, createdAt };
      return ok(task, 202);
    }
    if (url.pathname === '/api/tasks') {
      if (task && ++polls >= 2) {
        store(1, structuredClone(original));
        task = { ...task, status: 'SUCCEEDED', stage: 'DONE', progressPercent: 100, transcript: { transcriptId, version: 1 } };
      }
      return ok({ items: task ? [task] : [], page: 1, pageSize: 10, total: task ? 1 : 0 });
    }
    if (url.pathname.endsWith('/transcript')) return versions.size ? ok(versions.get(Math.max(...versions.keys()))) : missing();
    if (url.pathname === '/api/transcripts/' + transcriptId) {
      if (method === 'PATCH') {
        const input = request.postDataJSON(); expect(input.expectedVersion).toBe(Math.max(...versions.keys()));
        store(input.expectedVersion + 1, input.segments); return ok(versions.get(input.expectedVersion + 1));
      }
      return ok(versions.get(Number(url.searchParams.get('version')) || Math.max(...versions.keys())));
    }
    if (url.pathname.endsWith('/corrections')) {
      const input = request.postDataJSON();
      expect(input).toEqual({ expectedVersion: 2, segmentId: original[0].id });
      return ok({ transcriptId, version: 2, segmentId: input.segmentId, originalText: versions.get(2).segments[0].text, correctedText: '<img src=x onerror="window.fixtureXss=true">校对建议。' });
    }
    if (url.pathname.endsWith('/srt')) {
      const version = Number(url.searchParams.get('version')) || Math.max(...versions.keys());
      const text = versions.get(version).segments[0].text;
      return route.fulfill({ status: 200, contentType: 'application/x-subrip;charset=UTF-8', headers: { 'Content-Disposition': 'attachment; filename="subtitles.srt"' },
        body: `1\r\n00:00:00,100 --> 00:00:01,100\r\n${text}\r\n\r\n` });
    }
    throw new Error('Unexpected fixture request: ' + method + ' ' + url.pathname);
  });
  return { calls, versions, writes: () => writes };
}

test('cloud subtitle workflow supports editing, versions, safe correction suggestions and SRT on desktop/mobile', async ({ page }, testInfo) => {
  const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  page.on('dialog', (dialog) => dialog.accept());
  const state = await fixture(page);
  await page.goto('/'); await expect(page.locator('#media-status')).toHaveText('已就绪');
  await page.locator('#subtitle-tool').click(); await expect(page.locator('#subtitle-state')).toHaveText('暂无字幕');
  await page.locator('#asr-provider').selectOption('aliyun'); await page.locator('#start-transcription').click();
  await expect(page.locator('#subtitle-editor')).toBeVisible({ timeout: 12000 });
  await expect(page.locator('#subtitle-segments textarea')).toHaveCount(2);
  expect(state.writes()).toBe(1);
  await page.locator('#subtitle-segments textarea').first().fill('手工修改后的字幕。');
  await expect(page.locator('#subtitle-draft-state')).toHaveText('有未保存的修改');
  await expect(page.locator('#download-srt')).toBeHidden();
  await page.locator('#save-subtitle').click();
  await expect(page.locator('#subtitle-version')).toHaveValue('2');
  await page.locator('#subtitle-version').selectOption('1');
  await expect(page.locator('#subtitle-segments textarea').first()).toHaveValue('测试字幕。');
  await expect(page.locator('#subtitle-segments textarea').first()).toBeDisabled();
  await page.locator('#subtitle-version').selectOption('2');
  await page.locator('#subtitle-original').check();
  await expect(page.locator('#subtitle-segments textarea').first()).toHaveValue('测试字幕。');
  await page.locator('#subtitle-original').uncheck();
  await page.getByRole('button', { name: '校对第1段', exact: true }).click();
  await expect(page.locator('.subtitle-suggestion')).toContainText('<img src=x');
  expect(await page.evaluate(() => window.fixtureXss)).toBeUndefined();
  expect(state.versions.size).toBe(2);
  await page.getByRole('button', { name: '采用建议', exact: true }).click();
  await page.locator('#save-subtitle').click(); await expect(page.locator('#subtitle-version')).toHaveValue('3');
  const downloadPromise = page.waitForEvent('download'); await page.locator('#download-srt').click();
  const download = await downloadPromise;
  expect(fs.readFileSync(await download.path(), 'utf8')).toContain('00:00:00,100 --> 00:00:01,100');
  for (const viewport of [{ width: 1365, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport); await page.locator('#subtitle-section').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const boxes = await page.locator('#subtitle-segments').first().evaluate((element) => [...element.querySelectorAll('input,textarea,button')]
      .filter((item) => !item.hidden).map((item) => { const r = item.getBoundingClientRect(); return { x: r.x, width: r.width, right: r.right }; }));
    expect(boxes.every((box) => box.width > 0 && box.x >= 0 && box.right <= viewport.width)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('subtitles-' + viewport.width + '.png'), fullPage: true });
  }
  expect(errors).toEqual([]);
});

test('missing cloud credentials disable new recognition but retain existing subtitle editing/export', async ({ page }) => {
  await fixture(page, false, true);
  await page.goto('/'); await expect(page.locator('#media-status')).toHaveText('已就绪');
  await page.locator('#subtitle-tool').click();
  await expect(page.locator('#subtitle-editor')).toBeVisible();
  await expect(page.locator('#subtitle-state')).toHaveText('语音识别服务尚未配置。');
  await expect(page.locator('#start-transcription')).toBeDisabled();
  await expect(page.getByRole('button', { name: '校对第1段', exact: true })).toBeDisabled();
  await expect(page.locator('#subtitle-segments textarea').first()).toBeEnabled();
  await expect(page.locator('#download-srt')).toBeVisible();
});
