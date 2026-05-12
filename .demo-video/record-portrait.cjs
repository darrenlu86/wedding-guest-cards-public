'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const VIDEO_DIR = path.join(__dirname, 'output');
const OUTPUT_NAME = 'wedding-card-demo-portrait.webm';

// 9:16 直式手機尺寸（適合 IG Reels / TikTok / Shorts / 限動）
const VIEWPORT = { width: 720, height: 1280 };

if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true });

async function injectCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-cursor')) return;
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.innerHTML = `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`;
    cursor.style.cssText = `
      position: fixed; z-index: 999999; pointer-events: none;
      width: 36px; height: 36px;
      transition: left 0.08s, top 0.08s;
      filter: drop-shadow(2px 3px 4px rgba(0,0,0,0.45));
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

    // 上方標題條
    const top = document.createElement('div');
    top.id = 'demo-title';
    top.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; z-index: 999998;
      text-align: center; padding: 22px 24px 18px;
      background: linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 80%, rgba(0,0,0,0) 100%);
      color: white;
      font-family: -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif;
      font-size: 26px; font-weight: 700; letter-spacing: 0.8px;
      line-height: 1.4;
      transition: opacity 0.4s;
      pointer-events: none;
      text-shadow: 0 2px 8px rgba(0,0,0,0.5);
    `;
    top.textContent = '';
    top.style.opacity = '0';
    document.body.appendChild(top);

    // 下方副字幕條
    const bar = document.createElement('div');
    bar.id = 'demo-subtitle';
    bar.style.cssText = `
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 999998;
      text-align: center; padding: 22px 28px 28px;
      background: linear-gradient(0deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.6) 80%, rgba(0,0,0,0) 100%);
      color: white;
      font-family: -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif;
      font-size: 22px; font-weight: 500; letter-spacing: 0.5px;
      line-height: 1.5;
      transition: opacity 0.4s;
      pointer-events: none;
      text-shadow: 0 1px 4px rgba(0,0,0,0.6);
    `;
    bar.textContent = '';
    bar.style.opacity = '0';
    document.body.appendChild(bar);
  });
}

async function showTitle(page, text) {
  await page.evaluate((t) => {
    const top = document.getElementById('demo-title');
    if (!top) return;
    if (t) { top.innerHTML = t; top.style.opacity = '1'; }
    else { top.style.opacity = '0'; }
  }, text);
  if (text) await page.waitForTimeout(500);
}

async function showSubtitle(page, text) {
  await page.evaluate((t) => {
    const bar = document.getElementById('demo-subtitle');
    if (!bar) return;
    if (t) { bar.innerHTML = t; bar.style.opacity = '1'; }
    else { bar.style.opacity = '0'; }
  }, text);
  if (text) await page.waitForTimeout(500);
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
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 15 });
    await page.waitForTimeout(450);
  }
  await el.click();
  await page.waitForTimeout(postClickDelay);
  return true;
}

async function typeSlowly(page, locator, text, label, charDelay = 75) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  await moveAndClick(page, el, label, 300);
  await el.fill('');
  await el.pressSequentially(text, { delay: charDelay });
  await page.waitForTimeout(600);
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
    await injectCursor(page);
    await injectSubtitleBar(page);
    await page.waitForTimeout(1200);

    await showTitle(page, '💌 我用 AI 做了一個<br>婚禮專屬感謝卡');
    await showSubtitle(page, '每位賓客掃 QR Code，看到自己的卡片');
    await page.waitForTimeout(3200);

    await showTitle(page, '');
    await showSubtitle(page, '👇 賓客體驗：30 秒走完');
    await page.waitForTimeout(2200);

    await page.mouse.move(360, 640, { steps: 18 });
    await page.waitForTimeout(700);

    await showSubtitle(page, '輸入自己的名字 ✍️');
    await typeSlowly(page, '#guestName', '小明', '姓名欄位');

    await showSubtitle(page, '輸入電話驗證身份 📱');
    await typeSlowly(page, '#phone', '0912000001', '電話欄位');

    await page.waitForTimeout(600);

    await showSubtitle(page, '點下「查看感謝小卡」');
    await moveAndClick(page, 'button[type="submit"]', '提交按鈕', 1500);

    await page.waitForURL(/\/card\//, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    await injectCursor(page);
    await injectSubtitleBar(page);

    await showTitle(page, '✨ 信封出現了');
    await showSubtitle(page, '專屬於「小明」的卡片');
    await page.waitForTimeout(2800);

    await showTitle(page, '');
    await showSubtitle(page, '輕輕點一下信封 👆');
    await page.waitForTimeout(800);

    await page.waitForSelector('[class*="envelopeContainer"]', { timeout: 8000 });
    await page.waitForTimeout(300);
    await moveAndClick(page, '[class*="envelopeContainer"]', '信封', 200);

    await page.waitForTimeout(2200);
    await showSubtitle(page, '');
    await page.waitForTimeout(800);
    await showTitle(page, '💛 屬於你的祝福');
    await page.waitForTimeout(2500);

    await showTitle(page, '');

    await page.evaluate(() => window.scrollTo({ top: 200, behavior: 'smooth' }));
    await page.waitForTimeout(1800);
    await showSubtitle(page, '客製化文字 · 對方的相片 · 5 種主題色');
    await page.waitForTimeout(2200);

    await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'smooth' }));
    await page.waitForTimeout(2200);

    await page.evaluate(() => window.scrollTo({ top: 1100, behavior: 'smooth' }));
    await page.waitForTimeout(2000);

    await showSubtitle(page, '');
    await page.waitForTimeout(600);

    await showTitle(page, '🎉 100% 開源 · 免費自架');
    await showSubtitle(page, '不會寫程式？也有 SaaS 版<br>card.oharalab.com');
    await page.waitForTimeout(3800);

    await showTitle(page, '⭐ GitHub');
    await showSubtitle(page, 'darrenlu86/wedding-guest-cards-public');
    await page.waitForTimeout(3000);
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
