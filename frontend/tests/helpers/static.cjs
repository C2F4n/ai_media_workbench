const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../src/main/resources/static');

function readIndex() { return fs.readFileSync(path.join(root, 'index.html'), 'utf8'); }

// 页面与本地图标直接由测试拦截提供，API由各用例的后注册路由模拟，不占用端口。
async function serveStatic(page) {
  const files = { '/': 'index.html', '/assets/styles.css': 'assets/styles.css', '/assets/brand.svg': 'assets/brand.svg', '/assets/vendor/lucide.min.js': 'assets/vendor/lucide.min.js' };
  files['/assets/ui/components.js'] = 'assets/ui/components.js';
  files['/assets/auth/keyboard/config.json'] = 'assets/auth/keyboard/config.json';
  files['/assets/auth/keyboard/sound.ogg'] = 'assets/auth/keyboard/sound.ogg';
  for (const photo of ['mountain-ridges', 'turquoise-surf', 'sunset-meadow', 'forest-path', 'aerial-shore']) {
    const file = `assets/auth/gallery/${photo}.webp`;
    files[`/${file}`] = file;
  }
  files['/assets/fonts/InterDisplay-Bold.woff2'] = 'assets/fonts/InterDisplay-Bold.woff2';
  await page.route('**/*', (route) => {
    const name = new URL(route.request().url()).pathname;
    if (name.startsWith('/api/')) return route.fallback();
    const file = files[name]; if (!file) return route.fulfill({ status: 404, body: '' });
    const contentTypes = {
      '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
      '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json', '.ogg': 'audio/ogg',
    };
    const type = contentTypes[path.extname(file)] || 'text/html';
    return route.fulfill({
      status: 200, contentType: type,
      body: name === '/' ? readIndex() : fs.readFileSync(path.join(root, file))
    });
  });
}

module.exports = { readIndex, serveStatic };
