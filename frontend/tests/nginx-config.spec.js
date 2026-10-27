const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const net = require('node:net');

const root = path.resolve(__dirname, '../..');
function nginxPath() {
  if (process.env.NGINX_EXE) return process.env.NGINX_EXE;
  for (const folder of fs.readdirSync(path.dirname(root), { withFileTypes: true })) {
    if (!folder.isDirectory() || !folder.name.startsWith('nginx-')) continue;
    const base = path.join(path.dirname(root), folder.name);
    for (const candidate of [path.join(base, 'nginx.exe'), path.join(base, folder.name, 'nginx.exe')]) {
      if (fs.existsSync(candidate)) return candidate;
    }
  }
}
function opensslPath() {
  if (process.env.OPENSSL_EXE) return process.env.OPENSSL_EXE;
  for (const command of ['openssl.exe', 'git.exe']) {
    try {
      const found = execFileSync('where.exe', [command], { encoding: 'utf8', windowsHide: true, stdio: 'pipe' }).trim().split(/\r?\n/)[0];
      const candidate = command === 'git.exe' ? path.resolve(found, '../../usr/bin/openssl.exe') : found;
      if (fs.existsSync(candidate)) return candidate;
    } catch { /* Optional local verification tools may not be installed. */ }
  }
}

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const port = server.address().port;
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}

test('HTTP and HTTPS Nginx templates pass real syntax and certificate checks without starting a server', async () => {
  test.skip(process.platform !== 'win32', 'Windows deployment script verification');
  const nginx = nginxPath(), openssl = opensslPath();
  test.skip(!nginx || !openssl, 'Set NGINX_EXE and OPENSSL_EXE to enable deployment checks');
  // Nginx on Windows rejects DOS 8.3 paths such as R55600~1; expand them first.
  const tempRoot = fs.realpathSync.native(os.tmpdir());
  const directory = fs.mkdtempSync(path.join(tempRoot, 'amw-nginx-config-'));
  try {
    fs.mkdirSync(path.join(directory, 'logs'));
    fs.mkdirSync(path.join(directory, 'conf'));
    for (const name of ['client_body_temp', 'proxy_temp', 'fastcgi_temp', 'uwsgi_temp', 'scgi_temp']) {
      fs.mkdirSync(path.join(directory, 'temp', name), { recursive: true });
    }
    // Disposable certificate is only for nginx -t, never for a public browser or a running listener.
    const cert = path.join(directory, 'fullchain.pem'), key = path.join(directory, 'privkey.pem');
    execFileSync(openssl, ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1', '-subj', '/CN=media.example.com',
      '-addext', 'subjectAltName=DNS:media.example.com', '-keyout', key, '-out', cert], { stdio: 'ignore', timeout: 15000, windowsHide: true });
    const ports = new Set();
    while (ports.size < 3) ports.add(await freePort());
    const [httpPort, httpsPort, devPort] = [...ports];
    const template = fs.readFileSync(path.join(root, 'deploy/nginx/nginx.https.conf.template'), 'utf8')
      .replace('conf/ssl/fullchain.pem', cert.replaceAll('\\', '/')).replace('conf/ssl/privkey.pem', key.replaceAll('\\', '/'))
      .replace('127.0.0.1:8089', `127.0.0.1:${httpPort}`).replace('127.0.0.1:8443', `127.0.0.1:${httpsPort}`);
    const httpsConfig = path.join(directory, 'https.conf');
    fs.writeFileSync(httpsConfig, template);
    const devConfig = path.join(directory, 'http.conf');
    fs.writeFileSync(devConfig, fs.readFileSync(path.join(root, 'deploy/nginx/nginx.conf'), 'utf8').replace('127.0.0.1:8088', `127.0.0.1:${devPort}`));
    for (const config of [devConfig, httpsConfig]) {
      const output = execFileSync(nginx, ['-p', directory.replaceAll('\\', '/') + '/', '-c', config.replaceAll('\\', '/'), '-t'],
        { encoding: 'utf8', timeout: 10000, windowsHide: true, stdio: 'pipe' });
      expect(output).toBeDefined();
    }
    // Run the actual check-only command against an isolated prefix, not the user's Nginx installation.
    fs.copyFileSync(nginx, path.join(directory, 'nginx.exe'));
    const target = path.join(directory, 'conf/ai-media-workbench.conf');
    fs.writeFileSync(target, '# existing configuration must not change\n');
    const before = fs.readFileSync(target, 'utf8');
    const output = execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(root, 'deploy/run-nginx.ps1'),
      '-NginxHome', directory, '-ConfigPath', httpsConfig, '-CheckOnly'], { encoding: 'utf8', timeout: 10000, windowsHide: true });
    expect(output).toContain('no server was started or reloaded');
    expect(fs.readFileSync(target, 'utf8')).toBe(before);
    // nginx -t can create an empty PID file, but must not leave a running master PID.
    expect(fs.readFileSync(path.join(directory, 'logs/ai-media-workbench.pid'), 'utf8').trim()).toBe('');
  } finally {
    if (path.dirname(path.resolve(directory)) === path.resolve(tempRoot) && path.basename(directory).startsWith('amw-nginx-config-')) {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  }
});
