# Next.js Web 開發代碼規範

> **適用技術棧**：Next.js + React + TypeScript

## 命名規則

### 目錄與檔案結構

```
src/
├── components/        # React 元件（PascalCase）
│   ├── Button.tsx
│   ├── Modal/
│   │   ├── Modal.tsx
│   │   └── Modal.module.css
├── pages/            # Next.js 路由頁面
├── lib/              # 工具函式（camelCase）
├── styles/           # 全域樣式
├── types/            # TypeScript 類型定義
└── hooks/            # React Custom Hooks
```

### TypeScript / JavaScript 命名

```typescript
// 變數與函式：camelCase
const selectedCount = 5;
const user = { name: 'John' };
function calculateTotal(items: Item[]): number { ... }

// 常數：UPPER_SNAKE_CASE
const DEFAULT_TIMEOUT = 5000;
const MAX_RETRIES = 3;

// 元件：PascalCase
function UserProfile() { ... }
const Button = ({ label }: ButtonProps) => { ... }

// 介面與類型：PascalCase
interface UserProps {
  id: number;
  name: string;
}

type Status = 'pending' | 'success' | 'error';

// 列舉：PascalCase（單數形式）
enum HTTPStatus {
  OK = 200,
  Created = 201,
  BadRequest = 400,
}
```

### Hooks 命名

```typescript
// Custom Hooks：use[DescriptiveName]
function useLocalStorage(key: string) { ... }
function useFetchUser(userId: string) { ... }

// State hooks
const [isLoading, setIsLoading] = useState(false);
const [userData, setUserData] = useState<User | null>(null);
```

---

## 代碼結構與風格

### 元件組織

```typescript
// 1. 導入
import React, { useState } from 'react';
import { Button } from '@/components/Button';
import styles from './Modal.module.css';

// 2. 類型定義
interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
}

// 3. 元件定義
export function Modal({ isOpen, title, onClose }: ModalProps) {
  // State 與 Hooks
  const [isAnimating, setIsAnimating] = useState(false);

  // Event Handlers
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  // Render
  return isOpen ? (
    <div className={styles.modal}>
      <h2>{title}</h2>
      <button onClick={handleClose}>Close</button>
    </div>
  ) : null;
}
```

### 縮進與格式化

```typescript
// 使用 2 格空格縮進（Prettier 預設）
function processArray(items: Item[]) {
  return items.filter(item => {
    return item.status === 'active';
  });
}

// JSX 格式化
return (
  <div>
    <Button onClick={handleClick}>
      {label}
    </Button>
  </div>
);
```

### 註釋規範

```typescript
// 函式註釋：JSDoc 格式
/**
 * 計算兩點之間的距離
 * @param point1 第一個點 { x: number; y: number }
 * @param point2 第二個點
 * @returns 距離（像素）
 * @example
 * const dist = calculateDistance({ x: 0, y: 0 }, { x: 3, y: 4 });
 * console.log(dist); // 5
 */
function calculateDistance(
  point1: Point,
  point2: Point
): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// 單行註釋
const THRESHOLD = 100; // 距離閾值（像素）

// 複雜邏輯的解釋
// 檢查是否超出邊界
// 使用 >= 而非 > 以包含邊界點本身
if (x >= boundary.min && x <= boundary.max) {
  // ...
}
```

---

## TypeScript 最佳實踐

### 類型安全

```typescript
// ✅ 明確指定類型
interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

const user: UserProfile = { ... };

// ❌ 避免使用 any
const data: any = fetchUser(); // 不推薦

// ✅ 使用 unknown 需要類型檢查
const data: unknown = fetchUser();
if (typeof data === 'object' && data !== null) {
  // ...
}
```

### Props 與 State 類型

```typescript
// ✅ 為所有 Props 定義介面
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick: () => void;
}

// ❌ 避免省略 Props 類型
function Button(props) { ... }  // 不推薦
```

### API 回應類型

```typescript
// 定義 API 回應結構
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// 使用泛型
async function fetchUser(id: string): Promise<ApiResponse<User>> {
  // ...
}
```

---

## 代碼品質規則

### 避免常見陷阱

```typescript
// ❌ 避免在 JSX 中內聯定義函式
<Button onClick={() => setCount(count + 1)}>Increment</Button>

// ✅ 在元件外或使用 useCallback
const handleIncrement = useCallback(() => {
  setCount(prev => prev + 1);
}, []);

// ❌ 避免在 useEffect 中缺少依賴
useEffect(() => {
  fetchData();
}, []); // 如果 fetchData 來自 props，需要加入依賴

// ✅ 明確指定依賴
useEffect(() => {
  fetchData();
}, [fetchData]);

// ❌ 避免直接修改 state
state.items.push(newItem);

// ✅ 使用不可變更新
setState([...state, newItem]);
```

### 性能最佳實踐

```typescript
// ✅ 使用 React.memo 避免不必要的重新渲染
const UserCard = React.memo(({ user }: UserCardProps) => {
  return <div>{user.name}</div>;
});

// ✅ 使用 useMemo 快取計算結果
const expensiveResult = useMemo(
  () => complexCalculation(data),
  [data]
);

// ✅ 使用 useCallback 快取回調函式
const handleClick = useCallback(() => {
  onClose();
}, [onClose]);
```

---

## 檔案組織

### 元件檔案

```
Button/
├── Button.tsx          # 元件定義
├── Button.module.css   # 樣式
├── Button.test.tsx     # 測試
└── index.ts            # 導出（可選）
```

### 工具函式

```
lib/
├── api.ts              # API 呼叫
├── helpers.ts          # 工具函式
├── validators.ts       # 驗證邏輯
└── types.ts            # 共享類型
```

---

## Linting 與格式化

### Prettier 設定（推薦）

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid"
}
```

### ESLint 規則

```javascript
// .eslintrc.js
module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    'react/no-unescaped-entities': 'warn',
    'react-hooks/exhaustive-deps': 'error',
    '@next/next/no-html-link-for-pages': 'error',
  },
};
```

---

## 檢查清單

開發完成後確認：

- ✅ 所有變數、函式、元件有明確類型（無 any）
- ✅ 命名規則一致（camelCase / PascalCase）
- ✅ JSDoc 註釋已添加（複雜邏輯）
- ✅ Props 介面已定義
- ✅ 代碼通過 ESLint 檢查
- ✅ 代碼通過 Prettier 格式化
- ✅ 無性能陷阱（useCallback, useMemo）
- ✅ 依賴陣列完整（useEffect, useCallback 等）

---

**最後更新：2026-04-14**
**適用技術棧**：Next.js 14+ with TypeScript