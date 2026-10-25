const { test, expect } = require('@playwright/test');
const { acceptCloudCalls, handleActionConfirmations } = require('./helpers/cloud-confirmation.cjs');
test.beforeEach(async ({ page }) => { await acceptCloudCalls(page); await handleActionConfirmations(page); });
const { selectTool } = require('./helpers/navigation.cjs');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const password = 'Workbench-2026!';
let directory;
let video;
let joinVideo;
let exportVideo;

test.beforeAll(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'amw-media-e2e-'));
  video = path.join(directory, 'native-video.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'color=c=blue:s=160x90:r=10:d=0.4',
    '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-y', video], { timeout: 15000, stdio: 'ignore' });
  joinVideo = path.join(directory, 'join-colors.mp4');
  exportVideo = path.join(directory, 'export-source.mkv');
  execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'testsrc2=s=640x360:r=15:d=3', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000:duration=3', '-c:v', 'mpeg4', '-c:a', 'pcm_s16le', '-y', exportVideo], { timeout: 15000, stdio: 'ignore' });
  execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i',
    'color=c=red:s=160x90:r=30:d=1[r];color=c=lime:s=160x90:r=30:d=1[g];color=c=blue:s=160x90:r=30:d=1[b];[r][g][b]concat=n=3:v=1:a=0',
    '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000:duration=0.8', '-c:v', 'libx264', '-c:a', 'aac', '-pix_fmt', 'yuv420p', '-y', joinVideo], { timeout: 15000, stdio: 'ignore' });
});

test.afterAll(() => {
  if (directory && path.dirname(path.resolve(directory)) === path.resolve(os.tmpdir())
      && path.basename(directory).startsWith('amw-media-e2e-')) fs.rmSync(directory, { recursive: true, force: true });
});

async function csrf(context) {
  const result = await (await context.request.get('/api/auth/csrf')).json();
  return result.data.token;
}

async function registerAndLogin(page, context) {
  if (!process.env.TEST_MAILBOX_URL) throw new Error('TEST_MAILBOX_URL is required; never bypass verified registration.');
  const account = 'ui_' + crypto.randomBytes(6).toString('hex');
  const email = account + '@example.com';
  const token = await csrf(context);
  const delivery = await context.request.post('/api/auth/registration-email-code', {
    headers: { 'X-CSRF-Token': token }, data: { email }
  });
  expect(delivery.status()).toBe(200);
  const proof = (await delivery.json()).data;
  const inbox = await context.request.get(process.env.TEST_MAILBOX_URL + '/messages?email=' + encodeURIComponent(email));
  const code = (await inbox.json()).code;
  const registration = await context.request.post('/api/auth/register', {
    headers: { 'X-CSRF-Token': token }, data: { username: account, email, password, emailChallengeId: proof.challengeId, emailCode: code }
  });
  expect(registration.status()).toBe(201);
  await page.goto('/');
  await page.locator('#login-username').fill(account);
  await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.locator('#workbench-panel')).toBeVisible();
  await expect(page.locator('#account-panel')).toBeHidden();
  return account;
}

async function removeAccount(context, account) {
  const token = await csrf(context);
  const response = await context.request.delete('/api/users/me', {
    headers: { 'X-CSRF-Token': token }, data: { currentPassword: password, confirmUsername: account }
  });
  expect(response.status()).toBe(200);
}

test('composite export saves and restores settings, compresses trimmed silent WebM and preserves original MP3', async ({ page, context }, testInfo) => {
  test.setTimeout(60000);
  const account = await registerAndLogin(page, context), errors = [];
  page.on('pageerror', (error) => errors.push(error.message)); page.on('dialog', (dialog) => dialog.accept());
  try {
    await page.locator('#media-file').setInputFiles(exportVideo); await page.locator('#upload-submit').click();
    await expect(page.locator('#media-status')).toHaveText('已就绪', { timeout: 12000 });
    await selectTool(page, 'convert'); await page.locator('#export-format').selectOption('webm');
    await expect(page.locator('#export-codec')).toHaveValue('vp9');
    await page.locator('#export-combine').check();
    for (const id of ['export-trim', 'export-compress', 'export-mute', 'export-extract']) await page.locator('#' + id).check();
    await page.locator('#trim-start').fill('0.5'); await page.locator('#trim-end').fill('2.5'); await page.locator('#compression-target').fill('0.09');
    await page.locator('#conversion-resolution').selectOption('custom'); await page.locator('#export-width').fill('320'); await page.locator('#export-height').fill('200');
    await page.locator('#save-export-plan').click(); await expect(page.locator('#export-plan-state')).toContainText('已保存');
    const tasks = await (await context.request.get('/api/tasks')).json(); expect(tasks.data.total).toBe(0);
    await page.reload(); await expect(page.locator('#media-status')).toHaveText('已就绪'); await selectTool(page, 'convert');
    await page.locator('#restore-export-plan').click(); await expect(page.locator('#export-plan-state')).toContainText('已恢复');
    await expect(page.locator('#export-format')).toHaveValue('webm'); await expect(page.locator('#export-extract')).toBeChecked();
    await expect(page.locator('#trim-start')).toHaveValue('0.5'); await expect(page.locator('#export-width')).toHaveValue('320');
    await selectTool(page, 'mute'); await selectTool(page, 'convert');
    await expect(page.locator('#export-format')).toHaveValue('webm');
    for (const viewport of [{ width: 1365, height: 1000 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('export-settings-' + viewport.width + '.png'), fullPage: true });
    }
    await page.locator('#start-conversion').click(); await expect(page.locator('#task-status')).toHaveText('已完成', { timeout: 20000 });
    await expect(page.locator('#output-selector option')).toHaveCount(2);
    const result = (await (await context.request.get('/api/tasks')).json()).data.items[0];
    expect(result.parameters.operation).toBe('export'); expect(result.parameters.audioMode).toBe('mute');
    const videoResult = result.outputs.find((o) => o.contentType === 'video/webm'), audioResult = result.outputs.find((o) => o.contentType === 'audio/mpeg');
    expect(videoResult.metadata.width).toBe(320); expect(videoResult.metadata.height).toBe(180); expect(videoResult.metadata.hasAudio).toBe(false);
    expect(videoResult.sizeBytes).toBeLessThanOrEqual(Math.floor(.09 * 1024 * 1024)); expect(audioResult.metadata.durationMs).toBeGreaterThan(2900);
    await page.locator('#output-selector').selectOption(audioResult.id); await expect(page.locator('#output-audio')).toBeVisible(); await expect(page.locator('#download-label')).toHaveText('下载 MP3');
    await page.locator('#output-selector').selectOption(videoResult.id); await expect(page.locator('#output-preview')).toBeVisible(); await expect(page.locator('#download-label')).toHaveText('下载 WEBM');
    expect((await context.request.get(videoResult.downloadUrl)).status()).toBe(200);
    expect(errors).toEqual([]);
  } finally { await removeAccount(context, account); }
});

