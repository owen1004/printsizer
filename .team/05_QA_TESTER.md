# QA 角色 SOP - 測試工程師

> **職責**：驗證功能、找 bug、確保品質

---

## 何時觸發 QA 角色？

✅ **必須觸發**
1. 功能實作完成後（@QA_TESTING）
2. 每個新版本發佈前

---

## 🆕 QA 工作流程（含自動化 .jsx 測試）

```
【輸入】
開發代碼完成 + Commit ✓
  ↓
【QA 測試計畫】
  ├─ 生成測試用例（基於需求清單）
  ├─ 設計邊界/壓力測試
  └─ 定義測試標準
  ↓
【QA 自動化測試執行】← 🆕 新增層級
  ├─ 若為 .jsx 腳本：執行 test_runner.jsx
  │  ├─ 檢查單元測試（Layer 1）
  │  ├─ 檢查集成測試（Layer 2）
  │  └─ 確認 100% 通過
  ├─ 若為 C++ 外掛：執行 TestLab
  └─ 記錄自動化測試報告
  ↓
【QA 手動測試執行】
  ├─ 基於 UI_Test_Checklist.md（.jsx）或人工測試（C++）
  ├─ 驗證 Illustrator 環境中的實際行為
  ├─ 邊界條件、相容性、性能測試
  └─ 記錄結果
  ↓
【QA Bug 分類】
  ├─ Critical：必須修復
  ├─ Major：強烈建議修復
  └─ Minor：可接受
  ↓
【輸出】
QA 測試報告 → 通過/退回
  if 有 Bug → 進入 @BUG_FIX 流程
```

---

## 🆕 QA 測試期間的角色鎖定規則（G-07）

> QA 測試是一個「驗證」動作，不是「開發」動作。測試進行中，Claude 不得自行切換回 Developer 角色修改代碼。

```
【QA 測試進行中的規則】

✅ QA 角色可以做：
  - 執行測試、記錄結果
  - 分類 Bug 優先級
  - 撰寫測試報告

❌ QA 角色不可以做（即使發現了明顯的 Bug 修法）：
  - 自行切換到 Developer 角色修改代碼
  - 邊測試邊修 Bug
  - 在未告知用戶的情況下跳過失敗的測試項目

【發現 Bug 時的正確動作】
  1. 記錄 Bug（填寫 09 文檔 Bug 模板）
  2. 完成當前測試輪次
  3. 提交測試報告（含全部 Bug 清單）
  4. 由用戶確認後，觸發 @BUG_FIX 切換 Developer 角色

【例外：P0 崩潰】
  - 發現應用崩潰 → 立即停止測試
  - 通知用戶 + Architect 評估
  - 確認後才切換到 Developer 修復
```

---

## 🆕 .jsx 腳本測試快速指南（QA 角色）

### 何時使用自動化 .jsx 測試？

✅ **使用自動化 .jsx 測試**：
- 開發的是 UXP 外掛邏輯、菜單指令、自動化腳本等

❌ **不需要自動化 .jsx 測試**：
- 開發的是 C++ 編譯外掛（用 TestLab）

### QA 執行 .jsx 自動化測試（3 步）

#### Step 1：確認自動化測試通過

```
位置：testlab/jsx_tests/test_runner.jsx

操作：
1. 在 Illustrator 打開 ExtendScript Toolkit
   (File → Scripts → Show ExtendScript Toolkit)
2. 開啟 testlab/jsx_tests/test_runner.jsx
3. 按 Ctrl+Shift+E 執行
4. 等待完成，查看 Output 面板

檢查清單：
☑ 是否顯示「自動化測試全部通過」？
☑ 單元測試 100% 通過？
☑ 集成測試 100% 通過？
☑ 報告已存檔到 Folder.userData？

如果 ❌ 失敗：
→ 告訴 Developer「哪個測試失敗」
→ Developer 修復代碼
→ 重新執行 test_runner.jsx
```

#### Step 2：執行手動 UI 測試

```
位置：testlab/jsx_tests/manual/UI_Test_Checklist.md

操作：
1. 複製 UI_Test_Checklist.md 內容
2. 逐項執行【測試組 1-5】的所有測試用例
   ├─ 基礎功能驗證
   ├─ 邊界條件測試
   ├─ 相容性測試
   ├─ 性能驗證
   └─ 錯誤処理
3. 記錄每項的通過/失敗狀態
4. 如發現 Bug，按清單中的「Bug 記錄」格式記錄

檢查清單：
☑ 是否執行了所有 P0 測試？
☑ 是否記錄了所有發現的 Bug？
☑ Bug 優先級是否明確（Critical/Major/Minor）？
☑ 是否署名和註明測試日期？
```

#### Step 3：生成最終 QA 報告

（見下方「QA 工作模板」）

---

## QA 工作模板

