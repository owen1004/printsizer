# 開發日誌（Development Log）

> **Claude 必讀**：每次 Session 啟動讀取最後 5 筆記錄。
> **Claude 必寫**：每次完成功能或修復 Bug 後立即更新。
> 最新記錄在最上面。

---

## 🚦 技術債 Traffic Light

| 等級 | 數量 |
|------|------|
| 🔴 嚴重（影響核心功能） | 0 |
| 🟡 中等（影響體驗但可用） | 0 |
| 🟢 輕微（不影響功能） | 4 |

### 技術債明細

```
[N2] AspectRatioCalculator 原始尺寸變更後目標欄不自動重算（輕微）
[N3] 缺少 aria-label / aria-hidden SVG（無障礙，輕微）
[N4] GIF/BMP 支援未寫入 CONSTITUTION 第 4 條（文件欠更新）
[N5] <details> 重新上傳後展開狀態重置（輕微 UX）
```

---

## 📊 專案狀態快照

| 項目 | 內容 |
|------|------|
| **當前版本** | v1.0.0（正式上線） |
| **當前階段** | PHASE_1 完成 — 已部署上線 |
| **整體進度** | 100%（所有功能完成，已推送至 GitHub + Vercel） |
| **Live URL** | https://printsizer.vercel.app |
| **GitHub** | https://github.com/owen1004/printsizer |
| **上次更新** | 2026-05-05 |

---

## 📋 開發記錄（最新在上）

### [2026-05-05] Bug Fix — 印刷可行性判定改為按尺寸觀看距離分層

```
- 角色：02_Developer + 03_Architect
- 符合 CONSTITUTION：第 1 條（核心價值「減少印壞重印的浪費與糾紛」）+ 第 4 條（DPI 計算、品質評級）
- 觸發：用戶實測 736×1087 圖片，PrintSizer 評為「尚可」但 posterprintshop 評為 Poor，存在高估風險
- Root Cause：
  - canPrint 統一用 dpi >= 72 作為門檻，忽略觀看距離差異
  - 結果：名片 89 DPI 跟易拉展 89 DPI 都被標為「可印」，但實際印刷品質天差地遠
  - 整體評級 getQuality() 寫死 ≥150 DPI 為高品質，與 canPrint 雙重標準
- Fix：
  - PRINT_SIZES 加 minDpi 欄，按印刷實務觀看距離分層
    名片/DM/A6 = 200, A5/A4 = 150, A3 = 120, A2 = 100, A1 = 75, 易拉展 = 50
  - canPrint 改為 dpi >= size.minDpi
  - getQuality 改為以 canPrint 為基準，避免雙重標準
  - ResultPanel 提示文字同步更新（「門檻按觀看距離分層」）
- 驗證（用戶測試圖 736×1087）：
  - 舊：整體「尚可」，A4 標可印；新：整體「偏低」，僅名片可印
  - 對齊 posterprintshop 的 Poor 評級
- Pre-fix baseline commit：883277c
- Fix commit：見下次 push
- 技術債：無新增
```

---

### [2026-05-05] /checkpoint — PrintSizer v1.0 專案完成存檔

```
- 狀態：v1.0 功能完整，已部署至 Vercel，正式上線
- Live URL：https://printsizer.vercel.app
- GitHub：https://github.com/owen1004/printsizer
- 最終 commit：131117a
- Checkpoint 檔案：~/.gstack/projects/owen1004-SuperDevFramework/checkpoints/20260505-164218-printsizer-v1-complete.md
- Pending：og-image.png 尚未導出（OG 社群預覽）
```

---

### [2026-05-05] Sprint 4 — 部署 + GSAP 動畫 + 品質邏輯修正 + 視覺升級

```
- 角色：14_Frontend_Engineer + 06_DevOps_Release
- 內容：
  1. 部署至 GitHub (owen1004/printsizer) + Vercel (printsizer.vercel.app)
  2. 新增 SVG Favicon（album icon，橙色漸層），雙層方案（icon.svg + public/favicon.svg + <link> tag）
  3. Header logo 從 emoji 替換為 inline SVG（與 favicon 一致）
  4. 圖片預覽從 96×96 縮圖升級為全寬 hero banner（h-52，floating quality badge）
  5. GSAP 動畫：useGSAP hook，timeline 入場，彈性 meter dot
  6. 品質評級邏輯修正：改為基於「可達 ≥150 DPI 的最大尺寸」，新增 'low' 第 5 tier，解決矛盾顯示
  7. 長寬比顯示修正：niceRatio 算法（GCD + 有理數逼近，分母 ≤ 30），527:746 → 12:17
  8. Bug fix：GSAP opacity=0 導致底部 CTA 消失，改用 CSS animate-fade-in-up
- 關鍵 commits：
  - 131117a fix: restore bottom CTA and reset button visibility
  - 249ffcb feat: add GSAP animations + fix aspect ratio display
  - 05f45ae fix: rebase quality rating on achievable print size
  - a36bf1c feat: upgrade image preview to full-width hero
  - fe22c27 fix: favicon reliability
- 符合 CONSTITUTION：第 4 條（瀏覽器端），第 5 條（圖片不上傳）
- 技術債：og-image.png 未導出（🟢 輕微，不影響功能）
```

---

### [2026-05-05] Bug Fix — N2 AspectRatioCalculator 同步問題

```
- Root Cause: origW/origH 的 onChange 只更新 state，未觸發目標欄重算
- Fix: 新增 handleOrigWChange / handleOrigHChange，改變原始尺寸時依已有目標欄自動重算另一欄
- 驗證: 瀏覽器測試 1000×2000 → 目標寬20 → 改原始高1000 → 目標高自動更新 40.0→20.0 ✅
- 技術債 N2: 已清除
```

