'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { validateGuestName } from '@/lib/validation';
import { VerifyGuestResponse } from '@/types/api';
import PetalRain from '@/components/PetalRain';

interface VerificationFormProps {
  tableId: string;
}

export default function VerificationForm({ tableId }: VerificationFormProps) {
  const router = useRouter();
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 從 tableId 提取桌號數字
  const tableNumber = tableId.replace('table-', '');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // 驗證姓名
    const validation = validateGuestName(guestName);
    if (!validation.isValid) {
      setError(validation.error || '姓名格式不正確');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/verify-guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableId,
          guestName: validation.sanitized,
        }),
      });

      const data: VerifyGuestResponse = await response.json();

      if (data.success) {
        // 重導向到卡片頁面
        router.push(data.redirectUrl);
      } else {
        setError(data.error.message);
      }
    } catch (err) {
      setError('網路錯誤,請檢查您的連線');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* 花瓣粒子動畫 */}
      <PetalRain />

      {/* 浮動裝飾元素 */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 floating-element">
        🌸
      </div>
      <div className="absolute top-20 right-16 text-5xl opacity-15 floating-element animation-delay-1000">
        💐
      </div>
      <div className="absolute bottom-20 left-20 text-7xl opacity-10 floating-element animation-delay-2000">
        🌹
      </div>
      <div className="absolute bottom-32 right-12 text-6xl opacity-15 floating-element animation-delay-1500">
        💕
      </div>

      {/* 主要內容 */}
      <div className="w-full max-w-md relative z-10 animate-fadeInUp">
        {/* 頂部裝飾 */}
        <div className="text-center mb-8">
          <div className="inline-block text-7xl mb-4 animate-bounce-slow">💝</div>
        </div>

        {/* 卡片 */}
        <div className="card-container shadow-2xl">
          {/* 標題區 */}
          <div className="text-center mb-10">
            <h1 className="heading-primary">
              歡迎光臨
            </h1>
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-romantic-300"></div>
              <p className="text-gray-600 text-lg">
                桌號 <span className="text-2xl font-bold text-gradient-pink">{tableNumber}</span>
              </p>
              <div className="h-px w-12 bg-gradient-to-r from-romantic-300 to-transparent"></div>
            </div>
            <p className="text-gray-500 text-sm mt-2">為您準備了專屬祝福卡片</p>
          </div>

          {/* 表單 */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Honeypot 欄位 */}
            <input
              type="text"
              name="website"
              data-testid="honeypot-field"
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            {/* 姓名輸入 */}
            <div className="space-y-3">
              <label
                htmlFor="guestName"
                className="block text-romantic-700 font-medium text-base"
              >
                請輸入您的姓名
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="guestName"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="請輸入您的姓名"
                  className="input-field"
                  disabled={loading}
                  autoComplete="name"
                />
                {guestName && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl animate-scaleIn">
                    ✨
                  </div>
                )}
              </div>
            </div>

            {/* 錯誤訊息 */}
            {error && (
              <div className="p-4 glass-pink border-2 border-romantic-300 rounded-xl animate-scaleIn">
                <div className="flex items-start gap-2">
                  <span className="text-xl">⚠️</span>
                  <p className="text-romantic-700 text-sm flex-1">{error}</p>
                </div>
              </div>
            )}

            {/* 提交按鈕 */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin text-xl">⏳</span>
                  驗證中...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  查看卡片 <span className="text-xl">💌</span>
                </span>
              )}
            </button>
          </form>

          {/* 底部提示 */}
          <div className="mt-8 pt-8 border-t border-romantic-200">
            <p className="text-center text-gray-500 text-sm leading-relaxed">
              請輸入您在婚禮邀請函上的姓名<br />
              我們為您準備了專屬的祝福
            </p>
          </div>
        </div>

        {/* 底部裝飾 */}
        <div className="flex justify-center items-center gap-3 mt-8 opacity-60">
          <span className="text-2xl animate-heartbeat">💕</span>
          <span className="text-sm text-gray-500">~</span>
          <span className="text-2xl animate-heartbeat animation-delay-500">💕</span>
        </div>
      </div>
    </div>
  );
}
