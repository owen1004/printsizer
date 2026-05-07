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

### [2026-05-08] Feature — 安裝 Vercel Speed Insights

```
- 角色：06_DevOps_Release
- 內容：
  - npm install @vercel/speed-insights（^2.0.0）
  - layout.tsx import { SpeedInsights } from '@vercel/speed-insights/next'
  - <SpeedInsights /> 加在 <Analytics /> 後面
- 功能：採集 Core Web Vitals（LCP/CLS/INP/FCP/TTFB）至 Vercel dashboard
- 部署後第一次有用戶訪問即開始累積資料
- 技術債：無新增
```

---

### [2026-05-08] Feature — 安裝 Vercel Web Analytics

```
- 角色：06_DevOps_Release
- 觸發：用戶反映 Vercel Analytics dashboard 無資料
- Root Cause：Vercel agent 之前回報「已完成安裝」是假象——
  它只在自己沙盒跑過 build 驗證，但變更從未 commit/push 到 master
  package.json 沒有 @vercel/analytics、layout.tsx 沒有 Analytics import
- Fix（實際動手）：
  1. npm install @vercel/analytics（^2.0.1）
  2. layout.tsx import { Analytics } from '@vercel/analytics/next'
  3. 在 <body> 末尾加 <Analytics />
  4. TS pass，commit + push
- 不採用 Vercel agent 提的 ESLint flat config（過度設計，與既有 Next.js 預設不衝突）
- 部署後 5-10 分鐘開始累積資料；第一筆 pageview 觸發後可從 Vercel dashboard 看到
- 技術債：無新增
```

---

### [2026-05-08] Bug Fix — printQuality 階梯「良好」死區（minDpi ≥ 150 永遠跳過良好）

```
- 角色：02_Developer
- 觸發：用戶測試圖片發現「優秀直接跳勉強」少了「良好」中間層
- Root Cause：
  - dpiToPrintQuality 舊邏輯：minDpi ≤ dpi < 150 才算 'fair'(良好)
  - 但 7 個尺寸 minDpi ≥ 150（悠遊卡貼/名片/A7/DM/A6/A5/A4）→ 良好範圍空集合
  - 結果：這些尺寸的 row 永遠只能顯示 極致 / 優秀 / 勉強 / 不建議，跳過良好
- 印刷專業標準對齊：
  - 300 DPI = 印刷頂規（press-perfect）
  - 200 DPI = 高品質印刷標準（行業共識，比 150 更精準）
  - 150 DPI = 一般印刷標準（不夠稱「優秀」）
- Fix：
  - 「優秀」門檻從 ≥150 提到 ≥200（對齊 200 DPI = 高品質的業界標準）
  - 「良好」自動拓寬為 minDpi ≤ dpi < 200 區間，讓所有尺寸都有機會顯示
- 驗證：
  - image 1（小圖）：極致×3 → 優秀×2 → 良好 → 勉強×3 → 不建議×3（5 tier 完整）
  - image 2（大圖）：極致×5 → 優秀×2 → 良好×2 → 勉強×3（跟原本一樣）
- 副作用：
  - 部分 dpi 在 150-199 區間的 row 從 優秀 降為 良好（如 image 1 A5 170 DPI）
  - 屬合理校準，更貼近印刷專業判斷
- 技術債：無新增
```

---

### [2026-05-08] Bug Fix + UI — HEIC 預覽修復 + 預覽區優化

```
- 角色：02_Developer + 04_UI_UX_Designer

- Bug：iPhone HEIC 檔案可分析但預覽不顯示
  - Root Cause：page.tsx 把原始 HEIC 直接給 URL.createObjectURL，
    但瀏覽器 <img> 不支援 HEIC，預覽渲染失敗
  - Fix：
    - imageAnalyzer.ts 抽出 getPreviewableBlob() helper（HEIC → JPEG 轉換）
    - 對外匯出供 page.tsx 使用
    - page.tsx 在生成 previewUrl 之前先呼叫 getPreviewableBlob()
    - analyzeImage 內部改用同一個 helper（清掉重複邏輯）

- UI：預覽區視覺優化（小圖左右大量空白問題）
  - 舊：h-52（208px）+ bg-gray-100 純色背景 + object-contain
        小圖（如 600×400）顯示偏小，左右是大塊白色
  - 新：h-64 sm:h-72（256/288px）
        + 模糊放大版圖片作為底層（blur-2xl scale-110 opacity-60）
        + 主圖在前 object-contain + drop-shadow-xl
        + 任何長寬比的圖都填滿區塊，模糊背景跟主圖色調呼應
  - 設計參考：Apple Music / Spotify 等 hero 區塊常用手法

- 技術債：無新增
```

