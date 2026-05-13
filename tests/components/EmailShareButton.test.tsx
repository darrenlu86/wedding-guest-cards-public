import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmailShareButton from '@/components/EmailShareButton';
import { captureCardImage } from '@/lib/capture-card';

vi.mock('@/lib/capture-card', () => ({
  captureCardImage: vi.fn(),
}));

const FAKE_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

function mockFetchSuccess() {
  global.fetch = vi.fn().mockResolvedValue({
    json: async () => ({ success: true }),
  }) as unknown as typeof fetch;
}

function mockFetchFailure(message = '發送失敗，請稍後再試') {
  global.fetch = vi.fn().mockResolvedValue({
    json: async () => ({ success: false, error: { message } }),
  }) as unknown as typeof fetch;
}

describe('EmailShareButton', () => {
  const mockGuestName = '小明';
  const mockGuestId = 'guest-sample-01';
  const mockCardElementId = 'test-card';

  beforeEach(() => {
    const cardElement = document.createElement('div');
    cardElement.id = mockCardElementId;
    cardElement.innerHTML = '<div>測試卡片內容</div>';
    document.body.appendChild(cardElement);

    vi.mocked(captureCardImage).mockResolvedValue(FAKE_PNG);
    vi.clearAllMocks();
    vi.mocked(captureCardImage).mockResolvedValue(FAKE_PNG);
  });

  afterEach(() => {
    const cardElement = document.getElementById(mockCardElementId);
    if (cardElement) {
      document.body.removeChild(cardElement);
    }
    vi.restoreAllMocks();
  });

  describe('按鈕渲染', () => {
    it('應該正確渲染 Email 分享按鈕', () => {
      render(
        <EmailShareButton
          guestName={mockGuestName}
          guestId={mockGuestId}
          cardElementId={mockCardElementId}
        />
      );

      const button = screen.getByRole('button', { name: /Email 分享/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('email-button');
    });
  });

  describe('對話框開啟/關閉', () => {
    it('初始狀態不應該顯示對話框', () => {
      render(
        <EmailShareButton
          guestName={mockGuestName}
          guestId={mockGuestId}
          cardElementId={mockCardElementId}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('點擊按鈕應該打開對話框', async () => {
      render(
        <EmailShareButton
          guestName={mockGuestName}
          guestId={mockGuestId}
          cardElementId={mockCardElementId}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Email 分享/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('點擊取消按鈕應該關閉對話框', async () => {
      render(
        <EmailShareButton
          guestName={mockGuestName}
          guestId={mockGuestId}
          cardElementId={mockCardElementId}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Email 分享/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /取消/i }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('點擊遮罩應該關閉對話框', async () => {
      render(
        <EmailShareButton
          guestName={mockGuestName}
          guestId={mockGuestId}
          cardElementId={mockCardElementId}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Email 分享/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('dialog-backdrop'));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('按下 ESC 鍵應該關閉對話框', async () => {
      render(
        <EmailShareButton
          guestName={mockGuestName}
          guestId={mockGuestId}
          cardElementId={mockCardElementId}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Email 分享/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Email 輸入驗證', () => {
    it('空白 Email 應該顯示錯誤訊息', async () => {
      const user = userEvent.setup();

      render(
        <EmailShareButton
          guestName={mockGuestName}
          guestId={mockGuestId}
          cardElementId={mockCardElementId}
        />
      );

      await user.click(screen.getByRole('button', { name: /Email 分享/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /發送/i }));

      await waitFor(() => {
        expect(screen.getByText(/Email 不能為空/i)).toBeInTheDocument();
      });
    });

    it('無效的 Email 格式應該顯示錯誤訊息', async () => {
      const user = userEvent.setup();

      render(
        <EmailShareButton
          guestName={mockGuestName}
          guestId={mockGuestId}
          cardElementId={mockCardElementId}
        />
      );

      await user.click(screen.getByRole('button', { name: /Email 分享/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.type(
        screen.getByLabelText(/收件人 Email/i),
        'invalid-email'
      );
      await user.click(screen.getByRole('button', { name: /發送/i }));

      await waitFor(() => {
        expect(screen.getByText(/Email 格式不正確/i)).toBeInTheDocument();
      });
    });
  });

  describe('表單提交邏輯', () => {
    it('提交時應該顯示 loading 狀態', async () => {
      const user = userEvent.setup();

      // 永不 resolve 的 fetch 以便觀察 loading
      global.fetch = vi.fn().mockReturnValue(
        new Promise(() => {})
      ) as unknown as typeof fetch;

      render(
        <EmailShareButton
          guestName={mockGuestName}
          guestId={mockGuestId}
          cardElementId={mockCardElementId}
        />
      );

      await user.click(screen.getByRole('button', { name: /Email 分享/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.type(
        screen.getByLabelText(/收件人 Email/i),
        'test@example.com'
      );

      const submitButton = screen.getByRole('button', { name: /發送/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/發送中/i)).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });
    });

    it('成功發送應該顯示成功訊息並關閉對話框', async () => {
      const user = userEvent.setup();
      mockFetchSuccess();

      render(
        <EmailShareButton
          guestName={mockGuestName}
          guestId={mockGuestId}
          cardElementId={mockCardElementId}
        />
      );

      await user.click(screen.getByRole('button', { name: /Email 分享/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.type(
        screen.getByLabelText(/收件人 Email/i),
        'test@example.com'
      );
      await user.click(screen.getByRole('button', { name: /發送/i }));

      await waitFor(() => {
        expect(screen.getByText(/發送成功/i)).toBeInTheDocument();
      });

      // 1.5 秒後自動關閉
      await waitFor(
        () => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/send-email',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('發送失敗應該顯示錯誤訊息且保留對話框', async () => {
      const user = userEvent.setup();
      mockFetchFailure('伺服器錯誤');

      render(
        <EmailShareButton
          guestName={mockGuestName}
          guestId={mockGuestId}
          cardElementId={mockCardElementId}
        />
      );

      await user.click(screen.getByRole('button', { name: /Email 分享/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.type(
        screen.getByLabelText(/收件人 Email/i),
        'test@example.com'
      );

      const submitButton = screen.getByRole('button', { name: /發送/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/伺服器錯誤/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('對話框內容', () => {
    it('應該顯示賓客名稱', async () => {
      render(
        <EmailShareButton
          guestName={mockGuestName}
          guestId={mockGuestId}
          cardElementId={mockCardElementId}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Email 分享/i }));

      await waitFor(() => {
        expect(
          screen.getByText(new RegExp(mockGuestName, 'i'))
        ).toBeInTheDocument();
      });
    });

    it('應該顯示 Email 輸入框', async () => {
      render(
        <EmailShareButton
          guestName={mockGuestName}
          guestId={mockGuestId}
          cardElementId={mockCardElementId}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Email 分享/i }));

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/收件人 Email/i);
        expect(emailInput).toBeInTheDocument();
        expect(emailInput).toHaveClass('input-field');
      });
    });
  });

  describe('無障礙支援', () => {
    it('對話框應該有正確的 aria 屬性', async () => {
      render(
        <EmailShareButton
          guestName={mockGuestName}
          guestId={mockGuestId}
          cardElementId={mockCardElementId}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Email 分享/i }));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-labelledby');
      });
    });

    it('Email 輸入框應該有 label', async () => {
      render(
        <EmailShareButton
          guestName={mockGuestName}
          guestId={mockGuestId}
          cardElementId={mockCardElementId}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Email 分享/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/收件人 Email/i)).toBeInTheDocument();
      });
    });
  });
});
