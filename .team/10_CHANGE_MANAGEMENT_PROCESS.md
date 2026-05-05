# 修改管理流程

> **核心目的**：建立「修改前→執行→驗證→發佈」的完整管理流程，確保每次修改都有備份、都能回滾、都經過驗證，減少無法挽回的失誤

**最後更新**：2026-04-11  
**相關文檔**：[問題定義流程](09_PROBLEM_DEFINITION_PROCESS.md)、[驗證檢查清單](11_VERIFICATION_CHECKLIST.md)

---

## I. 修改流程總覽

```
【認知一致 ✅】（來自 Translator 澄清）
       ↓
【階段 1】修改前規劃
   - 分析影響範圍
   - 設計修改方案
   - 制定備份 & 回滾計畫
       ↓
【階段 2】版本控制準備
   - 新建特性分支
   - 建立基線（baseline）
       ↓
【階段 3】執行修改
   - 實施代碼修改
   - 本地測試
       ↓
【階段 4】驗證與測試
   - 單元測試（如適用）
   - 集成測試
   - 回滾測試（模擬失敗情況）
       ↓
【階段 5】上線與監控
   - Merge 到主分支
   - 自動 CI/CD 檢查
   - 部署 & 監控
       ↓
【階段 6】事後回顧
   - 文檔更新
   - 經驗教訓總結
```

---

## II. 階段 1：修改前規劃

### Step 1.1: 影響範圍分析（Impact Analysis）

在執行任何修改前，**必須**完成影響範圍分析。

#### 分析清單

```
【修改題目】[從問題定義中複製]

【受影響文件】
- 直接修改：[列出檔名]
- 可能影響：[間接相關的模組]
- 配置文件：[相關的 config/設定檔]

【受影響功能】
- 主功能：[核心影響]
- 副功能：[邊界影響]
- 性能：[預期的性能變化]

【相關測試**（需新增/修改）**】
- 單元測試：[哪些函數需要測試]
- 集成測試：[哪些流程需要測試]
- 邊界測試：[需要覆蓋的邊界情況]

【破壞性變更評估】
- API 變更：Yes / No（如是，向後兼容性考量）
- 數據遷移：Yes / No（如是，需要遷移腳本）
- 配置變更：Yes / No（如是，用戶需更新配置）

【複雜度評估】
- 代碼複雜度：Low / Medium / High
- 涉及模組數：[數量]
- 涉及開發者：[需要哪些角色參與]
- 預計工作量：[粗估小時數]

【風險評估】
- 風險等級：Low / Medium / High
- 關鍵風險：[具體列舉]
- 緩解策略：[如何降低風險]
```

**✅ 好的分析例子**：

```
【修改題目】修復排版超過 5 個物件時邊界計算錯誤

【受影響文件】
- 直接修改：src/algorithms/nesting.jsx (getBounds 函數)
- 可能影響：src/algorithms/layout.jsx (使用 getBounds)
           src/utils/container.jsx (容器邊界邏輯)
- 配置文件：config/nesting.json (精度參數)

【受影響功能】
- 主功能：「智能拼版」所有物件數量 > 5 的場景
- 副功能：「自動縮放」、「旋轉」可能受影響
- 性能：預期無變化（算法邏輯優化）

【相關測試】
- 單元測試：test/getBounds.test.jsx (新增 5+ 物件邊界測試)
- 集成測試：test/nesting.integration.jsx (完整拼版流程)
- 邊界測試：物件數量 1-10, 尺寸 10-500mm, 旋轉 0-360°

【破壞性變更評估】
- API 變更：No (函數簽名不變)
- 數據遷移：No
- 配置變更：No

【複雜度評估】
- 代碼複雜度：Medium (涉及矩陣計算)
- 涉及模組數：3 (nesting, layout, container)
- 涉及開發者：Developer + QA
- 預計工作量：4-6 小時

【風險評估】
- 風險等級：Medium Risk
  ├─ 關鍵風險：邊界計算邏輯變更可能影響其他依賴函數
  ├─ 影響範圍：layout.jsx 中的 5 個調用點
  └─ 緩解策略：完整單元測試覆蓋 + 迴歸測試
```

