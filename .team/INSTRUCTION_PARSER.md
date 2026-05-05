# 指令識別與自動回應系統 - Instruction Parser & Auto-Response

> **目的**：定義系統如何識別、解析、執行 @CODE 指令，以及自動化角色回應

---

## 指令識別流程

```
【用戶輸入】
  ↓
【Instruction Parser】
  ├─ 關鍵詞掃描（尋找 @CODE）
  ├─ 非標準化檢測（口語化、模糊）
  └─ 意圖分類
  ↓
【決策】
  ├─ 標準化 → 調用對應角色
  ├─ 非標準化 → Translator 介入
  └─ 無法判斷 → 詢問用戶
  ↓
【角色執行】
  └─ 標準化工作流
```

---

## 指令類型與識別規則

### 1. 指令掃描（Instruction Scanner）

**格式識別**：
```
匹配模式：@[A-Z_]+
例如：@NEW_FEATURE, @ARCHITECT_REVIEW, @BUG_FIX
```

**掃描優先順序**：
1. 用戶消息首行是否包含 @CODE？
2. 用戶消息中是否提及角色名稱？（如「架構師」、「QA」）
3. 是否有隱含的角色動作？（如「測試」→ QA）
4. 是否為續前文操作？（上文已啟動角色）

---

### 2. 標準指令對照表

| 指令碼 | 觸發角色 | 關鍵詞識別 | 用戶可能說的話 | 自動回應格式 |
|-------|--------|----------|--------------|-----------|
| **@AUTO_INIT** | 所有角色 | 啟動、初始化、開始 | 「開始新專案」 | 【初始化完成】→ PM 角色 |
| **@STRATEGY** | PM | 策略、市場、競品、用戶研究 | 「先分析一下市場方向」 | 【PM 產品規劃報告】→ 策略報告 |
| **@NEW_FEATURE** | PM | 新增、功能、實作、開發 | 「我們需要新增 X 功能」 | 【PM 需求分析】→ 需求報告 |
| **@REPRIORITIZE** | PM | 重排、優先級、調整順序 | 「調整一下功能優先級」 | 【PM 優先級重排】→ 更新列表 |
| **@ARCHITECT_REVIEW** | Architect | 架構、設計、方案、可行性 | 「這個方向可以嗎？」 | 【Architect 審核】→ 架構報告 |
| **@ARCHITECT_INTERVENTION** | Architect | 偏差、問題、改變、風險 | 「我們發現座標系統有問題」 | 【Architect 介入】→ 風險評估 |
| **@UX_DESIGN** | UI&UX 設計師 | 界面、設計、用戶體驗、UI、原型 | 「設計一下操作界面」 | 【UI&UX 設計報告】→ 設計方案 |
| **@START_DEVELOPMENT** | Dev | 開始、實作、寫代碼、開發 | 「開始開發」 | 進入開發階段 |
| **@BUG_FIX** | Dev | Bug、問題、修復、錯誤 | 「測試時發現 bug」 | 【Bug Fix】→ 修復流程 |
| **@HOTFIX** | Dev+QA+DevOps | 緊急、崩潰、線上問題、P0 | 「線上出問題了！」 | 【Hotfix 通道】→ 快速修復 |
| **@QA_TESTING** | QA | 測試、品質、驗證、檢查 | 「代碼完成了」 | 【QA 測試報告】→ 測試結果 |
| **@DEVOPS_DEPLOY** | DevOps | 部署、發佈、上線、版本 | 「準備部署了」 | 【DevOps 部署報告】→ 部署完成 |
| **@DOC_SYNC** | DocManager | 文檔、同步、更新、記錄 | 「部署完成，同步文檔」 | 【Doc Manager 同步】→ 文檔更新 |
| **@STATUS_CHECK** | PM | 進度、狀態、現在、哪裡 | 「我們做到哪裡了？」 | 【進度檢查】→ 狀態報告 |
| **@ADD_DECISION** | Architect | 決策、決定、確認、方向 | 「我們決定採用 X 方案」 | 【決策記錄】→ DECISIONS.md |
| **@TECH_DEBT_DECISION** | Architect | 技術債、欠的、重構、優化 | 「這段代碼是技術債」 | 【技術債評估】→ 決策記錄 |
| **@RESET** | Translator | 重置、重來、方向錯了、推倒 | 「這個方向不對，重來」 | 【Translator 確認重置範圍】→ A/B/C |
| **@SEARCH_RESOURCE** | Architect | 找不到、沒有資源、網路搜尋、GitHub、開源 | 「資料庫沒有這個功能」 | 【線上搜尋 + 安全評估】→ 決定是否納入資料庫 |
| **@SAVE_CONTEXT** | 系統 | /compact、額度、存檔、快照、記憶 | 「要 compact 了」 | 【Context 快照】→ 寫入 CONTEXT_SNAPSHOT.md |
| **(Translator)** | Translator | 模糊、口語、非標準 | 「這個有點問題」 | 【Translator 意圖分析】→ 確認 |

