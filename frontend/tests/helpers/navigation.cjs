async function selectTool(page, tool) {
  const group = ['subtitle', 'ai', 'find'].includes(tool) ? 'AI协作处理' : tool === 'history' ? '历史记录' : '常规处理';
  await page.locator('#workspace-home-nav').getByRole('button', { name: group, exact: true }).click();
  await page.locator('#workspace-tool-tab-' + tool).click();
}
module.exports = { selectTool };
