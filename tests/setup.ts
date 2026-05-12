import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// 每個測試後清理
afterEach(() => {
  cleanup();
});
