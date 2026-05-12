import { toPng } from 'html-to-image';

const CAPTURE_TIMEOUT_MS = 15_000;

/**
 * 確保元素內的所有 <img> 都已完全載入並解碼。
 * iOS Safari 需要圖片完全 decoded 才能正確渲染到 canvas。
 */
async function preloadImages(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll('img');
  const promises = Array.from(images).map(async (img) => {
    if (img.complete && img.naturalWidth > 0) {
      // 圖片已載入，嘗試 decode 確保 iOS 完全解碼
      try {
        await img.decode();
      } catch {
        // decode 失敗不阻塞流程
      }
      return;
    }
    // 等待圖片載入完成
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
      // 如果已經 complete 但沒觸發 onload
      if (img.complete) resolve();
    });
  });
  await Promise.all(promises);
}

/**
 * 使用 html-to-image 將 DOM 元素轉成 PNG。
 * iOS Safari 的 foreignObject 有已知 bug：第一次渲染時圖片可能為空白，
 * 需要多次渲染讓圖片進入內部快取後才能正確輸出。
 */
async function renderToPng(element: HTMLElement): Promise<string> {
  const options = {
    quality: 0.9,
    pixelRatio: 2,
    skipAutoScale: true,
    cacheBust: true,
  };

  // iOS Safari 需要多次渲染：前幾次讓圖片進入快取，最後一次才是正確結果
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document);

  if (isIOS) {
    // 預渲染 2 次讓圖片快取，不使用結果
    for (let i = 0; i < 2; i++) {
      try {
        await toPng(element, options);
      } catch {
        // 預渲染失敗可忽略
      }
    }
  }

  // 最終渲染
  return toPng(element, options);
}

/**
 * 截圖卡片元素，加上 timeout 和 iOS 相容處理。
 * 失敗時回傳 undefined 而非 throw，方便呼叫端 graceful fallback。
 */
export async function captureCardImage(
  cardElementId: string,
): Promise<string | undefined> {
  const cardElement = document.getElementById(cardElementId);
  if (!cardElement) {
    console.error('找不到卡片元素:', cardElementId);
    return undefined;
  }

  try {
    // 先確保所有圖片已載入並解碼
    await preloadImages(cardElement);

    const dataUrl = await Promise.race([
      renderToPng(cardElement),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('截圖逾時')), CAPTURE_TIMEOUT_MS),
      ),
    ]);
    return dataUrl;
  } catch (error) {
    console.error('卡片截圖失敗:', error);
    return undefined;
  }
}
