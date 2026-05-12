import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import {
  findGuestByTableAndName,
  getGuestById,
  updateGuestStats,
  seedTestData,
  clearTestData,
} from '@/lib/db';

describe('Database Operations', () => {
  beforeEach(async () => {
    // 清除測試資料
    await clearTestData();
    // 建立測試資料
    await seedTestData();
  });

  afterEach(async () => {
    // 清除測試資料
    await clearTestData();
  });

  describe('findGuestByTableAndName', () => {
    it('應該找到存在的賓客', async () => {
      const guest = await findGuestByTableAndName('table-1', '小明');
      expect(guest).toBeDefined();
      expect(guest?.name).toBe('小明');
      expect(guest?.tableId).toBe('table-1');
    });

    it('應該返回 null 當賓客不存在', async () => {
      const guest = await findGuestByTableAndName('table-1', '不存在的人');
      expect(guest).toBeNull();
    });

    it('應該返回 null 當桌號不存在', async () => {
      const guest = await findGuestByTableAndName('table-999', '小明');
      expect(guest).toBeNull();
    });

    it('應該不區分大小寫 (英文名)', async () => {
      const guest = await findGuestByTableAndName('table-2', 'john doe');
      expect(guest).toBeDefined();
      expect(guest?.name).toBe('John Doe');
    });
  });

  describe('getGuestById', () => {
    it('應該透過 ID 獲取賓客資料', async () => {
      // 先找到賓客取得 ID
      const foundGuest = await findGuestByTableAndName('table-1', '小明');
      expect(foundGuest).toBeDefined();

      // 透過 ID 取得
      const guest = await getGuestById(foundGuest!.id);
      expect(guest).toBeDefined();
      expect(guest?.id).toBe(foundGuest!.id);
      expect(guest?.name).toBe('小明');
    });

    it('應該返回 null 當 ID 不存在', async () => {
      const guest = await getGuestById('non-existent-id');
      expect(guest).toBeNull();
    });
  });

  describe('updateGuestStats', () => {
    it('應該更新 viewedAt', async () => {
      const foundGuest = await findGuestByTableAndName('table-1', '小明');
      expect(foundGuest).toBeDefined();

      await updateGuestStats(foundGuest!.id, 'viewedAt');

      const updatedGuest = await getGuestById(foundGuest!.id);
      expect(updatedGuest?.viewedAt).toBeDefined();
      expect(updatedGuest?.viewedAt).toBeInstanceOf(Date);
    });

    it('應該更新 downloadedAt', async () => {
      const foundGuest = await findGuestByTableAndName('table-1', '小明');
      expect(foundGuest).toBeDefined();

      await updateGuestStats(foundGuest!.id, 'downloadedAt');

      const updatedGuest = await getGuestById(foundGuest!.id);
      expect(updatedGuest?.downloadedAt).toBeDefined();
    });

    it('應該更新 emailSentAt', async () => {
      const foundGuest = await findGuestByTableAndName('table-1', '小明');
      expect(foundGuest).toBeDefined();

      await updateGuestStats(foundGuest!.id, 'emailSentAt');

      const updatedGuest = await getGuestById(foundGuest!.id);
      expect(updatedGuest?.emailSentAt).toBeDefined();
    });
  });
});
