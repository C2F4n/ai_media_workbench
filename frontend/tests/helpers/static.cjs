const fs = require('node:fs');
const path = require('node:path');

// 页面与本地图标直接由测试拦截提供，API由各用例的后注册路由模拟，不占用端口。
async function serveStatic(page) {
  const root = path.resolve(__dirname, '../../../src/main/resources/static');
  const files = { '/': 'index.html', '/assets/styles.css': 'assets/styles.css', '/assets/brand.svg': 'assets/brand.svg', '/assets/vendor/lucide.min.js': 'assets/vendor/lucide.min.js' };
  files['/assets/ui/components.js'] = 'assets/ui/components.js';
  for (const name of ['studio-desk.webp', 'studio-lighting.webp', 'studio-editing.webp']) files['/assets/auth/' + name] = 'assets/auth/' + name;
  await page.route('**/*', (route) => {
    const name = new URL(route.request().url()).pathname;
    if (name.startsWith('/api/')) return route.fallback();
    const file = files[name]; if (!file) return route.fulfill({ status: 404, body: '' });
    const type = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.svg') ? 'image/svg+xml' : file.endsWith('.webp') ? 'image/webp' : 'text/html';
    return route.fulfill({ status: 200, contentType: type, body: fs.readFileSync(path.join(root, file)) });
  });
}

module.exports = { serveStatic };