### [2026-05-05] Sprint 3 — Neumorphism 全站重設計

```
- 角色：12_UI_Designer + 14_Frontend_Engineer
- 內容：
  1. globals.css 新增完整 Neumorphism 設計系統（neuro-card / neuro-card-sm / neuro-inset / neuro-btn / neuro-header / neuro-upload / neuro-upload-dragging）
  2. 背景色 #f5f5f7 → #E4EAF0（冷調藍灰，雙向陰影參考色）
  3. 所有 Card：bg-white + apple-shadow → neuro-card（大卡） / neuro-card-sm（小卡）
  4. 所有 Input：border + bg-white → neuro-inset（凹陷壓入感）
  5. 重新上傳按鈕（Q2 優化）：border-based → neuro-btn（壓下有動感 active 態）
  6. 上傳區：border-dashed + bg-white → neuro-upload（外凸陰影 + dashed outline）
  7. DPI 行：去除色塊背景，改用 neuro-card-sm + 彩色文字/Badge
  8. Header：glass → neuro-header
  9. css.d.ts 補上，修復 next build TS 錯誤（moduleResolution: bundler 下 CSS 型別聲明缺失）
  10. 清除 .next 快取並重啟 dev server 確認視覺正確
- 符合 CONSTITUTION：第 4 條（瀏覽器端，不改核心邏輯）
- Codex Review：待執行
- 技術債：無新增
```

---

### 2026-05-05 — Feature：Sprint 2 — Apple UI 重設計 + 邏輯修復

- **角色**：14_Frontend_Engineer + 04_UI_UX_Designer
- **符合 CONSTITUTION**：第 3、4、5 條
- **內容**：
  - `imageAnalyzer.ts`：移除各尺寸個別 minDpi 門檻，改用統一 72 DPI 作為 canPrint 基準；新增 `printQuality` 欄位（excellent/good/fair/acceptable/poor），與 DPI 對照表邏輯完全一致
  - `ResultPanel.tsx`：Apple 白卡設計，統一品質等級列表（含彩色品質點），DPI 對照表列顏色對應品質
  - `ImageUploader.tsx`：極簡風格，移除橙色圓圈背景，改用低調 orange-50 + pulse
  - `page.tsx`：Apple frosted glass header + 大標題 hero 區（移除橙色 block）
  - `AspectRatioCalculator.tsx`：配合 Apple 白卡風格統一
  - `globals.css`：新增 `.glass`、`.apple-shadow`、`.apple-shadow-md` utility
- **Codex Review**：待執行（P0）
- **技術債**：N2/N3/N4/N5（均為輕微，已登記）

---

### 2026-05-05 — Feature：Sprint 1 完成 — 核心功能 + UI 全面重設計

- **角色**：14_Frontend_Engineer + 04_UI_UX_Designer
- **內容**：
  - `src/lib/imageAnalyzer.ts`：Canvas API 解析圖片尺寸，支援 HEIC（heic2any），計算 9 種標準印刷尺寸可行性
  - `src/components/ImageUploader.tsx`：Iconly 風格暖色上傳區，橙色大圓 + pulseWarm 動畫，拖拽 drop-glow 效果
  - `src/components/ResultPanel.tsx`：評分卡 + 雙亮點卡（最大可印 / 改善建議）+ 尺寸列表 + 摺疊不可印區塊
  - `src/components/AspectRatioCalculator.tsx`：雙向公分計算器
  - `src/app/globals.css`：自訂動畫（fadeInUp / pulseWarm / card-hover / drop-glow）
  - `src/app/page.tsx`：主頁佈局，橙色漸層 header 與 hero 卡
- **符合 CONSTITUTION**：第 4 條 MVP 範疇（全部功能已實作）、第 5 條紅線（圖片不上傳伺服器）
- **Codex Review**：待執行
- **技術債**：無

---

### 2026-05-04 — 初始化：SuperDevFramework v1.0 範本建立

- **類型**：初始化
- **內容**：
  - 建立 CLAUDE.md（強制規則 + 5 問題開場協定）
  - 建立 CONSTITUTION.md（專案憲法模板）
  - 建立 TODO.md（任務清單）
  - 建立 ADR.md（架構決策紀錄，含 ADR#0）
  - 複製 22 個角色文件到 .team/（8 技術 + 14 商業設計）
  - 清空 src/（技術棧待確認後 scaffold）
  - 刪除測試用驗證文件（7 個）
- **下一步**：用戶啟動新專案時執行「新專案啟動協定」

---

## 📝 記錄格式參考

### Bug 修復記錄
```
### YYYY-MM-DD — Bug Fix：[問題標題]
- 角色：[執行角色編號_名稱]
- 根本原因：[一句話說明]
- 修復方式：[具體做了什麼]
- 影響範圍：[受影響的模組/檔案]
- 符合 CONSTITUTION：第 X 條 — [說明]
- 技術債：[無 / 有 → 見技術債 #N]
- Commit：[hash]
```

### 功能完成記錄
```
### YYYY-MM-DD — Feature：[功能名稱]
- 角色：[執行角色編號_名稱]
- 內容：[完成了什麼]
- 符合 CONSTITUTION：第 X 條 — [說明]
- Codex Review：[通過 / 有問題 → 已修復]
- 技術債：[無 / 有 → 見技術債 #N]
- Commit：[hash]
```

### 技術債登記
```
## 技術債 #N — YYYY-MM-DD
- 描述：[做了什麼妥協]
- 原因：[為什麼這樣做]
- 影響範圍：[哪些功能受影響]
- 還款計畫：[什麼時候修、Sprint 幾]
```

---

**SuperDevFramework Development Log v1.0**