test('audio format exports use audio players while HEVC remains download-only', async ({ page, context }) => {
  test.setTimeout(60000);
  const account = await registerAndLogin(page, context), errors = [];
  page.on('pageerror', (error) => errors.push(error.message)); page.on('dialog', (dialog) => dialog.accept());
  try {
    await page.locator('#media-file').setInputFiles(joinVideo); await page.locator('#upload-submit').click();
    await expect(page.locator('#media-status')).toHaveText('已就绪', { timeout: 12000 });
    await selectTool(page, 'audio');
    for (const [format, mime] of [['m4a', 'audio/mp4'], ['wav', 'audio/wav'], ['flac', 'audio/flac']]) {
      await page.locator('#export-audio-format').selectOption(format);
      const queued = page.waitForResponse((r) => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/execute'));
      await page.locator('#start-conversion').click(); expect((await queued).status()).toBe(202);
      await expect(page.locator('#task-status')).toHaveText('已完成', { timeout: 15000 });
      await expect(page.locator('#output-audio')).toBeVisible(); await expect(page.locator('#output-preview')).toBeHidden();
      await expect(page.locator('#download-label')).toHaveText('下载 ' + format.toUpperCase());
      const task = (await (await context.request.get('/api/tasks')).json()).data.items[0]; expect(task.outputs[0].contentType).toBe(mime);
      expect(task.outputs[0].metadata.durationMs).toBeLessThan(1100); expect(task.outputs[0].metadata.videoCodec).toBeNull();
    }
    await selectTool(page, 'convert'); await page.locator('#export-codec').selectOption('hevc');
    const queued = page.waitForResponse((r) => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/execute'));
    await page.locator('#start-conversion').click(); expect((await queued).status()).toBe(202);
    await expect(page.locator('#task-status')).toHaveText('已完成', { timeout: 15000 });
    await expect(page.locator('#output-preview')).toBeHidden(); await expect(page.locator('#output-preview-status')).toContainText('下载');
    const task = (await (await context.request.get('/api/tasks')).json()).data.items[0], output = task.outputs[0];
    expect(output.metadata.videoCodec).toBe('hevc'); expect(output.previewUrl).toBeNull();
    expect((await context.request.get('/api/outputs/' + output.id + '/preview')).status()).toBe(409);
    expect((await context.request.get(output.downloadUrl)).status()).toBe(200); expect(errors).toEqual([]);
  } finally { await removeAccount(context, account); }
});

test('ordered repeated clip export runs real FFmpeg, retries one task and restores private playback/download', async ({ page, context }, testInfo) => {
  const account = await registerAndLogin(page, context), errors = [], writes = [];
  page.on('pageerror', (error) => errors.push(error.message)); page.on('dialog', (dialog) => dialog.accept());
  page.on('request', (request) => { if (request.method() === 'POST' && request.url().includes('/api/operation-plans')) writes.push(new URL(request.url()).pathname); });
  try {
    await page.locator('#media-file').setInputFiles(joinVideo); await page.locator('#upload-submit').click();
    await expect(page.locator('#media-status')).toHaveText('已就绪', { timeout: 12000 });
    await selectTool(page, 'join'); await expect(page.locator('#join-clips > li')).toHaveCount(1);
    await expect(page.locator('#join-clips input').first()).toBeEnabled();
    const row = (n) => page.locator('#join-clips > li').nth(n);
    await row(0).locator('input').nth(0).fill('2'); await row(0).locator('input').nth(1).fill('3');
    await page.getByRole('button', { name: '复制片段 1', exact: true }).click();
    await row(1).locator('input').nth(0).fill('0'); await row(1).locator('input').nth(1).fill('1');
    await page.getByRole('button', { name: '复制片段 1', exact: true }).click();
    await page.getByRole('button', { name: '下移片段 2', exact: true }).click();
    await expect(row(1).locator('input').first()).toHaveValue('0');
    await page.getByRole('button', { name: '添加片段', exact: true }).click(); await expect(page.locator('#join-clips > li')).toHaveCount(4);
    await page.getByRole('button', { name: '移除片段 4', exact: true }).click(); await expect(page.locator('#join-clips > li')).toHaveCount(3);
    await row(0).locator('input').nth(1).fill('2.1'); await expect(page.locator('#export-join')).toBeDisabled();
    await row(0).locator('input').nth(1).fill('3'); await expect(page.locator('#export-join')).toBeEnabled();
    await page.getByRole('button', { name: '预览片段 1', exact: true }).click();
    await expect.poll(() => page.locator('#join-preview').evaluate((node) => node.currentTime)).toBeGreaterThan(2.05);
    await expect.poll(() => page.locator('#join-preview').evaluate((node) => node.paused)).toBe(true);
    for (const viewport of [{ width: 1365, height: 1000 }, { width: 1001, height: 1000 }, { width: 800, height: 1000 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.locator('.tool-choice').evaluateAll((buttons) => buttons.every((button) => {
        const label = button.querySelector('.tool-name').getBoundingClientRect(), box = button.getBoundingClientRect();
        return label.left >= box.left && label.right <= box.right;
      }))).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('join-' + viewport.width + '.png'), fullPage: true });
    }
    let lost = false;
    await page.route('**/api/operation-plans/*/execute', async (route) => { if (!lost) { lost = true; await route.fetch(); return route.abort('failed'); } return route.continue(); });
    await page.locator('#export-join').click(); await expect(page.locator('#join-error')).toBeVisible();
    await page.locator('#export-join').click(); await expect(page.locator('#task-status')).toHaveText('已完成', { timeout: 15000 });
    await expect(page.locator('#join-result-slot #conversion-result')).toBeVisible();
    expect(writes.filter((value) => value === '/api/operation-plans')).toHaveLength(1);
    expect(writes.filter((value) => value.endsWith('/execute'))).toHaveLength(2);
    await page.locator('#output-preview').evaluate((node) => node.play());
    await expect.poll(() => page.locator('#output-preview').evaluate((node) => node.currentTime)).toBeGreaterThan(0.1);
    const downloadEvent = page.waitForEvent('download'); await page.locator('#download-output').click();
    const downloaded = await (await downloadEvent).path();
    const detected = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', downloaded], { timeout: 10000, encoding: 'utf8' }));
    expect(Number(detected.format.duration)).toBeGreaterThan(2.75); expect(Number(detected.format.duration)).toBeLessThan(3.25);
    expect(detected.streams.some((stream) => stream.codec_name === 'aac')).toBe(true);
    for (const seconds of [0.5, 1.5, 2.5]) {
      const frame = execFileSync('ffmpeg', ['-v', 'error', '-ss', String(seconds), '-i', downloaded, '-vf', 'scale=1:1', '-frames:v', '1', '-pix_fmt', 'rgb24', '-f', 'rawvideo', 'pipe:1'], { timeout: 10000 });
      expect(frame[seconds === 1.5 ? 0 : 2]).toBeGreaterThan(150);
    }
    const preview = await context.request.get(await page.locator('#source-preview').getAttribute('src')); expect(await preview.body()).toEqual(fs.readFileSync(joinVideo));
    await page.reload(); await expect(page.locator('#media-status')).toHaveText('已就绪'); await selectTool(page, 'join');
    await expect(page.locator('#join-clips > li')).toHaveCount(3); await expect(row(0).locator('input').first()).toHaveValue('2');
    await expect(page.locator('#join-result-slot #conversion-result')).toBeVisible(); expect(errors).toEqual([]);
  } finally { await removeAccount(context, account); }
});

test('login opens a project-free workspace and a real video is detected on desktop and mobile', async ({ page, context }, testInfo) => {
  const errors = [];
  const requests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  const account = await registerAndLogin(page, context);
  try {
    await expect(page.getByRole('button', { name: '视频转换', exact: true })).toBeEnabled();
    await page.locator('#media-file').setInputFiles(video);
    await page.getByRole('button', { name: '上传并检测', exact: true }).click();
    await expect(page.locator('#media-status')).toHaveText('已就绪', { timeout: 15000 });
    await expect(page.locator('#media-metadata')).toContainText('160 × 90');
    await expect(page.locator('#media-metadata')).toContainText('h264');
    await expect(page.locator('#media-total')).toHaveText('1 个素材');
    await selectTool(page, 'audio');
    await expect(page.locator('#audio-missing')).toBeVisible();
    await expect(page.getByRole('button', { name: '开始提取', exact: true })).toBeDisabled();
    await selectTool(page, 'trim');
    await expect(page.getByRole('button', { name: '开始裁切', exact: true })).toBeDisabled();
    await expect(page.locator('#trim-range-error')).toBeVisible();
    await selectTool(page, 'detect');
    for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('workbench-' + viewport.width + '.png'), fullPage: true });
    }
    await page.reload();
    await expect(page.locator('#workbench-panel')).toBeVisible();
    await expect(page.locator('#media-status')).toHaveText('已就绪');
    await page.getByRole('button', { name: '账户设置', exact: true }).click();
    await expect(page.locator('#profile-username')).toHaveText(account);
    await page.getByRole('button', { name: '返回工作台', exact: true }).click();
    await expect(page.locator('#workbench-panel')).toBeVisible();
    expect(requests.some((url) => url.includes('/api/projects'))).toBe(false);
    expect(errors).toEqual([]);
  } finally { await removeAccount(context, account); }
});

