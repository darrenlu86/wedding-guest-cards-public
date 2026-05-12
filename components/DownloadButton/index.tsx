'use client';

import { useState } from 'react';
import { captureCardImage } from '@/lib/capture-card';
import DownloadIcon from '@/components/icons/DownloadIcon';
import LoadingIcon from '@/components/icons/LoadingIcon';
import CheckIcon from '@/components/icons/CheckIcon';
import AlertIcon from '@/components/icons/AlertIcon';

interface DownloadButtonProps {
  guestName: string;
  cardElementId: string;
}

type MessageType = 'success' | 'error' | null;

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] ?? 'image/png';
  const binary = atob(parts[1]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

async function shareOrDownload(dataUrl: string, fileName: string): Promise<'shared' | 'downloaded'> {
  const blob = dataUrlToBlob(dataUrl);
  const file = new File([blob], fileName, { type: 'image/png' });

  // 優先使用 Web Share API（Line 瀏覽器支援）
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file] });
    return 'shared';
  }

  // Fallback: Blob URL 下載（比 dataUrl 更相容）
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = fileName;
  link.href = blobUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
  return 'downloaded';
}

export default function DownloadButton({
  guestName,
  cardElementId,
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<MessageType>(null);

  const showMessage = (text: string, type: MessageType) => {
    setMessage(text);
    setMessageType(type);

    // 3 秒後清除訊息
    setTimeout(() => {
      setMessage('');
      setMessageType(null);
    }, 3000);
  };

  const openImageInNewTab = (dataUrl: string) => {
    const newTab = window.open('');
    if (newTab) {
      newTab.document.write(
        `<html><head><title>長按圖片保存</title><meta name="viewport" content="width=device-width,initial-scale=1"></head>` +
        `<body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#faf9f7;">` +
        `<img src="${dataUrl}" style="max-width:100%;height:auto;" />` +
        `</body></html>`
      );
      newTab.document.close();
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const dataUrl = await captureCardImage(cardElementId);

      if (!dataUrl) {
        showMessage('截圖失敗，請用螢幕截圖保存', 'error');
        setIsDownloading(false);
        return;
      }

      const fileName = `wedding-card-${guestName}.png`;

      try {
        const result = await shareOrDownload(dataUrl, fileName);
        showMessage(result === 'shared' ? '分享成功' : '下載成功', 'success');
      } catch (shareError) {
        // 使用者取消 share 不算錯誤
        if (shareError instanceof Error && shareError.name === 'AbortError') {
          setIsDownloading(false);
          return;
        }
        // 分享/下載都失敗 → 開新分頁讓使用者長按存圖
        openImageInNewTab(dataUrl);
        showMessage('已開啟圖片，請長按保存', 'success');
      }
    } catch (error) {
      console.error('下載失敗:', error);
      showMessage('下載失敗，請用螢幕截圖保存', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="download-button inline-flex items-center gap-3 px-10 py-4 text-base font-medium rounded-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-serif"
      >
        {isDownloading ? (
          <>
            <LoadingIcon className="w-5 h-5" />
            <span>下載中...</span>
          </>
        ) : (
          <>
            <DownloadIcon className="w-5 h-5" />
            <span>下載卡片</span>
          </>
        )}
      </button>

      {/* 訊息提示 */}
      {message && (
        <div
          className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-3 px-4 py-2 rounded-lg animate-scaleIn whitespace-nowrap shadow-lg ${
            messageType === 'success'
              ? 'bg-green-50 border border-green-300 text-green-700'
              : 'bg-red-50 border border-red-300 text-red-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {messageType === 'success' ? (
              <CheckIcon className="w-4 h-4" />
            ) : (
              <AlertIcon className="w-4 h-4" />
            )}
            <p className="text-sm font-medium">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
