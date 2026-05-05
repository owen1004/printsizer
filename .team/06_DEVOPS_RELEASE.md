# DevOps 角色 SOP - 發佈工程師

> **職責**：編譯、部署、版本管理

---

## 何時觸發 DevOps 角色？

✅ **必須觸發**
1. QA 測試通過後（@DEVOPS_DEPLOY）
2. 準備發佈新版本時

---

## DevOps 工作流程

```
【輸入】
QA 通過 ✓
  ↓
【Step 1】編譯檢查
  ├─ MSBuild Release 配置
  ├─ 確認無警告
  └─ AIP 檔案生成 ✓
  ↓
【Step 2】部署前檢查清單
  ├─ ⚠️ Illustrator 已關閉？
  ├─ ✅ AIP 檔案未被鎖定？
  └─ ✅ 外掛目錄可寫？
  ↓
【Step 3】版本號管理
  └─ 遞進版本（Semantic Versioning）
  ↓
【Step 4】一鍵部署
  ├─ Copy AIP → 外掛目錄
  ├─ 更新版本號
  └─ commit & tag
  ↓
【輸出】
部署成功確認 → 進入 Doc Manager
```

---

## DevOps 工作模板

```markdown
【DevOps 部署報告】

版本：v [新版本號]
日期：[日期]

## 編譯檢查
✅ Release 編譯成功
✅ 無警告信息
✅ AIP 檔案已生成

## 部署前檢查清單
✅ Illustrator 已關閉
✅ AIP 檔案未被鎖定
✅ 外掛目錄可寫

## 版本號管理
舊版本：v [舊]
新版本：v [新]
變化類型：[Major / Minor / Patch]

## 部署執行
✅ Copy AIP 到外掛目錄
✅ 更新版本號
✅ git commit & tag

## 驗證
✅ Illustrator 啟動正常
✅ 外掛加載成功
✅ 無 error log

【部署狀態】
🟢 部署成功！
```

---

## 版本號管理（Semantic Versioning）

```
v MAJOR.MINOR.PATCH

v1.0.0  → v1.1.0  (新增功能 = Minor 版本)
v1.1.0  → v1.1.1  (Bug 修復 = Patch 版本)
v1.1.1  → v2.0.0  (架構改變 = Major 版本)
```

---

## DevOps 檢查清單

- ✅ 編譯成功，無警告
- ✅ 部署前檢查清單全部通過
- ✅ 版本號正確遞進
- ✅ 部署驗證成功

【DevOps 決策】
✅ 部署完成 → 進入 Doc Manager
❌ 部署失敗 → 診斷並修復

---

## 📚 相關角色與文檔

### 工作流程中的上下游角色

- **上游**：[QA 測試工程師](05_QA_TESTER.md)（測試通過確認）
- **下游**：[Doc Manager](07_DOC_MANAGER.md)（文檔同步）

### 相關檔案

- [ROLE_TRIGGERS.md](./ROLE_TRIGGERS.md) — DevOps 觸發條件和狀態轉移
- [TEAM_COMMUNICATION_GUIDE.md](./TEAM_COMMUNICATION_GUIDE.md) — DevOps 與各角色的溝通協議
- [CHANGELOG.md](../CHANGELOG.md) — 版本發佈記錄

### 發佈管理標準文檔（新增）

- [10_CHANGE_MANAGEMENT_PROCESS.md](10_CHANGE_MANAGEMENT_PROCESS.md) — **部署操作手冊**：備份計畫、回滾流程、Hotfix 快速通道、CI/CD Pipeline
- [11_VERIFICATION_CHECKLIST.md](11_VERIFICATION_CHECKLIST.md) — **發佈前簽核清單**：最終檢查、事後監控、用戶反饋收集

---

**最後更新：2026-04-10**