test('original video previews survive reload, preserve seeking, retry errors and revoke on deletion', async ({ page, context, browser }, testInfo) => {
  test.setTimeout(60000);
  const source = path.join(directory, 'source-preview.mp4'), unsupported = path.join(directory, 'unsupported-preview.mkv');
  execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'testsrc2=s=320x180:r=10:d=3',
    '-f', 'lavfi', '-i', 'sine=frequency=440:duration=3', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-y', source],
    { timeout: 15000, stdio: 'ignore' });
  execFileSync('ffmpeg', ['-v', 'error', '-i', source, '-c', 'copy', '-y', unsupported], { timeout: 15000, stdio: 'ignore' });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const account = await registerAndLogin(page, context);
  try {
    await page.locator('#media-file').setInputFiles(source);
    await page.getByRole('button', { name: '上传并检测', exact: true }).click();
    await expect(page.locator('#media-status')).toHaveText('已就绪', { timeout: 15000 });
    const item = (await (await context.request.get('/api/media')).json()).data.items[0];
    expect(item.previewUrl).toBe('/api/media/' + item.id + '/preview');
    const full = await context.request.get(item.previewUrl);
    expect(full.status()).toBe(200); expect(full.headers()['content-type']).toBe('video/mp4');
    expect(await full.body()).toEqual(fs.readFileSync(source));
    expect((await context.request.get(item.previewUrl, { headers: { Range: 'bytes=-32' } })).status()).toBe(206);
    const anonymous = await browser.newContext({ baseURL: new URL(page.url()).origin });
    try { expect((await anonymous.request.get(item.previewUrl)).status()).toBe(401); }
    finally { await anonymous.close(); }
    let failOnce = true;
    await page.route('**/api/media/*/preview', route => {
      if (failOnce) { failOnce = false; return route.abort(); }
      return route.continue();
    });
    await page.reload();
    await expect(page.locator('#source-preview-status')).toHaveText('原视频暂时无法播放。');
    await page.getByRole('button', { name: '重新加载原视频', exact: true }).click();
    await page.waitForFunction(() => document.getElementById('source-preview').readyState >= 2);
    await expect(page.locator('#source-preview-status')).toBeHidden();
    await expect(page.locator('#selected-preview')).toBeHidden();
    await expect(page.locator('#source-preview')).toHaveAttribute('src', item.previewUrl);
    await page.locator('#source-preview').evaluate(video => video.play());
    await page.waitForFunction(() => document.getElementById('source-preview').currentTime > 0);
    await page.locator('#source-preview').evaluate(video => { video.pause(); video.currentTime = 1.2; });
    await page.waitForFunction(() => !document.getElementById('source-preview').seeking);
    await Promise.all([
      page.waitForResponse(response => response.request().method() === 'GET' && new URL(response.url()).pathname === '/api/media'),
      page.getByRole('button', { name: '刷新素材', exact: true }).click()
    ]);
    expect(await page.locator('#source-preview').evaluate(video => video.currentTime)).toBeGreaterThanOrEqual(1.19);
    for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('source-preview-' + viewport.width + '.png'), fullPage: true });
    }
    await page.locator('#media-file').setInputFiles(unsupported);
    await page.getByRole('button', { name: '上传并检测', exact: true }).click();
    await expect(page.locator('#media-status')).toHaveText('已就绪', { timeout: 15000 });
    await expect(page.locator('#source-preview')).toBeHidden();
    await expect(page.locator('#source-preview')).not.toHaveAttribute('src');
    await expect(page.locator('#source-preview-status')).toHaveText('当前格式不支持直接预览。');
    await page.locator('#media-list > li').filter({ hasText: 'source-preview.mp4' }).locator('button').first().click();
    await expect(page.locator('#source-preview')).toHaveAttribute('src', item.previewUrl);
    await page.getByRole('button', { name: '删除素材 source-preview.mp4', exact: true }).click();
    await page.getByRole('button', { name: '确认删除', exact: true }).click();
    await expect(page.locator('#delete-media-dialog')).toBeHidden();
    expect((await context.request.get(item.previewUrl, { headers: { Range: 'bytes=0-31' } })).status()).toBe(404);
    await expect(page.locator('#source-preview')).not.toHaveAttribute('src', item.previewUrl);
    expect(errors).toEqual([]);
  } finally { await removeAccount(context, account); }
});

