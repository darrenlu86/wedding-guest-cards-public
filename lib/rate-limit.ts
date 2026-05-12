import { RATE_LIMIT } from './constants';

// 本地開發使用記憶體儲存
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface FailedAttemptEntry {
  count: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const failedAttemptsStore = new Map<string, FailedAttemptEntry>();

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
 * 記錄失敗的驗證嘗試
 * 返回當前失敗次數
 */
export async function recordFailedAttempt(tableId: string): Promise<number> {
  const now = Date.now();
  const key = `failed:${tableId}`;

  let entry = failedAttemptsStore.get(key);

  if (!entry) {
    entry = { count: 1 };
  } else {
    // 如果已被鎖定且未過期,維持鎖定狀態
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return entry.count;
    }

    // 如果鎖定已過期,重置計數
    if (entry.blockedUntil && now >= entry.blockedUntil) {
      entry = { count: 1 };
    } else {
      entry.count++;
    }
  }

  // 如果達到最大失敗次數,設定鎖定時間
  if (entry.count >= RATE_LIMIT.MAX_FAILED_ATTEMPTS) {
    entry.blockedUntil = now + RATE_LIMIT.BLOCK_DURATION_MS;
  }

  failedAttemptsStore.set(key, entry);

  return entry.count;
}

/**
 * 檢查桌號是否被鎖定
 */
export async function isTableBlocked(tableId: string): Promise<boolean> {
  const now = Date.now();
  const key = `failed:${tableId}`;
  const entry = failedAttemptsStore.get(key);

  if (!entry || !entry.blockedUntil) {
    return false;
  }

  return now < entry.blockedUntil;
}

/**
 * 清除 Rate Limit 資料 (測試用)
 */
export async function clearRateLimitData(): Promise<void> {
  rateLimitStore.clear();
  failedAttemptsStore.clear();
}
