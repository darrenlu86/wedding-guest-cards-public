import { NextRequest, NextResponse } from 'next/server';
import { validateEmail } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendWeddingCardEmail, buildCardPageUrl } from '@/lib/email';
import { ensureDataInitialized } from '@/lib/init';
import { SendEmailRequest, SendEmailResponse } from '@/types/api';

export async function POST(request: NextRequest): Promise<NextResponse<SendEmailResponse>> {
  try {
    await ensureDataInitialized();

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Rate Limiting
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

    // 公版卡片使用前端傳來的賓客名稱，其他使用 DB 的名稱
    const displayName = guestId === 'guest-default' && clientGuestName
      ? clientGuestName
      : guest.name;

    // 組合卡片頁面 URL（公版卡片附帶 ?name= 參數）
    const baseUrl = buildCardPageUrl(guestId);
    const cardPageUrl = guestId === 'guest-default' && clientGuestName
      ? `${baseUrl}?name=${encodeURIComponent(clientGuestName)}`
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
