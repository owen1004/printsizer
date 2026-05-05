# 開發規範、規則、流程步驟位置與對應文件

> **用途**：快速查詢開發規範、規則、流程的記錄位置
> **日期**：2026-04-10

---

## 📍 開發規範位置對應表

### 1️⃣ 代碼規範 (Coding Standards)

**位置**：`.guidelines/Coding_Standards.md`

**包含內容**：
- C++ 命名規範
- 代碼結構與組織
- 注釋標準
- 錯誤處理要求
- 性能考量指南
- 代碼審查檢查清單

**何時查詢**：開始寫代碼前、進行代碼審查時

---

### 2️⃣ 測試規範 (Testing Standards)

**位置**：`.guidelines/Testing_Guide.md`

**包含內容**：
- 測試層級定義（Unit / Integration / E2E）
- 測試用例設計方法
- 測試環境設置
- 測試覆蓋率指標
- 測試檢查清單

**何時查詢**：QA 階段、設計測試用例時

---

### 3️⃣ SDK 與 API 規範

**位置**：`.guidelines/Illustrator_SDK_Reference.md`

**包含內容**：
- 常用 SDK API 快速參考
- 座標系統說明
- 物件模型與層級
- 最佳實踐與常見陷阱
- 版本相容性注意

**何時查詢**：調用 Illustrator API 時、設計座標系統時

---

### 4️⃣ 環境配置規範

**位置**：`.guidelines/Illustrator_Paths.md`

**包含內容**：
- Illustrator 2021 / 2026 安裝路徑
- SDK 位置
- 外掛部署目錄
- 部署前檢查清單

**何時查詢**：設置開發環境、部署外掛時

---

### 5️⃣ 全域行為規範 (私人指令)

**位置**：`C:\Users\Powen\.claude\CLAUDE.md`

**包含內容**：
- 語言與溝通規範（繁體中文、簡潔直接）
- 代碼風格（最小改動、不做未要求的重構）
- 工具使用規範（優先專用工具）
- 安全規範（不提交 secrets、不繞過 hooks）

**何時查詢**：與 Claude 協作時遵循

---

## 🔄 開發流程步驟位置對應表

### 1️⃣ 整體流程架構

**位置**：`.team/ROLE_TRIGGERS.md`

**包含內容**：
```
【開發流程狀態機】
PM 分析 → Architect 審核 → Dev 實作 → QA 測試 → DevOps 部署 → Doc 同步
    ↑                                        ↓
    └─ Bug 發現 ──── Bug Fix ───── 重回 QA ─┘
```

**細節**：
- 完整狀態轉移圖
- 各角色觸發條件
- 並行與阻斷規則
- 防線機制（Architect 中途介入）

**何時查詢**：了解整體流程、追蹤當前進度時

---

### 2️⃣ 指令識別與執行機制

**位置**：`.team/INSTRUCTION_PARSER.md`

**包含內容**：
```
【指令識別流程】
用戶輸入 → 掃描 @CODE → 識別角色 → 檢查前置 → 激活角色 → 執行工作流
    ↓
    非標準化 → Translator 分析 → 確認 → 轉化為 @CODE
```

**細節**：
- 指令掃描規則
- 非標準化檢測（模糊詞彙、口語化、隱含意圖）
- Translator 自動介入流程
- 自動回應格式定義
- 指令解析邏輯（Pseudo Code）
- 並發衝突處理
- 錯誤恢復與降級

**何時查詢**：用戶發出非標準化指令時、理解 Translator 機制時

---

### 3️⃣ 各角色工作流步驟

**位置**：`.team/0X_[ROLE].md` （6 個 SOP 文件）

| 角色 | 文件 | 工作流步驟 |
|------|------|----------|
| **PM** | `01_PM_PRODUCT_MANAGER.md` | 需求分析 → 功能評估 → 工時估算 → 用戶確認 |
| **Developer** | `02_DEVELOPER_ROLE.md` | Architect 通過 → 代碼實作 → git commit → 代碼完成 |
| **Architect** | `03_ARCHITECT_ROLE.md` | 架構分析 → 風險評估 → 決策記錄 → 審核報告 |
| **UI&UX 設計師** | `04_UI_UX_DESIGNER.md` | 設計需求分析 → UI 原型 → UX 流程設計 → 設計審核 |
| **QA** | `05_QA_TESTER.md` | 測試計畫 → 測試執行 → Bug 分類 → 測試報告 |
| **DevOps** | `06_DEVOPS_RELEASE.md` | 編譯檢查 → 部署前檢查 → 版本號管理 → 部署執行 → 驗證 |
| **DocManager** | `07_DOC_MANAGER.md` | 文檔檢查 → 文檔更新 → 一致性檢查 → 提交備份 |
| **Translator** | `08_TRANSLATOR_ROLE.md` | 關鍵詞掃描 → 意圖分析 → 確認理解 → 轉化為 @CODE |

