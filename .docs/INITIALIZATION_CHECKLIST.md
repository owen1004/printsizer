# 自動化初始化檢查清單 - Initialization Checklist

> **用途**：確保新專案的完整自動化初始化
> **適用**：每次開啟新專案時
> **預計時間**：5 分鐘全自動

---

## 📋 完整自動化流程

### 用戶端操作（2 步）

```
【Step 1】複製範本資料夾
  └─ 複製 Illustrator-Tool-Template
  └─ 改名（如 Illustrator-LayoutEngine）

【Step 2】打開新 Claude Code 對話，發送
  └─ 拖入 START_HERE.md
  └─ 或直接發送：@AUTO_INIT
```

---

### Claude Code 自動化處理（3 步）

```
【Step 1】檢測並讀取
  ✅ 檢測到 START_HERE.md
  ✅ 自動讀取文件內容
  ✅ 識別 @AUTO_INIT 指令

【Step 2】自動執行初始化
  ✅ 掃描專案結構
  ✅ 驗證必要文件存在
  ✅ 啟動 @SETUP_LOGGING
     ├─ 詢問專案路徑
     ├─ 自動修改 monitor.bat
     └─ 生成代碼配置片段
  ✅ 載入八角色規則
  ✅ 載入指令識別系統

【Step 3】啟動開發準備
  ✅ 讀取 QUICK_COMMANDS.md
  ✅ 展示可用指令
  ✅ 進入 PM 角色
  ✅ 提示「準備開始新功能開發」
```

---

## ✅ 自動化初始化檢查清單

### Phase 1️⃣ : 環境準備（自動）

- [ ] ✅ 檢測到 START_HERE.md
- [ ] ✅ 讀取 PROJECT_INFO.txt
- [ ] ✅ 檢測專案名稱
- [ ] ✅ 掃描 tools/ 目錄
  - [ ] ✅ monitor.bat 存在
  - [ ] ✅ monitor_advanced.bat 存在
  - [ ] ✅ monitor_multi.bat 存在

---

### Phase 2️⃣ : 日誌系統初始化（自動化詢問）

```
【自動提問】
❓ 你的專案路徑是？
   你回答：S:\Illustrator-LayoutEngine

❓ debug.log 檔案位置？
   你回答：Y（使用預設）或 N（自訂）

【自動執行】
✅ monitor.bat 已更新
✅ monitor_advanced.bat 已更新
✅ monitor_multi.bat 已更新
✅ 代碼配置片段已生成
```

**檢查清單**：
- [ ] ✅ LOG_PATH 已修改
- [ ] ✅ debug.log 檔案創建
- [ ] ✅ 路徑一致性驗證通過

**用戶要做的**：
- [ ] 📋 複製生成的代碼片段到你的源代碼

---

### Phase 3️⃣ : 規則系統初始化（自動）

```
【自動載入】
✅ 讀取 .team/ 目錄的 11 個角色與流程文件
✅ 讀取 ROLE_TRIGGERS.md（角色觸發條件）
✅ 讀取 INSTRUCTION_PARSER.md（指令識別系統）
✅ 讀取 .guidelines/ 的開發規範
✅ 索引 .library/FUNCTION_RESOURCE_MAP.md（代碼複用資源）
```

**檢查清單**：
- [ ] ✅ 8 個角色規則已載入（+ 3 個流程文件）
- [ ] ✅ .library/ 代碼複用系統已索引
- [ ] ✅ 指令識別系統就緒
- [ ] ✅ Translator 角色已初始化

---

### Phase 4️⃣ : 開發環境準備（自動）

```
【自動掃描】
✅ 檢查 .project/ 目錄
   ├─ ARCHITECTURE.md（空模板）
   ├─ PROJECT_SCOPE.md（空模板）
   ├─ DEVELOPMENT_LOG.md（空模板）
   ├─ DECISIONS.md（空模板）
   └─ CHANGELOG.md（空模板）

✅ 檢查 .guidelines/ 目錄
   ├─ Coding_Standards.md
   ├─ Testing_Guide.md
   ├─ Log_Standards.md
   └─ 其他規範文件

✅ 檢查 tools/ 工具目錄
   ├─ Monitor 工具已就緒
   └─ 可供人工測試使用
```

