# Next.js Web 項目測試指南

> **測試框架**：Jest + React Testing Library
> **涵蓋範圍**：單元測試、集成測試、UI 測試

---

## 測試架構（三層模式）

### Layer 1：單元測試
**目標**：驗證單個函式、工具函式的邏輯

```typescript
// lib/helpers.test.ts
describe('calculateDistance', () => {
  it('應計算正確的距離', () => {
    const result = calculateDistance({ x: 0, y: 0 }, { x: 3, y: 4 });
    expect(result).toBe(5);
  });

  it('應處理負數座標', () => {
    const result = calculateDistance({ x: -1, y: -1 }, { x: 2, y: 3 });
    expect(result).toBeCloseTo(5, 1);
  });
});
```

### Layer 2：集成測試
**目標**：驗證多個元件/功能組合後的行為

```typescript
// components/UserForm.test.tsx
import { render, screen, userEvent } from '@testing-library/react';
import { UserForm } from './UserForm';

describe('UserForm 集成測試', () => {
  it('應成功提交表單', async () => {
    render(<UserForm onSubmit={jest.fn()} />);
    
    const input = screen.getByLabelText('用戶名');
    await userEvent.type(input, 'John Doe');
    
    const button = screen.getByRole('button', { name: '提交' });
    await userEvent.click(button);
    
    expect(screen.getByText('提交成功')).toBeInTheDocument();
  });
});
```

### Layer 3：UI 手動測試
**目標**：驗證視覺呈現、用戶交互、跨瀏覽器兼容性

見 `UI_Test_Checklist.md`

---

## 單元測試編寫規範

### 測試檔案位置與命名

```
src/
├── lib/
│   ├── helpers.ts
│   └── helpers.test.ts          # 與源文件同目錄
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
└── hooks/
    ├── useLocalStorage.ts
    └── useLocalStorage.test.ts
```

### 基本結構

```typescript
// ✅ 推薦的測試結構
describe('MyFunction', () => {
  // ✅ 使用 describe 分組相關測試
  describe('正常情況', () => {
    it('應返回預期結果', () => {
      expect(myFunction(input)).toBe(expected);
    });
  });

  describe('邊界條件', () => {
    it('應處理 null 輸入', () => {
      expect(myFunction(null)).toThrow();
    });

    it('應處理空陣列', () => {
      expect(myFunction([])).toEqual([]);
    });
  });

  describe('錯誤情況', () => {
    it('應拋出異常', () => {
      expect(() => myFunction(invalidInput)).toThrow('Invalid input');
    });
  });
});
```

### 常見的 Jest Matcher

```typescript
// 相等性
expect(value).toBe(5);                    // 嚴格相等
expect(obj).toEqual({ name: 'John' });   // 深度比較
expect(array).toContain(3);               // 陣列包含

// 布林值
expect(isValid).toBeTruthy();
expect(isEmpty).toBeFalsy();

// 浮點數
expect(result).toBeCloseTo(3.14, 2);     // 精度到 2 位小數

// 類型檢查
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// 異常
expect(() => func()).toThrow();
expect(() => func()).toThrow('Error message');

// 陣列與物件
expect(array).toHaveLength(3);
expect(obj).toHaveProperty('name', 'John');
```

### 模擬（Mock）與Stub

```typescript
// 模擬函式
const mockFn = jest.fn();
mockFn('arg1');
expect(mockFn).toHaveBeenCalledWith('arg1');
expect(mockFn).toHaveBeenCalledTimes(1);

// 模擬模組
jest.mock('./api', () => ({
  fetchUser: jest.fn().mockResolvedValue({ id: 1, name: 'John' }),
}));

// 模擬回傳值
const mockFn = jest.fn().mockReturnValue(42);
expect(mockFn()).toBe(42);

// 模擬異步函式
const mockAsync = jest.fn().mockResolvedValue('success');
const mockAsyncError = jest.fn().mockRejectedValue(new Error('fail'));
```

---

## 元件測試編寫規範

### React 元件測試