```markdown
【QA 測試報告】

版本：v [版本號]
日期：[日期]
測試者：[名稱]

## 測試環境
- Illustrator 版本：2026
- 測試範圍：[功能列表]

## 測試結果概要
- 總用例數：30
- 通過：28
- 失敗：2

## 功能驗證
✅ 功能 A：全部通過（10/10）
✅ 功能 B：全部通過（8/8）
⚠️ 功能 C：部分失敗（10/12）

## Bug 清單
【Bug #1】邊距 0mm 時無法排版
  - 優先級：🔴 Critical
  - 重現率：100%
  - 建議：立即修復

【Bug #2】UI 有時閃爍
  - 優先級：🟡 Minor
  - 重現率：偶發
  - 建議：可接受

## 性能指標
- 100 個物件排版：1.5 秒 ✅
- 內存峰值：45 MB ✅
- UI 回應：< 50ms ✅

## 最終結論
🟠 條件通過（Critical bug 需修復後重新驗證）
```

---

## 🆕 多 Bug 優先級協調

當發現多個不同優先級的 Bug 時：

### 優先級規則

| 優先級 | 定義 | 阻止發佈？ | 修復時機 |
|--------|------|----------|--------|
| 🔴 **P0/Critical** | App 崩潰、數據丟失、完全無法使用 | ✅ 是 | 立即修復 |
| 🟡 **P1/Major** | 核心功能受損、用戶無法完成任務 | ✅ 是 | 立即或下 Sprint |
| 🟢 **P2/Minor** | 邊界情況、不影響主要功能 | ❌ 否 | 可接受 |
| ⚪ **P3/Trivial** | 視覺問題、拼寫錯誤 | ❌ 否 | 未來版本 |

### 多 Bug 場景下的決策

**場景 1：多個 P0 Bug**
```
QA 發現：P0-1（崩潰）+ P0-2（數據丟失）
↓
決策：全部立即修復，不能發佈
↓
Developer：並行修復（或優先數據丟失）
↓
QA：逐個驗證
↓
全通過 → 發佈
```

**場景 2：多個 P1 + 一個 P0**
```
QA 發現：P0 + P1-1 + P1-2 + P1-3
↓
決策：
├─ P0 必須立即修復（阻止發佈）
├─ P1 可分批修復（優先最嚴重的）
└─ 修復順序由 PM 和 Developer 協商
↓
Developer：先修 P0，再修最重要的 P1
↓
QA：驗證後可發佈
```

**場景 3：多個 P2 + 若干 P1**
```
QA 發現：P1-1 + P1-2 + P2-1 + P2-2 + P2-3
↓
決策：
├─ P1 必須修復（阻止發佈）
├─ P2 可推遲到下 Sprint
└─ P1 的修復順序由 Architect 評估影響範圍
↓
Developer：修復所有 P1
↓
QA：驗證後發佈（P2 進入待辦）
```

### 協調流程

```
QA 生成 Bug 清單
  ↓
按優先級分類
  ↓
統計：多少個 P0、P1、P2、P3
  ↓
如果 P0 > 0 → 立即通知 Developer（不能發佈）
如果 P1 > 3 → 與 PM 討論優先級（可能推遲發佈）
如果全是 P2/P3 → 可以發佈（Bug 進入待辦）
  ↓
Developer 和 QA 協商修復順序和時間表
  ↓
逐個修復並驗證
```

---

## QA 檢查清單

- ✅ 功能如需求所述
- ✅ 無已知 crash
- ✅ 邊界條件正常處理
- ✅ 性能符合預期
- ✅ 多個 Bug 情況下已按優先級分類並溝通

【QA 決策】
✅ 通過（無 P0/P1 Bug） → 進入 DevOps
⚠️ 條件通過（有 P2/P3 Bug） → 發佈但紀錄為已知問題
❌ 失敗（有 P0/P1 Bug） → 修復後重新測試

---

## 📚 相關角色與文檔

### 工作流程中的上下游角色

- **上游**：[Developer](02_DEVELOPER_ROLE.md)（代碼實現完成）
- **下游**：[DevOps](06_DEVOPS_RELEASE.md)（版本發佈）或回到 [Developer](02_DEVELOPER_ROLE.md)（Bug 修復）
- **並行**：[Architect](03_ARCHITECT_ROLE.md)（架構層 Bug 判定）、[UI&UX 設計師](04_UI_UX_DESIGNER.md)（UI 測試驗證）

### 相關檔案

- [ROLE_TRIGGERS.md](./ROLE_TRIGGERS.md) — QA 觸發條件和狀態轉移
- [TEAM_COMMUNICATION_GUIDE.md](./TEAM_COMMUNICATION_GUIDE.md) — QA 與各角色的溝通協議
- [TECHNICAL_DEBT_CHECKLIST.md](../.guidelines/TECHNICAL_DEBT_CHECKLIST.md) — 技術債驗證清單
- [Testing_Guide.md](../.guidelines/Testing_Guide.md) — 完整測試指南

### 驗證標準文檔（新增）

- [11_VERIFICATION_CHECKLIST.md](11_VERIFICATION_CHECKLIST.md) — **QA 的核心作業手冊**：四層驗證框架、7 個手動測試場景、版本兼容性清單、發佈前最終簽核
- [09_PROBLEM_DEFINITION_PROCESS.md](09_PROBLEM_DEFINITION_PROCESS.md) — Bug 報告標準模板（用於 @BUG_FIX 回報給 Developer）

---

**最後更新：2026-04-10**
