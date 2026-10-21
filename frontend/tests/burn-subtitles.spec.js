const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

let directory, video;
test.beforeAll(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'amw-burn-e2e-'));
  const ass = '[Script Info]\nScriptType: v4.00+\nPlayResX: 640\nPlayResY: 360\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BorderStyle, Outline, Alignment, MarginV\nStyle: Default,sans-serif,24,&H00FFFFFF,&H00000000,1,1,2,20\n\n[Events]\nFormat: Layer, Start, End, Style, Text\nDialogue: 0,0:00:00.00,0:00:03.00,Default,字幕测试 Subtitle\n';
  fs.writeFileSync(path.join(directory, 'subtitles.ass'), ass);
  execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'color=c=black:s=640x360:r=20:d=3',
    '-vf', 'ass=filename=subtitles.ass', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-y', 'subtitled.mp4'],
  { cwd: directory, timeout: 15000, stdio: 'ignore' });
  video = fs.readFileSync(path.join(directory, 'subtitled.mp4'));
});
test.afterAll(() => {
  if (directory && path.dirname(path.resolve(directory)) === path.resolve(os.tmpdir())
      && path.basename(directory).startsWith('amw-burn-e2e-')) fs.rmSync(directory, { recursive: true, force: true });
});

// API contract fixture with a real libass-generated MP4; backend execution is tested separately.
async function fixture(page, { enabled = true, running = false, loseResponse = true } = {}) {
  const mediaId = '22222222-2222-4222-8222-222222222222', transcriptId = '66666666-6666-4666-8666-666666666666';
  const planId = '33333333-3333-4333-8333-333333333333', taskId = '44444444-4444-4444-8444-444444444444';
  const outputId = '55555555-5555-4555-8555-555555555555', now = '2026-10-20T00:00:00Z';
  const segment = { id: '77777777-7777-4777-8777-777777777777', startMs: 100, endMs: 2900, text: '字幕测试 Subtitle' };
  let version = 2, plan = null, task = null, posts = 0, executes = 0;
  const media = { id: mediaId, originalFilename: '字幕测试.mp4', sizeBytes: video.length, kind: 'VIDEO', status: 'READY', previewUrl: null,
    metadata: { container: 'mp4', durationMs: 3000, width: 640, height: 360, videoCodec: 'h264', hasAudio: false, audioCodec: null }, createdAt: now, updatedAt: now };
  await page.route('**/api/**', async (route) => {
    const req = route.request(), url = new URL(req.url()), method = req.method();
    const ok = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ code: 'SUCCESS', message: '成功', data, requestId: 'fixture', details: [] }) });
    const conflict = () => route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ code: 'TRANSCRIPT_VERSION_CONFLICT', data: null, details: [] }) });
    if (url.pathname === '/api/system/capabilities') return ok({ registration: false, emailVerification: false, passwordRecovery: false,
      aiPlans: false, asr: false, semanticSearch: false, clipRecommendations: false, subtitleCorrection: false, asrProviders: [],
      mediaTool: true, maxUploadBytes: 1073741824, maxDurationMs: 900000, supportedOperations: enabled ? ['transcode', 'burn_subtitles'] : ['transcode'] });
    if (url.pathname === '/api/auth/csrf') return ok({ token: 'fixture-csrf', headerName: 'X-CSRF-Token' });
    if (url.pathname === '/api/users/me') return ok({ id: '11111111-1111-4111-8111-111111111111', username: 'fixture', displayName: '字幕烧录', email: 'fixture@example.com', emailVerified: true, createdAt: now, updatedAt: now });
    if (url.pathname === '/api/media') return ok({ items: [media], page: 1, pageSize: 10, total: 1 });
    if (url.pathname === '/api/media/' + mediaId) return ok(media);
    if (url.pathname.endsWith('/transcript') || url.pathname === '/api/transcripts/' + transcriptId) {
      if (method === 'PATCH') { expect(req.postDataJSON().expectedVersion).toBe(version); version++; }
      return ok({ id: transcriptId, mediaId, version: Number(url.searchParams.get('version')) || version, language: 'zh-CN', segments: [segment], originalSegments: [segment], createdAt: now, updatedAt: now });
    }
    if (url.pathname === '/api/operation-plans' && method === 'POST') {
      posts++; const input = req.postDataJSON(); expect(req.headers()['x-csrf-token']).toBe('fixture-csrf');
      expect(input.mediaId).toBe(mediaId); expect(input.parameters).toEqual({ operation: 'burn_subtitles', outputFormat: 'mp4', transcriptId, transcriptVersion: input.parameters.transcriptVersion, resolutionPreset: 'source', audioMode: 'keep' });
      if (input.parameters.transcriptVersion !== version) return conflict();
      plan = { id: planId, mediaId, version: 1, status: 'READY', parameters: input.parameters, instruction: null, questions: [], warnings: [], summary: '烧录字幕', createdAt: now, updatedAt: now }; return ok(plan, 201);
    }
    if (url.pathname === '/api/operation-plans') return ok({ items: plan ? [plan] : [], page: 1, pageSize: 10, total: plan ? 1 : 0 });
    if (url.pathname.endsWith('/execute')) {
      executes++; expect(req.postDataJSON()).toEqual({ expectedVersion: 1 });
      if (!task) task = { id: taskId, mediaId, planId, planVersion: 1, kind: 'MEDIA_PROCESSING', sourceId: planId, sourceVersion: 1, parameters: plan.parameters,
        status: running ? 'RUNNING' : 'SUCCEEDED', stage: running ? 'TRANSCODING' : 'DONE', progressPercent: running ? null : 100, error: null, transcript: null, createdAt: now,
        outputs: running ? [] : [{ id: outputId, taskId, mediaId, filename: '字幕测试-subtitled.mp4', contentType: 'video/mp4', sizeBytes: video.length, metadata: media.metadata,
          previewUrl: '/api/outputs/' + outputId + '/preview', downloadUrl: '/api/outputs/' + outputId + '/download', createdAt: now }] };
      if (loseResponse) { loseResponse = false; return route.abort('failed'); } return ok(task);
    }
    if (url.pathname.endsWith('/cancel')) { task = { ...task, status: 'CANCELLED', stage: 'CANCELLED' }; return ok(task); }
    if (url.pathname === '/api/tasks') return ok({ items: task ? [task] : [], page: 1, pageSize: 10, total: task ? 1 : 0 });
    if (url.pathname === '/api/tasks/' + taskId) return ok(task);
    if (url.pathname.endsWith('/preview') || url.pathname.endsWith('/download')) return route.fulfill({ status: 200, contentType: 'video/mp4',
      headers: url.pathname.endsWith('/download') ? { 'Content-Disposition': 'attachment; filename="subtitled.mp4"' } : {}, body: video });
    throw new Error('Unexpected fixture request: ' + method + ' ' + url.pathname);
  });
  page.on('dialog', (dialog) => dialog.accept());
  return { state: () => ({ posts, executes, task }), change: () => { version++; } };
}
async function open(page) {
  await page.goto('/'); await expect(page.locator('#media-status')).toHaveText('已就绪');
  await page.locator('#subtitle-tool').click(); await expect(page.locator('#subtitle-editor')).toBeVisible();
}