**何時查詢**：進入某個角色階段時、了解該角色具體工作時

---

### 4️⃣ 指令代碼與觸發條件

**位置**：`QUICK_COMMANDS.md` + `.team/ROLE_TRIGGERS.md`

| 指令 | 觸發角色 | 前置條件 | 後置狀態 |
|------|--------|--------|--------|
| `@NEW_FEATURE` | PM | 無 | 需求分析報告 ✓ |
| `@ARCHITECT_REVIEW` | Architect | PM 完成 | 架構審核報告 ✓ |
| `@ARCHITECT_INTERVENTION` | Architect | 開發中發現問題 | 風險評估報告 ✓ |
| `@START_DEVELOPMENT` | Developer | Architect 通過 | Code Commit ✓ |
| `@BUG_FIX` | Developer | QA 發現 Bug | Bug 修復 Commit ✓ |
| `@QA_TESTING` | QA | Code Commit 完成 | 測試報告 ✓ |
| `@DEVOPS_DEPLOY` | DevOps | QA 通過 | 部署完成 ✓ |
| `@DOC_SYNC` | DocManager | DevOps 完成 | 文檔同步 ✓ |
| `@STATUS_CHECK` | PM | 任何時刻 | 進度報告 |
| `@ADD_DECISION` | PM | 做出決策時 | 決策記錄入 DECISIONS.md |

**何時查詢**：不確定用什麼指令時、查詢指令要求時

---

## 🔀 新專案開發流程對應確認

### 完整流程步驟

```
【步驟 1】用戶提出需求或指令
  ↓
【步驟 2】Translator 自動檢測（INSTRUCTION_PARSER.md 規則）
  ├─ 掃描 @CODE 格式
  ├─ 識別關鍵詞
  └─ 檢測非標準化輸入
  ↓
【步驟 3】指令解析 & 角色激活
  ├─ 若是 @NEW_FEATURE → 激活 【PM 角色】
  ├─ 若是 @ARCHITECT_REVIEW → 激活 【Architect 角色】
  ├─ 若是 @START_DEVELOPMENT → 進入 【Dev 實作】
  ├─ 若是 @QA_TESTING → 激活 【QA 角色】
  ├─ 若是 @DEVOPS_DEPLOY → 激活 【DevOps 角色】
  ├─ 若是 @DOC_SYNC → 激活 【DocManager 角色】
  └─ 若非標準化 → 【Translator 介入】分析 + 確認 + 轉化
  ↓
【步驟 4】檢查前置條件（ROLE_TRIGGERS.md 中的矩陣）
  ├─ 前置條件滿足 → 繼續執行
  ├─ 前置條件未滿足 → 提示用戶 + 建議下一步
  └─ 有依賴衝突 → 執行阻斷或調整順序
  ↓
【步驟 5】角色執行標準工作流（對應 SOP 文件）
  ├─ PM: 執行需求分析 → 產出【PM 需求分析報告】
  ├─ Architect: 執行架構設計 → 產出【Architect 審核報告】
  ├─ Dev: 編寫代碼 → 執行 git commit
  ├─ QA: 執行測試 → 產出【QA 測試報告】
  ├─ DevOps: 執行編譯部署 → 產出【DevOps 部署報告】
  └─ DocManager: 同步文檔 → 產出【Doc Manager 同步報告】
  ↓
【步驟 6】產生交付物 (根據角色定義)
  ├─ 報告文檔
  ├─ Git Commit
  ├─ 版本標籤
  └─ 狀態轉移信息
  ↓
【步驟 7】狀態轉移（ROLE_TRIGGERS.md 狀態機）
  ├─ ✅ 成功 → 自動轉移至下一角色
  │         （或詢問用戶下一步）
  │
  ├─ ⚠️ 條件通過 → 進入特殊狀態
  │              （如 QA 通過但需修復 Critical Bug）
  │
  ├─ ❌ 失敗 → 返回前一步或進入 Bug Fix
  │           例：QA 失敗 → @BUG_FIX → Dev 修復 → 重回 QA
  │
  └─ 🛑 無法判斷 → 詢問用戶確認
  ↓
【步驟 8】循環（返回步驟 2）直到發佈完成
  ├─ 若有新 Bug → 進入 @BUG_FIX 迴路
  ├─ 若有設計變動 → 觸發 @ARCHITECT_INTERVENTION
  └─ 若全部完成 → 發佈完成 ✓
```

