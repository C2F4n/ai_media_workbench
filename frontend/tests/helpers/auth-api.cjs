const { expect } = require('@playwright/test');

async function postAuth(request, path, data) {
  const csrf = await request.get('/api/auth/csrf');
  expect(csrf.status()).toBe(200);
  const { token } = (await csrf.json()).data;
  return request.post('/api/auth/' + path, { data, headers: { 'X-CSRF-Token': token } });
}

async function login(page, username, password, rememberMe = false) {
  const result = await postAuth(page.request, 'login', { username, password, rememberMe });
  expect(result.status()).toBe(200);
  await page.goto('/');
  await expect(page.locator('#account-view')).toBeVisible();
}

module.exports = { postAuth, login };