```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button 元件', () => {
  it('應正確渲染', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('應觸發 onClick 回調', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('應支援禁用狀態', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 測試 Custom Hooks

```typescript
// hooks/useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter Hook', () => {
  it('應初始化計數為 0', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('應遞增計數', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

### 測試 API 呼叫

```typescript
// lib/api.test.ts
import { fetchUser } from './api';

describe('API 函式', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('應成功取得用戶數據', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: 'John' }),
    });

    const user = await fetchUser(1);
    expect(user).toEqual({ id: 1, name: 'John' });
    expect(global.fetch).toHaveBeenCalledWith('/api/users/1');
  });

  it('應處理 API 錯誤', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(fetchUser(999)).rejects.toThrow('User not found');
  });
});
```

---

## 集成測試編寫規範

### 多元件集成測試

```typescript
// components/UserProfile.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from './UserProfile';

// 模擬 API
jest.mock('../lib/api', () => ({
  fetchUser: jest.fn().mockResolvedValue({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
  }),
}));

describe('UserProfile 集成測試', () => {
  it('應加載和顯示用戶數據', async () => {
    render(<UserProfile userId={1} />);
    
    // 等待異步數據加載
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('應允許編輯用戶信息', async () => {
    render(<UserProfile userId={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const editButton = screen.getByRole('button', { name: '編輯' });
    await userEvent.click(editButton);
    
    const nameInput = screen.getByDisplayValue('John Doe');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Jane Doe');
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    await userEvent.click(saveButton);
    
    expect(screen.getByText('保存成功')).toBeInTheDocument();
  });
});
```

---

## Jest 設定

### jest.config.js

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

### jest.setup.js

```javascript
import '@testing-library/jest-dom'

// 全局測試設定
global.matchMedia = global.matchMedia || function() {
  return {
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }
}
```

---

## 運行測試

### 常用命令

```bash
# 運行所有測試
npm test

# 監視模式（開發中）
npm test -- --watch

# 運行特定檔案
npm test -- Button.test.tsx

# 生成覆蓋率報告
npm test -- --coverage

# 更新快照
npm test -- --updateSnapshot
```

---

## 測試覆蓋率目標

| 指標 | 目標 | 說明 |
|------|------|------|
| 分支覆蓋 (Branches) | ≥ 70% | if/else 的所有分支 |
| 函式覆蓋 (Functions) | ≥ 70% | 定義的所有函式 |
| 行覆蓋 (Lines) | ≥ 70% | 執行的代碼行數 |
| 語句覆蓋 (Statements) | ≥ 70% | 所有語句 |

---

## 常見陷阱

### ❌ 避免的做法

```typescript
// ❌ 不要測試實現細節
it('應呼叫 setState', () => {
  const setState = jest.fn();
  // ... 測試 setState 的呼叫次數
});

// ✅ 改為測試用戶能看到的結果
it('應顯示更新後的計數', () => {
  render(<Counter />);
  const button = screen.getByRole('button');
  fireEvent.click(button);
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});

// ❌ 避免過度模擬
jest.mock('./api');
jest.mock('./helpers');
jest.mock('./utils');
// 模擬太多導致測試不再測試實際代碼路徑

// ✅ 只模擬外部依賴
jest.mock('./api');  // 外部 API
jest.mock('fetch');  // 瀏覽器 API
```

### ⚠️ 異步測試陷阱

```typescript
// ❌ 遺漏 await
it('應加載數據', () => {
  render(<UserList />);
  expect(screen.getByText('User 1')).toBeInTheDocument();
});

// ✅ 使用 waitFor
it('應加載數據', async () => {
  render(<UserList />);
  await waitFor(() => {
    expect(screen.getByText('User 1')).toBeInTheDocument();
  });
});
```

---

## 檢查清單

編寫測試時確認：

- ✅ 測試名稱清晰（describe 與 it 的文字描述）
- ✅ 測試獨立（不依賴其他測試）
- ✅ 邊界條件已測試（null、空陣列、大值等）
- ✅ 異常情況已測試
- ✅ 用 userEvent 模擬真實交互（非 fireEvent）
- ✅ 異步操作使用 waitFor 或 act
- ✅ Mock 已正確清理（afterEach）
- ✅ 測試覆蓋率 ≥ 70%

---

**最後更新：2026-04-14**
**適用技術棧**：Next.js 14+ with Jest + React Testing Library