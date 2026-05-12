# Wedding Guest Cards

一套開源的婚禮賓客互動感謝卡系統。賓客掃描同一張 QR Code 進入頁面，輸入姓名＋電話驗證身份後，觀看信封開啟動畫並查看為他/她客製化的祝福卡片。

> ⚠️ 這是 **公開範例版本**。所有賓客資料、訊息文字、圖片皆為示範用途，請於部署前替換為自己的內容。

---

## 功能特色

- ✅ **姓名＋電話雙驗證**：兩項資訊都需要匹配才能查看卡片
- ✅ **5 種淡色主題**：classic（粉黃）、rose（粉紅）、midnight（粉藍）、spring（粉綠）、luxe（粉橘）
- ✅ **信封動畫**：流暢的 3D 翻轉開啟動畫
- ✅ **圖片支援**：一張居中、多張雙列網格
- ✅ **安全防護**：Rate Limiting、Honeypot、XSS 防護
- ✅ **響應式設計**：手機 / 平板 / 桌面
- ✅ **零雲端依賴**：開發階段使用記憶體儲存，即可完整測試

---

## 快速開始

```bash
npm install
npm run dev
```

瀏覽器開啟 [http://localhost:3000](http://localhost:3000)。

---

## 範例資料（10 組）

本範例版內建 10 位示範賓客，涵蓋 5 種主題各 2 位、不同圖片數量（無圖 / 1 張 / 2 張）、中英文姓名混合。

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

### 範例圖片

`public/sample-images/sample-01.svg` ~ `sample-10.svg`：10 張對應 5 種主題色的 SVG 佔位插畫，作為 `customization.images` 的範例引用。`public/sample-cover.svg` 為 OG / 分享預覽用的封面圖佔位。

### 範例訊息

10 位賓客各有一段中文或英文祝福訊息，內容涵蓋大學朋友、職場夥伴、家人鄰居等不同關係類型，可作為自訂時的語氣參考。所有訊息皆為虛構範例，與任何真實人物無關。

---

## 測試流程

1. 開啟 [http://localhost:3000](http://localhost:3000)
2. 輸入上表中任一組「姓名＋電話」
3. 點擊「查看感謝小卡」
4. 觀看信封開啟動畫
5. 點擊信封打開
6. 查看對應主題的客製化卡片

---

## 專案架構

```
wedding-guest-cards/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 驗證入口（姓名＋電話）
│   ├── card/[guestId]/           # 卡片展示頁面
│   └── api/
│       ├── verify-guest/         # 驗證 API
│       ├── card-data/            # 卡片資料 API
│       └── send-email/           # 寄送卡片 API
├── components/
│   ├── BlessingCard/             # 祝福卡片（接入主題系統）
│   ├── EnvelopeAnimation/        # 信封動畫
│   ├── VerificationForm/         # 驗證表單
│   ├── DownloadButton/           # 卡片下載
│   ├── EmailShareButton/         # 寄送 Email
│   └── PetalRain.tsx             # 花瓣粒子動畫
├── lib/
│   ├── db.ts                     # 記憶體賓客儲存 + 10 組範例
│   ├── validation.ts             # 輸入驗證
│   ├── rate-limit.ts             # Rate Limiting
│   ├── constants.ts              # 常數定義
│   ├── email.ts                  # 寄送 Email
│   ├── capture-card.ts           # 卡片截圖
│   └── init.ts                   # 範例資料初始化
├── public/
│   ├── couple-illustration.png   # 新人似顏繪（可替換）
│   ├── sample-cover.svg          # OG 預覽封面（佔位）
│   └── sample-images/            # 10 張範例圖片
└── tests/                        # Vitest 測試
```

---

## 卡片主題系統

5 種淡色主題，每位賓客可分配不同色系（定義於 [`components/BlessingCard/cardTemplates.ts`](./components/BlessingCard/cardTemplates.ts)）：

| 主題 ID | 名稱 | 卡片背景 | 訊息區背景 | 裝飾色 |
|---------|------|----------|------------|--------|
| `classic` | 粉黃 | `#fffbf0` | `#fef3d4` | `#c9a84c` |
| `rose` | 粉紅 | `#fff5f7` | `#fde8ec` | `#d4778a` |
| `midnight` | 粉藍 | `#f0f7ff` | `#dbeafe` | `#6699cc` |
| `spring` | 粉綠 | `#f0fff4` | `#dcfce8` | `#5fb878` |
| `luxe` | 粉橘 | `#fff8f0` | `#fde8d4` | `#d4904c` |

主題影響範圍：卡片背景、訊息區、文字色、邊框與分隔線裝飾。

---

## 自訂為你自己的版本

1. **替換新人名稱與品牌資訊**
   - [`app/layout.tsx`](./app/layout.tsx)：`SITE_TITLE`、`SITE_URL`、`SITE_DESCRIPTION`
   - [`app/card/[guestId]/layout.tsx`](./app/card/[guestId]/layout.tsx)：OG meta
   - [`app/page.tsx`](./app/page.tsx) 第 92 行：登入頁顯示的新人名稱
   - [`components/BlessingCard/index.tsx`](./components/BlessingCard/index.tsx) 第 142 行：卡片簽名
   - [`lib/email.ts`](./lib/email.ts)：`CARD_BASE_URL`、`SENDER_NAME`

2. **替換賓客資料**
   - 編輯 [`lib/db.ts`](./lib/db.ts) 的 `seedTestData()`，或改寫 [`lib/init.ts`](./lib/init.ts) 從 JSON / 資料庫載入

3. **替換圖片**
   - `public/couple-illustration.png`：你的新人似顏繪
   - `public/sample-cover.svg`：OG / 分享預覽封面
   - `public/sample-images/`：每位賓客的相片

---

## 技術棧

- **前端**：Next.js 14+ (App Router) + TypeScript + Tailwind CSS 4.x
- **動畫**：CSS Animations + CSS Modules
- **儲存**：記憶體（開發用）；正式環境建議 Vercel KV / Redis / Supabase
- **測試**：Vitest + Testing Library

---

## 部署建議

最小可行：將賓客資料轉成 JSON 檔，部署到 Vercel / Cloudflare Pages 即可。需要管理後台或統計，再升級為 Supabase / Vercel KV。

---

## 授權

MIT License

