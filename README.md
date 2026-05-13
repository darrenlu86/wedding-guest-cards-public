# Wedding Guest Cards · 婚禮賓客互動感謝卡

> 給每位賓客一張「會打開的信封 + 客製化祝福卡」的婚禮互動工具。賓客掃 QR Code → 輸入姓名電話 → 看到專屬於自己的卡片，含對方專屬訊息、照片與主題色。

[![License: PolyForm Noncommercial 1.0.0](https://img.shields.io/badge/License-PolyForm%20NC%201.0.0-yellow.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

---

## 這個專案能幫你做什麼？

- 婚禮前印一張 QR Code 大牌，賓客掃描後輸入「姓名」和「電話」就能看到 **專屬於自己的祝福卡**
- 每張卡可以放：對方的客製化文字、對方的相片（0 ~ 多張）、5 種顏色主題擇一
- 看卡前會先有一個 **信封 3D 翻轉動畫**，賓客點一下，信封打開、卡片浮起來
- 卡片可以下載成圖，或寄到自己的 email 收藏

> 📺 想看實際運作？clone 後跑 `npm install && npm run dev`，瀏覽器開 `http://localhost:3000`，用範例賓客「小明 / 0912000001」就能體驗完整流程。

---

## 你有兩種選擇

### 選項 A：不寫程式，用我做的 SaaS 服務（5 分鐘上線）

👉 **[card.oharalab.com](https://card.oharalab.com)**

- 不用懂程式、不用裝任何東西
- 後台直接填賓客資料、上傳照片
- 內建 Excel 匯入、QR Code 產生、Email 寄送

如果你只是想辦個婚禮、不想花時間搞技術，**直接用 SaaS 就好**。

### 選項 B：自己 fork 這個 repo 改（DIY 工程師款，免費）

如果你會一點程式（或想學、或想丟給 AI 幫你做），這個 repo 是完整開源的，可以拿去改成自己想要的版本。

下面所有的說明都是為「選項 B」寫的。

> ⚠️ **此 repo 為公開範例版**：所有賓客資料、訊息文字、圖片都是示範用途，請於部署前替換為自己的內容。我自己婚禮上的真實內容（親手寫給家人朋友的卡片）並未包含在此 repo 中。

---

## ⚠️ 安全模型 / Threat Model（fork 前請看）

這個 repo 是「**小規模、私下分享**」的婚禮工具，不是 SaaS。整體安全設計建立在以下假設上：

- 卡片連結只透過 QR Code / 私訊發給賓客本人，**不會公開散播**到網路上
- 賓客 ID 在你跑 `npm run import:guests` 後是隨機字串，外人猜不到
- 賓客總數通常 < 200 人

**已知的設計取捨**（這些對單場婚禮的場景沒實際風險，所以不修）：

| 項目 | 行為 | 影響 |
|------|------|------|
| `/api/card-data/[guestId]` | 拿到 ID 就能讀，無 session 驗證 | 連結若外流，內容就外流 |
| 賓客資料 / Rate limit | 存在記憶體（serverless cold start 會重置） | 統計失準、rate limit best-effort |
| 「找不到賓客」回公版卡 / 「電話錯」回 NOT_FOUND | 錯誤訊息差異 | 可被用來測某姓名是否在名單上 |
| `lib/db.ts` 賓客電話 | 明碼存記憶體 | 範例 repo 沒問題；真實名單請評估是否要 hash |

**已加防護的部分**：

- `POST /api/send-email` 加了同源檢查、單一賓客 24h 寄信配額、圖片大小上限，避免有人拿到 `guestId` 後把你的 Gmail 當 open relay 濫用
- IP rate limit、honeypot、姓名格式驗證

**如果你的場景不符合上面的假設**（要當 SaaS 跑、要存大量 PII、卡片連結會公開散播、不接受任何資料外流風險）：

👉 **直接用 [card.oharalab.com](https://card.oharalab.com)**，我幫你處理 auth / DB / rate limit / 圖片儲存這些事。fork 自己改要補的東西比想像中多。

---

## 給 AI 助手的快速摘要

> 如果你（人類使用者）打算把這個 repo 丟給 AI（Claude / GPT / Cursor / Copilot 等）幫你完成自訂與部署，可以把下面這段話貼給 AI 作為任務描述：

```
我有一個 Next.js 16 婚禮卡片網站 fork 自 darrenlu86/wedding-guest-cards-public。
請依照 README.md 的「Step 1 ~ Step 3」幫我完成以下工作：

1. 把 public/photos/ 底下的賓客照片，依照 data/guests.xlsx 的內容
   引用到對應賓客的 customization.images 欄位
2. 跑 `npm run import:guests` 把 Excel 轉成 lib/guests.json
3. 修改 lib/init.ts 從 guests.json 載入（而不是 seedTestData）
4. 把所有「Alex & Jamie」替換成我提供的新人名稱（中英都改）
5. 把所有「your-domain.example.com」替換成我提供的網域
6. 跑 `npm run build` 確認沒有錯誤
7. 告訴我怎麼部署到 Vercel
```

AI 應該能直接照著 README 中的檔案路徑與指令完成上述任務。下面所有路徑都是 **絕對精確** 的，不需要猜。

---

## Step 0：環境準備（5 分鐘）

### 0-1. 安裝 Node.js

如果你還沒有 Node.js，到 [nodejs.org](https://nodejs.org/) 下載最新 LTS 版本安裝。

驗證安裝：

```bash
node --version    # 應該看到 v20.x 或 v22.x 以上
npm --version     # 應該看到 10.x 以上
```

### 0-2. Clone 這個 repo

```bash
git clone https://github.com/darrenlu86/wedding-guest-cards-public.git
cd wedding-guest-cards-public
```

### 0-3. 安裝依賴 + 啟動

```bash
npm install
npm run dev
```

瀏覽器自動打開（或手動開）[http://localhost:3000](http://localhost:3000)，輸入：
- 姓名：`小明`
- 電話：`0912000001`

點「查看感謝小卡」，就能看到完整流程。

---

## Step 1：把照片放到 `public/photos/`

### 1-1. 照片要放在這個資料夾

```
專案根目錄/
└── public/
    └── photos/              ← 你的所有賓客照片放這裡
        ├── 王小明.jpg
        ├── 01-李小華.jpg
        └── ...
```

### 1-2. 命名建議

| ✅ 推薦 | ❌ 不推薦 |
|--------|----------|
| `王小明.jpg` | `IMG_4523.jpg`（之後找不到誰是誰） |
| `01-王小明.jpg` | `照片1.jpg` |
| `John_Doe.png` | `pic.jpg` |

中文檔名 OK，系統會自動處理。

### 1-3. 支援格式與尺寸

- 支援：`.jpg` / `.jpeg` / `.png` / `.webp` / `.svg` / `.avif`
- 建議尺寸：800×600 以上（直/橫向皆可）

### 1-4. 在資料裡引用照片時的路徑寫法

```
✅ 對：  /photos/王小明.jpg
❌ 錯：  photos/王小明.jpg          （少了開頭斜線）
❌ 錯：  public/photos/王小明.jpg    （不要加 public/）
❌ 錯：  ./photos/王小明.jpg         （不要加點號）
```

多張照片，用逗號隔開（在 Excel 裡）或寫成陣列（在 JSON 裡）：

- **Excel 寫法**：`/photos/01-王小明.jpg, /photos/02-王小明.jpg`
- **JSON 寫法**：`["/photos/01-王小明.jpg", "/photos/02-王小明.jpg"]`

---

## Step 2：填賓客名單（Excel 流程）

這是最不需要碰程式碼的方式。

### 2-1. 打開模板

```bash
open data/guests-template.xlsx
```

或直接在檔案總管雙擊 `data/guests-template.xlsx`。

### 2-2. 模板長這樣

| 姓名 | 電話 | 祝福訊息 | 主題 | 圖片 |
|------|------|----------|------|------|
| 王小明 | 0912345678 | 親愛的小明，\n感謝你的陪伴... | classic | /photos/01-王小明.jpg |
| 李小華 | 0987654321 | 親愛的小華，... | rose | /photos/02-李小華.jpg, /photos/02b-李小華.jpg |
| John Doe | 0922222222 | Dear John,... | spring |  |

**5 個欄位說明：**

| 欄位 | 必填？ | 說明 |
|------|--------|------|
| **姓名** | ✅ 必填 | 用於登入驗證，需與賓客輸入完全一致 |
| **電話** | 選填 | 沒填的話只用姓名驗證 |
| **祝福訊息** | 選填 | 卡片中央顯示的內容。在 Excel 裡按 `Alt+Enter`（Windows）或 `Option+Enter`（Mac）換行 |
| **主題** | 選填 | 五選一：`classic`（粉黃）/ `rose`（粉紅）/ `midnight`（粉藍）/ `spring`（粉綠）/ `luxe`（粉橘）。不填預設 classic |
| **圖片** | 選填 | 一張或多張，多張用「半形逗號 + 空白」隔開。路徑要用 `/photos/檔名` 格式 |

### 2-3. 另存為 `guests.xlsx`

⚠️ **重要**：填完之後要 **另存新檔**，存成 `data/guests.xlsx`（不是 `guests-template.xlsx`）。

### 2-4. 跑匯入指令

```bash
npm run import:guests
```

這個指令會：
1. 讀取 `data/guests.xlsx`
2. 驗證每一列（姓名是否填、主題是否合法等）
3. 生成 `lib/guests.json`
4. 印出匯入摘要（成功幾筆、警告幾筆、錯誤幾筆）

### 2-5. 切換到「載入真實資料」模式

打開 [`lib/init.ts`](./lib/init.ts)，把整個檔案內容替換成：

```ts
import { addGuest, getAllGuests } from './db';
import { Guest } from '@/types/guest';
import guestsData from './guests.json';

let initialized = false;

export async function ensureDataInitialized() {
  if (initialized) return;
  for (const guest of guestsData as Guest[]) {
    await addGuest(guest);
  }
  initialized = true;
  const guests = await getAllGuests();
  console.log(`Loaded ${guests.length} guests from guests.json`);
}
```

### 2-6. 重啟 dev server

```bash
# 在跑 npm run dev 的視窗按 Ctrl+C 停掉
# 然後重新啟動
npm run dev
```

打開 http://localhost:3000，用你 Excel 中的真實姓名測試 → 看到你的賓客卡片。✅

> 📌 **不想用 Excel？** 可以直接編輯 [`lib/db.ts`](./lib/db.ts) 中的 `seedTestData()` 函式，把 10 組範例改成自己的賓客（適合 < 30 人的情況）。

---

## Step 3：自訂新人名稱、主題色、品牌

### 3-1. 替換新人名稱（5 處）

在以下 5 個檔案搜尋 `Alex & Jamie` 並替換成你們的名字：

| 檔案 | 行號附近 | 改什麼 |
|------|---------|--------|
| [`app/layout.tsx`](./app/layout.tsx) | 第 5、12、15、16、29 行 | `SITE_TITLE`、`template`、`keywords`、`authors`、`alt` |
| [`app/card/[guestId]/layout.tsx`](./app/card/[guestId]/layout.tsx) | 第 13、15、23、29 行 | OG meta 中的標題與描述 |
| [`app/page.tsx`](./app/page.tsx) | 第 92 行 | 登入頁顯示的新人名稱 |
| [`components/BlessingCard/index.tsx`](./components/BlessingCard/index.tsx) | 第 142 行 | 卡片簽名 |
| [`lib/email.ts`](./lib/email.ts) | 第 4 行 | `SENDER_NAME`（寄信用） |

**快速一次改完**（macOS / Linux）：

```bash
# 把 Alex & Jamie 全部換成「小明 & 小華」
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "./node_modules/*" \
  -exec sed -i.bak 's/Alex & Jamie/小明 \& 小華/g' {} \;
find . -name "*.bak" -delete
```

### 3-2. 替換網域

```bash
# 把 your-domain.example.com 換成你的網域
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "./node_modules/*" \
  -exec sed -i.bak 's/your-domain.example.com/我們的婚禮.tw/g' {} \;
find . -name "*.bak" -delete
```

### 3-3. 替換新人似顏繪與封面圖

```
public/couple-illustration.png   ← 換成你們的圓形似顏繪（建議 512×512）
public/sample-cover.svg          ← 換成你們的 OG / 社群分享預覽圖（建議 1200×800）
```

直接覆蓋這兩個檔案即可。

### 3-4. 客製化主題色（選用）

5 種主題定義在 [`components/BlessingCard/cardTemplates.ts`](./components/BlessingCard/cardTemplates.ts)。

每個主題的設定長這樣：

```ts
{
  id: 'classic',
  card: { backgroundColor: '#fffbf0', ... },
  message: { background: '#fef3d4', border: '#e8d4a3', ... },
  text: { title: '#6b5a2a', body: '#3a3a3a', ... },
  accent: '#c9a84c',  // 邊框、分隔線、四角紋飾的主色
}
```

可以直接改 hex 值，或新增第 6 種主題（記得也在 `lib/constants.ts` 註冊新的 templateId）。

---

## Step 4：部署上線

完成自訂後，把網站部署到網路上，賓客掃 QR Code 才能進入。

### 選項 A：Vercel（推薦，免費，5 分鐘）

**步驟**：

1. 把你的 fork 推到自己的 GitHub repo（如 `myname/our-wedding-cards`）
2. 到 [vercel.com/new](https://vercel.com/new) 用 GitHub 登入
3. 選你的 repo → 點 `Deploy`
4. 等 2 分鐘，拿到網址（例：`our-wedding-cards.vercel.app`）

**設定自訂網域**（選用）：
- Vercel Dashboard → Project Settings → Domains → 加入你的網域
- 跟著畫面指示去 DNS 設定 CNAME

**選用環境變數**（要寄送 Email 才需要，詳見下方「Step 6：Email 寄送設定」）：

```env
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
GMAIL_SENDER_EMAIL=
```

> ⚠️ **重要**：這四個值「必須使用你自己的 Google 帳號和 OAuth Client」，**不要填別人的**，否則賓客寄出的 Email 會用別人的 Gmail 發送。詳見「Step 6」。

### 選項 B：Cloudflare Pages（免費，適合自訂網域）

```bash
npm run build
npx opennextjs-cloudflare deploy
```

詳細步驟見 [Cloudflare Next.js 部署文件](https://developers.cloudflare.com/pages/framework-guides/nextjs/)。

### 選項 C：GitHub Pages（純靜態，受限）

⚠️ **限制**：GitHub Pages 只支援靜態網站，沒有伺服器。本專案有 API routes（`/api/verify-guest`、`/api/card-data`、`/api/send-email`），**無法直接運作**。

如果一定要用 GitHub Pages，需要大幅改動：
1. 把賓客 JSON 直接 embed 進前端（**賓客名單會對外可見**，有隱私風險）
2. 改用 `next export` 產生靜態檔
3. 失去 rate limiting、honeypot、email 寄送等功能

> 👉 **建議**：除非你能接受名單對外可見，否則選 Vercel 或 Cloudflare。

### 選項 D：完全不想處理部署？

回到上方 → 用 [**card.oharalab.com**](https://card.oharalab.com) SaaS 服務。

---

## Step 5：印 QR Code

部署完拿到網址後，印一張 QR Code 放在婚禮現場：

```bash
# 用 CLI 產生 QR Code
npx qrcode "https://our-wedding-cards.vercel.app" -o qr.png -w 1200
```

或用線上工具：[qr-code-generator.com](https://www.qr-code-generator.com/)

建議把 QR Code 印在邊長 ≥ 5 公分的紙板上，掃描距離 ≥ 30 公分。

---

## Step 6：Email 寄送設定（Gmail OAuth）⚠️ 必看

賓客在卡片頁有「Email 分享」按鈕，可以把自己的卡片寄到自己的 email 收藏。**這個功能需要你串接自己的 Google 帳號**，否則按下去會失敗。

### ⚠️ 為什麼一定要用「你自己的」Google 帳號？

這個專案 **沒有預設的 Email 寄件人**。所有 OAuth 憑證都從環境變數讀取：

```ts
// lib/email.ts:13-16
const clientId = process.env.GMAIL_CLIENT_ID;
const clientSecret = process.env.GMAIL_CLIENT_SECRET;
const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
const senderEmail = process.env.GMAIL_SENDER_EMAIL;
```

- ✅ 你 fork 這個 repo，env 變數空白 → Email 按鈕會出現「寄送失敗」（其他功能不受影響）
- ✅ 你填上自己的 Gmail OAuth 憑證 → 所有 Email 從你自己的 Gmail 發出
- ❌ 你絕對不會「不小心用到作者（Darren Lu）的 Gmail」—— 因為原始碼裡沒有任何作者的憑證

> **作者注**：我的 Gmail 憑證只存在我自己的 `.env.local`，從未推到 GitHub。你 clone 這個 repo 拿到的是空白的 `.env.example`。

### 6-1. 在 Google Cloud Console 建立 OAuth Client

1. 用你的 Gmail 帳號登入 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立一個新的 Project（或選現有的）
3. 左側選單 → **APIs & Services** → **Library**
4. 搜尋 `Gmail API` → 點 **Enable**
5. 左側選單 → **APIs & Services** → **OAuth consent screen**
   - User Type：**External**
   - App name 隨便填（例：`Our Wedding Cards`）
   - User support email：你的 Gmail
   - Developer contact information：你的 Gmail
   - **Scopes** 加入：`https://mail.google.com/`
   - **Test users** 加入：你的 Gmail（OAuth 在 testing 模式下只允許 test users 授權）
6. 左側選單 → **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
   - Application type：**Desktop app**
   - Name 隨便填
   - **Create** 之後會跳出 Client ID 和 Client Secret

### 6-2. 複製 `.env.example` 並填入

```bash
cp .env.example .env.local
```

打開 `.env.local`，填入剛剛拿到的值：

```env
GMAIL_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com   # ← Google 給你的
GMAIL_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxx            # ← Google 給你的
GMAIL_REFRESH_TOKEN=                                          # ← 下一步取得
GMAIL_SENDER_EMAIL=your-name@gmail.com                       # ← 你的 Gmail
```

### 6-3. 取得 Refresh Token（自動化腳本）

```bash
npx tsx scripts/get-gmail-token.ts
```

腳本會：
1. 問你 Client ID 和 Client Secret（直接從 `.env.local` 複製貼上）
2. 開啟瀏覽器，跳到 Google 授權頁面
3. 你按「允許」授權給自己的 OAuth Client（會看到 unverified app 警告，按「Advanced → Go to ... unsafe」沒關係，因為你是用自己的 Client 授權給自己）
4. 取得 Refresh Token，印在終端機

把這個 Refresh Token 貼回 `.env.local` 的 `GMAIL_REFRESH_TOKEN=`。

### 6-4. 部署時把這四個變數設到 Vercel / Cloudflare

**Vercel**：Dashboard → Project Settings → Environment Variables → 加入四個變數。

**Cloudflare Pages**：Dashboard → Project → Settings → Environment variables → 加入四個變數。

> ⚠️ **絕對不要**把 `.env.local` 推到 GitHub。`.gitignore` 已經幫你忽略了，但每次 commit 前還是確認一下 `git status` 沒有列出 `.env.local`。

### 6-5. 測試

在本地跑 `npm run dev`，進入卡片頁，按「Email 分享」→ 輸入收件 email → 應該會收到一封 HTML 排版的卡片信。

如果失敗：
- 看終端機錯誤訊息（Client 端只會顯示「寄送失敗，請稍後再試」，server console 才有詳細錯誤）
- 檢查 Gmail API 是否啟用、OAuth consent screen 是否加了你的 email 作為 test user

### 6-6. 不想搞 Email？

如果你覺得 OAuth 設定太麻煩，**直接不填就好**。卡片頁的 Email 按鈕會顯示錯誤，但其他功能（驗證、信封動畫、卡片顯示、下載卡片）完全不受影響。

或者也可以直接刪掉 Email 按鈕：把 [`components/EmailShareButton`](./components/EmailShareButton/) 從卡片頁 import 移除即可。

---

## Step 7：下載功能（無需任何設定）

賓客在卡片頁有「下載卡片」按鈕，**這個功能完全是前端處理的，不需要任何環境變數**。

技術原理（在 [`components/DownloadButton/index.tsx`](./components/DownloadButton/index.tsx)）：

1. 用 [`html-to-image`](https://www.npmjs.com/package/html-to-image) 把卡片 DOM 截成 PNG dataURL
2. 把 dataURL 轉成 Blob 和 File
3. 優先使用 **Web Share API**（手機 / LINE 內建瀏覽器會跳分享選單）
4. Fallback：用 `<a download>` 觸發瀏覽器下載

所以：
- ✅ 不需要 server、不需要任何 API key
- ✅ 不會把賓客資料上傳到任何地方
- ✅ 桌面瀏覽器下載成 PNG 檔（檔名：`wedding-card-{guestName}.png`）
- ✅ 手機跳系統分享選單，可以直接存到相簿或傳給朋友

如果想換成下載 PDF 或 JPG，可以改 [`lib/capture-card.ts`](./lib/capture-card.ts) 的 `toPng` 為 `toJpeg` 或接 `jsPDF`。

---

## 完整檔案目錄（給 AI 參考用）

```
wedding-guest-cards-public/
├── app/                              # Next.js App Router
│   ├── page.tsx                      # 驗證入口頁（要改新人名）
│   ├── layout.tsx                    # 根 layout（要改 SITE_TITLE 等）
│   ├── icon.svg                      # 網站 favicon
│   ├── card/[guestId]/
│   │   ├── page.tsx                  # 卡片展示頁
│   │   └── layout.tsx                # 卡片頁 OG meta（要改）
│   ├── [tableId]/page.tsx            # 桌次入口（可選）
│   └── api/
│       ├── verify-guest/             # 姓名＋電話驗證 API
│       ├── card-data/[guestId]/      # 卡片資料 API
│       └── send-email/               # 寄送 Email API
├── components/
│   ├── BlessingCard/
│   │   ├── index.tsx                 # 祝福卡主元件（要改第 142 行簽名）
│   │   ├── cardTemplates.ts          # 5 種主題定義（要改顏色就改這裡）
│   │   ├── BorderOrnament.tsx        # 邊框裝飾
│   │   ├── DividerElegant.tsx        # 分隔線
│   │   └── CornerOrnament.tsx        # 四角紋飾
│   ├── EnvelopeAnimation/
│   │   ├── index.tsx                 # 信封動畫元件
│   │   └── Envelope.module.css       # 動畫 CSS
│   ├── VerificationForm/             # 驗證表單
│   ├── DownloadButton/               # 下載卡片
│   ├── EmailShareButton/             # Email 分享
│   ├── PetalRain.tsx                 # 花瓣粒子背景
│   └── icons/                        # SVG icons
├── lib/
│   ├── db.ts                         # 賓客儲存 + 10 組範例 seedTestData()
│   ├── init.ts                       # 資料初始化（Step 2-5 要改這個）
│   ├── validation.ts                 # 輸入驗證
│   ├── rate-limit.ts                 # IP rate limit
│   ├── email.ts                      # Email 寄送（要改第 4 行 SENDER_NAME）
│   ├── capture-card.ts               # 卡片截圖
│   └── constants.ts                  # 主題 ID 常數
├── data/
│   └── guests-template.xlsx          # Excel 模板（填寫後另存 guests.xlsx）
├── public/
│   ├── couple-illustration.png       # 新人似顏繪（要換）
│   ├── sample-cover.svg              # OG 封面（要換）
│   ├── sample-images/                # 10 張範例照片（部署前可刪）
│   ├── photos/                       # 你自己的照片放這裡
│   └── fonts/                        # 中文字型
├── scripts/
│   ├── import-guests.ts              # Excel → JSON 匯入腳本
│   ├── init-data.ts                  # 範例資料初始化
│   ├── create-template.ts            # 重新生成 Excel 模板
│   └── get-gmail-token.ts            # Gmail OAuth token 取得
├── tests/                            # Vitest 測試
├── styles/globals.css                # 全域樣式
├── types/                            # TypeScript 型別
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── vitest.config.ts
├── README.md                         # ← 本檔案
├── CLAUDE.md                         # Claude Code 工作筆記
└── LICENSE                           # PolyForm Noncommercial 1.0.0
```

---

## 範例帳號（內建 10 組）

部署前可以用這 10 組測試流程。實際上線時記得替換成自己的資料（見 Step 2）。

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

定義在 [`lib/db.ts`](./lib/db.ts) 的 `seedTestData()` 函式。

---

## 常見問題 FAQ

### Q1：賓客輸入姓名後說「查無資料」？

確認三件事：
1. 賓客姓名與 `lib/guests.json`（或 `lib/db.ts` 的 `name`）**完全一致**（包含繁簡、空格）
2. 你是否有跑 `npm run import:guests` 重新生成 JSON
3. 你是否有重啟 dev server（改 JSON 後要重啟）

系統會做大小寫不敏感與 trim 處理，但**不會做模糊比對**。

### Q2：我改了 Excel 但網站沒變？

改完 Excel 後**三個步驟**缺一不可：
1. 跑 `npm run import:guests` 重新生成 `lib/guests.json`
2. 在 dev server 視窗按 `Ctrl+C` 停掉
3. 再跑一次 `npm run dev`

### Q3：圖片顯示破圖？

檢查三件事：
1. 照片是否放在 `public/photos/` 底下（不是其他資料夾）
2. 路徑寫法是否為 `/photos/檔名.jpg`（**不要加 `public/`**）
3. 副檔名大小寫是否一致（macOS 開發時不敏感，但 Linux 部署後敏感）

### Q4：為什麼 Tailwind 某些 class 沒生效？

`styles/globals.css` 中的 `* { padding: 0; margin: 0; }` 會覆蓋 Tailwind utility class。對於關鍵間距，請改用 inline style：

```tsx
<div style={{ marginBottom: '2.5rem' }}>...</div>
```

可以參考 `app/page.tsx` 第 90、98 行的範例寫法。

### Q5：部署後賓客資料怎麼處理？

預設使用記憶體儲存，每次 cold start 會重新跑 init。如果賓客名單會更新（RSVP 變動），有兩個選擇：

- **小規模（< 100 人）**：每次更新名單後重新部署即可
- **大規模 / 頻繁更新**：改用 Vercel KV、Redis 或 Supabase（需要改 `lib/db.ts`）

### Q6：可以拿來做商業用途嗎？

不行（沒有付費的話）。本專案使用 **PolyForm Noncommercial 1.0.0** 授權：

- ✅ 自己的婚禮、研究、學習 → 免費
- ✅ 慈善、教育、政府機構 → 免費
- ❌ 接案做給客戶用 → 需要授權
- ❌ 做成 SaaS 服務賣錢 → 需要授權

商業授權洽詢：📧 **kevin868686@gmail.com**

---

## 開發指令速查

```bash
npm run dev             # 開發伺服器（http://localhost:3000）
npm run build           # 建置生產版本
npm start               # 啟動生產伺服器
npm run import:guests   # Excel → JSON 匯入
npm run init:data       # 重新載入 10 組範例資料
npm test                # 執行 Vitest 測試
```

---

## 技術棧

- **前端**：Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4
- **動畫**：純 CSS Animations + CSS Modules（信封 3D 翻轉、花瓣粒子）
- **儲存**：記憶體 Map（開發用）；正式環境可換成 Vercel KV / Redis / Supabase
- **驗證**：自寫姓名＋電話雙驗證 + Honeypot 反爬蟲 + IP Rate Limiting
- **Email**：Nodemailer + SMTP
- **截圖 / 下載**：html-to-image
- **測試**：Vitest + Testing Library

---

## 授權

**[PolyForm Noncommercial License 1.0.0](./LICENSE)**

| 用途 | 是否允許 |
|------|---------|
| 你自己的婚禮 | ✅ |
| 學習、研究、實驗 | ✅ |
| 慈善、教育、政府機構 | ✅ |
| 接案 / 商業專案 | ❌ 需要授權 |
| 做成 SaaS 服務 | ❌ 需要授權 |
| 任何以營利為目的的散布 | ❌ 需要授權 |

商業授權洽詢：📧 **kevin868686@gmail.com**

或直接用 SaaS 版本 → [card.oharalab.com](https://card.oharalab.com)

---

## 貢獻

歡迎開 issue 或 PR 改善：Bug 回報、新主題色、新動畫效果、文件改善。

注意：貢獻內容將以 PolyForm Noncommercial 1.0.0 授權釋出。

---

## 作者

Made with 💛 by [Darren Lu](https://github.com/darrenlu86)

如果這個專案對你的婚禮（或任何個人專案）有幫助，歡迎 ⭐ Star 或來信跟我說一聲！

