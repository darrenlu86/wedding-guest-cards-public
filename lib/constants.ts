// Rate Limiting 配置
export const RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  WINDOW_MS: 60 * 1000, // 1 分鐘
  BLOCK_DURATION_MS: 5 * 60 * 1000, // 5 分鐘
  MAX_FAILED_ATTEMPTS: 3, // 同一桌號失敗次數
};

// 輸入驗證
export const VALIDATION = {
  NAME_MAX_LENGTH: 20,
  NAME_PATTERN: /^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// Redis 鍵前綴
export const REDIS_KEYS = {
  GUEST: 'guest:',
  TABLE: 'table:',
  RATE_LIMIT: 'rate_limit:',
  FAILED_ATTEMPTS: 'failed_attempts:',
};

// 卡片樣板
export const CARD_TEMPLATES = {
  CLASSIC: 'classic',
  ROSE: 'rose',
  MIDNIGHT: 'midnight',
  SPRING: 'spring',
  LUXE: 'luxe',
};