---

### [2026-05-08] Refactor — 5 區塊評級審查（P1 + P2a）+ 新增 3 個印刷尺寸

```
- 角色：09_Senior_PM + 04_UI_UX_Designer + 02_Developer
- 觸發：用戶要求審查 5 區塊（解析度評級/最佳建議/最大可印/DPI 階梯/各印刷尺寸品質）
       是否有統一的評級系統與專業印刷分級標準

- 審查發現：
  - P1：詞彙系統重疊衝突 — 「優秀」「良好」在整圖層 vs 單尺寸層意義不同
  - P1：「可接受」標籤跟淡化 row 矛盾 — 用戶分不清能不能印
  - P2a：最佳建議 vs 最大可印 在某些圖會重疊冗餘
  - P2b：DPI 階梯表用詞範式跟其他不同（用途導向 vs 品質等級）→ 評估後保留現狀

- 修正內容（P1）：
  1. 整圖評級換詞，跟單尺寸層分流：
     - 優秀 → 頂級
     - 良好 → 高品質
     - 尚可 → 中等
     - 偏低 → 偏低（不變）
     - 不足 → 不足（不變）
  2. 計量條兩端：「不足 / 優秀」→ 「不足 / 頂級」
  3. 單尺寸 'acceptable' 標籤：可接受 → 勉強

- 修正內容（P2a）：
  - 最佳建議 == 最大可印 時合併為單一全寬卡片「建議印製尺寸」
  - 避免兩張卡片顯示同一個尺寸的訊息冗餘

- 新增 3 個印刷尺寸（按用戶指示）：
  - 悠遊卡貼 8.5×5.4 cm，minDpi 200（手持近看）
  - A7 標籤 7.4×10.5 cm，minDpi 200（產品標籤・遊戲卡牌）
  - A0 海報 84.1×118.9 cm，minDpi 60（大型工程圖・展示海報）
  - A8/A9/A10 微型標籤依用戶指示不加
  - getQuality() 的 bigFormats / lowFormats 同步更新

- 配套整理：
  - 全部 desc 更新為更貼近用戶習慣的描述
  - buildQualityLabel 移除「僅適合名片」特例，統一用「最高可印 X」
- 技術債：無新增
```

---

### [2026-05-08] Polish — 不足狀態移除「可接受」殘留 + AI 工具文案商業化（選項 2）

```
- 角色：09_Senior_PM + 02_Developer + 10_BD
- 兩個改動：

1. 「不足」狀態下「可接受」標籤殘留問題
   - 觸發：用戶 600×400 圖整體判「不足」，但「各印刷尺寸品質」名片 169 DPI 仍標「可接受」
   - Root Cause：
     - 「可接受」(0.6-1.0×minDpi) 緩衝層的存在前提是「至少有一個尺寸能印」
     - 全圖 noPrintable 時，再給「可接受」會跟主訊息「無法印任何標準尺寸」打架
   - Fix：在 ResultPanel 渲染時加 effectiveQuality
     noPrintable && printQuality === 'acceptable' → 'poor'
   - 效果：noPrintable 時所有尺寸統一顯示「不建議」，訊號完全一致

2. AI 放大工具文案商業化（評估後選方案 2）
   - 觸發：評估推薦 upscayl / waifu2x / Topaz Photo AI 對接單服務的影響
   - 結論：Topaz Photo AI 是付費競品（$199 美金），不該在站上免費曝光
   - Fix：
     舊：「推薦 upscayl / waifu2x / Topaz Photo AI（細節有極限）」
     新：「坊間有免費軟體可試做初步處理。複雜或商業用途，建議交給專業印刷廠處理。」
   - 商業效果：
     - 移除 Topaz 品牌曝光（攔下原本被截走的高意向客戶）
     - 加「商業用途交給專業」勾子，導回 LINE
     - 「商業」二字協助篩出付費客戶
- 技術債：無新增
```

---

