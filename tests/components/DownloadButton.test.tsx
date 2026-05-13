import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DownloadButton from '@/components/DownloadButton';
import { captureCardImage } from '@/lib/capture-card';

// 1x1 transparent PNG dataURL
const FAKE_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

vi.mock('@/lib/capture-card', () => ({
  captureCardImage: vi.fn(),
}));

describe('DownloadButton', () => {
  const mockGuestName = '小明';
  const mockCardElementId = 'test-card';

  beforeEach(() => {
    const cardElement = document.createElement('div');
    cardElement.id = mockCardElementId;
    cardElement.innerHTML = '<div>測試卡片內容</div>';
    document.body.appendChild(cardElement);

    // 預設關閉 Web Share API，走 blob 下載路徑
    delete (navigator as unknown as { share?: unknown }).share;
    delete (navigator as unknown as { canShare?: unknown }).canShare;

    global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
    global.URL.revokeObjectURL = vi.fn();

    vi.clearAllMocks();
  });

  afterEach(() => {
    const cardElement = document.getElementById(mockCardElementId);
    if (cardElement) {
      document.body.removeChild(cardElement);
    }
  });

  it('應該正確渲染下載按鈕', () => {
    render(
      <DownloadButton
        guestName={mockGuestName}
        cardElementId={mockCardElementId}
      />
    );

    const button = screen.getByRole('button', { name: /下載卡片/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('download-button');
  });

  it('點擊按鈕時應該呼叫 captureCardImage', async () => {
    vi.mocked(captureCardImage).mockResolvedValueOnce(FAKE_PNG);

    render(
      <DownloadButton
        guestName={mockGuestName}
        cardElementId={mockCardElementId}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /下載卡片/i }));

    await waitFor(() => {
      expect(captureCardImage).toHaveBeenCalledWith(mockCardElementId);
    });
  });

  it('成功擷取後應該顯示下載成功訊息', async () => {
    vi.mocked(captureCardImage).mockResolvedValueOnce(FAKE_PNG);

    render(
      <DownloadButton
        guestName={mockGuestName}
        cardElementId={mockCardElementId}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /下載卡片/i }));

    await waitFor(() => {
      expect(screen.getByText(/下載成功/i)).toBeInTheDocument();
    });
  });

  it('擷取期間按鈕應該顯示 loading 狀態', async () => {
    let resolveCapture: (value: string) => void = () => {};
    vi.mocked(captureCardImage).mockImplementationOnce(
      () =>
        new Promise<string>((resolve) => {
          resolveCapture = resolve;
        })
    );

    render(
      <DownloadButton
        guestName={mockGuestName}
        cardElementId={mockCardElementId}
      />
    );

    const button = screen.getByRole('button', { name: /下載卡片/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
      expect(screen.getByText(/下載中/i)).toBeInTheDocument();
    });

    resolveCapture(FAKE_PNG);

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('擷取失敗（回傳 undefined）應該顯示錯誤訊息', async () => {
    vi.mocked(captureCardImage).mockResolvedValueOnce(undefined);

    render(
      <DownloadButton
        guestName={mockGuestName}
        cardElementId={mockCardElementId}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /下載卡片/i }));

    await waitFor(() => {
      expect(screen.getByText(/截圖失敗/i)).toBeInTheDocument();
    });
  });

  it('擷取拋出錯誤應該顯示下載失敗訊息', async () => {
    vi.mocked(captureCardImage).mockRejectedValueOnce(new Error('boom'));
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <DownloadButton
        guestName={mockGuestName}
        cardElementId={mockCardElementId}
      />
    );

    const button = screen.getByRole('button', { name: /下載卡片/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/下載失敗/i)).toBeInTheDocument();
    });
    expect(button).not.toBeDisabled();

    consoleErrorSpy.mockRestore();
  });

  it('成功後 3 秒應該清除訊息', async () => {
    vi.useFakeTimers();
    vi.mocked(captureCardImage).mockResolvedValueOnce(FAKE_PNG);

    render(
      <DownloadButton
        guestName={mockGuestName}
        cardElementId={mockCardElementId}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /下載卡片/i }));

    // 用 real timers 等成功訊息出現，再切到 fake timers 推進清除時間
    await vi.waitFor(() => {
      expect(screen.getByText(/下載成功/i)).toBeInTheDocument();
    });

    vi.advanceTimersByTime(3500);

    await vi.waitFor(() => {
      expect(screen.queryByText(/下載成功/i)).not.toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});
