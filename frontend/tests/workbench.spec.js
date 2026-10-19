const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const password = 'Workbench-2026!';
let directory;
let video;

test.beforeAll(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'amw-media-e2e-'));
  video = path.join(directory, 'native-video.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'color=c=blue:s=160x90:r=10:d=0.4',
    '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-y', video], { timeout: 15000, stdio: 'ignore' });
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
    await page.getByRole('button', { name: '视频转换', exact: true }).click();
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
    await page.getByRole('button', { name: '视频转换', exact: true }).click();
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
    await page.getByRole('button', { name: '视频压缩', exact: true }).click();
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
    await page.getByRole('button', { name: '视频压缩', exact: true }).click();
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
