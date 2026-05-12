import { seedTestData, getAllGuests } from './db';

let initialized = false;

/**
 * 確保資料已初始化（開源範例版）
 *
 * 預設使用 lib/db.ts 中的 10 組範例賓客。
 * 部署正式版時，將此函式改為從 JSON 檔或資料庫載入真實名單。
 */
export async function ensureDataInitialized() {
  if (!initialized) {
    await seedTestData();
    initialized = true;
    const guests = await getAllGuests();
    console.log(`Sample data initialized: ${guests.length} guests loaded`);
  }
}