test('damaged files fail honestly and can be retried', async ({ page, context }) => {
  const account = await registerAndLogin(page, context);
  try {
    await page.locator('#media-file').setInputFiles({ name: 'broken.mp4', mimeType: 'video/mp4', buffer: Buffer.from('not a real video') });
    await page.getByRole('button', { name: '上传并检测', exact: true }).click();
    await expect(page.locator('#media-status')).toHaveText('检测失败', { timeout: 15000 });
    await expect(page.locator('#media-error')).toBeVisible();
    await page.getByRole('button', { name: '重新检测', exact: true }).click();
    await expect(page.locator('#media-status')).toHaveText('检测失败', { timeout: 15000 });
    await expect(page.locator('#media-total')).toHaveText('1 个素材');
  } finally { await removeAccount(context, account); }
});

test('native conversion survives reload and provides a playable authenticated download', async ({ page, context, browser }, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const account = await registerAndLogin(page, context);
  try {
    await selectTool(page, 'convert');
    await expect(page.locator('#start-conversion')).toBeDisabled();
    await page.locator('#media-file').setInputFiles(video);
    await page.getByRole('button', { name: '上传并检测', exact: true }).click();
    await expect(page.locator('#media-status')).toHaveText('已就绪', { timeout: 15000 });
    await page.locator('#conversion-resolution').selectOption('720p');
    await page.getByRole('button', { name: '开始转换', exact: true }).click();
    await expect(page.locator('#task-status')).toHaveText('已完成', { timeout: 20000 });
    await expect(page.locator('#task-total')).toHaveText('1 个任务');
    await page.waitForFunction(() => {
      const video = document.getElementById('output-preview');
      return video.readyState >= 2 && video.videoWidth === 160 && video.videoHeight === 90;
    });
    const href = await page.locator('#download-output').getAttribute('href');
    const preview = href.replace('/download', '/preview');
    const range = await context.request.get(preview, { headers: { Range: 'bytes=0-31' } });
    expect(range.status()).toBe(206);
    expect((await range.body()).length).toBe(32);
    const anonymous = await browser.newContext({ baseURL: new URL(page.url()).origin });
    try { expect((await anonymous.request.get(href)).status()).toBe(401); }
    finally { await anonymous.close(); }
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('link', { name: '下载 MP4', exact: true }).click();
    const download = await downloadEvent;
    expect(download.suggestedFilename()).toBe('native-video-converted.mp4');
    const downloaded = await download.path();
    expect(fs.statSync(downloaded).size).toBeGreaterThan(0);
    const metadata = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height', '-of', 'json', downloaded], { timeout: 10000 }).toString());
    expect(metadata.streams[0]).toMatchObject({ codec_name: 'h264', width: 160, height: 90 });
    await page.reload();
    await expect(page.locator('#workbench-panel')).toBeVisible();
    await selectTool(page, 'convert');
    await expect(page.locator('#task-status')).toHaveText('已完成');
    await expect(page.locator('#download-output')).toHaveAttribute('href', href);
    for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('conversion-' + viewport.width + '.png'), fullPage: true });
    }
    expect(errors).toEqual([]);
  } finally { await removeAccount(context, account); }
});