---

## 非標準化檢測與 Translator 啟動

### 規則 1：模糊詞彙檢測

```
檢測詞彙：「有點問題」、「感覺」、「可能」、「似乎」、「差不多」

檢測範例：
用戶：「這個排版邏輯有點問題」
↓
解析：模糊詞彙 + 技術詞彙（排版邏輯）
↓
推斷：可能涉及架構問題
↓
觸發：Translator
↓
Translator 問：「你是指邊界計算有誤嗎？還是演算法邏輯？」
```

### 規則 2：口語化指令檢測

```
檢測模式：非結構化、欠缺具體參數、混合多個角色訴求

檢測範例：
用戶：「我們要改一下座標系統，然後測試一下，再發佈」
↓
分析：涉及 Architect（設計改動）+ Dev（實作）+ QA（測試）+ DevOps（發佈）
↓
觸發：Translator
↓
Translator：「我拆解一下你的訴求...」
↓
轉化為：@ARCHITECT_INTERVENTION → @START_DEVELOPMENT → @QA_TESTING → @DEVOPS_DEPLOY
```

### 規則 3：隱含意圖檢測

```
檢測信號：用戶說「做完了」但未明確指出下一步

檢測範例：
用戶：「代碼做完了」
↓
隱含意圖：代碼已實作完成，應進入測試
↓
推斷指令：@QA_TESTING
↓
自動觸發：Translator 確認
↓
Translator：「代碼完成，我現在啟動 QA 測試？」
```

---

## 自動回應格式系統

### 格式 1：角色激活回應

```markdown
【[角色名稱] 角色已激活】

指令：@[CODE]
日期：[日期]
狀態：⏳ 進行中

[角色特定的工作流模板]

---

預計完成：[時間估算]
下一步：[狀態轉移目標]
```

### 格式 2：標籤化角色識別

```markdown
【PM 角色】[工作內容]
【Architect 角色】[工作內容]
【QA 角色】[工作內容]
...
```

### 格式 3：決策/轉移提示

```markdown
【[角色] 決策】
✅ 條件 A 滿足
⚠️ 條件 B 需注意
❌ 條件 C 未通過

【轉移狀態】
當前：[狀態 A]
下一個：[狀態 B]（自動 / 需用戶確認）
```

---

## 實時指令解析器（Pseudo Code）

```
function parseInstruction(userInput) {
  // Step 1: 掃描 @CODE
  let codeMatch = userInput.match(/@[A-Z_]+/);
  
  if (codeMatch) {
    // 標準化指令 → 直接調用
    return activateRole(codeMatch[0]);
  }
  
  // Step 2: 關鍵詞匹配
  let keywords = extractKeywords(userInput);
  let detectedRole = matchRole(keywords);
  
  if (detectedRole) {
    // 隱含指令 → Translator 確認
    return translator.confirmRole(detectedRole, userInput);
  }
  
  // Step 3: 口語化檢測
  if (isFuzzy(userInput) || isMultiRoleImplied(userInput)) {
    // 非標準化 → Translator 介入
    return translator.analyzeIntent(userInput);
  }
  
  // Step 4: 無法判斷
  return askUserForClarification(userInput);
}

function activateRole(code) {
  switch(code) {
    case "@AUTO_INIT":
      return System.fullInitialization();
    case "@STRATEGY":
      return PM.productStrategyAnalysis();
    case "@NEW_FEATURE":
      return PM.newFeatureAnalysis();
    case "@REPRIORITIZE":
      return PM.reprioritize();
    case "@ARCHITECT_REVIEW":
      return Architect.architectureReview();
    case "@ARCHITECT_INTERVENTION":
      return Architect.riskAssessment();
    case "@TECH_DEBT_DECISION":
      return Architect.techDebtAssessment();
    case "@UX_DESIGN":
      return UIUXDesigner.designPhase();
    case "@START_DEVELOPMENT":
      return Developer.startCoding();
    case "@BUG_FIX":
      return Developer.bugFixProcess();
    case "@HOTFIX":
      return HotfixChannel.emergencyFix(); // Architect + Dev + QA + DevOps
    case "@QA_TESTING":
      return QA.testingPlan();
    case "@DEVOPS_DEPLOY":
      return DevOps.deploymentProcess();
    case "@DOC_SYNC":
      return DocManager.documentSync();
    case "@STATUS_CHECK":
      return PM.progressReport();
    case "@ADD_DECISION":
      return Architect.recordDecision();
    case "@RESET":
      return Translator.confirmResetScope(); // G-10
    case "@SEARCH_RESOURCE":
      return Architect.searchOnlineResource(); // 見 .library/ONLINE_RESOURCE_SEARCH.md
    case "@SAVE_CONTEXT":
      return System.saveContextSnapshot(); // 寫入 .project/CONTEXT_SNAPSHOT.md
    // ... 其他指令
  }
}
```

