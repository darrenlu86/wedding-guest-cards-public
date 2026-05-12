import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VerificationForm from '@/components/VerificationForm';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('VerificationForm', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });
  it('應該正確渲染', () => {
    render(<VerificationForm tableId="table-1" />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('請輸入您的姓名')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /查看卡片/i })).toBeInTheDocument();
  });

  it('應該顯示錯誤訊息當姓名為空', async () => {
    render(<VerificationForm tableId="table-1" />);

    const button = screen.getByRole('button', { name: /查看卡片/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/姓名不能為空/i)).toBeInTheDocument();
    });
  });

  it('應該顯示錯誤訊息當姓名包含特殊字元', async () => {
    render(<VerificationForm tableId="table-1" />);

    const input = screen.getByPlaceholderText(/請輸入您的姓名/i);
    fireEvent.change(input, { target: { value: '<script>' } });

    const button = screen.getByRole('button', { name: /查看卡片/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/姓名只能包含中文、英文、數字和空格/i)).toBeInTheDocument();
    });
  });

  it('應該呼叫 API 當輸入有效', async () => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            guestId: 'test-id',
            redirectUrl: '/card/test-id',
          }),
      })
    ) as any;

    render(<VerificationForm tableId="table-1" />);

    const input = screen.getByPlaceholderText(/請輸入您的姓名/i);
    fireEvent.change(input, { target: { value: '小明' } });

    const button = screen.getByRole('button', { name: /查看卡片/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/verify-guest',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            tableId: 'table-1',
            guestName: '小明',
          }),
        })
      );
    });
  });

  it('應該顯示 loading 狀態', async () => {
    // Mock slow API
    global.fetch = vi.fn(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () =>
                  Promise.resolve({
                    success: true,
                    guestId: 'test-id',
                    redirectUrl: '/card/test-id',
                  }),
              }),
            100
          )
        )
    ) as any;

    render(<VerificationForm tableId="table-1" />);

    const input = screen.getByPlaceholderText(/請輸入您的姓名/i);
    fireEvent.change(input, { target: { value: '小明' } });

    const button = screen.getByRole('button', { name: /查看卡片/i });
    fireEvent.click(button);

    // 檢查 loading 狀態
    expect(button).toBeDisabled();
    expect(screen.getByText(/驗證中/i)).toBeInTheDocument();
  });

  it('應該包含 honeypot 欄位', () => {
    render(<VerificationForm tableId="table-1" />);

    const honeypot = screen.getByTestId('honeypot-field');
    expect(honeypot).toBeInTheDocument();
    expect(honeypot).not.toBeVisible();
  });
});