---

### Step 1.2: 修改方案設計

基於影響範圍分析，設計具體的修改方案。

#### 方案模板

```markdown
## 修改方案設計

### 目標
[從問題定義中複製「期望」部分]

### 當前實現
[描述現有邏輯]

### 提案方案
[清晰描述修改策略]

### 實施步驟
1. [修改步驟 1]
2. [修改步驟 2]
3. ...

### 替代方案（如有）
- 方案 A：[優缺點]
- 方案 B：[優缺點]
- 決選：方案 [X]（理由：[成本/風險/收益])

### 驗證方法
[描述如何驗證修改成功]

### 已知限制（如有）
[描述該方案的局限性，避免過度承諾]
```

**✅ 好的方案例子**：

```markdown
## 修改方案：修復邊界計算算法

### 目標
排版超過 5 個物件時，容器邊界計算正確

### 當前實現
```javascript
// src/algorithms/nesting.jsx
function getBounds(objects) {
  let minX = objects[0].x;
  let maxX = objects[0].x + objects[0].width;
  // 簡化版本，未正確處理所有物件
  return [minX, maxX];
}
```

### 提案方案
計算所有物件的邊界盒（bounding box），正確處理旋轉和重疊：
```javascript
function getBounds(objects) {
  let bounds = {
    minX: Infinity, maxX: -Infinity,
    minY: Infinity, maxY: -Infinity
  };
  objects.forEach(obj => {
    // 考慮旋轉後的四角座標
    const rotated = rotateCorners(obj);
    const objBounds = calculateBounds(rotated);
    bounds = mergeBounds(bounds, objBounds);
  });
  return bounds;
}
```

### 實施步驟
1. 新增 `rotateCorners()` 輔助函數
2. 新增 `calculateBounds()` 高精度邊界計算
3. 修改 `getBounds()` 核心邏輯
4. 更新單元測試

### 驗證方法
- 單元測試：1-10 物件 × 4 旋轉角度 × 5 尺寸 = 200+ 測試用例
- 集成測試：完整拼版流程
- 手動測試：large_objects.ai 檔案確認視覺正確

### 已知限制
- 不支援非矩形物件（此版本不在範圍內）
- 精度：±0.1mm（配置可調）
```

---

### Step 1.3: 備份 & 回滾計畫

**這是最關鍵的一步。** 必須在執行修改前設計完整的回滾計畫。

#### 備份策略

| 修改類型 | 備份方式 | 保留時間 | 觸發回滾條件 |
|---------|--------|--------|-----------|
| **代碼修改** | Git 新分支 + stash | 至少 1 週 | 測試失敗 / 性能退化 |
| **配置變更** | 版本化配置文件 | 至少 1 週 | 錯誤配置導致功能中斷 |
| **數據遷移** | DB 備份快照 | 至少 1 個月 | 數據遺失 / 格式損壞 |

#### 回滾檢查清單

```markdown
## 回滾準備清單

### 備份驗證
- [ ] Git 新分支已創建（命名：feature/[問題ID]-[簡述]）
- [ ] 本地代碼已 commit（不含未跟蹤檔案）
- [ ] 遠程備份已推送（git push origin [分支名]）
- [ ] 配置文件版本已標記（git tag v[版本號]）

### 回滾測試
- [ ] 手動驗證「git checkout [舊分支] + 重新構建」能還原功能
- [ ] 驗證「git reset --hard [備份提交]」的可行性
- [ ] 確認回滾所需時間 < 15 分鐘

### 事故應急計畫
- [ ] 已確定「發現問題時的聯絡人」
- [ ] 已準備「緊急回滾腳本」
- [ ] 已標記「關鍵時間點」（修改開始時間、預期完成時間）

### 團隊溝通
- [ ] 已通知相關角色（QA、PM、DevOps）進入「修改中」狀態
- [ ] 已設定「修改完成預期時間」的提醒
```

