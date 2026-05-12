'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const VIDEO_DIR = path.join(__dirname, 'output');
const OUTPUT_NAME = 'wedding-card-demo.webm';

if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true });

async function injectCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-cursor')) return;
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`;
    cursor.style.cssText = `
      position: fixed; z-index: 999999; pointer-events: none;
      width: 28px; height: 28px;
      transition: left 0.08s, top 0.08s;
      filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.4));
    `;
    cursor.style.left = '0px';
    cursor.style.top = '0px';
    document.body.appendChild(cursor);
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
  });
}

async function injectSubtitleBar(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-subtitle')) return;
    const bar = document.createElement('div');
    bar.id = 'demo-subtitle';
    bar.style.cssText = `
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 999998;
      text-align: center; padding: 14px 24px;
      background: rgba(0, 0, 0, 0.78);
      color: white; font-family: -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif;
      font-size: 17px; font-weight: 500; letter-spacing: 0.5px;
      transition: opacity 0.3s;
      pointer-events: none;
    `;
    bar.textContent = '';
    bar.style.opacity = '0';
    document.body.appendChild(bar);
  });
}

async function showSubtitle(page, text) {
  await page.evaluate((t) => {
    const bar = document.getElementById('demo-subtitle');
    if (!bar) return;
    if (t) {
      bar.textContent = t;
      bar.style.opacity = '1';
    } else {
      bar.style.opacity = '0';
    }
  }, text);
  if (text) await page.waitForTimeout(600);
}

async function moveAndClick(page, locator, label, postClickDelay = 1000) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`WARNING: skipped - "${label}" not visible`);
    return false;
  }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const box = await el.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 });
    await page.waitForTimeout(400);
  }
  await el.click();
  await page.waitForTimeout(postClickDelay);
  return true;
}

async function typeSlowly(page, locator, text, label, charDelay = 60) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  await moveAndClick(page, el, label, 300);
  await el.fill('');
  await el.pressSequentially(text, { delay: charDelay });
  await page.waitForTimeout(500);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await injectCursor(page);
    await injectSubtitleBar(page);
    await page.waitForTimeout(1500);

    await showSubtitle(page, '婚禮賓客互動感謝卡 · 開源範例');
    await page.waitForTimeout(2500);

    await page.mouse.move(640, 360, { steps: 15 });
    await page.waitForTimeout(800);

    await showSubtitle(page, 'Step 1 · 輸入姓名');
    await typeSlowly(page, '#guestName', '小明', '姓名欄位');

    await showSubtitle(page, 'Step 2 · 輸入電話');
    await typeSlowly(page, '#phone', '0912000001', '電話欄位');

    await page.waitForTimeout(800);

    await showSubtitle(page, 'Step 3 · 送出，驗證身份');
    await moveAndClick(page, 'button[type="submit"]', '提交按鈕', 1500);

    await page.waitForURL(/\/card\//, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await injectCursor(page);
    await injectSubtitleBar(page);

    await showSubtitle(page, 'Step 4 · 信封出現了');
    await page.waitForTimeout(2500);

    await showSubtitle(page, 'Step 5 · 點擊信封開啟祝福');
    await page.waitForSelector('[class*="envelopeContainer"]', { timeout: 8000 });
    await page.waitForTimeout(500);
    await moveAndClick(page, '[class*="envelopeContainer"]', '信封', 500);

    await page.waitForTimeout(3500);
    await showSubtitle(page, 'Step 6 · 賓客的專屬祝福卡片');

    await page.evaluate(() => window.scrollTo({ top: 100, behavior: 'smooth' }));
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(2500);

    await page.evaluate(() => window.scrollTo({ top: 800, behavior: 'smooth' }));
    await page.waitForTimeout(2500);

    await showSubtitle(page, '');
    await page.waitForTimeout(1000);

    await showSubtitle(page, '⭐ github.com/darrenlu86/wedding-guest-cards-public');
    await page.waitForTimeout(3500);
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
        console.error('Failed to copy video:', e.message);
      }
    }
    await browser.close();
  }
})();
