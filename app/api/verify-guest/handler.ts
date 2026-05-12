import { VerifyGuestResponse } from '@/types/api';
import { validateGuestName } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rate-limit';
import { findGuestByName, updateGuestStats } from '@/lib/db';
import { ensureDataInitialized } from '@/lib/init';

interface VerifyGuestInput {
  guestName: string;
  phone?: string;
  ip: string;
  honeypot: string;
}

export async function verifyGuest(
  input: VerifyGuestInput
): Promise<VerifyGuestResponse> {
  const { guestName, phone, ip, honeypot } = input;

  // 0. 確保資料已初始化
  await ensureDataInitialized();

  // 1. Honeypot 檢查
  if (honeypot) {
    return {
      success: false,
      error: {
        code: 'HONEYPOT_DETECTED',
        message: '請求異常',
      },
    };
  }

  // 2. Rate Limiting 檢查
  const rateLimitResult = await checkRateLimit(ip);
  if (!rateLimitResult.allowed) {
    return {
      success: false,
      error: {
        code: 'RATE_LIMIT',
        message: `請求過於頻繁，請在 ${rateLimitResult.retryAfter} 秒後再試`,
      },
    };
  }

  // 3. 驗證姓名
  const nameValidation = validateGuestName(guestName);
  if (!nameValidation.isValid) {
    return {
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: nameValidation.error || '姓名格式不正確',
      },
    };
  }

  // 4. 查找賓客
  const guest = await findGuestByName(nameValidation.sanitized!);

  if (!guest) {
    // 找不到賓客時，導向公版卡片（帶上輸入的姓名）
    const encodedName = encodeURIComponent(nameValidation.sanitized!);
    return {
      success: true,
      guestId: 'guest-default',
      redirectUrl: `/card/guest-default?name=${encodedName}`,
    };
  }

  // 5. 驗證電話號碼（僅在賓客資料有電話時才驗證）
  if (guest.phone) {
    if (!phone) {
      return {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '請輸入電話號碼',
        },
      };
    }

    // 標準化電話號碼進行比較（去除空格、連字符、括號）
    const normalizePhone = (p: string) => p.replace(/[\s\-()]/g, '');
    if (normalizePhone(phone) !== normalizePhone(guest.phone)) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '姓名或電話號碼不匹配，請確認資訊是否正確',
        },
      };
    }
  }

  // 6. 更新查看時間
  await updateGuestStats(guest.id, 'viewedAt');

  // 6. 返回成功結果
  return {
    success: true,
    guestId: guest.id,
    redirectUrl: `/card/${guest.id}`,
  };
}