---

## III. 階段 2：版本控制準備

### Step 2.1: 創建特性分支

```bash
# 命名規範：feature/[Issue-ID]-[簡述]
git checkout -b feature/ISSUE-0042-fix-nesting-bounds

# 推送到遠程（作為備份）
git push -u origin feature/ISSUE-0042-fix-nesting-bounds
```

**分支命名規範**：
- 功能開發：`feature/[Issue-ID]-[簡述]`
- Bug 修復：`bugfix/[Issue-ID]-[簡述]`
- 性能優化：`perf/[簡述]`
- 緊急修復：`hotfix/[簡述]`（需立即發佈）

### Step 2.2: 建立代碼基線

在開始修改前，創建基線以便後續對比：

```bash
# 記錄當前提交哈希（基線）
BASELINE_COMMIT=$(git rev-parse HEAD)
echo $BASELINE_COMMIT > .baseline

# 後續可用於對比：
git diff $BASELINE_COMMIT HEAD --stat
```

---

## IV. 階段 3：執行修改

### Step 3.1: 本地開發與測試

```
【修改代碼】
  ├─ 根據方案設計修改相關檔案
  ├─ 保持最小修改範圍（不涉及方案外的代碼）
  └─ 每個邏輯步驟後 commit（原子化提交）

【本地測試】
  ├─ 功能測試（基本操作）
  ├─ 邊界測試（邊界情況）
  ├─ 性能測試（如有性能要求）
  └─ 回滾測試（確保可恢復）
```

**原子化提交範例**：

```bash
# Commit 1: 新增邊界計算輔助函數
git add src/algorithms/nesting.jsx
git commit -m "feat: 新增 rotateCorners 和 calculateBounds 輔助函數

- rotateCorners: 計算旋轉後的四角座標
- calculateBounds: 高精度邊界盒計算
- 為 getBounds 重構做準備"

# Commit 2: 修改核心 getBounds 邏輯
git add src/algorithms/nesting.jsx
git commit -m "fix: 修復 getBounds 未正確處理多物件邊界的問題

- 使用新的邊界盒演算法
- 正確處理物件旋轉
- 支援無限物件數量

Fixes #0042"

# Commit 3: 新增測試
git add test/getBounds.test.jsx
git commit -m "test: 新增 getBounds 多物件邊界測試

- 添加 5 個邊界測試場景
- 測試旋轉、重疊、邊界情況
- 覆蓋率達 95%"
```

### Step 3.2: 運行自動化測試

```bash
# 運行所有相關測試
npm test -- src/algorithms/nesting.test.jsx

# 驗證代碼風格
npm run lint

# 性能基準測試（如適用）
npm run benchmark
```

---

## V. 階段 4：驗證與測試

### Step 4.1: 三層測試驗證

#### Layer 1: 單元測試
```javascript
// test/getBounds.test.jsx
describe('getBounds', () => {
  test('should handle single object', () => {
    const obj = { x: 0, y: 0, width: 100, height: 100, rotation: 0 };
    expect(getBounds([obj])).toEqual({ minX: 0, maxX: 100, minY: 0, maxY: 100 });
  });

  test('should handle 5 objects correctly', () => {
    const objects = [/* 5 個測試物件 */];
    const bounds = getBounds(objects);
    // 驗證邊界計算正確
    expect(bounds.maxX - bounds.minX).toBe(300); // 預期寬度
  });

  test('should handle rotated objects', () => {
    const obj = { x: 0, y: 0, width: 100, height: 50, rotation: 45 };
    const bounds = getBounds([obj]);
    // 旋轉後邊界應更大
    expect(bounds.maxX - bounds.minX).toBeGreaterThan(100);
  });
});
```

