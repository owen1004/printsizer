# Context Snapshot

> 由 /checkpoint 自動同步。保留最新 3 筆。最新在上。

---

## [2026-05-05T16:42:18Z] Checkpoint — PrintSizer v1.0 Complete

### 專案狀態
- **版本**：v1.0.0（正式上線）
- **Live URL**：https://printsizer.vercel.app
- **GitHub**：https://github.com/owen1004/printsizer
- **最終 commit**：`131117a` — fix: restore bottom CTA and reset button visibility

### 完成功能清單
- [x] 圖片上傳（JPG / PNG / WebP / HEIC）
- [x] 像素解析 + DPI 計算（9 種台灣常見印刷尺寸）
- [x] 5 級品質評級（excellent / good / fair / low / poor）
- [x] DPI 對照表（300 / 150 / 100 / 72 門檻）
- [x] 自訂尺寸品質計算器（AspectRatioCalculator）
- [x] 全寬 hero 圖片預覽 + floating quality badge
- [x] GSAP 入場動畫（timeline + elastic meter dot）
- [x] Smart 長寬比（GCD + 有理數逼近）
- [x] SVG Favicon（album icon，雙層方案）
- [x] LINE 浮動聯絡按鈕
- [x] Vercel 部署（GitHub 自動 CI/CD）

### 待處理
- [ ] `public/og-image.png`：需從 og-image.svg 導出 1200×630 PNG，LINE 分享縮圖才能顯示

### 下次 Session 從這裡繼續
og-image.png 導出 → push → 完成所有 OG 預覽設定。
其餘以用戶反饋驅動。
