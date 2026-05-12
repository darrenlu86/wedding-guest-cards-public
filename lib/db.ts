import { Guest } from '@/types/guest';

// 本地開發使用記憶體儲存
// 生產環境可替換為 Redis/Vercel KV
const guestStore = new Map<string, Guest>();
const nameIndex = new Map<string, string>(); // name (lowercase) -> guestId

/**
 * 根據姓名查找賓客
 */
export async function findGuestByName(
  guestName: string
): Promise<Guest | null> {
  const normalizedName = guestName.toLowerCase().trim();
  const guestId = nameIndex.get(normalizedName);

  if (!guestId) {
    return null;
  }

  const guest = guestStore.get(guestId);
  return guest || null;
}

/**
 * 根據 ID 獲取賓客資料
 */
export async function getGuestById(guestId: string): Promise<Guest | null> {
  const guest = guestStore.get(guestId);
  return guest || null;
}

/**
 * 更新賓客統計資料
 */
export async function updateGuestStats(
  guestId: string,
  field: 'viewedAt' | 'downloadedAt' | 'emailSentAt'
): Promise<void> {
  const guest = guestStore.get(guestId);
  if (!guest) {
    throw new Error('Guest not found');
  }

  guest[field] = new Date();
  guestStore.set(guestId, guest);
}

/**
 * 新增賓客到資料庫
 */
export async function addGuest(guest: Guest): Promise<void> {
  guestStore.set(guest.id, guest);

  // 更新姓名索引
  const normalizedName = guest.name.toLowerCase().trim();
  nameIndex.set(normalizedName, guest.id);
}

/**
 * 建立 10 組範例賓客資料（開源範例）
 *
 * - 涵蓋 5 種主題各 2 位（classic / rose / midnight / spring / luxe）
 * - 圖片數量混合：無圖、1 張、2 張
 * - 中英文姓名混合，方便測試多語場景
 *
 * 部署時請替換為自己的賓客名單。
 */