test('target-size compression produces a complete smaller video and persists its result', async ({ page, context }, testInfo) => {
  const compressionVideo = path.join(directory, 'compression-source.mkv');
  execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=640x360:rate=20',
    '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000', '-t', '3', '-c:v', 'mpeg4', '-q:v', '2', '-c:a', 'pcm_s16le', '-y', compressionVideo],
  { timeout: 15000, stdio: 'ignore' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const account = await registerAndLogin(page, context);
  try {
    await selectTool(page, 'compress');
    await page.locator('#media-file').setInputFiles(compressionVideo);
    await page.getByRole('button', { name: '上传并检测', exact: true }).click();
    await expect(page.locator('#media-status')).toHaveText('已就绪', { timeout: 15000 });
    await page.locator('#compression-target').fill('0');
    await expect(page.getByRole('button', { name: '开始压缩', exact: true })).toBeDisabled();
    const target = 200000;
    await page.locator('#compression-target').fill(String(target / 1024 / 1024));
    await page.locator('#conversion-resolution').selectOption('720p');
    await page.getByRole('button', { name: '开始压缩', exact: true }).click();
    await expect(page.locator('#task-status')).toHaveText('已完成', { timeout: 20000 });
    await expect(page.locator('#compression-stats')).toContainText('实际');
    await page.waitForFunction(() => document.getElementById('output-preview').readyState >= 2);
    const tasks = (await (await context.request.get('/api/tasks')).json()).data.items;
    expect(tasks[0].parameters).toMatchObject({ operation: 'compress', targetSizeBytes: target, resolutionPreset: '720p' });
    const output = tasks[0].outputs[0];
    expect(output.sizeBytes).toBeLessThanOrEqual(target);
    expect(output.sizeBytes).toBeLessThan(fs.statSync(compressionVideo).size);
    const response = await context.request.get(output.downloadUrl);
    expect(response.status()).toBe(200);
    const downloaded = path.join(directory, 'downloaded-compressed.mp4');
    fs.writeFileSync(downloaded, await response.body());
    const metadata = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_name,width,height', '-of', 'json', downloaded], { timeout: 10000 }).toString());
    expect(metadata.streams[0]).toMatchObject({ codec_name: 'h264', width: 640, height: 360 });
    expect(metadata.streams.some((stream) => stream.codec_name === 'aac')).toBe(true);
    expect(Number(metadata.format.duration)).toBeGreaterThanOrEqual(2.9);
    expect(Number(metadata.format.duration)).toBeLessThanOrEqual(3.25);
    await page.reload();
    await selectTool(page, 'compress');
    await expect(page.locator('#task-status')).toHaveText('已完成');
    await expect(page.locator('#download-output')).toHaveAttribute('href', output.downloadUrl);
    for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('compression-' + viewport.width + '.png'), fullPage: true });
    }
    expect(errors).toEqual([]);
  } finally { await removeAccount(context, account); }
});

test('audio extraction provides playable private MP3 and restores after reload', async ({ page, context, browser }, testInfo) => {
  const source = path.join(directory, 'soundtrack-source.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=320x180:rate=10',
    '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000', '-t', '2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-y', source],
  { timeout: 15000, stdio: 'ignore' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const account = await registerAndLogin(page, context);
  try {
    await selectTool(page, 'audio');
    await expect(page.locator('#resolution-field')).toBeHidden();
    await expect(page.locator('#compression-target-field')).toBeHidden();
    await page.locator('#media-file').setInputFiles(source);
    await page.getByRole('button', { name: '上传并检测', exact: true }).click();
    await expect(page.locator('#media-status')).toHaveText('已就绪', { timeout: 15000 });
    await expect(page.locator('#audio-missing')).toBeHidden();
    await page.getByRole('button', { name: '开始提取', exact: true }).click();
    await expect(page.locator('#task-status')).toHaveText('已完成', { timeout: 15000 });
    await expect(page.locator('#output-preview')).toBeHidden();
    await expect(page.locator('#output-audio')).toBeVisible();
    await page.waitForFunction(() => document.getElementById('output-audio').readyState >= 2);
    await page.locator('#output-audio').evaluate((audio) => audio.play());
    await page.waitForFunction(() => document.getElementById('output-audio').currentTime > 0);
    await page.locator('#output-audio').evaluate((audio) => audio.pause());
    const task = (await (await context.request.get('/api/tasks')).json()).data.items[0];
    expect(task.parameters).toEqual({ operation: 'extract_audio', outputFormat: 'mp3' });
    const output = task.outputs[0];
    expect(output.contentType).toBe('audio/mpeg');
    expect(output.metadata).toMatchObject({ width: null, height: null, videoCodec: null, hasAudio: true, audioCodec: 'mp3' });
    const range = await context.request.get(output.previewUrl, { headers: { Range: 'bytes=0-31' } });
    expect(range.status()).toBe(206); expect((await range.body()).length).toBe(32);
    expect(range.headers()['content-type']).toContain('audio/mpeg');
    const anonymous = await browser.newContext({ baseURL: new URL(page.url()).origin });
    try { expect((await anonymous.request.get(output.downloadUrl)).status()).toBe(401); }
    finally { await anonymous.close(); }
    const downloading = page.waitForEvent('download');
    await page.getByRole('link', { name: '下载 MP3', exact: true }).click();
    const download = await downloading;
    expect(download.suggestedFilename()).toBe('soundtrack-source-audio.mp3');
    const metadata = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_name,codec_type', '-of', 'json', await download.path()], { timeout: 10000 }).toString());
    expect(metadata.streams).toHaveLength(1); expect(metadata.streams[0]).toMatchObject({ codec_name: 'mp3', codec_type: 'audio' });
    expect(Number(metadata.format.duration)).toBeGreaterThanOrEqual(1.8); expect(Number(metadata.format.duration)).toBeLessThanOrEqual(2.3);
    await page.reload();
    await selectTool(page, 'audio');
    await expect(page.locator('#task-status')).toHaveText('已完成');
    await expect(page.locator('#download-output')).toHaveAttribute('href', output.downloadUrl);
    for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('audio-' + viewport.width + '.png'), fullPage: true });
    }
    expect(errors).toEqual([]);
  } finally { await removeAccount(context, account); }
});

