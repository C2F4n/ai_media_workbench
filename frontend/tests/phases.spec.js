const { test, expect } = require('@playwright/test');
const { serveStatic } = require('./helpers/static.cjs');
const { selectTool } = require('./helpers/navigation.cjs');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

let directory, videoPath, video;
test.beforeAll(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'amw-phases-'));
  videoPath = path.join(directory, 'studio-preview.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'testsrc2=s=640x360:r=15:d=3',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', '-y', videoPath], { timeout: 15000 });
  video = fs.readFileSync(videoPath);
});
test.afterAll(() => {
  if (directory && path.dirname(path.resolve(directory)) === path.resolve(os.tmpdir()) && path.basename(directory).startsWith('amw-phases-'))
    fs.rmSync(directory, { recursive: true, force: true });
});

async function fixture(page) {
  await serveStatic(page);
  const id = '22222222-2222-4222-8222-222222222222', planId = '33333333-3333-4333-8333-333333333333', taskId = '44444444-4444-4444-8444-444444444444';
  const now = '2026-10-22T00:00:00Z', metadata = { container: 'mp4', durationMs: 3000, width: 640, height: 360, videoCodec: 'h264', hasAudio: false, audioCodec: null };
  const media = { id, originalFilename: 'studio-preview.mp4', sizeBytes: video.length, kind: 'VIDEO', status: 'READY', metadata,
    previewUrl: `/api/media/${id}/preview`, createdAt: now, updatedAt: now };
  const state = { uploaded: false, plan: null, task: null, posts: [] };
  await page.route('**/api/**', async route => {
    const req = route.request(), url = new URL(req.url()), method = req.method();
    const ok = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ code: 'SUCCESS', data }) });
    const pageOf = items => ({ items, total: items.length, page: 1, pageSize: 10 });
    if (url.pathname.endsWith('/preview')) return route.fulfill({ contentType: 'video/mp4', body: video });
    if (url.pathname === '/api/auth/csrf') return ok({ token: 'fixture-csrf' });
    if (url.pathname === '/api/users/me') return ok({ id: 'fixture-user', username: 'fixture', displayName: '工作台', email: 'fixture@example.com', emailVerified: true, createdAt: now });
    if (url.pathname === '/api/system/capabilities') return ok({ registration: false, mediaTool: true, aiPlans: true, subtitleCorrection: true,
      semanticSearch: true, clipRecommendations: true, asrProviders: [], exportFormats: ['mp4', 'webm', 'mp3'], exportVideoCodecs: ['h264', 'vp9'],
      supportedOperations: ['transcode', 'compress', 'trim', 'mute', 'join_clips', 'export', 'workflow'], maxUploadBytes: 3221225472, maxDurationMs: 900000,
      textAi: { source: 'SERVER', model: 'qwen3.5-4b', available: true, unavailableReason: null } });
    if (url.pathname === '/api/media' && method === 'GET') return ok(pageOf(state.uploaded ? [media] : []));
    if (url.pathname === '/api/media' && method === 'POST') { state.uploaded = true; return ok(media, 201); }
    if (url.pathname === `/api/media/${id}`) return ok(media);
    if (url.pathname === '/api/operation-plans' && method === 'GET') return ok(pageOf(state.plan ? [state.plan] : []));
    if (url.pathname === '/api/operation-plans' && method === 'POST') {
      const body = req.postDataJSON(); state.posts.push(body);
      state.plan = { id: planId, mediaId: id, version: 1, status: 'READY', parameters: body.parameters, instruction: null, summary: '转换为 MP4', questions: [], warnings: [], createdAt: now };
      return ok(state.plan, 201);
    }
    if (url.pathname === `/api/operation-plans/${planId}/execute`) {
      state.task = { id: taskId, mediaId: id, planId, planVersion: 1, kind: 'PROCESSING', parameters: state.plan.parameters, status: 'SUCCEEDED', stage: 'DONE',
        outputs: [{ id: '55555555-5555-4555-8555-555555555555', filename: 'studio-converted.mp4', sizeBytes: video.length, metadata,
          previewUrl: '/api/outputs/55555555-5555-4555-8555-555555555555/preview', downloadUrl: '/api/outputs/55555555-5555-4555-8555-555555555555/download' }], createdAt: now };
      return ok(state.task, 202);
    }
    if (url.pathname === '/api/tasks') return ok(pageOf(state.task ? [state.task] : []));
    if (url.pathname === `/api/tasks/${taskId}`) return ok(state.task);
    throw new Error('Unexpected phase fixture request: ' + method + ' ' + url.pathname);
  });
  await page.goto('/'); await expect(page.locator('#workbench-panel')).toBeVisible();
  return state;
}