export async function seedTestData(): Promise<void> {
  const sampleGuests: Guest[] = [
    {
      id: 'guest-sample-01',
      name: '小明',
      phone: '0912000001',
      customization: {
        message: `呦小明，謝謝你今天來～

我們從大學就認識到現在，當時應該也想不到我會有結婚的這一天哈哈哈。從一起熬夜趕報告、然後一起逃課去吃宵夜的時候，到現在大家各自有各自的階段，時間真的過很快。

雖然我們不算很常聯絡，但每次見面都還是可以無縫接軌，這種朋友其實已經不多了，謝謝你一直都在。

接下來也祝你工作、感情都順順利利，下次找你吃個飯。`,
        images: ['/sample-images/sample-01.svg'],
        templateId: 'classic',
      },
    },
    {
      id: 'guest-sample-02',
      name: '小婷',
      phone: '0912000002',
      customization: {
        message: `嗨小婷，

從學生時代認識到現在，一路上有妳真的差很多。從那些奇怪的小事（像是凌晨三點打給妳問人生選擇），到現在各自被工作追著跑，妳還是一直願意聽我廢話，真的很感謝。

我們之前約好的那個旅行還沒去呢，看是今年下半年還是明年再來喬一下，總之不能再拖了哈哈哈。

謝謝妳今天來，愛妳～`,
        images: [
          '/sample-images/sample-02.svg',
          '/sample-images/sample-01.svg',
        ],
        templateId: 'classic',
      },
    },
    {
      id: 'guest-sample-03',
      name: '玫君',
      phone: '0912000003',
      customization: {
        message: `玫君，

從工作上認識妳，然後不知不覺變成現在這種可以一起喝酒抱怨的朋友，這個過程其實還蠻意外的哈哈哈，畢竟同事變朋友的機率沒有想像中高。

謝謝妳這幾年的陪伴，那些我講不出口的事情，妳大概是少數聽過的人。希望我們之後不論在哪個公司、做什麼工作，都還能繼續一起吐槽世界 :p

祝幸福、平安！`,
        images: [],
        templateId: 'rose',
      },
    },
    {
      id: 'guest-sample-04',
      name: '思賢',
      phone: '0912000004',
      customization: {
        message: `Hi 思賢，

我們算是工作上一起被 deadline 追的戰友，幾個專案下來，我覺得跟你合作真的很安心。你那個一邊吐槽一邊把事情做完的特質，現在回想起來其實是滿稀有的能力哈。

不知道你接下來會往哪個方向走，但相信不論做什麼都會走出自己的路。如果之後有合作機會，歡迎隨時找我聊聊。

祝好運！`,
        images: ['/sample-images/sample-04.svg'],
        templateId: 'rose',
      },
    },
    {
      id: 'guest-sample-05',
      name: 'Alex Chen',
      phone: '0912000005',
      customization: {
        message: `Hey Alex,

Honestly didn't expect you to actually fly over for this — thanks for showing up, means a lot.

The last time we hung out feels like ages ago, but somehow whenever we catch up it's like nothing changed. That's pretty rare these days, so I'll take it.

Take care, and let's grab a proper drink before the year ends.`,
        images: ['/sample-images/sample-05.svg'],
        templateId: 'midnight',
      },
    },
    {
      id: 'guest-sample-06',
      name: '佳穎',
      phone: '0912000006',
      customization: {
        message: `嗨佳穎，

謝謝妳在我之前那段比較奇怪的時間陪著我。沒有要說多麼煽情的話，但那時候真的是靠妳願意一直接我廢話電話撐過來的，講真的。

希望我們未來都能慢慢變得更從容一點，下次換我當妳的後盾的時候，可以像妳當時那樣穩。

愛妳～`,
        images: [
          '/sample-images/sample-06.svg',
          '/sample-images/sample-05.svg',
        ],
        templateId: 'midnight',
      },
    },
    {
      id: 'guest-sample-07',
      name: '志豪',
      phone: '0912000007',
      customization: {
        message: `志豪哥，謝謝你今天來。

當年是你帶我入行的，那時候對你的印象就是一個一邊罵我一邊把事情教完的人哈哈哈。但回頭看，你那些「直接」的建議，現在每個都還用得到。

雖然現在我們不在同一間公司，但有什麼決定要做的時候還是會想找你聊一下，希望我們之後都保持這個習慣。

身體顧好，下次換我請吃飯。`,
        images: [],
        templateId: 'spring',
      },
    },
    {
      id: 'guest-sample-08',
      name: 'Jamie Lee',
      phone: '0912000008',
      customization: {
        message: `Hey Jamie,

Funny how we keep ending up in the same orbit even after all these years and timezones. We never really planned to stay in touch and yet, here we are.

Thanks for being someone I can pick up a conversation with after 6 months of silence like nothing happened — that's underrated.

See you next time, wherever that ends up being.`,
        images: ['/sample-images/sample-08.svg'],
        templateId: 'spring',
      },
    },
    {
      id: 'guest-sample-09',
      name: '怡君',
      phone: '0912000009',
      customization: {
        message: `嗨怡君，

從以前家裡附近的小妹妹，到現在可以一起喝酒聊心事的朋友，這個過程其實還蠻奇妙的，當時應該也沒想過會變成這樣對吧哈哈哈。

很多很細碎的事情都謝謝妳家人這些年的照顧，這份心意我們都記得。未來不論搬到哪邊，我們都還是那種家人般的關係。

愛妳，下次來家裡喝酒～`,
        images: [
          '/sample-images/sample-09.svg',
          '/sample-images/sample-10.svg',
        ],
        templateId: 'luxe',
      },
    },
    {
      id: 'guest-sample-10',
      name: '宏達',
      phone: '0912000010',
      customization: {
        message: `呦宏達，

說真的，你飛這麼遠來真的有點意外哈哈哈，但這份心意我們收到了。

我們很久沒有好好聊了，今天時間如果不夠，那就先記著，下次換我們去找你，到時候你要負責當地陪、行程也要排好，我們去當奧客 :p

祝順利平安，期待再見！`,
        images: ['/sample-images/sample-10.svg'],
        templateId: 'luxe',
      },
    },
  ];

  for (const guest of sampleGuests) {
    await addGuest(guest);
  }
}

/**
 * 清除測試資料
 */
export async function clearTestData(): Promise<void> {
  guestStore.clear();
  nameIndex.clear();
}

/**
 * 獲取所有賓客（用於管理後台）
 */
export async function getAllGuests(): Promise<Guest[]> {
  return Array.from(guestStore.values());
}
