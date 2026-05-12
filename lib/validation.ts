import { VALIDATION } from './constants';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

export function validateGuestName(name: string): ValidationResult {
  // 移除前後空格
  const trimmed = name.trim();

  // 檢查空字串
  if (!trimmed) {
    return {
      isValid: false,
      error: '姓名不能為空',
    };
  }

  // 檢查長度
  if (trimmed.length > VALIDATION.NAME_MAX_LENGTH) {
    return {
      isValid: false,
      error: `姓名最多 ${VALIDATION.NAME_MAX_LENGTH} 個字元`,
    };
  }

  // 檢查字元 (只允許中文、英文、數字、空格)
  if (!VALIDATION.NAME_PATTERN.test(trimmed)) {
    return {
      isValid: false,
      error: '姓名只能包含中文、英文、數字和空格',
    };
  }

  return {
    isValid: true,
    sanitized: trimmed,
  };
}

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Email 不能為空',
    };
  }

  if (!VALIDATION.EMAIL_PATTERN.test(trimmed)) {
    return {
      isValid: false,
      error: 'Email 格式不正確',
    };
  }

  return {
    isValid: true,
    sanitized: trimmed,
  };
}

export function validateTableId(tableId: string): ValidationResult {
  const trimmed = tableId.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: '桌號不能為空',
    };
  }

  // 檢查格式: table-{number}
  if (!/^table-\d+$/.test(trimmed)) {
    return {
      isValid: false,
      error: '桌號格式不正確',
    };
  }

  return {
    isValid: true,
    sanitized: trimmed,
  };
}
