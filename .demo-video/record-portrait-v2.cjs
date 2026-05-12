'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const VIDEO_DIR = path.join(__dirname, 'output');
const OUTPUT_NAME = 'wedding-card-demo-portrait.webm';

const VIEWPORT = { width: 720, height: 1280 };

if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true });

async function injectOverlays(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-cursor')) return;

    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.innerHTML = `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`;
    cursor.style.cssText = `position: fixed; z-index: 999999; pointer-events: none; width: 36px; height: 36px; transition: left 0.06s, top 0.06s; filter: drop-shadow(2px 3px 4px rgba(0,0,0,0.45));`;
    document.body.appendChild(cursor);
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });

    const top = document.createElement('div');
    top.id = 'demo-title';
    top.style.cssText = `position: fixed; top: 0; left: 0; right: 0; z-index: 999998; text-align: center; padding: 24px 24px 18px; background: linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 80%, rgba(0,0,0,0) 100%); color: white; font-family: -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif; font-size: 28px; font-weight: 700; letter-spacing: 0.8px; line-height: 1.4; transition: opacity 0.3s; pointer-events: none; text-shadow: 0 2px 8px rgba(0,0,0,0.6);`;
    top.style.opacity = '0';
    document.body.appendChild(top);

    const bar = document.createElement('div');
    bar.id = 'demo-subtitle';
    bar.style.cssText = `position: fixed; bottom: 0; left: 0; right: 0; z-index: 999998; text-align: center; padding: 22px 28px 28px; background: linear-gradient(0deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.6) 80%, rgba(0,0,0,0) 100%); color: white; font-family: -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif; font-size: 24px; font-weight: 500; letter-spacing: 0.5px; line-height: 1.5; transition: opacity 0.3s; pointer-events: none; text-shadow: 0 1px 4px rgba(0,0,0,0.6);`;
    bar.style.opacity = '0';
    document.body.appendChild(bar);

    const tag = document.createElement('div');
    tag.id = 'demo-theme-tag';
    tag.style.cssText = `position: fixed; top: 100px; right: 24px; z-index: 999998; padding: 8px 16px; border-radius: 999px; background: rgba(255,255,255,0.95); color: #555; font-family: -apple-system, "PingFang TC", sans-serif; font-size: 18px; font-weight: 600; letter-spacing: 0.5px; transition: opacity 0.3s; pointer-events: none; box-shadow: 0 4px 12px rgba(0,0,0,0.18);`;
    tag.style.opacity = '0';
    document.body.appendChild(tag);
  });
}

async function showTitle(page, text) {
  await page.evaluate((t) => {
    const el = document.getElementById('demo-title');
    if (!el) return;
    if (t) { el.innerHTML = t; el.style.opacity = '1'; }
    else { el.style.opacity = '0'; }
  }, text);
  if (text) await page.waitForTimeout(300);
}

async function showSubtitle(page, text) {
  await page.evaluate((t) => {
    const el = document.getElementById('demo-subtitle');
    if (!el) return;
    if (t) { el.innerHTML = t; el.style.opacity = '1'; }
    else { el.style.opacity = '0'; }
  }, text);
  if (text) await page.waitForTimeout(300);
}

async function showThemeTag(page, text, color) {
  await page.evaluate(({ t, c }) => {
    const el = document.getElementById('demo-theme-tag');
    if (!el) return;
    if (t) {
      el.innerHTML = t;
      el.style.background = c || 'rgba(255,255,255,0.95)';
      el.style.color = c ? '#fff' : '#555';
      el.style.opacity = '1';
    } else {
      el.style.opacity = '0';
    }
  }, { t: text, c: color });
}

async function moveAndClick(page, locator, label, postClickDelay = 600) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`WARN: skipped "${label}"`);
    return false;
  }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const box = await el.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
    await page.waitForTimeout(250);
  }
  await el.click();
  await page.waitForTimeout(postClickDelay);
  return true;
}

async function typeSlowly(page, locator, text, label) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  await moveAndClick(page, el, label, 150);
  await el.fill('');
  await el.pressSequentially(text, { delay: 45 });
  await page.waitForTimeout(300);
}