#### Layer 2: 集成測試
```javascript
// test/nesting.integration.test.jsx
describe('Nesting Integration', () => {
  test('full layout process with 5 objects', () => {
    const file = loadAiFile('test-data/large_objects.ai');
    const result = runNestingAlgorithm(file, { container: [300, 300] });
    
    // 驗證所有物件都在容器內
    expect(result.bounds.maxX).toBeLessThanOrEqual(300);
    expect(result.bounds.maxY).toBeLessThanOrEqual(300);
    expect(result.wastedArea).toBeLessThan(50); // 廢料 < 50mm²
  });
});
```

#### Layer 3: 手動測試
```markdown
## 手動測試清單

- [ ] 打開 test-data/large_objects.ai
- [ ] 選擇前 5 個物件
- [ ] 執行「智能拼版」
- [ ] **視覺驗證**：
      ✓ 所有物件都在容器邊界內
      ✓ 物件間間距合理
      ✓ 沒有物件被切掉
- [ ] 測試旋轉：選擇物件 → 旋轉 90° → 重新拼版
      ✓ 邊界應自動重新計算
- [ ] 性能測試：10+ 物件是否卡頓？
```

### Step 4.2: 回滾可行性測試

**在真正發佈前，必須驗證回滾流程**：

```bash
# 1. 測試 git 回滾
git log --oneline -5  # 查看最近 5 個提交
BASELINE=$(git rev-list HEAD~[N]..HEAD | tail -1)  # 取得基線

# 2. 模擬回滾
git reset --hard $BASELINE
# 驗證代碼是否恢復到修改前的狀態

# 3. 重新運行測試（確保舊版本測試通過）
npm test

# 4. 如果通過，恢復到新版本
git reset --hard [新提交哈希]
```

---

## VI. 階段 5：上線 & 發佈

### Step 5.1: 準備合併 (Merge Request)

```markdown
## Merge Request: 修復排版邊界計算問題 #42

### 提案者
[開發者名稱]

### 連結到原始問題
Fixes #0042

### 修改摘要
- 修復 getBounds 函數未正確處理多物件邊界的問題
- 新增邊界計算輔助函數以支援旋轉物件
- 添加 20+ 單元測試

### 修改清單
- `src/algorithms/nesting.jsx`: 核心修改
- `test/getBounds.test.jsx`: 新增測試

### 測試覆蓋率
- 單元測試：20 個新測試，覆蓋 95%
- 集成測試：通過
- 手動測試：通過（使用 large_objects.ai）

### 性能影響
- 無負面影響
- 大物件數量場景性能 +5%（優化後）

### 回滾計畫
分支：feature/ISSUE-0042-fix-nesting-bounds
回滾命令：`git revert [提交哈希]`
預計回滾時間：< 5 分鐘

### 已審核清單
- [ ] 代碼審查通過
- [ ] 所有測試通過
- [ ] 沒有代碼風格問題
- [ ] 文檔已更新
- [ ] 性能測試通過
```

### Step 5.2: 自動 CI/CD 檢查

```yaml
# .github/workflows/test.yml (示例)
name: CI/CD Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install dependencies
        run: npm install
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Performance check
        run: npm run benchmark
      
      - name: Security scan
        run: npm run security-check
```

如果任何一步失敗，MR 會被自動 block，無法合併。

### Step 5.3: 正式發佈

```bash
# 1. 執行 Merge（通常由 DevOps 或領導者執行）
git checkout main
git pull origin main
git merge --no-ff feature/ISSUE-0042-fix-nesting-bounds

# 2. 創建發佈標籤（語義版本）
git tag -a v2.1.1 -m "Fix: 修復邊界計算問題 (Issue #0042)"

# 3. 推送到遠程
git push origin main
git push origin v2.1.1

# 4. 部署到生產環境（如有自動部署）
# 觸發 CD pipeline，自動打包並發佈

# 5. 監控
# - 檢查應用崩潰率
# - 檢查性能指標
# - 監控用戶反饋
```

---

