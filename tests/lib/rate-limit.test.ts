import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, clearRateLimitData } from '@/lib/rate-limit';

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
});