test('saved subtitle burn requires confirmation, retries one task and restores a playable result on desktop/mobile', async ({ page }, testInfo) => {
  const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  const app = await fixture(page); await open(page);
  await expect(page.locator('#start-transcription')).toBeDisabled(); await expect(page.locator('#burn-subtitle')).toBeEnabled();
  await page.locator('#subtitle-segments textarea').fill('修改字幕'); await expect(page.locator('#burn-subtitle')).toBeDisabled();
  await page.locator('#save-subtitle').click(); await expect(page.locator('#subtitle-version')).toHaveValue('3');
  await page.locator('#subtitle-version').selectOption('1'); await expect(page.locator('#burn-subtitle')).toBeDisabled();
  await page.locator('#subtitle-version').selectOption('3'); await page.locator('#subtitle-original').check(); await expect(page.locator('#burn-subtitle')).toBeDisabled();
  await page.locator('#subtitle-original').uncheck(); await page.locator('#burn-subtitle').click();
  await expect(page.locator('#subtitle-error')).toBeVisible(); await page.locator('#burn-subtitle').click();
  await expect(page.locator('#subtitle-result-slot #conversion-result')).toBeVisible(); await expect(page.locator('#task-status')).toHaveText('已完成');
  expect(app.state().posts).toBe(1); expect(app.state().executes).toBe(2); expect(app.state().task.parameters.transcriptVersion).toBe(3);
  await page.locator('#output-preview').evaluate((video) => video.play());
  await expect.poll(() => page.locator('#output-preview').evaluate((video) => video.currentTime)).toBeGreaterThan(0.1);
  const pixels = await page.locator('#output-preview').evaluate((video) => {
    const canvas = document.createElement('canvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d'); ctx.drawImage(video, 0, 0); const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let bright = 0; for (let i = 0; i < data.length; i += 4) if (data[i] > 100) bright++; return { bright, image: canvas.toDataURL('image/png') };
  }); expect(pixels.bright).toBeGreaterThan(100);
  fs.writeFileSync(testInfo.outputPath('burned-frame.png'), Buffer.from(pixels.image.split(',')[1], 'base64'));
  for (const viewport of [{ width: 1365, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('burn-' + viewport.width + '.png'), fullPage: true });
  }
  // Native forced downloads bypass browser routing; the real endpoint is covered by server/media tests.
  await expect(page.locator('#download-output')).toHaveAttribute('href', /\/api\/outputs\/[^/]+\/download$/);
  await expect(page.locator('#download-output')).toHaveAttribute('download', '字幕测试-subtitled.mp4');
  await page.reload(); await page.locator('#subtitle-tool').click(); await expect(page.locator('#subtitle-result-slot #conversion-result')).toBeVisible();
  await expect(page.locator('#task-stage')).toContainText('字幕 v3'); expect(errors).toEqual([]);
});

test('stale saved versions are rejected and running subtitle burn can be cancelled', async ({ page }) => {
  const app = await fixture(page, { running: true, loseResponse: false }); await open(page); app.change();
  await page.locator('#burn-subtitle').click(); await expect(page.locator('#subtitle-error')).toContainText('字幕已变更');
  expect(app.state().task).toBeNull(); await page.locator('#refresh-subtitle').click(); await expect(page.locator('#subtitle-version')).toHaveValue('3');
  await page.locator('#burn-subtitle').click(); await expect(page.locator('#task-status')).toHaveText('字幕烧录中');
  await expect(page.locator('#burn-subtitle')).toBeDisabled(); await page.locator('#cancel-task').click();
  await expect(page.locator('#task-status')).toHaveText('已取消'); await expect(page.locator('#burn-subtitle')).toBeEnabled();
  await expect(page.locator('#download-output')).toBeHidden();
});

test('missing libass closes burn without blocking saved subtitle edits or SRT', async ({ page }) => {
  await fixture(page, { enabled: false }); await open(page);
  await expect(page.locator('#burn-subtitle')).toBeDisabled(); await expect(page.locator('#download-srt')).toBeVisible();
  await expect(page.locator('#subtitle-segments textarea')).toBeEnabled();
});