**檢查清單**：
- [ ] ✅ 空模板檔案已偵測
- [ ] ✅ 開發規範已就緒
- [ ] ✅ 工具已準備

---

### Phase 5️⃣ : 團隊啟動（自動）

```
【自動激活】
✅ 【PM 角色】已激活
   └─ 準備進行新功能分析
   
✅ 【其他 7 個角色】待命
   ├─ Architect（等待 @ARCHITECT_REVIEW）
   ├─ UI&UX 設計師（等待 @UX_DESIGN）
   ├─ Developer（等待 @START_DEVELOPMENT）
   ├─ QA（等待 @QA_TESTING）
   ├─ DevOps（等待 @DEVOPS_DEPLOY）
   └─ DocManager（等待 @DOC_SYNC）

✅ 【Translator】在後台持續監聽
   └─ 自動識別非標準化輸入並轉化

✅ 【所有角色】隨時可用
   └─ 發送對應 @CODE 即刻激活
```

**檢查清單**：
- [ ] ✅ PM 角色已激活
- [ ] ✅ 其他角色已待命
- [ ] ✅ Translator 自動識別就緒

---

## 🎯 完整初始化完成時的狀態

### 你會看到的提示

```
【自動化初始化完成】

✅ 專案環境已準備
✅ 日誌系統已配置
✅ 開發規範已載入
✅ 八角色團隊已就位

【PM 角色 已激活】

準備開始新功能開發？

下一步：
1. 告訴我要開發什麼功能
2. 或發送 @NEW_FEATURE 指令

或查詢幫助：
- 快速指令：@QUICK_COMMANDS
- 常見問題：@FAQ
```

---

## 📞 初始化後的操作

### 立即可用的指令

| 指令 | 作用 |
|------|------|
| `@NEW_FEATURE` | 開始新功能開發 |
| `@STATUS_CHECK` | 查詢當前狀態 |
| `@QUICK_COMMANDS` | 查看快速命令 |
| `@SETUP_LOGGING` | 重新配置日誌（如需要） |

### 人工測試準備

初始化完成後，人工測試前：

```
【Step 1】複製代碼配置片段
  └─ 生成的 Logger 初始化代碼
  └─ 貼到你的源代碼

【Step 2】編譯外掛
  └─ 產生 AIP 檔案

【Step 3】準備人工測試
  └─ 雙擊 tools/monitor_advanced.bat
  └─ 窗口變綠，開始監聽

【Step 4】在 Illustrator 執行操作
  └─ monitor 實時顯示日誌
  └─ 問題立即顯示
```

---

## 🚨 初始化異常排查

### 問題 1：無法自動偵測 START_HERE.md

**解決**：手動發送指令

```
@AUTO_INIT

或分步驟發送：
@SETUP_LOGGING
```

---

### 問題 2：日誌配置失敗

**可能原因**：路徑無效或權限問題

**解決**：
```
確認路徑是否包含特殊字符
確認你對該目錄有寫入權限
嘗試自訂路徑或使用簡單路徑
```

---

### 問題 3：角色未激活

**解決**：
```
【重新初始化】
發送：@AUTO_INIT

【或手動激活 PM】
發送：@NEW_FEATURE
```

---

## ✅ 初始化完成度評分

| 檢查項 | 狀態 | 分數 |
|-------|------|------|
| 環境準備 | ✅ | 25% |
| 日誌系統 | ✅ | 25% |
| 規則載入 | ✅ | 25% |
| 團隊激活 | ✅ | 25% |
| **總進度** | **✅ 完成** | **100%** |

**結論**：準備開始開發 🚀

---

## 📝 首次開發前的最終檢查

- [ ] ✅ 所有自動初始化已完成
- [ ] ✅ 代碼配置片段已複製到源代碼
- [ ] ✅ Monitor 工具已準備（tools/ 目錄）
- [ ] ✅ 開發規範已閱讀（可選但推薦）
- [ ] ✅ 快速指令已了解（見 QUICK_COMMANDS.md）

**準備開發**：發送 `@NEW_FEATURE` 開始！

---

**最後更新**：2026-04-10