for (const bytes of [2147483648 + 1, 3221225472, 3221225472 + 1]) {
  test(`upload validation uses the advertised 3 GiB limit for ${bytes} bytes`, async ({ page }) => {
    const state = await fixture(page);
    // Simulate the reported size without allocating or transferring gigabytes in a UI test.
    await page.locator('#media-file').evaluate((input, bytes) => {
      const file = new File([new Uint8Array([1])], 'large-video.mp4', { type: 'video/mp4' });
      Object.defineProperty(file, 'size', { value: bytes });
      const transfer = new DataTransfer(); transfer.items.add(file); input.files = transfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, bytes);
    await page.locator('#upload-submit').click();
    if (bytes <= 3221225472) {
      await expect(page.locator('#upload-state')).toHaveText('上传完成');
      expect(state.uploaded).toBe(true);
    } else {
      await expect(page.locator('#upload-error')).toContainText('3.0 GB');
      expect(state.uploaded).toBe(false);
    }
  });
}

for (const viewport of [{ width: 1920, height: 1080 }, { width: 1365, height: 900 }, { width: 800, height: 1024 }, { width: 390, height: 844 }]) {
  test(`import edit export preserves state and renders real video at ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const state = await fixture(page);
    await expect(page.locator('#phase-import')).toBeVisible();
    await expect(page.locator('#phase-edit')).toBeHidden(); await expect(page.locator('#phase-export')).toBeHidden();
    await expect(page.locator('#continue-editing')).toBeDisabled();
    await page.locator('#media-file').setInputFiles(videoPath); await page.locator('#upload-submit').click();
    await expect(page.locator('#media-status')).toHaveText('已就绪');
    await page.screenshot({ path: testInfo.outputPath(`import-${viewport.width}.png`), fullPage: true, animations: 'disabled' });
    await page.locator('#continue-editing').click();
    await expect(page.locator('#phase-edit')).toBeVisible();
    await expect(page.locator('#editor-filename')).toHaveText('studio-preview.mp4');
    await page.locator('#source-preview').evaluate(video => video.play());
    await expect.poll(() => page.locator('#source-preview').evaluate(video => video.currentTime)).toBeGreaterThan(0.1);
    const frame = await page.locator('#source-preview').evaluate(video => {
      const canvas = document.createElement('canvas'); canvas.width = 160; canvas.height = 90;
      const ctx = canvas.getContext('2d'); ctx.drawImage(video, 0, 0, 160, 90);
      const pixels = ctx.getImageData(0, 0, 160, 90).data;
      let colored = 0; for (let i = 0; i < pixels.length; i += 4) if (Math.max(pixels[i], pixels[i + 1], pixels[i + 2]) - Math.min(pixels[i], pixels[i + 1], pixels[i + 2]) > 50) colored++;
      return colored;
    });
    expect(frame).toBeGreaterThan(1000);
    await selectTool(page, 'convert');
    await page.locator('#conversion-resolution').selectOption('720p');
    await page.screenshot({ path: testInfo.outputPath(`edit-${viewport.width}.png`), fullPage: true, animations: 'disabled' });
    await page.locator('#phase-export-tab').click();
    await expect(page.locator('#source-preview')).not.toBeVisible();
    expect(await page.locator('#source-preview').evaluate(video => video.paused)).toBe(true);
    await expect(page.locator('#export-result-empty')).toBeVisible();
    await page.locator('#phase-import-tab').click(); await page.locator('#phase-edit-tab').click();
    await expect(page.locator('#conversion-resolution')).toHaveValue('720p');
    expect(state.posts).toHaveLength(0);
    await page.locator('#phase-edit-tab').focus(); await page.keyboard.press('ArrowRight');
    await expect(page.locator('#phase-export-tab')).toBeFocused();
    await page.keyboard.press('Home'); await expect(page.locator('#phase-import')).toBeVisible();
    await page.keyboard.press('End'); await expect(page.locator('#phase-export')).toBeVisible();
    await page.locator('#back-to-editing').click();
    await page.locator('#start-conversion').click();
    await expect(page.locator('#phase-export')).toBeVisible();
    await expect(page.locator('#task-status')).toHaveText('已完成');
    await expect(page.locator('#download-output')).toHaveAttribute('href', /\/download$/);
    await page.locator('#output-preview').evaluate(video => video.play());
    await expect.poll(() => page.locator('#output-preview').evaluate(video => video.currentTime)).toBeGreaterThan(0.1);
    await page.locator('#output-preview').evaluate(video => video.pause());
    await expect(page.locator('#export-result-empty')).toBeHidden();
    await page.screenshot({ path: testInfo.outputPath(`export-${viewport.width}.png`), fullPage: true, animations: 'disabled' });
    expect(state.posts).toHaveLength(1);
    for (const tool of ['compress', 'trim', 'mute', 'audio', 'join', 'ai', 'subtitle', 'find', 'detect']) {
      // Special tools fetch saved plans/transcripts; the separate contract suites cover those calls.
      if (['join', 'ai', 'subtitle', 'find'].includes(tool)) continue;
      await selectTool(page, tool);
      expect(await page.locator('#workspace-tool-title').textContent()).toBe(await page.locator(`#${tool}-tool .tool-name`).textContent());
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator('[role=tabpanel]').evaluateAll(panels => panels.filter(panel => panel.id.startsWith('phase-') && !panel.hidden).length)).toBe(1);
    expect(errors).toEqual([]);
  });
}

test('reduced motion disables phase animations without disabling keyboard navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await fixture(page);
  await page.locator('#phase-import-tab').focus(); await page.keyboard.press('ArrowRight');
  await expect(page.locator('#phase-edit')).toBeVisible();
  expect(await page.locator('#phase-edit').evaluate(panel => panel.getAnimations().length)).toBe(0);
  expect(await page.locator('.phase-indicator').evaluate(panel => panel.getAnimations().length)).toBe(0);
});
