import { EMAIL_SEND, RATE_LIMIT } from './constants';

// 本地開發使用記憶體儲存
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const emailQuotaStore = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  retryAfter?: number;
}

/**
 * 檢查 IP 是否超過 Rate Limit
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const now = Date.now();
  const key = `ip:${ip}`;

  let entry = rateLimitStore.get(key);

  // 如果沒有記錄或已過期,重置
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 1,
      resetAt: now + RATE_LIMIT.WINDOW_MS,
    };
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      remaining: RATE_LIMIT.MAX_ATTEMPTS - 1,
    };
  }

  // 增加計數
  entry.count++;

  // 檢查是否超過限制
  if (entry.count > RATE_LIMIT.MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000), // 秒數
    };
  }

  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: RATE_LIMIT.MAX_ATTEMPTS - entry.count,
  };
}

/**
 * 檢查單一賓客的 Email 寄送配額
 *
 * 每個 guestId 在 EMAIL_SEND.WINDOW_MS 內最多 EMAIL_SEND.MAX_PER_GUEST 次。
 * 防止攻擊者拿到 guestId 後把網站當 Gmail open relay 濫用。
 *
 * 注意：使用記憶體 store，serverless cold start 會重置 counter。
 * 真要嚴格管控請改用 Vercel KV / Upstash Redis。
 */
export async function checkEmailSendQuota(
  guestId: string
): Promise<RateLimitResult> {
  const now = Date.now();
  const key = `email-quota:${guestId}`;

  let entry = emailQuotaStore.get(key);

  if (!entry || now > entry.resetAt) {
    entry = {
      count: 1,
      resetAt: now + EMAIL_SEND.WINDOW_MS,
    };
    emailQuotaStore.set(key, entry);
    return {
      allowed: true,
      remaining: EMAIL_SEND.MAX_PER_GUEST - 1,
    };
  }

  entry.count++;

  if (entry.count > EMAIL_SEND.MAX_PER_GUEST) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  emailQuotaStore.set(key, entry);

  return {
    allowed: true,
    remaining: EMAIL_SEND.MAX_PER_GUEST - entry.count,
  };
}

/**
 * 清除 Rate Limit 資料 (測試用)
 */
export async function clearRateLimitData(): Promise<void> {
  rateLimitStore.clear();
  emailQuotaStore.clear();
}
