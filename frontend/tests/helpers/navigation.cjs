async function selectTool(page, tool) {
  const toggle = page.locator('#toggle-sidebar');
  await toggle.waitFor({ state: 'visible' });
  if (await toggle.getAttribute('aria-expanded') === 'false') await toggle.click();
  await page.locator(`#${tool}-tool`).click();
}

module.exports = { selectTool };