## VII. 階段 6：事後回顧

### Step 6.1: 文檔更新

修改完成後，更新相關文檔：

```markdown
## CHANGELOG 條目

### [v2.1.1] - 2026-04-11

#### Fixed
- 修復排版超過 5 個物件時邊界計算錯誤
  - Issue: #0042
  - 詳情：[連結到完整分析]

#### Tests
- 新增 20+ 邊界計算單元測試
- 新增集成測試
```

### Step 6.2: 經驗教訓總結

```markdown
## 修改回顧 #0042

### 時間線
- 2026-04-11 10:00 - 開始分析影響範圍
- 2026-04-11 11:30 - 完成方案設計
- 2026-04-11 13:00 - 開始代碼修改
- 2026-04-11 14:30 - 本地測試完成
- 2026-04-11 15:00 - 提交 MR
- 2026-04-11 15:30 - 合併完成
- 總耗時：5.5 小時

### 成功因素
- ✅ 完整的影響範圍分析
- ✅ 清晰的修改方案
- ✅ 充分的測試覆蓋
- ✅ 及時的備份準備

### 改進空間
- ⚠️ [如有]: 描述
- ⚠️ [如有]: 描述

### 知識沉澱
- [記錄學到的技術細節]
- [記錄遇到的陷阱]
- [記錄可複用的解決方案]
```

---

## VIII. 特殊情況処理

### 緊急修復 (Hotfix)

當發現 P0 Critical Bug 需要立即修復時：

```
【正常流程】
Feature Branch → 完整測試 → Code Review → Merge → Deploy (1-2 天)

【Hotfix 流程】
Hotfix Branch → 最小化測試 → 快速 Review → Merge to main + release (< 1 小時)

後續：在下個迭代中進行完整測試和文檔補充
```

**Hotfix 快速流程**：

```bash
# 1. 從 main 創建 hotfix 分支（不從 develop）
git checkout main
git checkout -b hotfix/CRITICAL-xyz

# 2. 修復問題（最小化修改）
# ... 修改代碼 ...

# 3. 快速測試（只測試關鍵功能）
npm test -- --grep="critical"

# 4. 立即合併（跳過某些審查）
git checkout main
git merge --no-ff hotfix/CRITICAL-xyz
git tag v2.1.2

# 5. 立即部署
npm run deploy:production

# 6. 事後補充文檔和完整測試
```

### 🆕 Hotfix 後 Feature Branch 同步策略（G-06）

> **問題背景**：Hotfix 直接 merge 到 main，但同時進行中的 feature branch 是從舊 main 分出去的，導致兩者產生分歧。不處理會在 feature branch 完成後 merge 時發生衝突。

**比喻**：你在裝修房間 A（feature branch），同時水管爆了修好了（Hotfix merge 到 main）。裝修完後合併時，房間 A 還沒有新水管的位置，會打架。

#### 什麼時候觸發同步？

```
Hotfix merge 到 main 完成後 → Architect 主動通知：

「Hotfix [版本號] 已完成 merge，以下 feature branch 需要同步：
  - feature/ISSUE-xxx（你正在開發的功能 A）
  - feature/ISSUE-yyy（其他進行中的分支）

請在繼續開發前執行同步，避免後期衝突。」
```

#### 同步操作步驟

```bash
# 1. 確認 Hotfix 已 merge 到 main
git log main --oneline -5
# 確認看到 hotfix/CRITICAL-xyz 的 commit

# 2. 切換到你的 feature branch
git checkout feature/ISSUE-xxx

# 3. 將 main 的最新變更同步進來（選一種）

# 方案 A：Rebase（推薦 - 歷史更乾淨）
git rebase main
# 若有衝突 → 解決後 git rebase --continue

# 方案 B：Merge（更安全 - 但歷史有 merge commit）
git merge main
# 若有衝突 → 解決後 git commit

# 4. 確認同步成功
git log --oneline -10
# 確認 Hotfix 的 commit 出現在歷史中

# 5. 繼續正常開發
```