### [2026-05-08] Refactor — DPI 階梯表「不足」狀態隱藏（方案 A，取代方案 B）

```
- 角色：09_Senior_PM
- 觸發：先前選方案 B 直接刪表，但用戶想保留給攝影/設計用戶（理論 DPI 階梯仍有意義）
- 決策變更：revert b6b0052（刪表 commit），改走方案 A
- 改動：
  - revert 4cad9b9：把 DpiLevel / calcDpiLevels / DPI_ROW / JSX / GSAP 全部還原
  - 在 JSX 外層包 {!noPrintable && ...}，「不足」狀態下不渲染整張表
- 效果：
  - 正常狀態（圖能印）：DPI 階梯表照常顯示，攝影/設計用戶仍可看反向參考
  - 不足狀態（無可印尺寸）：隱藏，避免跟主評級訊號矛盾
- 技術債：無新增（保留兩張表的維護負擔，trade-off 是給更多元用戶留有資訊）
```

---

### [2026-05-08] Bug Fix — 印刷尺寸品質階梯「優秀直接掉不建議」斷層

```
- 角色：02_Developer
- 觸發：用戶發現「各印刷尺寸品質」標籤從 優秀 → 不建議 之間沒有過渡
  例：A5 170 DPI 優秀 → A4 120 DPI 不建議（中間直接跳 4 階）
- Root Cause：
  - dpiToPrintQuality 只有兩種狀態：dpi < minDpi → poor / 達標 → 絕對分級
  - 缺少「接近 minDpi 但沒達」的中間警示帶
- Fix：兩段邏輯
  - dpi < 0.6×minDpi → poor（明顯不足）
  - dpi 0.6×–1.0× minDpi → acceptable（警示，仍 canPrint=false 淡化）
  - dpi ≥ minDpi → 絕對 DPI 分級（300+ excellent / 150+ good / 其他 fair）
- 驗證範例（1500×2750 圖）：
  - 修正前：極致 → 優秀×3 → 不建議×5
  - 修正後：極致 → 優秀×3 → 可接受×3 → 不建議×2（階梯平順）
- 視覺意義：
  - 「可接受」(orange) row 仍然淡化（canPrint=false），但給用戶警示而非全否決
  - 印刷廠老闆視角：客戶硬要印 A4 120 DPI，告訴他「勉強可接受」比「不建議」溫和但仍誠實
- 技術債：無新增
```

---

### [2026-05-08] UX Overhaul — 「不足」狀態完整重設計（選項 2）

```
- 角色：09_Senior_PM + 04_UI_UX_Designer + 14_Frontend_Engineer
- 觸發：用戶上傳 600×400 小圖，發現「不足」狀態 UX 全是矛盾與引導斷層
- 三大改動：
  1. 修「最佳建議」自相矛盾（P0）
     - getBestQualitySize 改為「先過 canPrint，再挑 dpi >= 1.5×minDpi 的最大尺寸」
     - 沒可印就回 null，不會再出現「最佳建議：名片（不建議）」這種荒謬輸出
  2. 摘要卡邏輯（P0/P1）
     - 全部尺寸都不可印時，2 欄摘要卡換成單張橘色診斷卡
     - 訊息明確：「這張圖無法印出標準尺寸」+ 為什麼 + 引導下方解決方案
  3. CTA 重設計（P1）
     - 原本「確認好尺寸了？讓我幫你印出來」+ 服務方案/LINE 詢價
     - 不足時換成「解析度不足，這樣解決」橘色卡片
     - 內含像素對照表（目前 vs 名片需求 vs A4 需求，以萬/百萬像素標示）
     - 3 條解決路徑（找原始檔 / 重新拍攝掃描 / AI 放大工具推薦）
     - LINE 按鈕文案改為「LINE 諮詢解決方案」
- 配套：
  - PrintSize interface 加 minDpi 欄（外部組件能讀，方便邏輯擴展）
  - 新增 pxNeeded / formatPx / formatMP 工具函式
- 設計原則：
  - 「不足」是 PrintSizer 最重要的場景（差異化賣點 = 攔下爛單）
  - 不在「不足」狀態推印刷下單 CTA，避免引導爛單進印刷廠
  - 給用戶具體可行的下一步，不是把用戶趕走
- 技術債：無新增
```

---

### [2026-05-05] Feature — 解析度評級加可展開「標準說明」（差異化賣點）

