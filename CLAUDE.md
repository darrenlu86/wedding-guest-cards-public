# Claude Code 專案筆記（開源範例版）

## 部署平台：Vercel

> 本專案預設部署於 **Vercel**，可改部署到 Cloudflare Pages / Workers / 其他 Edge 平台。

## 專案概述

婚禮賓客互動感謝卡片系統的 **開源範例版本**。賓客透過掃描同一張 QR Code 進入根頁面，輸入姓名＋電話驗證身份後觀看信封開啟動畫，查看客製化祝福卡片。每位賓客可分配不同的淡色主題。

> ⚠️ 所有賓客資料、訊息文字、圖片皆為示範用途，請於部署前替換為自己的內容。

## 技術架構

- **框架**: Next.js 14+ (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS 4.x
- **測試**: Vitest + Testing Library
- **動畫**: CSS Animations + CSS Modules

## 重要目錄結構

```
app/
├── page.tsx                # 根頁面（驗證入口，姓名＋電話）
├── card/[guestId]/page.tsx # 卡片展示頁面
└── api/
    ├── verify-guest/       # 驗證 API（姓名＋電話雙驗證）
    ├── card-data/          # 卡片資料 API
    └── send-email/         # 寄送卡片 API

components/
├── BlessingCard/           # 祝福卡片（接入主題系統）
├── EnvelopeAnimation/      # 信封動畫
├── VerificationForm/       # 驗證表單
├── DownloadButton/         # 卡片下載
└── EmailShareButton/       # 寄送 Email

lib/
├── db.ts                   # 記憶體賓客儲存 + 10 組範例 seedTestData()
├── validation.ts           # 輸入驗證
├── rate-limit.ts           # Rate Limiting
├── constants.ts            # 常數定義（含 5 個卡片模板 ID）
├── email.ts                # 寄送 Email
├── capture-card.ts         # 卡片截圖
└── init.ts                 # 範例資料初始化

public/
├── couple-illustration.png # 新人似顏繪（可替換）
├── sample-cover.svg        # OG 預覽封面（佔位）
└── sample-images/          # 10 張範例圖片
```

## 設計系統

### 卡片主題（5 種淡色系）

| 主題 ID | 名稱 | 卡片背景 | 訊息區背景 | 裝飾色(accent) |
|---------|------|----------|------------|----------------|
| classic | 粉黃 | #fffbf0 | #fef3d4 | #c9a84c |
| rose | 粉紅 | #fff5f7 | #fde8ec | #d4778a |
| midnight | 粉藍 | #f0f7ff | #dbeafe | #6699cc |
| spring | 粉綠 | #f0fff4 | #dcfce8 | #5fb878 |
| luxe | 粉橘 | #fff8f0 | #fde8d4 | #d4904c |

所有主題均為淡色系，不使用黑色或深色。

### 間距規範

- 副標題到輸入框：`marginBottom: '2.5rem'` (inline style)
- 表單項：`gap-4`
- 卡片內 padding：`px-6 sm:px-12`
- 簽名區底部：`paddingBottom: '2.5rem'`

## 驗證流程

1. 根頁面 `/` — 輸入姓名＋電話
2. POST `/api/verify-guest` — 後端驗證：
   - Honeypot 檢查
   - Rate Limiting（IP）
   - 姓名格式驗證
   - 查找賓客（按姓名）
   - **電話號碼驗證（標準化後比較）**
   - 回傳 guestId + redirectUrl
3. 重導向至 `/card/{guestId}`
4. GET `/api/card-data/{guestId}` — 取得賓客資料
5. 顯示信封動畫 → 開啟 → 展示卡片

## 範例資料（10 組）

範例賓客定義於 `lib/db.ts` 的 `seedTestData()`：

| ID | 姓名 | 電話 | 主題 | 圖片 |
|----|------|------|------|------|
| guest-sample-01 | 小明 | 0912000001 | classic | 1 張 |
| guest-sample-02 | 小婷 | 0912000002 | classic | 2 張 |
| guest-sample-03 | 玫君 | 0912000003 | rose | 0 |
| guest-sample-04 | 思賢 | 0912000004 | rose | 1 張 |
| guest-sample-05 | Alex Chen | 0912000005 | midnight | 1 張 |
| guest-sample-06 | 佳穎 | 0912000006 | midnight | 2 張 |
| guest-sample-07 | 志豪 | 0912000007 | spring | 0 |
| guest-sample-08 | Jamie Lee | 0912000008 | spring | 1 張 |
| guest-sample-09 | 怡君 | 0912000009 | luxe | 2 張 |
| guest-sample-10 | 宏達 | 0912000010 | luxe | 1 張 |

所有姓名、訊息、電話均為虛構，與任何真實人物無關。

## 已知問題與解決方案

### 1. Tailwind CSS 被 globals.css 覆蓋

`globals.css` 中的 `* { padding: 0; margin: 0; }` 會覆蓋 Tailwind utility class。關鍵間距使用 inline style 確保生效。

### 2. 測試資料必須用固定 ID

`seedTestData` 必須用固定字串 ID（如 `guest-sample-01`），不可用 `uuidv4()`。Next.js 在不同 worker 間重新初始化時隨機 UUID 會導致 verify-guest 與 card-data 之間 ID 不匹配（404）。

### 3. 圖片網格 — 單張居中

雙列 grid 裡只有一張圖會佔左半邊。單張時用 `flex justify-center + width: 70%`，兩張以上才用雙列 grid。

## 開發指令

```bash
npm run dev      # 開發伺服器
npm test         # 執行測試
npm run build    # 建置
```

## 從範例版客製化為自己的婚禮

1. 替換新人名稱：`app/layout.tsx`、`app/card/[guestId]/layout.tsx`、`app/page.tsx`、`components/BlessingCard/index.tsx`、`lib/email.ts`
2. 替換賓客資料：改寫 `lib/db.ts` 的 `seedTestData()`，或改 `lib/init.ts` 從 JSON / 資料庫載入
3. 替換圖片：`public/couple-illustration.png`、`public/sample-cover.svg`、`public/sample-images/`