async function showThemeCard(page, guestId, themeLabel, themeColor) {
  await page.goto(`${BASE_URL}/card/${guestId}`, { waitUntil: 'networkidle' });
  await injectOverlays(page);
  await page.waitForSelector('[class*="envelopeContainer"]', { timeout: 6000 });
  await page.waitForTimeout(400);
  await showThemeTag(page, themeLabel, themeColor);
  await page.locator('[class*="envelopeContainer"]').first().click();
  await page.waitForTimeout(2200);
  await page.evaluate(() => window.scrollTo({ top: 250, behavior: 'smooth' }));
  await page.waitForTimeout(1200);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: { dir: VIDEO_DIR, size: VIEWPORT },
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await injectOverlays(page);
    await page.waitForTimeout(600);

    await showTitle(page, '💌 婚禮專屬感謝卡');
    await showSubtitle(page, '每位賓客掃 QR Code → 看到自己的卡片');
    await page.waitForTimeout(2200);
    await showTitle(page, '');

    await showSubtitle(page, '輸入姓名 ✍️');
    await typeSlowly(page, '#guestName', '小明', '姓名');

    await showSubtitle(page, '電話驗證身份 📱');
    await typeSlowly(page, '#phone', '0912000001', '電話');

    await showSubtitle(page, '點下「查看感謝小卡」');
    await moveAndClick(page, 'button[type="submit"]', '送出', 800);

    await page.waitForURL(/\/card\//, { timeout: 8000 });
    await page.waitForLoadState('networkidle');
    await injectOverlays(page);
    await page.waitForTimeout(400);

    await showTitle(page, '✨ 專屬於「小明」的信封');
    await page.waitForTimeout(1500);
    await showTitle(page, '');
    await showSubtitle(page, '點一下信封 👆');

    await page.waitForSelector('[class*="envelopeContainer"]', { timeout: 6000 });
    await page.waitForTimeout(200);
    await moveAndClick(page, '[class*="envelopeContainer"]', '信封', 100);
    await page.waitForTimeout(1800);

    await showSubtitle(page, '');
    await showTitle(page, '💛 屬於你的祝福');
    await page.waitForTimeout(1500);
    await showTitle(page, '');

    await page.evaluate(() => window.scrollTo({ top: 350, behavior: 'smooth' }));
    await showSubtitle(page, '客製化文字 · 對方的相片');
    await page.waitForTimeout(1800);

    await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'smooth' }));
    await page.waitForTimeout(1500);
    await showSubtitle(page, '');

    await showTitle(page, '🎨 5 種主題色任選');
    await page.waitForTimeout(1300);
    await showTitle(page, '');

    await showThemeCard(page, 'guest-sample-03', 'rose 粉紅', '#d4778a');
    await showThemeCard(page, 'guest-sample-05', 'midnight 粉藍', '#6699cc');
    await showThemeCard(page, 'guest-sample-07', 'spring 粉綠', '#5fb878');
    await showThemeCard(page, 'guest-sample-09', 'luxe 粉橘', '#d4904c');
    await showThemeTag(page, '', null);

    await showTitle(page, '🎉 100% 開源 · 免費自架');
    await showSubtitle(page, '不會寫程式？也有 SaaS 版<br>card.oharalab.com');
    await page.waitForTimeout(3000);

    await showTitle(page, '⭐ GitHub');
    await showSubtitle(page, 'darrenlu86/wedding-guest-cards-public');
    await page.waitForTimeout(2500);
  } catch (err) {
    console.error('DEMO ERROR:', err.message);
    console.error(err.stack);
  } finally {
    await context.close();
    const video = page.video();
    if (video) {
      const src = await video.path();
      const dest = path.join(VIDEO_DIR, OUTPUT_NAME);
      try {
        fs.copyFileSync(src, dest);
        const stats = fs.statSync(dest);
        console.log(`Video saved: ${dest} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      } catch (e) {
        console.error('Failed to copy:', e.message);
      }
    }
    await browser.close();
  }
})();
