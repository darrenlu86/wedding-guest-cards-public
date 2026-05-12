'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { validateGuestName } from '@/lib/validation';
import { VerifyGuestResponse } from '@/types/api';
import LoadingIcon from '@/components/icons/LoadingIcon';
import HeartIcon from '@/components/icons/HeartIcon';
import AlertIcon from '@/components/icons/AlertIcon';
import PetalRain from '@/components/PetalRain';

export default function HomePage() {
  const router = useRouter();
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // 驗證姓名
    const validation = validateGuestName(guestName);
    if (!validation.isValid) {
      setError(validation.error || '姓名格式不正確');
      return;
    }

    // 驗證電話（有填才驗格式，沒填也可以送出 — 不在名單的人不需要電話）
    const trimmedPhone = phone.trim();
    if (trimmedPhone && !/^\+?[\d\s\-()]{7,15}$/.test(trimmedPhone)) {
      setError('電話號碼格式不正確');
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
          guestName: validation.sanitized,
          phone: trimmedPhone,
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
      setError('網路錯誤，請檢查您的連線');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* 花瓣粒子動畫 */}
      <PetalRain />

      {/* 主要內容 */}
      <div className="w-full max-w-md relative z-10 animate-fadeInUp">
        {/* 頂部似顏繪 */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-block relative w-48 h-48 sm:w-56 sm:h-56">
            <div className="absolute inset-0 bg-white rounded-full shadow-lg"></div>
            <div className="relative w-full h-full p-6">
              <img
                src="/couple-illustration.png"
                alt="新人似顏繪"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* 卡片 */}
        <div className="card-container shadow-2xl">
          {/* 標題區 */}
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3 tracking-wide font-serif">
              Alex & Jamie
            </h1>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, #8b7355)' }}></div>
              <div className="w-1.5 h-1.5 bg-bronze rotate-45"></div>
              <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, #8b7355)' }}></div>
            </div>
            <p className="text-gray-500 text-lg leading-relaxed font-serif">
              謝謝你見證這一天，這張卡片送給你
            </p>
            <p className="text-gray-400 text-sm mt-2 font-serif">
              請輸入本名查詢，暱稱或綽號可能會查不到喔
            </p>
          </div>

          {/* 表單 */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <div className="relative">
              <input
                type="text"
                id="guestName"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="請輸入姓名"
                className="input-field"
                disabled={loading}
                autoComplete="name"
              />
            </div>

            {/* 電話輸入 */}
            <div className="relative">
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="請輸入電話號碼"
                className="input-field"
                disabled={loading}
                autoComplete="tel"
              />
            </div>

            {/* 錯誤訊息 */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-scaleIn">
                <div className="flex items-start gap-3">
                  <AlertIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm flex-1">{error}</p>
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
                <span className="flex items-center justify-center gap-3">
                  <LoadingIcon className="w-5 h-5" />
                  驗證中...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  查看感謝小卡
                  <HeartIcon className="w-5 h-5" />
                </span>
              )}
            </button>
          </form>

        </div>

        {/* 底部裝飾 */}
        <div className="flex justify-center items-center gap-4 mt-12 opacity-40">
          <div className="w-1 h-1 bg-bronze rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400 font-serif italic">~</span>
          <div className="w-1 h-1 bg-bronze rounded-full animate-pulse animation-delay-500"></div>
        </div>
      </div>
    </div>
  );
}
