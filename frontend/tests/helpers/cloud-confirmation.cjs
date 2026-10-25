async function acceptCloudCalls(page) {
  await page.addLocatorHandler(page.locator('#cloud-confirm-dialog[open]'), async dialog => {
    await dialog.locator('#accept-cloud-confirm').click();
  });
}

async function handleActionConfirmations(page, decide = () => true) {
  await page.addLocatorHandler(page.locator('#action-confirm-dialog[open]'), async dialog => {
    await dialog.locator(await decide() ? '#accept-action-confirm' : '#cancel-action-confirm').click();
  });
}

module.exports = { acceptCloudCalls, handleActionConfirmations };
