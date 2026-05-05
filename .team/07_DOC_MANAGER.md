# Doc Manager 角色 SOP - 文檔管理員

> **職責**：文檔同步、知識存檔、版本記錄

---

## 何時觸發 Doc Manager 角色？

✅ **必須觸發**
1. DevOps 部署完成後（@DOC_SYNC）
2. 每個新版本發佈時

---

## 🆕 Doc Manager vs 修改管理流程的分工（G-03）

> 兩個流程都涉及文檔更新，以下明確定義各自負責的範圍，避免重複或遺漏。

| 文檔 | 誰負責 | 時機 |
|------|--------|------|
| **commit 訊息** | 修改管理流程（10 文檔）| 每次代碼提交時 |
| **技術修改回顧**（學到什麼、踩了什麼坑）| 修改管理流程（10 文檔 Stage 6）| 修改完成後立即記錄 |
| **CHANGELOG.md** | Doc Manager | 部署完成後 |
| **README.md** | Doc Manager | 部署完成後（面向用戶的說明）|
| **ARCHITECTURE.md** | Doc Manager | 架構有變動時 |
| **DECISIONS.md** | Architect 角色記錄初稿，Doc Manager 格式化 | 有重要技術決策時 |
| **DEVELOPMENT_LOG.md** | Doc Manager | 每個版本發佈後 |

**簡單記憶**：
- 修改管理流程（10 文檔）→ **技術內部筆記**（給開發者看的）
- Doc Manager → **面向未來的正式文檔**（給人看的、留存的）

---

## Doc Manager 工作流程

```
【輸入】
部署成功 ✓
  ↓
【Step 1】檢查需更新的文檔（Doc Manager 負責範圍）
  ├─ README.md（新增功能說明 → 面向用戶）
  ├─ ARCHITECTURE.md（架構變更 → 面向未來開發者）
  ├─ CHANGELOG.md（版本記錄 → 面向所有人）
  ├─ DECISIONS.md（格式化 Architect 的決策初稿）
  └─ DEVELOPMENT_LOG.md（進度更新）
  ↓
【Step 2】自動生成/更新文檔
  ├─ 基於 commit 歷史
  ├─ 基於版本號
  └─ 基於功能清單
  ↓
【Step 3】文檔一致性檢查
  ├─ 版本號對齐
  ├─ 沒有過時的參考
  └─ 示例代碼正確
  ↓
【Step 4】提交與備份
  ├─ git commit（文檔更新）
  └─ git tag（版本標籤）
  ↓
【輸出】
文檔同步完成 ✓ → 版本發佈完成
```

---

## Doc Manager 工作模板

```markdown
【Doc Manager 同步報告】

版本：v [版本號]
日期：[日期]

## 檢查的文檔清單
✅ README.md：新增「排版引擎」功能說明
✅ ARCHITECTURE.md：新增「排版模組」架構圖
✅ CHANGELOG.md：記錄 v [版本號] 新功能
✅ DECISIONS.md：記錄「座標系統統一」決策
✅ DEVELOPMENT_LOG.md：更新進度為「已發佈」

## 文檔更新詳情
- README.md：+10 行（功能說明）
- ARCHITECTURE.md：+5 行（模組圖）
- CHANGELOG.md：+8 行（版本記錄）

## 一致性檢查
✅ 版本號對齐（所有地方都是 v [版本號]）
✅ 沒有過時的參考
✅ 示例代碼正確

## 提交與備份
✅ git commit：「docs: update for v [版本號]」
✅ git tag：「v [版本號]」

【同步狀態】
🟢 文檔同步完成！
```

---

## 五份核心文檔

### 1. README.md
- 工具名稱、核心功能
- 安裝指南、快速開始
- 已知限制

### 2. ARCHITECTURE.md
- 系統架構、模組劃分
- 數據流、關鍵設計決策
- 座標系統說明

### 3. CHANGELOG.md
- 每個版本的新增功能、Bug 修復、改動
- 格式：## v X.Y.Z (日期)

### 4. DECISIONS.md
- 所有重要技術決策的記錄
- 格式：## Decision #N：決策主題

### 5. DEVELOPMENT_LOG.md
- 當前開發進度（百分比、Phase、待辦項）
- 已知問題、修復狀態
- 預計完成日期

---

## Doc Manager 檢查清單

- ✅ 所有文檔已檢查
- ✅ 版本號對齐
- ✅ 沒有過時的內容
- ✅ 示例代碼正確
- ✅ commit & tag 完成

【Doc Manager 決策】
✅ 文檔同步完成 → 版本發佈完成
❌ 發現問題 → 修正後重新提交

---

## 📚 相關角色與文檔

### 工作流程中的上游角色

- **上游**：[DevOps](06_DEVOPS_RELEASE.md)（版本發佈完成）

### 維護的關鍵文檔

- [CHANGELOG.md](../CHANGELOG.md) — 版本更新記錄
- [DECISIONS.md](../DECISIONS.md) — 決策記錄
- [ARCHITECTURE.md](../.project/ARCHITECTURE.md) — 架構文檔
- [DEVELOPMENT_LOG.md](../.project/DEVELOPMENT_LOG.md) — 開發進度日誌

### 相關檔案

- [ROLE_TRIGGERS.md](./.team/ROLE_TRIGGERS.md) — Doc Manager 觸發條件和狀態轉移
- [TEAM_COMMUNICATION_GUIDE.md](./.team/TEAM_COMMUNICATION_GUIDE.md) — Doc Manager 與各角色的溝通協議

---

**最後更新：2026-04-10**