---

## ✅ 流程與規範對應檢查清單

### 規範檢查

- [x] **代碼規範** → `.guidelines/Coding_Standards.md`
- [x] **測試規範** → `.guidelines/Testing_Guide.md`
- [x] **SDK 規範** → `.guidelines/Illustrator_SDK_Reference.md`
- [x] **環境規範** → `.guidelines/Illustrator_Paths.md`
- [x] **全域規則** → `C:\Users\Powen\.claude\CLAUDE.md`

### 流程檢查

- [x] **整體狀態機** → `.team/ROLE_TRIGGERS.md`
- [x] **指令識別機制** → `.team/INSTRUCTION_PARSER.md`
- [x] **PM 工作流** → `.team/01_PM_PRODUCT_MANAGER.md`
- [x] **Developer 工作流** → `.team/02_DEVELOPER_ROLE.md`
- [x] **Architect 工作流** → `.team/03_ARCHITECT_ROLE.md`
- [x] **UI&UX 設計師工作流** → `.team/04_UI_UX_DESIGNER.md`
- [x] **QA 工作流** → `.team/05_QA_TESTER.md`
- [x] **DevOps 工作流** → `.team/06_DEVOPS_RELEASE.md`
- [x] **DocManager 工作流** → `.team/07_DOC_MANAGER.md`
- [x] **Translator 工作流** → `.team/08_TRANSLATOR_ROLE.md`

### 指令檢查

- [x] **15 個 @CODE 指令** → `QUICK_COMMANDS.md`
- [x] **指令觸發條件** → `.team/ROLE_TRIGGERS.md` 中的矩陣表
- [x] **指令解析邏輯** → `.team/INSTRUCTION_PARSER.md`

---

## 🎯 流程一致性驗證

### 我們討論的流程

```
用戶指令 → 識別 & 分類 → Translator 確認
  ↓
激活對應角色 → 執行工作流 → 產出交付物
  ↓
狀態轉移 → 進入下一角色
  ↓
成功完成 → 發佈
```

### 範本中實現的流程

```
【用戶指令】
  ↓
【Translator 檢測】(持續背景，自動運行)
  ├─ @CODE 掃描（INSTRUCTION_PARSER.md 規則 1）
  ├─ 關鍵詞匹配（INSTRUCTION_PARSER.md 規則 2）
  └─ 模糊/口語化檢測（INSTRUCTION_PARSER.md 規則 3-4）
  ↓
【指令解析】
  ├─ 標準化 @CODE → 直接激活角色
  └─ 非標準化 → Translator 分析 + 確認 → 轉化為 @CODE
  ↓
【角色激活】(ROLE_TRIGGERS.md 觸發條件矩陣)
  ├─ 檢查前置條件
  ├─ 檢查阻斷規則
  └─ 激活對應角色工作流
  ↓
【角色工作流執行】(各角色 SOP 文件)
  ├─ 執行標準化工作流
  ├─ 產生報告/交付物
  └─ 準備狀態轉移
  ↓
【狀態轉移】(ROLE_TRIGGERS.md 狀態機)
  ├─ ✅ 通過 → 轉移至下一角色
  ├─ ⚠️ 條件通過 → 特殊處理
  ├─ ❌ 失敗 → 進入 Bug Fix 迴路
  └─ 🛑 無法判斷 → 詢問用戶
  ↓
【循環】直到發佈完成
```

### ✅ 一致性驗證結果

| 要素 | 我們討論 | 範本中 | 一致性 |
|------|--------|--------|--------|
| 用戶指令識別 | ✓ | INSTRUCTION_PARSER.md | ✅ |
| Translator 自動檢測 | ✓ | INSTRUCTION_PARSER.md | ✅ |
| 非標準化轉化 | ✓ | 08_TRANSLATOR_ROLE.md | ✅ |
| 角色激活 | ✓ | ROLE_TRIGGERS.md | ✅ |
| 工作流執行 | ✓ | 各角色 SOP | ✅ |
| 狀態轉移 | ✓ | ROLE_TRIGGERS.md 狀態機 | ✅ |
| Bug 修復迴路 | ✓ | ROLE_TRIGGERS.md | ✅ |
| 防線機制 | ✓ | 03_ARCHITECT_ROLE.md | ✅ |
| 並行 / 阻斷規則 | ✓ | ROLE_TRIGGERS.md | ✅ |
| 交付物定義 | ✓ | 各角色 SOP 模板 | ✅ |

**結論**：✅ **完全一致** - 範本實現了我們討論的所有流程機制

---

**最後更新**：2026-04-10
