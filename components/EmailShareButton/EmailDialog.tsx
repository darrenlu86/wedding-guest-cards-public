'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { validateEmail } from '@/lib/validation';
import { captureCardImage } from '@/lib/capture-card';
import LoadingIcon from '@/components/icons/LoadingIcon';

interface EmailDialogProps {
  guestName: string;
  guestId: string;
  cardElementId: string;
  onClose: () => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

async function sendEmail(
  recipientEmail: string,
  guestId: string,
  guestName: string,
  cardImageBase64?: string
): Promise<void> {
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipientEmail, guestId, guestName, cardImageBase64 }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message ?? '發送失敗，請稍後再試');
  }
}

export default function EmailDialog({
  guestName,
  guestId,
  cardElementId,
  onClose,
}: EmailDialogProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // ESC 鍵關閉對話框
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // 自動 focus
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  // 成功後自動關閉
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const validation = validateEmail(email);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Email 無效');
      return;
    }

    setStatus('loading');

    try {
      const cardImageBase64 = await captureCardImage(cardElementId);
      await sendEmail(validation.sanitized || email, guestId, guestName, cardImageBase64);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '發送失敗');
    }
  };

  return (
    <div
      data-testid="dialog-backdrop"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(45, 41, 37, 0.4)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-dialog-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '26rem',
          backgroundColor: '#fafaf8',
          borderRadius: '1rem',
          padding: '2.5rem 2rem',
          boxShadow: '0 8px 32px rgba(45, 41, 37, 0.15), 0 1px 2px rgba(45, 41, 37, 0.08)',
          border: '1px solid rgba(232, 230, 220, 0.6)',
          animation: 'scaleIn 0.3s ease-out',
          fontFamily: 'var(--font-serif)',
        }}
      >
        {/* 裝飾圖標 */}
        <div style={{ textAlign: 'center', marginBottom: '0.75rem', fontSize: '1.75rem' }}>
          💌
        </div>

        {/* 標題 */}
        <h2
          id="email-dialog-title"
          style={{
            fontSize: '1.25rem',
            fontWeight: 500,
            color: 'var(--accent-bronze)',
            textAlign: 'center',
            letterSpacing: '0.08em',
            marginBottom: '0.5rem',
          }}
        >
          分享婚禮祝福卡片
        </h2>

        {/* 副標題 */}
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-tertiary)',
            textAlign: 'center',
            marginBottom: '2rem',
            lineHeight: 1.5,
          }}
        >
          將 <span style={{ color: 'var(--accent-bronze)', fontWeight: 500 }}>{guestName}</span> 的專屬卡片寄送到指定信箱
        </p>

        {/* 分隔線 */}
        <div
          style={{
            height: '1px',
            background: 'linear-gradient(to right, transparent, var(--detail-taupe), transparent)',
            marginBottom: '2rem',
          }}
        />

        {/* 表單 */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="email-input"
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                marginBottom: '0.5rem',
                letterSpacing: '0.04em',
              }}
            >
              收件人 Email
            </label>
            <input
              ref={emailInputRef}
              id="email-input"
              type="text"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              disabled={status === 'loading'}
            />
            {errorMessage && (
              <p
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  color: '#b44a4a',
                }}
              >
                {errorMessage}
              </p>
            )}
          </div>

          {/* 成功訊息 */}
          {status === 'success' && (
            <div
              style={{
                marginBottom: '1.5rem',
                padding: '0.875rem 1rem',
                backgroundColor: 'rgba(95, 184, 120, 0.1)',
                border: '1px solid rgba(95, 184, 120, 0.3)',
                borderRadius: '0.5rem',
                color: '#3d7a4a',
                fontSize: '0.85rem',
                textAlign: 'center',
              }}
            >
              發送成功！卡片已寄送到 {email}
            </div>
          )}

          {/* 按鈕區 */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={status === 'loading'}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                backgroundColor: 'transparent',
                color: 'var(--text-tertiary)',
                border: '1px solid var(--detail-taupe)',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-serif)',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--accent-bronze)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-serif)',
                letterSpacing: '0.06em',
                fontWeight: 500,
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                opacity: status === 'loading' ? 0.7 : 1,
                boxShadow: '0 2px 8px rgba(139, 115, 85, 0.2)',
                transition: 'all 0.2s',
              }}
            >
              {status === 'loading' ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <LoadingIcon className="w-4 h-4" />
                  發送中...
                </span>
              ) : (
                '發送'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
