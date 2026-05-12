const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  // Page 1: Login (home)
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  console.log('=== LOGIN PAGE ===');
  const f1 = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, button')).filter(el => el.offsetParent !== null).map(el => ({
      tag: el.tagName,
      type: el.type || '',
      id: el.id || '',
      name: el.name || '',
      placeholder: el.placeholder || '',
      text: (el.textContent || '').trim().slice(0, 50),
      ariaHidden: el.getAttribute('aria-hidden') || '',
    }));
  });
  console.log(JSON.stringify(f1, null, 2));

  // Page 2: Submit verify form and see card page
  await page.locator('#guestName').fill('小明');
  await page.locator('#phone').fill('0912000001');
  await page.locator('button[type=submit]').click();
  await page.waitForURL(/\/card\//, { timeout: 8000 }).catch(() => console.log('No URL change'));
  await page.waitForTimeout(2000);
  console.log('\n=== CARD PAGE URL ===');
  console.log(page.url());
  console.log('\n=== CARD PAGE STRUCTURE ===');
  const f2 = await page.evaluate(() => {
    // Find envelope and key clickable elements
    const items = [];
    document.querySelectorAll('[class*="envelope"], [class*="Envelope"], button, [class*="card"]').forEach(el => {
      if (el.offsetParent !== null) {
        items.push({
          tag: el.tagName,
          class: (el.className || '').toString().slice(0, 80),
          text: (el.textContent || '').trim().slice(0, 50),
        });
      }
    });
    return items.slice(0, 30);
  });
  console.log(JSON.stringify(f2, null, 2));

  await browser.close();
})();
