import { NextRequest, NextResponse } from 'next/server';
import { validateEmail, validateGuestName } from '@/lib/validation';
import { checkEmailSendQuota, checkRateLimit } from '@/lib/rate-limit';
import { sendWeddingCardEmail, buildCardPageUrl } from '@/lib/email';
import { ensureDataInitialized } from '@/lib/init';
import { EMAIL_SEND } from '@/lib/constants';
import { SendEmailRequest, SendEmailResponse } from '@/types/api';

/**
 * 同源檢查：阻擋從其他網站（或無 Origin header 的工具）POST 過來的請求。
 *
 * Why: send-email 用 operator 的 Gmail 寄信，若沒有 origin 檢查，任何拿到
 * 一個合法 guestId 的人都能把這個 endpoint 當 open relay 濫用。
 *
 * Dev 環境（NODE_ENV !== 'production'）跳過，避免本機測試卡住。
 */
function isSameOrigin(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== 'production') return true;

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (!origin || !host) return false;

  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

/**
 * 估算 base64 字串解碼後的 byte 數（不實際解碼）。
 *
 * 4 個 base64 字元 = 3 bytes，扣掉尾端 '=' padding。
 */
function estimateBase64Bytes(base64: string): number {
  const data = base64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
  const padding = (data.match(/=+$/) || [''])[0].length;
  return Math.floor((data.length * 3) / 4) - padding;
}

export async function POST(request: NextRequest): Promise<NextResponse<SendEmailResponse>> {
  try {
    // 0. 同源檢查（擋 CSRF / cross-origin 濫用）
    if (!isSameOrigin(request)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: '請求來源不被允許' },
        },
        { status: 403 }
      );
    }

    await ensureDataInitialized();

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // IP-based rate limit（注意：serverless 多 instance 會失效，是 best-effort）
    const rateResult = await checkRateLimit(`email:${ip}`);
    if (!rateResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT',
            message: `請求過於頻繁，請 ${rateResult.retryAfter} 秒後再試`,
          },
        },
        { status: 429 }
      );
    }

    // 解析請求
    const body: SendEmailRequest = await request.json();
    const { recipientEmail, guestId, guestName: clientGuestName, cardImageBase64 } = body;

    // 驗證 guestId
    if (!guestId || typeof guestId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_INPUT', message: '缺少賓客 ID' },
        },
        { status: 400 }
      );
    }

    // 驗證 Email
    const emailValidation = validateEmail(recipientEmail ?? '');
    if (!emailValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: emailValidation.error ?? 'Email 格式不正確',
          },
        },
        { status: 400 }
      );
    }

    // 驗證 cardImageBase64 大小（避免被當大附件中轉）
    if (cardImageBase64) {
      const imageBytes = estimateBase64Bytes(cardImageBase64);
      if (imageBytes > EMAIL_SEND.MAX_IMAGE_BYTES) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_INPUT',
              message: `卡片圖片過大（上限 ${Math.floor(EMAIL_SEND.MAX_IMAGE_BYTES / 1024 / 1024)} MB）`,
            },
          },
          { status: 400 }
        );
      }
    }

    // 查詢賓客資料
    const { getGuestById } = await import('@/lib/db');
    const guest = await getGuestById(guestId);
    if (!guest) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '找不到賓客資料' },
        },
        { status: 404 }
      );
    }

    // Per-guest 配額（每個 guestId 24h 上限）
    const quotaResult = await checkEmailSendQuota(guestId);
    if (!quotaResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'QUOTA_EXCEEDED',
            message: '這張卡片今日寄送次數已達上限，請明天再試',
          },
        },
        { status: 429 }
      );
    }

    // 公版卡片：client 提供的 guestName 必須先過 validateGuestName 才能用在郵件主旨/內文
    let displayName = guest.name;
    if (guestId === 'guest-default' && clientGuestName) {
      const nameCheck = validateGuestName(clientGuestName);
      if (!nameCheck.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_INPUT',
              message: nameCheck.error ?? '姓名格式不正確',
            },
          },
          { status: 400 }
        );
      }
      displayName = nameCheck.sanitized!;
    }

    // 組合卡片頁面 URL（公版卡片附帶 ?name= 參數）
    const baseUrl = buildCardPageUrl(guestId);
    const cardPageUrl = guestId === 'guest-default' && displayName !== guest.name
      ? `${baseUrl}?name=${encodeURIComponent(displayName)}`
      : baseUrl;

    // 發送 Email
    await sendWeddingCardEmail(
      emailValidation.sanitized ?? recipientEmail,
      displayName,
      cardPageUrl,
      cardImageBase64
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : '發送失敗';
    console.error('Send email error:', message);

    return NextResponse.json(
      {
        success: false,
        error: { code: 'SEND_FAILED', message: '寄送失敗，請稍後再試' },
      },
      { status: 500 }
    );
  }
}