---

## 並發與狀態衝突處理

### 情況 1：用戶同時發出多個指令

```
用戶：「@ARCHITECT_INTERVENTION，同時我想修復 @BUG_FIX」

解析器：
✅ 檢測到 2 個指令
↓
決策：Architect 優先（通常高層次），Bug Fix 等待
↓
回應：
「我先啟動 Architect 風險評估。
評估完後，我們再進行 Bug Fix。
你同意嗎？」
```

### 情況 2：指令序列衝突

```
用戶：「@QA_TESTING」（但代碼尚未 Commit）

解析器：
❌ 前置條件檢查失敗
↓
回應：
「QA 測試需要代碼已 Commit。
目前狀態：[Dev] 開發進行中
請先完成 @START_DEVELOPMENT，產生 Commit。」
```

### 情況 3：循環回路檢測

```
流程：Dev @START_DEVELOPMENT → QA → Bug Found → @BUG_FIX → QA（第 3 次）

警告：
「⚠️ 檢測到高頻 QA 循環（3 次）
建議：
1. 重新檢視架構是否有根本問題？
2. 是否需要 @ARCHITECT_INTERVENTION？
3. 或者考慮降低測試嚴格度？」
```

---

## 記憶系統與指令學習

### 持續改進

```
每次 Translator 轉化成功 → 記錄模式
例如：
「用戶說 'X 有點問題' → 推斷 = 架構問題」
→ 存入 Translator.patterns
→ 未來相同情景自動識別無需確認

```

### 常見口語模式資料庫

```
【Pattern #1】「需要...功能」→ @NEW_FEATURE
【Pattern #2】「這樣可以嗎」→ @ARCHITECT_REVIEW
【Pattern #3】「發現...問題」→ @ARCHITECT_INTERVENTION 或 @BUG_FIX
【Pattern #4】「開始...」 → @START_DEVELOPMENT
【Pattern #5】「測試時...」 → @QA_TESTING
【Pattern #6】「部署...」 → @DEVOPS_DEPLOY
```

---

## 錯誤恢復與降級

### 情況 1：指令無法解析

```
用戶：「dhjdk @UNKNOWN_CODE」

解析器：
❌ 無法解析 @UNKNOWN_CODE
↓
降級：
「我不認識指令 @UNKNOWN_CODE。
可用的指令有：
@NEW_FEATURE, @ARCHITECT_REVIEW, ...

或者，你想做什麼？我來幫你解析。」
```

### 情況 2：角色狀態衝突

```
當前狀態：QA 測試進行中
用戶：「我想現在部署」→ @DEVOPS_DEPLOY

解析器：
❌ 狀態衝突（QA 未完成）
↓
提示：
「目前正在 QA 測試中。
要直接跳過 QA 嗎？（不建議）
或等待 QA 完成？」
```

---

## 指令日誌與審計

每次指令執行記錄：

```
【指令執行日誌】
時間：2026-04-10 14:32:00
指令：@QA_TESTING
觸發方式：手動
用戶確認：Y
角色執行：QA
結果：通過 ✅
轉移狀態：→ DevOps
```

---

**最後更新：2026-04-10**
