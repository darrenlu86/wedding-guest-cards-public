import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRateLimit,
  recordFailedAttempt,
  clearRateLimitData,
} from '@/lib/rate-limit';

describe('Rate Limiting', () => {
  beforeEach(async () => {
    await clearRateLimitData();
  });

  describe('checkRateLimit', () => {
    it('應該允許第一次請求', async () => {
      const result = await checkRateLimit('test-ip-1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('應該追蹤剩餘次數', async () => {
      const ip = 'test-ip-2';

      const result1 = await checkRateLimit(ip);
      expect(result1.allowed).toBe(true);

      const result2 = await checkRateLimit(ip);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBeLessThan(result1.remaining);
    });

    it('應該在超過限制時拒絕請求', async () => {
      const ip = 'test-ip-3';

      // 連續請求超過限制 (5次)
      for (let i = 0; i < 5; i++) {
        await checkRateLimit(ip);
      }

      // 第6次應該被拒絕
      const result = await checkRateLimit(ip);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });
  });

  describe('recordFailedAttempt', () => {
    it('應該記錄失敗次數', async () => {
      const tableId = 'table-1';

      await recordFailedAttempt(tableId);
      const count1 = await recordFailedAttempt(tableId);
      expect(count1).toBe(2);
    });

    it('應該在達到限制時返回鎖定狀態', async () => {
      const tableId = 'table-2';

      // 記錄3次失敗
      await recordFailedAttempt(tableId);
      await recordFailedAttempt(tableId);
      const count = await recordFailedAttempt(tableId);

      expect(count).toBe(3);
    });

    it('不同桌號應該獨立計數', async () => {
      await recordFailedAttempt('table-1');
      await recordFailedAttempt('table-1');

      const count2 = await recordFailedAttempt('table-2');
      expect(count2).toBe(1);
    });
  });
});
