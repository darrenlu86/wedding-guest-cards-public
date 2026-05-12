import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmailShareButton from '@/components/EmailShareButton';

describe('EmailShareButton', () => {
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

  describe('按鈕渲染', () => {
    it('應該正確渲染 Email 分享按鈕', () => {
      render(
        <EmailShareButton
          guestName={mockGuestName}
          cardElementId={mockCardElementId}
        />
      );

      const button = screen.getByRole('button', { name: /Email 分享/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('btn-secondary');
    });

    it('應該顯示 Email 圖示', () => {
      render(
        <EmailShareButton
          guestName={mockGuestName}
          cardElementId={mockCardElementId}
        />
      );

      expect(screen.getByText('✉️')).toBeInTheDocument();
    });
  });

  describe('對話框開啟/關閉', () => {
    it('初始狀態不應該顯示對話框', () => {
      render(
        <EmailShareButton
          guestName={mockGuestName}
          cardElementId={mockCardElementId}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('點擊按鈕應該打開對話框', async () => {
      render(
        <EmailShareButton
          guestName={mockGuestName}
          cardElementId={mockCardElementId}
        />
      );

      const button = screen.getByRole('button', { name: /Email 分享/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('點擊取消按鈕應該關閉對話框', async () => {
      render(
        <EmailShareButton
          guestName={mockGuestName}
          cardElementId={mockCardElementId}
        />
      );

      // 打開對話框
      const button = screen.getByRole('button', { name: /Email 分享/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // 點擊取消按鈕
      const cancelButton = screen.getByRole('button', { name: /取消/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('點擊遮罩應該關閉對話框', async () => {
      render(
        <EmailShareButton
          guestName={mockGuestName}
          cardElementId={mockCardElementId}
        />
      );

      // 打開對話框
      const button = screen.getByRole('button', { name: /Email 分享/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // 點擊遮罩 (backdrop)
      const backdrop = screen.getByTestId('dialog-backdrop');
      fireEvent.click(backdrop);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('按下 ESC 鍵應該關閉對話框', async () => {
      render(
        <EmailShareButton
          guestName={mockGuestName}
          cardElementId={mockCardElementId}
        />
      );

      // 打開對話框
      const button = screen.getByRole('button', { name: /Email 分享/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // 按下 ESC 鍵
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
          cardElementId={mockCardElementId}
        />
      );

      // 打開對話框
      const button = screen.getByRole('button', { name: /Email 分享/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // 直接提交空白表單
      const submitButton = screen.getByRole('button', { name: /發送/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Email 不能為空/i)).toBeInTheDocument();
      });
    });

    it('無效的 Email 格式應該顯示錯誤訊息', async () => {
      const user = userEvent.setup();

      render(
        <EmailShareButton
          guestName={mockGuestName}
          cardElementId={mockCardElementId}
        />
      );

      // 打開對話框
      const button = screen.getByRole('button', { name: /Email 分享/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // 輸入無效的 Email
      const emailInput = screen.getByLabelText(/收件人 Email/i);
      await user.type(emailInput, 'invalid-email');

      // 提交表單
      const submitButton = screen.getByRole('button', { name: /發送/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Email 格式不正確/i)).toBeInTheDocument();
      });
    });

    it('有效的 Email 應該通過驗證', async () => {
      const user = userEvent.setup();

      render(
        <EmailShareButton
          guestName={mockGuestName}
          cardElementId={mockCardElementId}
        />
      );

      // 打開對話框
      const button = screen.getByRole('button', { name: /Email 分享/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // 輸入有效的 Email
      const emailInput = screen.getByLabelText(/收件人 Email/i);
      await user.type(emailInput, 'test@example.com');

      // 提交表單 - 應該進入 loading 狀態
      const submitButton = screen.getByRole('button', { name: /發送/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('表單提交邏輯', () => {
    it('提交時應該顯示 loading 狀態', async () => {
      const user = userEvent.setup();

      render(
        <EmailShareButton
          guestName={mockGuestName}
          cardElementId={mockCardElementId}
        />
      );

      // 打開對話框
      const button = screen.getByRole('button', { name: /Email 分享/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // 輸入 Email
      const emailInput = screen.getByLabelText(/收件人 Email/i);
      await user.type(emailInput, 'test@example.com');

      // 提交表單
      const submitButton = screen.getByRole('button', { name: /發送/i });
      await user.click(submitButton);

      // 檢查 loading 狀態
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText(/發送中/i)).toBeInTheDocument();
      });
    });

    it('成功發送應該顯示成功訊息並關閉對話框', async () => {
      const user = userEvent.setup();

      // Mock Math.random 確保成功 (> 0.1)
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      render(
        <EmailShareButton
          guestName={mockGuestName}
          cardElementId={mockCardElementId}
        />
      );

      // 打開對話框
      const button = screen.getByRole('button', { name: /Email 分享/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // 輸入 Email
      const emailInput = screen.getByLabelText(/收件人 Email/i);
      await user.type(emailInput, 'test@example.com');

      // 提交表單
      const submitButton = screen.getByRole('button', { name: /發送/i });
      await user.click(submitButton);

      // 等待成功訊息
      await waitFor(() => {
        expect(screen.getByText(/發送成功/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // 對話框應該關閉
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      }, { timeout: 4000 });
    });

    it('發送失敗應該顯示錯誤訊息', async () => {
      const user = userEvent.setup();

      // Mock Math.random 確保失敗 (< 0.1)
      vi.spyOn(Math, 'random').mockReturnValue(0.05);

      render(
        <EmailShareButton
          guestName={mockGuestName}
          cardElementId={mockCardElementId}
        />
      );

      // 打開對話框
      const button = screen.getByRole('button', { name: /Email 分享/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // 輸入 Email
      const emailInput = screen.getByLabelText(/收件人 Email/i);
      await user.type(emailInput, 'test@example.com');

      // 提交表單
      const submitButton = screen.getByRole('button', { name: /發送/i });
      await user.click(submitButton);

      // 等待錯誤訊息
      await waitFor(() => {
        expect(screen.getByText(/發送失敗/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // 對話框應該還在
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // 按鈕應該重新啟用
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('對話框內容', () => {
    it('應該顯示賓客名稱', async () => {
      render(
        <EmailShareButton
          guestName={mockGuestName}
          cardElementId={mockCardElementId}
        />
      );

      // 打開對話框
      const button = screen.getByRole('button', { name: /Email 分享/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(new RegExp(mockGuestName, 'i'))).toBeInTheDocument();
      });
    });

    it('應該顯示 Email 輸入框', async () => {
      render(
        <EmailShareButton
          guestName={mockGuestName}
          cardElementId={mockCardElementId}
        />
      );

      // 打開對話框
      const button = screen.getByRole('button', { name: /Email 分享/i });
      fireEvent.click(button);

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/收件人 Email/i);
        expect(emailInput).toBeInTheDocument();
        expect(emailInput).toHaveClass('input-field');
      });
    });

    it('應該顯示卡片預覽', async () => {
      render(
        <EmailShareButton
          guestName={mockGuestName}
          cardElementId={mockCardElementId}
        />
      );

      // 打開對話框
      const button = screen.getByRole('button', { name: /Email 分享/i });
      fireEvent.click(button);

      await waitFor(() => {
        const preview = screen.getByTestId('card-preview');
        expect(preview).toBeInTheDocument();
      });
    });
  });

  describe('無障礙支援', () => {
    it('對話框應該有正確的 aria 屬性', async () => {
      render(
        <EmailShareButton
          guestName={mockGuestName}
          cardElementId={mockCardElementId}
        />
      );

      // 打開對話框
      const button = screen.getByRole('button', { name: /Email 分享/i });
      fireEvent.click(button);

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
          cardElementId={mockCardElementId}
        />
      );

      // 打開對話框
      const button = screen.getByRole('button', { name: /Email 分享/i });
      fireEvent.click(button);

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/收件人 Email/i);
        expect(emailInput).toBeInTheDocument();
      });
    });
  });
});