test('deleting media confirms, retries safely and revokes results without restoring stale records', async ({ page, context }, testInfo) => {
  test.setTimeout(60000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const account = await registerAndLogin(page, context);
  let releaseOld = () => {};
  try {
    await selectTool(page, 'convert');
    await page.locator('#media-file').setInputFiles(video);
    await page.getByRole('button', { name: '上传并检测', exact: true }).click();
    await expect(page.locator('#media-status')).toHaveText('已就绪', { timeout: 15000 });
    await page.getByRole('button', { name: '开始转换', exact: true }).click();
    await expect(page.locator('#task-status')).toHaveText('已完成', { timeout: 20000 });
    const task = (await (await context.request.get('/api/tasks')).json()).data.items[0];
    const output = task.outputs[0];
    await page.locator('#media-file').setInputFiles({ name: 'preserved.mp4', mimeType: 'video/mp4', buffer: fs.readFileSync(video) });
    await page.getByRole('button', { name: '上传并检测', exact: true }).click();
    await expect(page.locator('#media-result-name')).toHaveText('preserved.mp4');
    await expect(page.locator('#media-status')).toHaveText('已就绪', { timeout: 15000 });
    await expect(page.locator('#media-total')).toHaveText('2 个素材');
    await page.waitForFunction(() => document.getElementById('selected-preview').readyState >= 2 && document.getElementById('output-preview').readyState >= 2);
    const trash = page.getByRole('button', { name: '删除素材 native-video.mp4', exact: true });
    await trash.click();
    await expect(page.locator('#delete-media-name')).toHaveText('native-video.mp4');
    for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      expect(await page.locator('#delete-media-dialog').evaluate((dialog) => dialog.scrollWidth <= dialog.clientWidth)).toBe(true);
      expect(await page.locator('#delete-media-dialog').evaluate((dialog) => {
        const box = dialog.getBoundingClientRect();
        return box.left >= 0 && box.top >= 0 && box.right <= innerWidth && box.bottom <= innerHeight;
      })).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('delete-media-' + viewport.width + '.png') });
    }
    await page.getByRole('button', { name: '取消', exact: true }).click();
    await expect(page.locator('#media-total')).toHaveText('2 个素材');
    await trash.click(); await page.keyboard.press('Escape');
    await expect(page.locator('#delete-media-dialog')).not.toBeVisible();

    let failOnce = true;
    await page.route('**/api/media/*', (route) => {
      if (route.request().method() === 'DELETE' && failOnce) { failOnce = false; return route.abort(); }
      return route.continue();
    });
    let holdOnce = true, captured;
    const oldCaptured = new Promise((resolve) => { captured = resolve; });
    const gate = new Promise((resolve) => { releaseOld = resolve; });
    let finished;
    const oldFinished = new Promise((resolve) => { finished = resolve; });
    await page.route('**/api/tasks?*', async (route) => {
      if (!holdOnce) return route.continue();
      holdOnce = false;
      const response = await route.fetch(); captured();
      await gate; await route.fulfill({ response }); finished();
    });
    await page.locator('#refresh-tasks').click(); await oldCaptured;
    await trash.click();
    await page.getByRole('button', { name: '确认删除', exact: true }).click();
    await expect(page.locator('#delete-media-error')).toHaveText('暂时无法连接服务，请稍后重试。');
    await expect(page.locator('#media-total')).toHaveText('2 个素材');
    await page.getByRole('button', { name: '确认删除', exact: true }).click();
    await expect(page.locator('#delete-media-dialog')).not.toBeVisible();
    await expect(page.locator('#media-total')).toHaveText('1 个素材');
    await expect(page.locator('#task-total')).toHaveText('0 个任务');
    releaseOld(); await oldFinished;
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await expect(page.locator('#task-total')).toHaveText('0 个任务');
    await expect(page.locator('#conversion-result')).toBeHidden();
    await expect(page.locator('#download-output')).toBeHidden();
    await expect(page.locator('#media-result-name')).toHaveText('preserved.mp4');
    for (const url of ['/api/media/' + task.mediaId, '/api/tasks/' + task.id, output.previewUrl, output.downloadUrl])
      expect((await context.request.get(url)).status()).toBe(404);
    expect((await context.request.delete('/api/media/' + task.mediaId, { headers: { 'X-CSRF-Token': await csrf(context) } })).status()).toBe(200);
    await page.reload();
    await expect(page.locator('#media-total')).toHaveText('1 个素材');
    await expect(page.locator('#media-result-name')).toHaveText('preserved.mp4');
    await page.getByRole('button', { name: '删除素材 preserved.mp4', exact: true }).click();
    await page.getByRole('button', { name: '确认删除', exact: true }).click();
    await expect(page.locator('#media-total')).toHaveText('0 个素材');
    await expect(page.locator('#media-result')).toBeHidden();
    await selectTool(page, 'convert');
    await expect(page.getByRole('button', { name: '开始转换', exact: true })).toBeDisabled();
    expect(errors).toEqual([]);
  } finally { releaseOld(); await removeAccount(context, account); }
});

