'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Envelope.module.css';

interface EnvelopeAnimationProps {
  onComplete: () => void;
  guestName: string;
}

export default function EnvelopeAnimation({
  onComplete,
  guestName,
}: EnvelopeAnimationProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);

  useEffect(() => {
    if (isOpening) {
      // 3.2 秒後完成動畫 (1.2s 信封翻轉 + 1.5s 信紙上升 + 0.5s 緩衝)
      const timer = setTimeout(() => {
        onComplete();
      }, 3200);

      return () => clearTimeout(timer);
    }
  }, [isOpening, onComplete]);

  const handleClick = () => {
    if (!hasClicked) {
      setIsOpening(true);
      setHasClicked(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        {/* 提示文字 */}
        <div style={{ marginBottom: '3rem', minHeight: '2rem' }}>
          {!isOpening && (
            <p className="text-amber-600 text-2xl font-medium animate-pulse">
              點擊信封開啟祝福 ✨
            </p>
          )}
          {isOpening && (
            <p className="text-amber-600 text-2xl font-medium animate-fadeInUp">
              正在為您開啟...
            </p>
          )}
        </div>

        {/* 信封容器 */}
        <div
          className={`${styles.envelopeContainer} ${
            isOpening ? styles.opening : ''
          }`}
          onClick={handleClick}
        >
          {/* 信封背面 */}
          <div className={styles.envelopeBack}></div>

          {/* 信封正面 */}
          <div className={styles.envelopeFront}></div>

          {/* 信封蓋 */}
          <div className={styles.envelopeFlap}></div>

          {/* 信封貼紙 - 包含似顏繪和文字 */}
          <div className={styles.flapSticker}>
            <div className={styles.stickerInner}>
              <div className={styles.stickerImage}>
                <Image
                  src="/couple-illustration.png"
                  alt="似顏繪"
                  width={60}
                  height={60}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className={styles.stickerText}>
                <p>親愛的 {guestName}</p>
                <p>您有一封專屬卡片</p>
              </div>
            </div>
          </div>

          {/* 信紙 */}
          <div className={styles.envelopeLetter}>
            <div className={styles.letterPreview}>
              <Image
                src="/couple-illustration.png"
                alt="似顏繪"
                width={150}
                height={150}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