#### 衝突解決原則

```
遇到衝突時的決策：

【Hotfix 修改 vs Feature 修改 衝突】
├─ Hotfix 是 Bug 修復？ → 保留 Hotfix 的版本（優先）
├─ Feature 修改了 Hotfix 觸碰的代碼？ → 召集 Architect 評估
└─ 只是格式或注釋衝突？ → 手動合併，保留兩邊邏輯

【若衝突複雜，無法自行判斷】
→ 觸發 @ARCHITECT_INTERVENTION
→ Architect 評估後決定合併策略
```

#### Architect 的責任

| 時機 | 責任 |
|------|------|
| Hotfix merge 完成後 | 主動通知所有活躍 feature branch 的開發者 |
| 有開發者回報衝突時 | 介入評估，給出合併策略建議 |
| 同步完成後 | 確認各 feature branch 的測試仍通過 |

---

### 大型重構 (Major Refactor)

對於涉及多個文件、多個模組的大型修改：

```
【分階段策略】
第 1 階段：基礎設施準備
  - 新增測試框架和測試用例
  - 建立監控和告警機制

第 2 階段：增量遷移
  - 逐個模組重構
  - 每個模組後都進行驗證

第 3 階段：整體驗證
  - 端到端測試
  - 性能基準測試

第 4 階段：運行時監控
  - 灰度發佈（10% → 50% → 100%）
  - 持續監控關鍵指標
  - 準備快速回滾方案
```

---

## IX. 修改管理檢查清單

在發佈前，複製並檢查此清單：

```markdown
## ✅ 修改上線前檢查清單

### 影響範圍分析
- [ ] 已完成影響範圍分析
- [ ] 已識別所有受影響文件和功能
- [ ] 已評估複雜度和風險等級
- [ ] 已設計測試覆蓋範圍

### 修改方案
- [ ] 已設計修改方案（並記錄備選方案）
- [ ] 已制定備份和回滾計畫
- [ ] 已驗證回滾可行性

### 版本控制
- [ ] 已在獨立分支上開發
- [ ] 已建立代碼基線
- [ ] 所有提交都是原子化且有清晰的提交信息

### 測試驗證
- [ ] 單元測試通過（覆蓋率 > 80%）
- [ ] 集成測試通過
- [ ] 手動測試通過（涵蓋邊界情況）
- [ ] 性能測試通過（無退化）
- [ ] 回滾測試通過

### 代碼質量
- [ ] 代碼風格檢查通過
- [ ] 沒有新增 linting 警告
- [ ] 沒有安全漏洞

### 文檔與溝通
- [ ] MR/PR 描述清晰完整
- [ ] 已通知相關團隊成員
- [ ] 已準備發佈說明和更新日誌

### 應急準備
- [ ] 已確定監控指標和告警閾值
- [ ] 已準備回滾命令和腳本
- [ ] 已確定應急聯絡人

✅ 全部檢查通過後，才可執行發佈
```

---

## X. 與其他流程的整合

```
問題定義 [09_PROBLEM_DEFINITION_PROCESS.md]
       ↓
   Translator 澄清 [08_TRANSLATOR_ROLE.md]
       ↓
   認知一致 ✅
       ↓
修改管理（本文檔）
   ├─ Step 1: 影響分析 & 方案設計 & 備份計畫
   ├─ Step 2: 版本控制準備
   ├─ Step 3: 執行修改
   ├─ Step 4: 驗證測試
   ├─ Step 5: 上線發佈
   └─ Step 6: 事後回顧
       ↓
驗證檢查清單 [VERIFICATION_CHECKLIST.md]
   （確保修改符合預期）
       ↓
   完成 ✅
```

---

**文檔完成**：2026-04-11  
**相關角色**：[Developer](02_DEVELOPER_ROLE.md) 和 [DevOps](06_DEVOPS_RELEASE.md) 負責執行此流程
