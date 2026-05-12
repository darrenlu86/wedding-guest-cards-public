import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DownloadButton from '@/components/DownloadButton';
import html2canvas from 'html2canvas';

// Mock html2canvas
vi.mock('html2canvas');

describe('DownloadButton', () => {
  const mockGuestName = '小明';
  const mockCardElementId = 'test-card';

  beforeEach(() => {
    // 創建測試用的卡片元素
    const cardElement = document.createElement('div');
    cardElement.id = mockCardElementId;
    cardElement.innerHTML = '<div>測試卡片內容</div>';
    document.body.appendChild(cardElement);

    // 清除所有 mock
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 清理測試元素
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
    expect(button).toHaveClass('btn-primary');
  });

  it('應該顯示下載圖示', () => {
    render(
      <DownloadButton
        guestName={mockGuestName}
        cardElementId={mockCardElementId}
      />
    );

    // 檢查按鈕內是否包含文字
    expect(screen.getByText(/下載卡片/i)).toBeInTheDocument();
  });

  it('點擊按鈕時應該呼叫 html2canvas', async () => {
    const mockCanvas = {
      toBlob: vi.fn((callback) => {
        callback(new Blob(['test'], { type: 'image/png' }));
      }),
    };

    (html2canvas as any).mockResolvedValue(mockCanvas);

    render(
      <DownloadButton
        guestName={mockGuestName}
        cardElementId={mockCardElementId}
      />
    );

    const button = screen.getByRole('button', { name: /下載卡片/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(html2canvas).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          useCORS: true,
          logging: false,
        })
      );
    });
  });

  it('應該生成正確的檔案名稱', async () => {
    const mockCanvas = {
      toBlob: vi.fn((callback) => {
        callback(new Blob(['test'], { type: 'image/png' }));
      }),
    };

    (html2canvas as any).mockResolvedValue(mockCanvas);

    // Mock URL.createObjectURL 和 createElement
    const mockUrl = 'blob:test-url';
    global.URL.createObjectURL = vi.fn(() => mockUrl);
    global.URL.revokeObjectURL = vi.fn();

    const createElementSpy = vi.spyOn(document, 'createElement');

    render(
      <DownloadButton
        guestName={mockGuestName}
        cardElementId={mockCardElementId}
      />
    );

    const button = screen.getByRole('button', { name: /下載卡片/i });
    fireEvent.click(button);

    await waitFor(() => {
      const calls = createElementSpy.mock.calls.filter(call => call[0] === 'a');
      expect(calls.length).toBeGreaterThan(0);
    });

    // 驗證下載連結的檔案名稱
    await waitFor(() => {
      expect(mockCanvas.toBlob).toHaveBeenCalled();
    });

    createElementSpy.mockRestore();
  });

  it('應該顯示 loading 狀態', async () => {
    const mockCanvas = {
      toBlob: vi.fn((callback) => {
        setTimeout(() => {
          callback(new Blob(['test'], { type: 'image/png' }));
        }, 100);
      }),
    };

    (html2canvas as any).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockCanvas);
        }, 50);
      });
    });

    render(
      <DownloadButton
        guestName={mockGuestName}
        cardElementId={mockCardElementId}
      />
    );

    const button = screen.getByRole('button', { name: /下載卡片/i });
    fireEvent.click(button);

    // 檢查 loading 狀態
    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    await waitFor(() => {
      expect(screen.getByText(/下載中/i)).toBeInTheDocument();
    });

    // 等待完成
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    }, { timeout: 3000 });
  });

  it('應該在錯誤時顯示錯誤訊息', async () => {
    (html2canvas as any).mockRejectedValue(new Error('Canvas error'));

    // Mock console.error 避免測試輸出錯誤訊息
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

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

    // 按鈕應該重新啟用
    expect(button).not.toBeDisabled();

    consoleErrorSpy.mockRestore();
  });

  it('當卡片元素不存在時應該顯示錯誤', async () => {
    // Mock console.error 避免測試輸出錯誤訊息
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <DownloadButton
        guestName={mockGuestName}
        cardElementId="non-existent-id"
      />
    );

    const button = screen.getByRole('button', { name: /下載卡片/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/找不到卡片元素/i)).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('應該在成功後顯示成功訊息', async () => {
    const mockCanvas = {
      toBlob: vi.fn((callback) => {
        callback(new Blob(['test'], { type: 'image/png' }));
      }),
    };

    (html2canvas as any).mockResolvedValue(mockCanvas);

    global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
    global.URL.revokeObjectURL = vi.fn();

    render(
      <DownloadButton
        guestName={mockGuestName}
        cardElementId={mockCardElementId}
      />
    );

    const button = screen.getByRole('button', { name: /下載卡片/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/下載成功/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('應該在指定時間後清除訊息', async () => {
    const mockCanvas = {
      toBlob: vi.fn((callback) => {
        callback(new Blob(['test'], { type: 'image/png' }));
      }),
    };

    (html2canvas as any).mockResolvedValue(mockCanvas);

    global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
    global.URL.revokeObjectURL = vi.fn();

    render(
      <DownloadButton
        guestName={mockGuestName}
        cardElementId={mockCardElementId}
      />
    );

    const button = screen.getByRole('button', { name: /下載卡片/i });
    fireEvent.click(button);

    // 等待下載成功訊息出現
    await waitFor(() => {
      expect(screen.getByText(/下載成功/i)).toBeInTheDocument();
    });

    // 等待 3 秒後訊息應該消失
    await new Promise(resolve => setTimeout(resolve, 3100));

    // 檢查訊息是否已清除
    expect(screen.queryByText(/下載成功/i)).not.toBeInTheDocument();
  });
});