test('individual MP3 and MP4 deletion preserves originals, history and the ability to process again', async ({ page, context }, testInfo) => {
  test.setTimeout(60000);
  const source = path.join(directory, 'result-source.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=320x180:rate=10',
    '-f', 'lavfi', '-i', 'sine=frequency=660:sample_rate=48000', '-t', '2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-y', source],
  { timeout: 15000, stdio: 'ignore' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const account = await registerAndLogin(page, context);
  let releaseOld = () => {};
  try {
    await selectTool(page, 'convert');
    await page.locator('#media-file').setInputFiles(source);
    await page.getByRole('button', { name: '上传并检测', exact: true }).click();
    await expect(page.locator('#media-status')).toHaveText('已就绪', { timeout: 15000 });
    await page.getByRole('button', { name: '开始转换', exact: true }).click();
    await expect(page.locator('#task-status')).toHaveText('已完成', { timeout: 20000 });
    await selectTool(page, 'audio');
    await page.getByRole('button', { name: '开始提取', exact: true }).click();
    await expect(page.locator('#task-total')).toHaveText('2 个任务');
    await expect(page.locator('#download-output')).toHaveText('下载 MP3', { timeout: 15000 });
    const tasks = (await (await context.request.get('/api/tasks')).json()).data.items;
    const audioTask = tasks.find((task) => task.parameters.operation === 'extract_audio');
    const videoTask = tasks.find((task) => task.parameters.operation === 'transcode');
    const audio = audioTask.outputs[0], converted = videoTask.outputs[0];
    await page.waitForFunction(() => document.getElementById('output-audio').readyState >= 2);
    await page.getByRole('button', { name: '删除结果', exact: true }).click();
    await expect(page.locator('#delete-output-name')).toHaveText(audio.filename);
    for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      expect(await page.locator('#delete-output-dialog').evaluate((dialog) => {
        const box = dialog.getBoundingClientRect();
        return box.left >= 0 && box.top >= 0 && box.right <= innerWidth && box.bottom <= innerHeight && dialog.scrollWidth <= dialog.clientWidth;
      })).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('delete-output-' + viewport.width + '.png') });
    }
    await page.getByRole('button', { name: '取消', exact: true }).click();
    expect((await context.request.get(audio.downloadUrl)).status()).toBe(200);
    await page.getByRole('button', { name: '删除结果', exact: true }).click(); await page.keyboard.press('Escape');
    await expect(page.locator('#delete-output-dialog')).not.toBeVisible();

    let loseOnce = true;
    await page.route('**/api/outputs/' + audio.id, async (route) => {
      if (route.request().method() === 'DELETE' && loseOnce) {
        loseOnce = false; expect((await route.fetch()).status()).toBe(200); return route.abort();
      }
      return route.continue();
    });
    let holdOnce = true, captured, finished;
    const oldCaptured = new Promise((resolve) => { captured = resolve; });
    const oldFinished = new Promise((resolve) => { finished = resolve; });
    const gate = new Promise((resolve) => { releaseOld = resolve; });
    await page.route('**/api/tasks?*', async (route) => {
      if (!holdOnce) return route.continue();
      holdOnce = false; const response = await route.fetch(); captured();
      await gate; await route.fulfill({ response }); finished();
    });
    await page.locator('#refresh-tasks').click(); await oldCaptured;
    await page.getByRole('button', { name: '删除结果', exact: true }).click();
    await page.getByRole('button', { name: '确认删除结果', exact: true }).click();
    await expect(page.locator('#delete-output-error')).toHaveText('暂时无法连接服务，请稍后重试。');
    expect((await context.request.get(audio.previewUrl)).status()).toBe(404);
    await page.getByRole('button', { name: '确认删除结果', exact: true }).click();
    await expect(page.locator('#delete-output-dialog')).not.toBeVisible();
    await expect(page.locator('#output-empty')).toBeVisible();
    await expect(page.locator('#output-audio')).toBeHidden();
    await expect(page.locator('#download-output')).toBeHidden();
    releaseOld(); await oldFinished;
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await expect(page.locator('#output-empty')).toBeVisible();
    await expect(page.locator('#task-total')).toHaveText('2 个任务');
    expect((await context.request.get(converted.previewUrl, { headers: { Range: 'bytes=0-31' } })).status()).toBe(206);
    const deletedTask = (await (await context.request.get('/api/tasks/' + audioTask.id)).json()).data;
    expect(deletedTask.status).toBe('SUCCEEDED'); expect(deletedTask.outputs).toEqual([]);
    expect((await (await context.request.get('/api/media/' + audioTask.mediaId)).json()).data.status).toBe('READY');
    await page.reload();
    await selectTool(page, 'audio');
    await expect(page.locator('#output-empty')).toBeVisible();
    await page.locator('#task-list .task-row').filter({ hasText: videoTask.id.slice(0, 8) }).getByRole('button').click();
    await expect(page.locator('#download-output')).toHaveAttribute('href', converted.downloadUrl);
    await page.getByRole('button', { name: '删除结果', exact: true }).click();
    await page.getByRole('button', { name: '确认删除结果', exact: true }).click();
    await expect(page.locator('#output-empty')).toBeVisible();
    await expect(page.locator('#output-preview')).toBeHidden();
    await expect(page.locator('#task-stage')).toContainText('无可用结果');
    expect((await context.request.get(converted.downloadUrl)).status()).toBe(404);
    await expect(page.locator('#media-total')).toHaveText('1 个素材');
    for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('output-empty-' + viewport.width + '.png'), fullPage: true });
    }
    await page.getByRole('button', { name: '开始转换', exact: true }).click();
    await expect(page.locator('#task-total')).toHaveText('3 个任务');
    await expect(page.locator('#download-output')).toBeVisible({ timeout: 20000 });
    expect(await page.locator('#download-output').getAttribute('href')).not.toBe(converted.downloadUrl);
    await expect(page.locator('#task-status')).toHaveText('已完成');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  } finally { releaseOld(); await removeAccount(context, account); }
});

test('video mute removes all audio and preserves the source with private playback and downloads', async ({ page, context, browser }, testInfo) => {
  test.setTimeout(60000);
  const source = path.join(directory, 'mute-source.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'color=c=green:s=320x180:r=10:d=2',
    '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2', '-f', 'lavfi', '-i', 'sine=frequency=880:duration=2',
    '-map', '0:v', '-map', '1:a', '-map', '2:a', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-y', source],
    { timeout: 15000, stdio: 'ignore' });
  const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  const account = await registerAndLogin(page, context);
  try {
    await selectTool(page, 'mute');
    await expect(page.locator('#processing-audio-mode')).toHaveText('移除音轨');
    await expect(page.locator('#trim-fields')).toBeHidden();
    await expect(page.locator('#compression-target-field')).toBeHidden();
    await page.locator('#conversion-resolution').selectOption('720p');
    await page.locator('#media-file').setInputFiles(source);
    await page.getByRole('button', { name: '上传并检测', exact: true }).click();
    await expect(page.locator('#media-status')).toHaveText('已就绪', { timeout: 15000 });
    await expect(page.locator('#media-metadata')).toContainText('aac');
    await page.getByRole('button', { name: '开始静音', exact: true }).click();
    await expect(page.locator('#task-status')).toHaveText('已完成', { timeout: 20000 });
    const tasks = (await (await context.request.get('/api/tasks')).json()).data;
    expect(tasks.total).toBe(1);
    const task = tasks.items[0], output = task.outputs[0];
    expect(task.parameters).toEqual({ operation: 'mute', outputFormat: 'mp4', resolutionPreset: '720p' });
    expect(output.metadata.hasAudio).toBe(false); expect(output.metadata.audioCodec).toBeNull();
    expect(output.metadata).toMatchObject({ width: 320, height: 180, videoCodec: 'h264' });
    await page.waitForFunction(() => document.getElementById('output-preview').readyState >= 2);
    await page.locator('#output-preview').evaluate((video) => video.play());
    await page.waitForFunction(() => document.getElementById('output-preview').currentTime > 0);
    await page.locator('#output-preview').evaluate((video) => video.pause());
    const anonymous = await browser.newContext({ baseURL: new URL(page.url()).origin });
    try { expect((await anonymous.request.get(output.previewUrl)).status()).toBe(401); }
    finally { await anonymous.close(); }
    expect((await context.request.get(output.previewUrl, { headers: { Range: 'bytes=0-3' } })).status()).toBe(206);
    const downloading = page.waitForEvent('download');
    await page.getByRole('link', { name: '下载 MP4', exact: true }).click();
    const download = await downloading;
    expect(download.suggestedFilename()).toBe('mute-source-muted.mp4');
    const metadata = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,codec_name,width,height', '-of', 'json', await download.path()], { timeout: 10000 }).toString());
    expect(metadata.streams).toEqual([{ codec_name: 'h264', codec_type: 'video', width: 320, height: 180 }]);
    expect(Number(metadata.format.duration)).toBeGreaterThanOrEqual(1.75); expect(Number(metadata.format.duration)).toBeLessThanOrEqual(2.25);
    const original = (await (await context.request.get('/api/media/' + task.mediaId)).json()).data;
    expect(original.metadata.hasAudio).toBe(true); expect(original.sizeBytes).toBe(fs.statSync(source).size);
    for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('mute-' + viewport.width + '.png'), fullPage: true });
    }
    await page.reload(); await selectTool(page, 'mute');
    await page.getByRole('button', { name: '静音 MP4 · 720p' }).click();
    await expect(page.locator('#conversion-title')).toHaveText('视频静音');
    await expect(page.locator('#download-output')).toHaveAttribute('href', output.downloadUrl);
    expect(errors).toEqual([]);
  } finally { await removeAccount(context, account); }
});

