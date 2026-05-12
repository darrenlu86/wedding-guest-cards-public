'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Guest } from '@/types/guest';
import EnvelopeAnimation from '@/components/EnvelopeAnimation';
import BlessingCard from '@/components/BlessingCard';
import DownloadButton from '@/components/DownloadButton';
import EmailShareButton from '@/components/EmailShareButton';
import PetalRain from '@/components/PetalRain';

interface PageProps {
  params: Promise<{
    guestId: string;
  }>;
}

export default function CardPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCard, setShowCard] = useState(false);
  const [revealComplete, setRevealComplete] = useState(false);

  useEffect(() => {
    async function fetchGuest() {
      try {
        const response = await fetch(
          `/api/card-data/${resolvedParams.guestId}`
        );

        if (!response.ok) {
          throw new Error('找不到卡片資料');
        }

        const data = await response.json();
        const guestData: Guest = data.guest;

        // 公版卡片：用 query param 的名字覆蓋預設名稱
        if (guestData.id === 'guest-default') {
          const nameFromQuery = searchParams.get('name');
          if (nameFromQuery) {
            setGuest({ ...guestData, name: nameFromQuery });
            return;
          }
        }

        setGuest(guestData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '載入失敗');
      } finally {
        setLoading(false);
      }
    }

    fetchGuest();
  }, [resolvedParams.guestId]);

  const handleEnvelopeComplete = () => {
    setShowCard(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-bronze-light border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-bronze text-lg font-serif">載入中...</p>
        </div>
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-300 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-700 mb-2 font-serif">
            糟糕！
          </h1>
          <p className="text-gray-600">{error || '找不到卡片資料'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!showCard ? (
        <EnvelopeAnimation
          onComplete={handleEnvelopeComplete}
          guestName={guest.name}
        />
      ) : (
        <div className="min-h-screen relative">
          {/* 花瓣粒子動畫 */}
          <PetalRain />

          {/* 揭秘遮罩 */}
          {!revealComplete && (
            <div
              className="fixed inset-0 z-20 pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, #faf9f7 60%, transparent 100%)',
                animation: 'revealMask 2s ease-out forwards',
              }}
            />
          )}

          <style>{`
            @keyframes revealMask {
              0% {
                opacity: 1;
                transform: translateY(0);
              }
              60% {
                opacity: 0.6;
              }
              100% {
                opacity: 0;
                transform: translateY(100vh);
              }
            }

            @keyframes cardReveal {
              0% {
                opacity: 0;
                transform: scale(0.92) translateY(30px);
              }
              60% {
                opacity: 1;
                transform: scale(1.02) translateY(-5px);
              }
              100% {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }

            @keyframes buttonsReveal {
              0% {
                opacity: 0;
                transform: translateY(20px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>

          {/* 內容容器 */}
          <div
            className="relative z-10 min-h-screen flex items-center justify-center"
            style={{ padding: '3rem 0' }}
            onAnimationEnd={() => setRevealComplete(true)}
          >
            <div className="w-[92%] sm:w-[88%] md:w-[85%] max-w-[35rem] flex flex-col items-center gap-4 sm:gap-6">
              {/* 返回主頁按鈕 - 延遲出現 */}
              <div
                className="flex justify-center"
                style={{ animation: 'buttonsReveal 0.8s ease-out 1s both' }}
              >
                <Link
                  href="/"
                  className="text-sm font-serif tracking-wide transition-opacity hover:opacity-80"
                  style={{
                    color: 'rgba(139, 115, 85, 0.6)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    backgroundColor: 'rgba(139, 115, 85, 0.06)',
                  }}
                >
                  ← 查看其他卡片
                </Link>
              </div>

              {/* 祝福卡片 - 揭秘動畫 */}
              <div style={{ animation: 'cardReveal 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
                <BlessingCard guest={guest} />
              </div>

              {/* 操作按鈕區 - 延遲出現 */}
              <div
                className="flex flex-row gap-4 sm:gap-8 justify-center mt-6 sm:mt-8"
                style={{ animation: 'buttonsReveal 0.8s ease-out 1.2s both' }}
              >
                <DownloadButton
                  guestName={guest.name}
                  cardElementId="blessing-card"
                />

                <EmailShareButton
                  guestName={guest.name}
                  guestId={resolvedParams.guestId}
                  cardElementId="blessing-card"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
