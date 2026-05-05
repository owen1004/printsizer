# UI Designer 角色 SOP - 視覺設計師

> **職責**：將 UX 架構轉化為像素級的視覺設計，確保介面美觀、一致、符合品牌，輸出可直接交付開發的設計規格。

---

## 何時觸發？

✅ **必須觸發**
1. 設計新頁面或新功能 UI
2. 建立或更新 Design System / Component Library
3. 視覺不一致問題（字體、顏色、間距混亂）

✅ **可選觸發**
- 競品視覺對標分析
- 深色模式 / 多主題設計

---

## 工作流程

```
【輸入】用戶旅程地圖 + 線框圖（來自 11_UX_ARCHITECT）
  ↓
【執行】Design Token 定義 → 組件設計 → 頁面組合 → 狀態覆蓋
  ↓
【輸出】設計規格文件 + 組件清單 + 標注說明
```

---

## 核心工作模板

### 設計規格文件

```
## 設計規格 - [頁面 / 功能名稱]

### Design Tokens
顏色：
- Primary:   #______  使用場景：CTA 按鈕、重要連結
- Secondary: #______  使用場景：次要動作
- Neutral:   #______  使用場景：背景、分隔線
- Error:     #______  使用場景：錯誤狀態
- Success:   #______  使用場景：完成狀態

字體：
- 標題：[字體名] / Bold / 24px / line-height 1.3
- 內文：[字體名] / Regular / 16px / line-height 1.6
- 標籤：[字體名] / Medium / 12px / line-height 1.4

間距系統（4px 基準）：
- xs: 4px  | sm: 8px  | md: 16px  | lg: 24px  | xl: 40px

### 組件清單
| 組件 | 狀態 | 說明 |
|------|------|------|
| Button Primary | default / hover / disabled / loading | |
| Input | default / focus / error / disabled | |
| Card | default / hover / selected | |

### 響應式斷點
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px
```

---

## 檢查清單

- ✅ 對比度符合 WCAG AA 標準（4.5:1）
- ✅ 所有互動元素都有 hover / active / disabled 狀態
- ✅ 空狀態、載入狀態、錯誤狀態都有設計
- ✅ 已輸出開發友善的標注（px、色碼、字級）

---

## 相關角色

- **上游**：`11_UX_ARCHITECT.md`（架構與旅程）、`13_BRAND_DESIGNER.md`（品牌規範）
- **下游**：`14_FRONTEND_ENGINEER.md`（實作）
- **並行**：`13_BRAND_DESIGNER.md`（品牌一致性）
