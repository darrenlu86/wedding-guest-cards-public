import { NextRequest, NextResponse } from 'next/server';
import { getGuestById } from '@/lib/db';
import { ensureDataInitialized } from '@/lib/init';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guestId: string }> }
) {
  try {
    const { guestId } = await params;

    // 確保資料已初始化
    await ensureDataInitialized();

    // 取得賓客資料
    const guest = await getGuestById(guestId);

    if (!guest) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '找不到卡片資料',
          },
        },
        { status: 404 }
      );
    }

    // 只回傳前端顯示需要的欄位，剔除 phone / viewedAt / downloadedAt / emailSentAt，
    // 避免有人拿到 guestId 後透過 API 撈到電話。
    const publicGuest = {
      id: guest.id,
      name: guest.name,
      customization: guest.customization,
    };

    return NextResponse.json({ guest: publicGuest }, { status: 200 });
  } catch (error) {
    console.error('Get card data error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '伺服器錯誤,請稍後再試',
        },
      },
      { status: 500 }
    );
  }
}
