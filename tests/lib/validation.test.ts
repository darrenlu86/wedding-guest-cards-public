import { describe, it, expect } from 'vitest';
import { validateGuestName, validateEmail, validateTableId } from '@/lib/validation';

describe('validateGuestName', () => {
  it('應該接受有效的中文姓名', () => {
    expect(validateGuestName('小明').isValid).toBe(true);
    expect(validateGuestName('李四').isValid).toBe(true);
  });

  it('應該接受有效的英文姓名', () => {
    expect(validateGuestName('John Doe').isValid).toBe(true);
    expect(validateGuestName('Mary').isValid).toBe(true);
  });

  it('應該接受中英文混合', () => {
    expect(validateGuestName('王John').isValid).toBe(true);
  });

  it('應該拒絕過長的姓名', () => {
    const longName = '王'.repeat(21);
    const result = validateGuestName(longName);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('姓名最多 20 個字元');
  });

  it('應該拒絕空字串', () => {
    const result = validateGuestName('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('姓名不能為空');
  });

  it('應該拒絕特殊字元', () => {
    const result = validateGuestName('王<script>');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('姓名只能包含中文、英文、數字和空格');
  });

  it('應該拒絕 XSS 攻擊', () => {
    expect(validateGuestName('<script>alert(1)</script>').isValid).toBe(false);
    expect(validateGuestName('"><img src=x>').isValid).toBe(false);
  });

  it('應該移除前後空格', () => {
    const result = validateGuestName('  小明  ');
    expect(result.isValid).toBe(true);
    expect(result.sanitized).toBe('小明');
  });
});

describe('validateEmail', () => {
  it('應該接受有效的 email', () => {
    expect(validateEmail('test@example.com').isValid).toBe(true);
    expect(validateEmail('user.name@domain.co.uk').isValid).toBe(true);
  });

  it('應該拒絕無效的 email', () => {
    expect(validateEmail('invalid').isValid).toBe(false);
    expect(validateEmail('@example.com').isValid).toBe(false);
    expect(validateEmail('test@').isValid).toBe(false);
  });

  it('應該移除前後空格', () => {
    const result = validateEmail('  test@example.com  ');
    expect(result.isValid).toBe(true);
    expect(result.sanitized).toBe('test@example.com');
  });
});

describe('validateTableId', () => {
  it('應該接受有效的桌號格式', () => {
    expect(validateTableId('table-1').isValid).toBe(true);
    expect(validateTableId('table-10').isValid).toBe(true);
  });

  it('應該拒絕無效格式', () => {
    expect(validateTableId('').isValid).toBe(false);
    expect(validateTableId('invalid').isValid).toBe(false);
    expect(validateTableId('table-').isValid).toBe(false);
  });
});