```
- 角色：04_UI_UX_Designer + 14_Frontend_Engineer
- 觸發：與業界（fineartprinting / posterprintshop）對比後，PrintSizer 採觀看距離分層、結果會不同
- 設計：
  - 「解析度評級」標籤改為可點擊按鈕（hover 變色），右側加 ℹ️ 圖示
  - 點擊展開灰底卡片：「為什麼有些網站給出不一樣的結果？」
  - 內容列出 4 個尺寸的觀看距離 + DPI 門檻邏輯
  - 結尾說明「其他工具用單一門檻會誤判」
- 目的：
  - 用戶交叉比對時不被結果差異困惑
  - 把「按觀看距離分層」這個差異化賣點顯性化
  - 強化專業形象，避免被誤認為「跟對手結果不同 = 工具不準」
- 技術債：無新增
```

---

### [2026-05-05] Bug Fix — 解析度評級標籤改為動態（反映實際最大可印尺寸）

```
- 角色：02_Developer
- 觸發：用戶 1536×2752 圖片實際最高印到 A3，但標籤寫「優秀 — 可印大型海報（A3 以上）」誤導
- Root Cause：
  - QUALITY_LABELS 是寫死的 Record<quality, string>
  - 'excellent' 等級涵蓋 A3 ~ 易拉展，但標籤只寫一句「A3 以上」
  - 用戶看到「A3 以上」會誤以為 A2/A1 也能印，實際 A2 可能未達 minDpi
- Fix：
  - 新增 QUALITY_TIER（純等級形容詞 map）+ buildQualityLabel(quality, largest)
  - 動態組「<等級> — 最高可印 <實際最大尺寸>」
  - 名片例外：「<等級> — 僅適合名片」
  - poor 例外：「不足 — 建議換更高畫質圖片」
- 範例：
  - 1536×2752 max=A3 → 優秀 — 最高可印 A3 海報（之前：可印大型海報 A3 以上）
  - 736×1087 max=名片 → 偏低 — 僅適合名片（不變）
  - 高解析度 max=易拉展 → 優秀 — 最高可印 易拉展
- 技術債：無新增
```

---

### [2026-05-05] Bug Fix — printQuality 標籤跟 canPrint 互打架

```
- 角色：02_Developer
- 觸發：用戶截圖顯示 A4 120 DPI 行已淡化但標籤仍寫「良好」、A3 85 DPI 寫「可接受」
- Root Cause：
  - dpiToPrintQuality() 還在用舊的絕對 DPI 階梯（≥150=good / ≥100=fair / ≥72=acceptable）
  - canPrint 已改用 size.minDpi
  - 兩條判斷各跑各的 → 視覺淡化（不可印）但標籤仍顯示正面評價
- Fix：dpiToPrintQuality 加 minDpi 參數，dpi < minDpi 時直接判 'poor'（不建議）
- 驗證範例：
  - A4 minDpi=150 dpi=120：120<150 → poor 不建議 ✓（原本誤標 良好）
  - A3 minDpi=120 dpi=85：85<120 → poor 不建議 ✓（原本誤標 可接受）
  - 達標尺寸（名片極致 / DM 優秀 / A6 優秀 / A5 優秀）標籤完全不變
- 技術債：無新增
```

---

### [2026-05-05] Polish — DPI 等級對照表標籤同步新邏輯

```
- 角色：02_Developer + 04_UI_UX_Designer
- 觸發：用戶反映「各品質等級最大可印尺寸」區塊未跟新 minDpi 邏輯同步
- Root Cause：
  - calcDpiLevels 沿用「優秀/良好/可接受品質」抽象標籤
  - 跟 PRINT_SIZES 的觀看距離分層概念脫鉤，可能讓用戶誤判
- Fix：
  - 300 DPI：極致品質（不變）
  - 150 DPI：優秀品質 → 傳單品質（A4 門檻）
  - 100 DPI：良好品質 → 海報品質（A2/A3 中距）
  - 72 DPI → 75 DPI：可接受品質 → 遠距品質（對齊 A1 minDpi）
  - 副標：「在不同 DPI 品質下的最大輸出尺寸」→「DPI 越低 → 可印越大但需越遠距離觀看」
- 驗證：TS pass，色票/欄位 key 不變，視覺布局無破壞
- 技術債：無新增
```

---

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
