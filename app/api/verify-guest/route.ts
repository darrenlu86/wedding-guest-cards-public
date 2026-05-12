import { NextRequest, NextResponse } from 'next/server';
import { verifyGuest } from './handler';
import { VerifyGuestRequest } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    // 解析請求體
    const body: VerifyGuestRequest = await request.json();

    // 取得 IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // 取得 honeypot 欄位
    const honeypot = (body as any).website || '';

    // 驗證賓客
    const result = await verifyGuest({
      guestName: body.guestName,
      phone: body.phone,
      ip,
      honeypot,
    });

    // 返回結果
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      const statusCode =
        result.error.code === 'RATE_LIMIT' ? 429 : 400;
      return NextResponse.json(result, { status: statusCode });
    }
  } catch (error) {
    console.error('Verify guest error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '伺服器錯誤,請稍後再試',
        },
      },
      { status: 500 }
    );
  }
}
