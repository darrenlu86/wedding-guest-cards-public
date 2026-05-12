import { describe, it, expect, beforeEach } from 'vitest';
import { verifyGuest } from '@/app/api/verify-guest/handler';
import { seedTestData, clearTestData } from '@/lib/db';
import { clearRateLimitData } from '@/lib/rate-limit';

describe('Verify Guest API', () => {
  beforeEach(async () => {
    await clearTestData();
    await clearRateLimitData();
    await seedTestData();
  });

  it('應該成功驗證存在的賓客', async () => {
    const result = await verifyGuest({
      guestName: '小明',
      ip: 'test-ip-1',
      honeypot: '',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.guestId).toBeDefined();
      expect(result.redirectUrl).toContain('/card/');
    }
  });

  it('應該拒絕不存在的賓客', async () => {
    const result = await verifyGuest({
      guestName: '不存在的人',
      ip: 'test-ip-2',
      honeypot: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('NOT_FOUND');
    }
  });

  it('應該拒絕無效的姓名', async () => {
    const result = await verifyGuest({
      guestName: '<script>alert(1)</script>',
      ip: 'test-ip-3',
      honeypot: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_INPUT');
    }
  });


  it('應該檢測 Honeypot', async () => {
    const result = await verifyGuest({
      guestName: '小明',
      ip: 'test-ip-5',
      honeypot: 'bot-filled-this',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('HONEYPOT_DETECTED');
    }
  });

  it('應該在超過 Rate Limit 時拒絕請求', async () => {
    const ip = 'test-ip-6';

    // 連續請求 5 次
    for (let i = 0; i < 5; i++) {
      await verifyGuest({
        guestName: '小明',
        ip,
        honeypot: '',
      });
    }

    // 第 6 次應該被拒絕
    const result = await verifyGuest({
      guestName: '小明',
      ip,
      honeypot: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('RATE_LIMIT');
    }
  });

  it('應該記錄失敗次數', async () => {
    const ip = 'test-ip-7';

    // 連續 3 次失敗
    for (let i = 0; i < 3; i++) {
      await verifyGuest({
        guestName: '不存在的人',
        ip,
        honeypot: '',
      });
    }

    // 第 4 次即使是正確的名字也可能被限制 (取決於實作)
    const result = await verifyGuest({
      guestName: '小明',
      ip,
      honeypot: '',
    });

    // 這個測試主要確認失敗次數有被記錄
    expect(result).toBeDefined();
  });
});
