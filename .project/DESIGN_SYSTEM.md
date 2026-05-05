# Design System — PrintSizer

> Apple 風格設計規範 + WCAG AA 無障礙標準
> 依據影片「Debug 土撥鼠」4 維度框架建立

---

## 1. 色彩系統（Visual Consistency + Comprehensibility）

### 文字色（全部通過 WCAG AA 4.5:1 on white）

| Token 名稱 | Tailwind Class | Hex | 對比度 | 用途 |
|-----------|---------------|-----|--------|------|
| text-primary | `text-gray-900` | #111827 | 19:1 ✓ | 標題、重要數字 |
| text-secondary | `text-gray-700` | #374151 | 10.2:1 ✓ | 內文、說明 |
| text-tertiary | `text-gray-500` | #6B7280 | 4.5:1 ✓ | 次要說明、標籤 |
| text-disabled | `text-gray-400` | #9CA3AF | 2.4:1 ✗ | **禁止用於文字** |
| text-placeholder | `text-gray-400` | #9CA3AF | 2.4:1 ✗ | **input placeholder 例外** |

> ⚠️ `text-gray-300` 和 `text-gray-400` 禁止用於實際文字內容，僅允許用於裝飾性元素。

### 品牌色

| Token | Tailwind | Hex | 用途 |
|-------|---------|-----|------|
| brand | `text-orange-500` | #F97316 | CTA、重點強調 |
| brand-dark | `text-orange-600` | #EA580C | hover 狀態 |
| brand-bg | `bg-orange-50` | #FFF7ED | 品牌色背景 |

### 背景

| Token | Value | 用途 |
|-------|-------|------|
| bg-page | `#F5F5F7` | Apple 頁面底色 |
| bg-card | `#FFFFFF` | 卡片背景 |
| bg-input | `#FFFFFF` | 輸入框 |

### 品質等級色（DPI 表格、尺寸清單）

| 等級 | 點 | 文字 | 背景 |
|------|---|------|------|
| excellent (300+ DPI) | `bg-green-500` | `text-green-700` | `bg-green-50` |
| good (150+ DPI) | `bg-blue-500` | `text-blue-700` | `bg-blue-50` |
| fair (100+ DPI) | `bg-amber-500` | `text-amber-700` | `bg-amber-50` |
| acceptable (72+ DPI) | `bg-orange-400` | `text-orange-700` | `bg-orange-50` |
| poor (<72 DPI) | `bg-gray-300` | `text-gray-500` | `bg-gray-50` |

---

## 2. 字體系統（Comprehensibility）

| 用途 | Size | Weight | Color Token | Tailwind |
|------|------|--------|------------|---------|
| Hero H1 | 40-48px | Bold | text-primary | `text-4xl md:text-5xl font-bold tracking-tight` |
| Section H2 | 20-24px | Semibold | text-primary | `text-xl font-semibold tracking-tight` |
| Card label（大寫） | 11px | Semibold | text-tertiary | `text-xs font-semibold uppercase tracking-widest` |
| Body | 14-16px | Normal | text-secondary | `text-sm text-gray-700` |
| Caption | 12px | Normal | text-tertiary | `text-xs text-gray-500` |
| 數字（DPI/品質） | 24-32px | Black | 品質等級色 | `text-2xl font-black` |

---

## 3. 間距系統（Visual Consistency）

- 卡片 padding：`p-5`（20px）
- 卡片圓角：`rounded-3xl`（24px）
- 輸入框圓角：`rounded-xl`（12px）
- Badge 圓角：`rounded-full`
- Section 間距：`space-y-4`（16px）
- Hero padding top：`pt-14`（56px）

---

## 4. 陰影系統（Visual Consistency）

| Class | 用途 |
|-------|------|
| `apple-shadow` | 標準卡片：`box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.08)` |
| `apple-shadow-md` | 懸停/強調：`box-shadow: 0 4px 16px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.06)` |
| `drop-glow` | 拖拽上傳時：orange glow |

---

## 5. 四維度設計檢查清單

### 視覺注意力（Visual Attention）
- [ ] 0.5 秒法則：頁面最重要元素（上傳區/品質分數）在 0.5 秒內可見
- [ ] 上傳圓圈作為第一視覺焦點（pulse 動畫 + 足夠大小 w-20 h-20）
- [ ] 結果頁：品質等級字樣最大（text-2xl font-black）

### 可理解性（Comprehensibility）
- [ ] 所有文字對比度 ≥ 4.5:1（WCAG AA）
- [ ] 禁用 text-gray-300 / text-gray-400 作為文字
- [ ] 說明文字 ≤ 2 行，避免過長段落

### 操作流暢度（Actionability）
- [ ] 上傳區佔據頁面中心，點擊目標夠大
- [ ] 重新上傳按鈕明確可見
- [ ] 沒有元素相互遮擋 CTA

### 視覺一致性（Consistency）
- [ ] 卡片圓角統一（rounded-3xl）
- [ ] 陰影統一使用 apple-shadow
- [ ] 品質等級色在 DPI 表格、尺寸清單、評分卡三處完全一致
- [ ] 字體不超過 3 種 weight（normal / semibold / bold/black）

---

**版本**：v1.0 | **建立**：2026-05-05 | **負責角色**：11_UX_Architect + 12_UI_Designer
