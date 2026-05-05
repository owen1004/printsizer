# TODO — 任務清單

> **使用規則**：
> - Claude 每次 Session 啟動必須讀取此文件
> - 完成任務後立即標記，不要累積
> - 超出此清單範圍的任務，必須先討論再加入（防止 Scope Creep）

---

## 🔴 P0 — 本 Sprint 必完成

```
[ ] 執行 codex review（Sprint 2 功能：Apple UI 重設計 + 邏輯修復）
[ ] 在瀏覽器完整測試：上傳、縮圖、DPI 表格、各尺寸品質等級
[ ] 更新 DEVELOPMENT_LOG.md（Sprint 2 記錄）
```

---

## 🟡 P1 — 本 Sprint 盡量完成

```
[x] AspectRatioCalculator：修復原始尺寸改變後目標欄位不同步（codex N2）✅ 2026-05-05
[ ] 無障礙補強：aria-label、aria-hidden SVG（codex N3）
[ ] GIF/BMP 加入 CONSTITUTION.md 第 4 條說明（codex N4）
```

---

## 🟢 P2 — 下個 Sprint 再做

```
[ ] 部署至 Vercel
[ ] 加入 og:image 社群分享縮圖
[ ] 考慮加入「比例尺寸列表」（類似 posterprintshop 的比例換算表）
[ ] 多語言支援（英文）
[ ] 與 BoltPrint 印刷接單系統整合（CONSTITUTION 第 4 條已預留）
```

---

## ✅ 已完成

```
[x] 2026-05-05 — Sprint 1：核心功能實作（imageAnalyzer + 三個元件）
[x] 2026-05-05 — Bug 修復：DPI 公式錯誤（×0.3937 → ÷0.3937）
[x] 2026-05-05 — Bug 修復：heic2any Blob[] 未處理
[x] 2026-05-05 — Bug 修復：零尺寸圖片防護
[x] 2026-05-05 — Sprint 2：Apple 風格 UI 大改版（全站重設計）
[x] 2026-05-05 — 邏輯修復：各尺寸 canPrint 改用統一 72 DPI 門檻，新增 printQuality 欄位
[x] 2026-05-05 — 功能新增：縮圖預覽、DPI 等級對照表、各尺寸品質一覽
[x] 2026-05-05 — codex review Sprint 1（3 blocking 已修復）
```

---

## 🚫 技術債待還

詳見 `.project/DEVELOPMENT_LOG.md` → 技術債區塊

```
[N2] AspectRatioCalculator：原始尺寸變更後目標欄位不自動更新（輕微）
[N3] 缺少 aria-label / aria-hidden（無障礙）
[N4] GIF/BMP 支援未寫入 CONSTITUTION 第 4 條
[N5] <details> 展開狀態重新上傳後重置（輕微）
```

---

**最後更新：2026-05-05**
