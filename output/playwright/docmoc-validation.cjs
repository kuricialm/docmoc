const { chromium } = require('playwright');

const APP_URL = 'http://localhost:3000';
const TEST_EMAIL = 'codex.validation@docmoc.local';
const TEST_PASSWORD = 'Codex123!';
const TEST_DOC_NAME = 'codex-validation.pdf';

async function waitFor(fn, description, timeout = 10000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    if (await fn()) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${description}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const pageErrors = [];

  page.on('pageerror', (error) => pageErrors.push(error.message));

  const loginResponse = await context.request.post(`${APP_URL}/api/auth/login`, {
    data: {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    },
  });
  if (!loginResponse.ok()) {
    throw new Error(`Validation login failed with status ${loginResponse.status()}`);
  }

  await page.goto(APP_URL, { waitUntil: 'networkidle' });

  await waitFor(async () => await page.getByText(TEST_DOC_NAME).isVisible(), 'test document card');

  await page.evaluate(() => {
    const root = document.documentElement;
    const frames = [
      {
        className: root.className,
        datasetTheme: root.dataset.theme || null,
      },
    ];

    const observer = new MutationObserver(() => {
      frames.push({
        className: root.className,
        datasetTheme: root.dataset.theme || null,
      });
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    window.__themeFrames = frames;
    window.__themeObserver = observer;
  });

  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await waitFor(
    async () => (await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark',
    'dark theme after toggle',
  );
  await page.waitForTimeout(300);

  const themeFrames = await page.evaluate(() => {
    window.__themeObserver?.disconnect();
    return window.__themeFrames || [];
  });
  const themeFramesAfterToggle = themeFrames.slice(1);
  if (!themeFramesAfterToggle.length) {
    throw new Error('Theme toggle produced no observed theme mutations');
  }
  if (themeFramesAfterToggle.some((frame) => frame.datasetTheme !== 'dark' || !frame.className.includes('dark'))) {
    throw new Error(`Theme toggle passed through an unexpected non-dark state: ${JSON.stringify(themeFrames)}`);
  }

  await page.getByText(TEST_DOC_NAME).click();
  const dialog = page.getByRole('dialog');
  await waitFor(async () => await dialog.isVisible(), 'document dialog');

  const pdfFrame = dialog.locator(`iframe[title="${TEST_DOC_NAME}"]`);
  await waitFor(async () => await pdfFrame.isVisible(), 'native PDF iframe');

  await pdfFrame.click({ position: { x: 40, y: 40 } });

  if (!(await dialog.isVisible()) || !(await pdfFrame.isVisible())) {
    throw new Error('PDF interaction caused the dialog to close or the preview to disappear');
  }
  if (pageErrors.length > 0) {
    throw new Error(`Page errors detected: ${pageErrors.join(' | ')}`);
  }

  await page.screenshot({ path: 'output/playwright/docmoc-validation.png', fullPage: true });

  await dialog.getByRole('button', { name: 'Close' }).click();
  await waitFor(async () => !(await dialog.isVisible()), 'dialog close');

  console.log(JSON.stringify({
    ok: true,
    themeFrames,
    screenshot: 'output/playwright/docmoc-validation.png',
  }, null, 2));

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
