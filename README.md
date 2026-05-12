# Wedding Guest Cards · 婚禮賓客互動感謝卡

> 一套開源的婚禮賓客互動感謝卡系統。賓客掃描同一張 QR Code 進入頁面，輸入姓名＋電話驗證身份後，觀看信封開啟動畫並查看為他/她客製化的祝福卡片。

[![License: PolyForm Noncommercial 1.0.0](https://img.shields.io/badge/License-PolyForm%20NC%201.0.0-yellow.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

---

## 這是什麼？

我自己婚禮時做的一個小工具：給每位賓客一張「會打開的信封 + 客製化祝福卡」，每張卡可以放對方專屬的照片、文字、主題色。賓客只要掃 QR Code 進來輸入名字＋電話，就會看到自己那張。

婚禮辦完後，我把這個版本整理成 **開源範例版**，讓有類似需求的人可以直接拿去改。

> ⚠️ **這是公開範例版**：所有賓客資料、訊息文字、圖片都是示範用途，請於部署前替換為自己的內容。原本婚禮上的真實內容（我們親手寫給家人朋友的卡片）並未包含在此 repo 中。

---

## Demo 預覽

- 賓客驗證頁：輸入姓名 + 電話 → 通過驗證後進入信封動畫
- 信封翻轉動畫：3D 翻轉 → 信封打開 → 卡片浮起
- 卡片內容：對應賓客主題色、客製化訊息、照片網格、簽名

> 想看真實成果，可以參考我自己當時的婚禮版本：~~card.darrenlu.com~~（已關閉）

---

## 功能

- ✅ **姓名＋電話雙重驗證**：兩項都對才能看卡
- ✅ **5 種淡色主題**：classic（粉黃）、rose（粉紅）、midnight（粉藍）、spring（粉綠）、luxe（粉橘）
- ✅ **信封 3D 翻轉動畫**：純 CSS，行動裝置流暢
- ✅ **圖片支援**：0 張、1 張（居中）、2+ 張（雙列網格）
- ✅ **花瓣粒子動畫**：登入頁背景特效
- ✅ **Email 寄送 + 卡片下載**：賓客可下載卡片或寄到 email
- ✅ **安全防護**：Rate Limiting、Honeypot 反爬蟲、輸入驗證、XSS 防護
- ✅ **響應式設計**：手機 / 平板 / 桌面
- ✅ **零雲端依賴**：開發階段使用記憶體儲存，本機跑完整流程

---

## 快速開始

```bash
# 1. clone
git clone https://github.com/darrenlu86/wedding-guest-cards-public.git
cd wedding-guest-cards-public

# 2. 安裝依賴
npm install

# 3. 啟動開發伺服器
npm run dev
```

瀏覽器開啟 [http://localhost:3000](http://localhost:3000)，輸入下方範例帳號中任一組即可體驗。

### 範例帳號（10 組）

| # | 姓名 | 電話 | 主題 | 圖片數 |
|---|------|------|------|--------|
| 1 | 小明 | `0912000001` | classic（粉黃） | 1 |
| 2 | 小婷 | `0912000002` | classic（粉黃） | 2 |
| 3 | 玫君 | `0912000003` | rose（粉紅） | 0 |
| 4 | 思賢 | `0912000004` | rose（粉紅） | 1 |
| 5 | Alex Chen | `0912000005` | midnight（粉藍） | 1 |
| 6 | 佳穎 | `0912000006` | midnight（粉藍） | 2 |
| 7 | 志豪 | `0912000007` | spring（粉綠） | 0 |
| 8 | Jamie Lee | `0912000008` | spring（粉綠） | 1 |
| 9 | 怡君 | `0912000009` | luxe（粉橘） | 2 |
| 10 | 宏達 | `0912000010` | luxe（粉橘） | 1 |

> 賓客資料與祝福訊息定義於 [`lib/db.ts`](./lib/db.ts) 的 `seedTestData()`。

### 範例圖片與訊息

- `public/sample-images/sample-01.svg` ~ `sample-10.svg`：對應 5 種主題色的 SVG 佔位插畫
- `public/sample-cover.svg`：OG / 分享預覽用的封面圖
- 10 段範例祝福訊息：涵蓋大學朋友、職場夥伴、家人鄰居、遠方友人等不同關係，口語化、有自嘲、不甜膩，可作為自訂時的語氣參考

---

## 客製化為你自己的婚禮版

### 1. 替換新人名稱與品牌資訊

| 檔案 | 要改的內容 |
|------|------------|
| [`app/layout.tsx`](./app/layout.tsx) | `SITE_URL`、`SITE_TITLE`、`SITE_DESCRIPTION`、`keywords`、`authors` |
| [`app/card/[guestId]/layout.tsx`](./app/card/[guestId]/layout.tsx) | 卡片頁 OG meta（title、description、images） |
| [`app/page.tsx`](./app/page.tsx) | 第 92 行新人名稱顯示 |
| [`components/BlessingCard/index.tsx`](./components/BlessingCard/index.tsx) | 第 142 行卡片簽名 |
| [`lib/email.ts`](./lib/email.ts) | `CARD_BASE_URL`、`SENDER_NAME`（寄信用） |

### 2. 替換賓客資料

**方法 A：直接編輯 `lib/db.ts`**

開啟 [`lib/db.ts`](./lib/db.ts) 找到 `seedTestData()`，把 10 組範例改成自己的賓客名單：

```ts
{
  id: 'guest-001',          // 必須是固定字串（不可用 uuid，否則跨 worker 會 404）
  name: '王小明',            // 賓客姓名（驗證用）
  phone: '0912345678',      // 電話（驗證用）
  customization: {
    message: `親愛的小明，
你寫的訊息內容...`,
    images: [
      '/photos/xiaoming-01.jpg',   // 放到 public/photos/ 底下
    ],
    templateId: 'classic',         // classic | rose | midnight | spring | luxe
  },
},
```

**方法 B：從 JSON 載入（適合大量賓客）**

把 `lib/init.ts` 改回從 JSON 載入：

```ts
import guestsData from './guests.json';  // 你的賓客 JSON
// ...
for (const guest of guestsData as Guest[]) {
  await addGuest(guest);
}
```

`scripts/` 底下還有從 Excel / CSV 轉 JSON 的工具腳本（`import-guests.ts`、`enrich-guests.ts`、`parse-tables.ts`），可以參考改成自己的工作流。

### 3. 替換圖片

| 檔案 | 用途 | 建議尺寸 |
|------|------|----------|
| `public/couple-illustration.png` | 登入頁的新人似顏繪 | 圓形友善，~512×512 |
| `public/sample-cover.svg` | OG / 社群分享預覽封面 | 1200×800 |
| `public/sample-images/*.svg` | 每位賓客卡片裡的相片 | 任意，建議 800×600 以上 |

把自己的相片放進 `public/photos/`（或任何子目錄），然後在 `lib/db.ts` 用 `/photos/xxx.jpg` 引用即可。

### 4. 客製化主題色

5 種主題定義於 [`components/BlessingCard/cardTemplates.ts`](./components/BlessingCard/cardTemplates.ts)：

```ts
{
  id: 'classic',
  card: { backgroundColor: '#fffbf0', ... },
  message: { background: '#fef3d4', border: '#e8d4a3', ... },
  text: { title: '#6b5a2a', body: '#3a3a3a', ... },
  accent: '#c9a84c',  // 邊框、分隔線、四角紋飾的主色
}
```

可以直接改 hex 值，或新增第 6 種主題（記得也在 `lib/constants.ts` 註冊 templateId）。

---

## 部署

### Vercel（最簡單）

```bash
npx vercel
```

或在 [Vercel Dashboard](https://vercel.com/new) 直接 import GitHub repo。

需要的環境變數：

```env
# (可選) 寄送 Email 用
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password   # Gmail 需用「應用程式密碼」
SMTP_FROM="新人姓名 <your@gmail.com>"
```

### Cloudflare Pages / Workers

本範例使用 OpenNext 適配 Cloudflare Workers：

```bash
npm run build
npx opennextjs-cloudflare deploy
```

詳見 [Cloudflare Next.js 部署文件](https://developers.cloudflare.com/pages/framework-guides/nextjs/)。

### 自架（VPS / Docker）

```bash
npm run build
npm start  # 預設 :3000
```

---

## QR Code 設定

婚禮現場建議印一張 QR Code 大牌或桌卡。指向你部署後的網址（例如 `https://your-wedding.com`）。

可以用任何 QR 產生器：
- 線上：[qr-code-generator.com](https://www.qr-code-generator.com/)
- 命令列：`npx qrcode "https://your-wedding.com" -o qr.png -w 1200`

---

## Email 寄送設定

如果要讓賓客可以把卡片寄到自己 email，需要設定 SMTP（見上方環境變數）。

**Gmail 設定步驟：**

1. 帳號開啟 2FA
2. 到 [Google 應用程式密碼](https://myaccount.google.com/apppasswords) 產生 16 碼密碼
3. 把這 16 碼填到 `SMTP_PASS`

不設定也沒關係，卡片下載 / 顯示功能不受影響。

---

## 技術棧

- **前端**：Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4
- **動畫**：純 CSS Animations + CSS Modules（信封 3D 翻轉、花瓣粒子）
- **儲存**：記憶體 Map（開發用）；正式環境建議 Vercel KV / Redis / Supabase
- **驗證**：自寫姓名＋電話雙驗證 + Honeypot 反爬蟲 + IP Rate Limiting
- **Email**：Nodemailer + SMTP
- **截圖 / 下載**：html-to-image
- **測試**：Vitest + Testing Library

---

## 專案架構

```
wedding-guest-cards-public/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 驗證入口
│   ├── card/[guestId]/           # 卡片展示頁
│   └── api/
│       ├── verify-guest/         # 姓名＋電話驗證
│       ├── card-data/            # 卡片資料 API
│       └── send-email/           # 寄送 Email
├── components/
│   ├── BlessingCard/             # 祝福卡片（含主題系統）
│   ├── EnvelopeAnimation/        # 信封 3D 翻轉動畫
│   ├── VerificationForm/         # 驗證表單
│   ├── DownloadButton/           # 卡片下載
│   ├── EmailShareButton/         # Email 分享
│   └── PetalRain.tsx             # 花瓣粒子背景
├── lib/
│   ├── db.ts                     # 記憶體儲存 + 10 組範例
│   ├── validation.ts             # 輸入驗證
│   ├── rate-limit.ts             # IP rate limit
│   ├── email.ts                  # Nodemailer 封裝
│   ├── capture-card.ts           # 卡片截圖
│   ├── constants.ts              # 主題 ID 常數
│   └── init.ts                   # 範例資料初始化
├── public/
│   ├── couple-illustration.png   # 新人似顏繪
│   ├── sample-cover.svg          # OG 封面
│   └── sample-images/            # 10 張範例圖片
├── scripts/                      # 資料轉換工具（可選）
└── tests/                        # Vitest 測試
```

---

## 常見問題

**Q: 賓客輸入姓名後說「查無資料」？**
A: 確認賓客姓名與 `lib/db.ts` 中的 `name` 完全一致（包含繁簡、空格）。系統會做大小寫不敏感與 trim 處理，但不會做模糊比對。

**Q: 為什麼 Tailwind 某些 class 沒生效？**
A: `globals.css` 中的 `* { padding: 0; margin: 0; }` 會覆蓋 Tailwind utility class。對於關鍵間距，請改用 inline style（見 `app/page.tsx` 範例）。

**Q: 部署後賓客資料怎麼處理？**
A: 預設使用記憶體儲存，每次 cold start 會重新跑 `seedTestData()`。如果賓客名單會更新（例如 RSVP 變動），建議改用 Vercel KV 或外部資料庫。

**Q: 可以拿來做商業用途嗎？**
A: 本專案使用 **PolyForm Noncommercial 1.0.0** 授權，**禁止商業用途**。個人 / 非商業使用（自己的婚禮、研究、學習）皆可。若要用於商業專案（接案、SaaS、付費服務等），請來信聯絡作者討論授權。

---

## 開發指令

```bash
npm run dev          # 開發伺服器（http://localhost:3000）
npm run build        # 建置生產版本
npm start            # 啟動生產伺服器
npm test             # 執行 Vitest 測試
npm run test:ui      # 測試 UI 介面
npm run test:coverage # 測試覆蓋率
```

---

## 授權

**[PolyForm Noncommercial License 1.0.0](./LICENSE)**

- ✅ 個人 / 非營利用途自由使用、修改、散布
- ✅ 自己的婚禮、研究、學習、實驗
- ✅ 慈善、教育、政府機構
- ❌ 商業用途（接案、SaaS、付費服務等）
- ❌ 任何以營利為目的的散布

商業授權洽詢：📧 **kevin868686@gmail.com**

---

## 貢獻

歡迎開 issue 或 PR 改善：
- Bug 回報
- 新主題色
- 新動畫效果
- 文件改善

但請注意，貢獻內容將以 PolyForm Noncommercial 1.0.0 授權釋出。

---

## 作者

Made with 💛 by [Darren Lu](https://github.com/darrenlu86)

如果這個專案對你的婚禮（或任何個人專案）有幫助，歡迎 ⭐ Star 或來信跟我說一聲，我會很開心！