test('video trim validates its range, retries one task and downloads the selected frames', async ({ page, context, browser }, testInfo) => {
  test.setTimeout(60000);
  const source = path.join(directory, 'trim-source.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'color=c=blue:s=320x180:r=10:d=1',
    '-f', 'lavfi', '-i', 'color=c=red:s=320x180:r=10:d=2', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=3',
    '-filter_complex', '[0:v][1:v]concat=n=2:v=1:a=0[v]', '-map', '[v]', '-map', '2:a',
    '-c:v', 'libx264', '-g', '30', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-y', source], { timeout: 15000, stdio: 'ignore' });
  const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  const account = await registerAndLogin(page, context);
  try {
    await selectTool(page, 'trim');
    await expect(page.locator('#resolution-field')).toBeHidden();
    await expect(page.locator('#compression-target-field')).toBeHidden();
    await page.locator('#media-file').setInputFiles(source);
    await page.getByRole('button', { name: '上传并检测', exact: true }).click();
    await expect(page.locator('#media-status')).toHaveText('已就绪', { timeout: 15000 });
    await page.locator('#trim-start').fill('1.25'); await page.locator('#trim-end').fill('1.5');
    await expect(page.getByRole('button', { name: '开始裁切', exact: true })).toBeDisabled();
    await expect(page.locator('#trim-range-error')).toBeVisible();
    await page.locator('#trim-end').fill('4');
    await expect(page.getByRole('button', { name: '开始裁切', exact: true })).toBeDisabled();
    await page.locator('#trim-end').fill('2.25');
    await expect(page.locator('#trim-range-error')).toBeHidden();
    let loseOnce = true;
    await page.route('**/api/operation-plans/*/execute', async (route) => {
      if (loseOnce) { loseOnce = false; expect((await route.fetch()).status()).toBe(202); return route.abort(); }
      return route.continue();
    });
    await page.getByRole('button', { name: '开始裁切', exact: true }).click();
    await expect(page.locator('#conversion-error')).toHaveText('暂时无法连接服务，请稍后重试。');
    await page.getByRole('button', { name: '开始裁切', exact: true }).click();
    await expect(page.locator('#task-status')).toHaveText('已完成', { timeout: 20000 });
    const tasks = (await (await context.request.get('/api/tasks')).json()).data;
    expect(tasks.total).toBe(1);
    expect((await (await context.request.get('/api/operation-plans')).json()).data.total).toBe(1);
    const task = tasks.items[0], output = task.outputs[0];
    expect(task.parameters).toEqual({ operation: 'trim', outputFormat: 'mp4', startMs: 1250, endMs: 2250, audioMode: 'keep' });
    expect(output.metadata.durationMs).toBeGreaterThanOrEqual(750); expect(output.metadata.durationMs).toBeLessThanOrEqual(1250);
    await page.waitForFunction(() => document.getElementById('output-preview').readyState >= 2 && document.getElementById('output-preview').videoWidth === 320);
    await page.locator('#output-preview').evaluate((video) => video.play());
    await page.waitForFunction(() => document.getElementById('output-preview').currentTime > 0);
    await page.locator('#output-preview').evaluate((video) => video.pause());
    await expect(page.locator('#task-stage')).toContainText('1.250-2.250 秒');
    const anonymous = await browser.newContext({ baseURL: new URL(page.url()).origin });
    try { expect((await anonymous.request.get(output.downloadUrl)).status()).toBe(401); }
    finally { await anonymous.close(); }
    const downloading = page.waitForEvent('download');
    await page.getByRole('link', { name: '下载 MP4', exact: true }).click();
    const download = await downloading;
    expect(download.suggestedFilename()).toBe('trim-source-trimmed.mp4');
    const downloaded = await download.path();
    const metadata = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_name,width,height', '-of', 'json', downloaded], { timeout: 10000 }).toString());
    expect(metadata.streams[0]).toMatchObject({ codec_name: 'h264', width: 320, height: 180 });
    expect(metadata.streams.some((stream) => stream.codec_name === 'aac')).toBe(true);
    expect(Number(metadata.format.duration)).toBeGreaterThanOrEqual(.75); expect(Number(metadata.format.duration)).toBeLessThanOrEqual(1.25);
    const pixel = path.join(directory, 'trim-frame.rgb');
    execFileSync('ffmpeg', ['-v', 'error', '-i', downloaded, '-frames:v', '1', '-vf', 'scale=1:1', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-y', pixel], { timeout: 10000, stdio: 'ignore' });
    const rgb = fs.readFileSync(pixel); expect(rgb.length).toBe(3); expect(rgb[0]).toBeGreaterThan(200); expect(rgb[2]).toBeLessThan(60);
    const original = (await (await context.request.get('/api/media/' + task.mediaId)).json()).data;
    expect(original.metadata.durationMs).toBeGreaterThanOrEqual(3000); expect(original.sizeBytes).toBe(fs.statSync(source).size);
    for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('trim-' + viewport.width + '.png'), fullPage: true });
    }
    await page.reload(); await selectTool(page, 'trim');
    await expect(page.locator('#download-output')).toHaveAttribute('href', output.downloadUrl);
    await expect(page.locator('#task-stage')).toContainText('1.250-2.250 秒');
    expect(errors).toEqual([]);
  } finally { await removeAccount(context, account); }
});
