# Front-End Engineer 角色 SOP - 前端工程師

> **職責**：將設計稿轉化為高品質的 UI 實作，負責前端架構、組件開發、效能優化與跨裝置相容性。

---

## 何時觸發？

✅ **必須觸發**
1. 實作新 UI 組件或頁面
2. Next.js / React 頁面開發
3. 前端效能問題（LCP > 2.5s、CLS 過高）
4. API 串接與前端狀態管理設計

✅ **可選觸發**
- 前端測試策略（E2E / 組件測試）
- SEO 優化、Meta 標籤設定

---

## 工作流程

```
【輸入】設計規格文件（來自 12_UI_DESIGNER）+ API 文件（來自 15_BACKEND）
  ↓
【執行】組件拆分 → 實作 → 狀態管理 → API 串接 → 響應式調整
  ↓
【輸出】可運行的組件 + PR + Storybook 文件（若有）
```

---

## 核心工作模板

### 組件開發規格

```
## 組件規格 - [ComponentName]

### Props 定義
```typescript
interface [ComponentName]Props {
  // 必填
  value: string           // 說明
  onChange: (v: string) => void

  // 選填
  placeholder?: string    // 預設：''
  disabled?: boolean      // 預設：false
  className?: string
}
```

### 狀態清單
- default：正常顯示
- loading：顯示骨架屏或 spinner
- error：顯示錯誤訊息 + 紅色邊框
- disabled：灰色、不可互動
- empty：無資料時的空狀態

### 事件處理
- onClick：[行為說明]
- onError：[錯誤處理方式]

### 邊界情況
- [ ] 文字過長截斷處理
- [ ] 圖片載入失敗 fallback
- [ ] 網路斷線重試機制
```

---

## 檢查清單

- ✅ 組件有對應 TypeScript 型別定義
- ✅ 所有狀態（loading / error / empty）都已實作
- ✅ 響應式：mobile 360px 到 desktop 1440px 測試過
- ✅ 無障礙：aria-label、keyboard navigation 基本支援

---

## 相關角色

- **上游**：`12_UI_DESIGNER.md`（設計規格）
- **下游**：`15_BACKEND_ENGINEER.md`（API 需求溝通）
- **並行**：`16_MOBILE_ENGINEER.md`（共用邏輯協調）
