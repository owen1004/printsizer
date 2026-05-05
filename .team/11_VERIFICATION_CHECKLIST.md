# 驗證檢查清單 (Verification Checklist)

> **核心目的**：建立標準化的驗證標準，確保每次修改都經過「功能、性能、兼容性、安全」四個維度的完整驗證，最小化發佈後的缺陷風險

**最後更新**：2026-04-11  
**相關文檔**：[修改管理流程](10_CHANGE_MANAGEMENT_PROCESS.md)、[問題定義流程](09_PROBLEM_DEFINITION_PROCESS.md)

---

## I. 驗證框架總覽

```
【修改執行】（來自 CHANGE_MANAGEMENT_PROCESS.md）
       ↓
【驗證 Level 1】功能驗證
   - 單元測試
   - 集成測試
   - 手動功能測試
       ↓
【驗證 Level 2】性能驗證
   - 執行速度
   - 內存使用
   - 資源消耗
       ↓
【驗證 Level 3】兼容性驗證
   - 版本相容性（Illustrator 版本）
   - 操作系統兼容性
   - 邊界情況兼容性
       ↓
【驗證 Level 4】安全驗證
   - 代碼安全檢查
   - 數據安全檢查
   - 漏洞掃描
       ↓
【最終簽核】
   - 所有驗證都通過 ✅
   - 可以發佈
       ↓
【事後驗證】監控與告警
   - 發佈後性能監控
   - 用戶反饋收集
   - 應急回滾準備
```

---

## II. Level 1：功能驗證

### 2.1 單元測試驗證

**目標**：驗證最小代碼單位（函數、方法）的正確性

#### 測試覆蓋率標準

| 代碼類型 | 最低覆蓋率 | 說明 |
|---------|---------|------|
| **核心業務邏輯** | 95%+ | 如 nesting 演算法、座標轉換 |
| **工具函數** | 80%+ | 如 math 工具、格式化函數 |
| **UI 相關** | 60%+ | 難以自動化，主要靠手動測試 |
| **配置和常數** | 不要求 | 通常不計算覆蓋率 |

#### 測試檢查清單

```markdown
## ✅ 單元測試驗證清單

### 測試執行
- [ ] 所有相關測試文件都已更新或新增
- [ ] `npm test` 運行無誤，所有測試通過
- [ ] 新增測試覆蓋修改的所有代碼路徑

### 覆蓋率檢查
- [ ] 整體覆蓋率達到要求（見上表）
- [ ] 新增代碼的覆蓋率 ≥ 95%
- [ ] 無任何「已修改但未測試」的代碼行

### 邊界情況測試
- [ ] 測試了邊界值（0、負數、最大值）
- [ ] 測試了異常輸入（null、undefined、空字符串）
- [ ] 測試了邊界條件（列表長度為 0、1、大數字）

### 回歸測試
- [ ] 所有舊測試仍然通過（未因新修改而失敗）
- [ ] 沒有新增 skipped 或 xfail 測試（除非有特殊原因）

**簽核**：所有項目勾選後，進入集成測試階段
```

**測試範例**：

```javascript
// test/nesting.test.jsx
describe('Nesting Algorithm', () => {
  describe('getBounds', () => {
    // 正常情況
    test('should return correct bounds for single object', () => {
      const obj = { x: 10, y: 20, width: 100, height: 50 };
      const bounds = getBounds([obj]);
      expect(bounds).toEqual({ minX: 10, maxX: 110, minY: 20, maxY: 70 });
    });

    // 邊界情況
    test('should handle zero-sized object', () => {
      const obj = { x: 10, y: 20, width: 0, height: 0 };
      const bounds = getBounds([obj]);
      expect(bounds).toEqual({ minX: 10, maxX: 10, minY: 20, maxY: 20 });
    });

    test('should handle negative coordinates', () => {
      const obj = { x: -50, y: -30, width: 100, height: 100 };
      const bounds = getBounds([obj]);
      expect(bounds.minX).toBe(-50);
      expect(bounds.maxX).toBe(50);
    });

    // 異常輸入
    test('should throw error for null input', () => {
      expect(() => getBounds(null)).toThrow();
    });

    test('should throw error for empty array', () => {
      expect(() => getBounds([])).toThrow('At least one object required');
    });

    // 複雜情況
    test('should handle multiple rotated objects', () => {
      const objects = [
        { x: 0, y: 0, width: 100, height: 50, rotation: 45 },
        { x: 150, y: 0, width: 100, height: 50, rotation: -45 }
      ];
      const bounds = getBounds(objects);
      // 驗證邊界包含所有旋轉物件
      expect(bounds.maxX).toBeGreaterThan(150);
    });
  });
});
```

---

### 2.2 集成測試驗證

**目標**：驗證多個模組的協作是否正確

#### 集成測試檢查清單

```markdown
## ✅ 集成測試驗證清單

### 測試範圍
- [ ] 覆蓋了主要的業務流程（端到端）
- [ ] 測試了相關模組間的 API 調用
- [ ] 測試了數據在模組間的流轉

### 測試執行
- [ ] `npm test -- integration` 所有測試通過
- [ ] 測試使用真實或接近真實的環境（如測試數據文件）
- [ ] 沒有 Mock 或 Stub（或僅在必要時使用）

### 流程完整性
- [ ] 測試完整的操作流程（如「打開文件→修改→保存」）
- [ ] 測試了流程中的分支邏輯（成功、失敗、異常）
- [ ] 測試了流程的恢復機制（如回滾、重試）

### 性能基準
- [ ] 集成測試完成時間 < 5 分鐘（否則太慢，難以頻繁運行）
- [ ] 沒有明顯的性能退化（相比修改前）

**簽核**：所有項目勾選後，進入手動功能測試階段
```

**集成測試範例**：

```javascript
// test/nesting.integration.test.jsx
describe('Nesting Integration', () => {
  beforeAll(() => {
    // 打開測試 AI 檔案
    testDoc = app.open('test-data/large_objects.ai');
  });

  afterAll(() => {
    testDoc.close(SaveOptions.DONOTSAVECHANGES);
  });

  test('full nesting workflow', () => {
    // 1. 選擇物件
    const objects = testDoc.selection.slice(0, 5);
    
    // 2. 執行拼版
    const result = nestingEngine.arrange(objects, {
      container: [300, 300],
      padding: 5,
      allowRotation: true
    });
    
    // 3. 驗證結果
    expect(result.success).toBe(true);
    expect(result.bounds.maxX).toBeLessThanOrEqual(300);
    expect(result.bounds.maxY).toBeLessThanOrEqual(300);
    expect(result.wastedArea).toBeLessThan(50); // 廢料 < 50mm²
    
    // 4. 驗證物件已正確排列
    result.positions.forEach((pos, idx) => {
      expect(objects[idx].position).toEqual([pos.x, pos.y]);
    });
  });
});
```

---

### 2.3 手動功能測試驗證

**目標**：通過實際操作驗證功能是否符合預期

#### 測試場景設計

對於排版工具的例子，設計以下測試場景：

```markdown
## ✅ 手動功能測試場景

### 場景 1：基本拼版（Happy Path）
```
前置條件：
- 打開 Illustrator 2026
- 打開 test-data/basic_objects.ai
- 選擇前 3 個矩形物件

操作步驟：
1. 進入 Cut Pro 外掛 → 「智能拼版」
2. 設定容器尺寸：300mm × 300mm
3. 點擊「自動排列」

驗證點：
- ✓ 物件自動排列，緊湊排放
- ✓ 所有物件都在容器邊界內
- ✓ 物件間沒有重疊
- ✓ 廢料面積合理（< 50mm²）
- ✓ 操作耗時 < 2 秒
```

### 場景 2：邊界情況 - 超大物件數量
```
前置條件：
- 同上，但選擇 10 個物件（考慮極端情況）

操作步驟：
1-3. 同場景 1

驗證點：
- ✓ 系統不崩潰
- ✓ 物件仍正確排列
- ✓ 邊界計算正確
- ✓ 性能可接受（< 10 秒）
```

### 場景 3：相容性 - 物件旋轉後重新排列
```
前置條件：
- 同場景 1

操作步驟：
1. 選擇其中 1-2 個物件
2. 旋轉 90° (或 45°)
3. 點擊「自動排列」（重新排版）

驗證點：
- ✓ 邊界重新計算
- ✓ 旋轉後的物件邊界正確
- ✓ 排列結果最優化
```

### 場景 4：邊界條件 - 非常小的容器
```
前置條件：
- 選擇 3 個物件（每個 100mm × 100mm）

操作步驟：
1. 設定容器尺寸：150mm × 150mm（無法容納所有物件）
2. 點擊「自動排列」

驗證點：
- ✓ 系統提示「無法排放」（或自動縮小物件）
- ✓ 沒有丟失物件或崩潰
```

### 場景 5：版本相容性 - Illustrator 2023
```
前置條件：
- 打開 Illustrator 2023
- 打開同一檔案

操作步驟：
1-3. 同場景 1

驗證點：
- ✓ 外掛仍能正常加載
- ✓ 功能與 2026 版本一致
- ✓ 沒有 API 相容性錯誤
```

### 場景 6：异常情況 - 修改過程中撤銷
```
前置條件：
- 執行場景 1 的拼版操作

操作步驟：
1. 拼版完成
2. 按 Ctrl+Z（撤銷）3 次
3. 按 Ctrl+Y（重做）

驗證點：
- ✓ 撤銷操作成功，物件恢復原位
- ✓ 重做後物件重新排列，結果一致
```

### 場景 7：邊界情況 - 零寬度或零高度的物件
```
前置條件：
- 創建 1 個零寬度物件（如直線）
- 混入正常物件中

操作步驟：
1. 選擇混合物件（包括零寬度物件）
2. 點擊「自動排列」

驗證點：
- ✓ 系統不崩潰
- ✓ 零寬度物件被正確處理
- ✓ 其他物件正常排列
```

### 簽核表

| 場景 | 狀態 | 備註 |
|------|------|------|
| 場景 1：基本拼版 | ☐ 通過 | |
| 場景 2：超大數量 | ☐ 通過 | |
| 場景 3：旋轉重排 | ☐ 通過 | |
| 場景 4：小容器 | ☐ 通過 | |
| 場景 5：版本相容 | ☐ 通過 | |
| 場景 6：撤銷重做 | ☐ 通過 | |
| 場景 7：零寬度 | ☐ 通過 | |

**全部通過後，進入性能驗證階段**
```

---

## III. Level 2：性能驗證

### 3.1 執行速度驗證

**目標**：確保修改不會導致性能退化

#### 性能基準測試

```javascript
// test/performance.benchmark.js
const Benchmark = require('benchmark');

const suite = new Benchmark.Suite;

suite
  .add('getBounds with 5 objects', () => {
    const objects = generateTestObjects(5);
    getBounds(objects);
  })
  .add('getBounds with 20 objects', () => {
    const objects = generateTestObjects(20);
    getBounds(objects);
  })
  .add('nestingAlgorithm with 5 objects', () => {
    const objects = generateTestObjects(5);
    nestingAlgorithm.arrange(objects);
  })
  .on('complete', function() {
    console.log('Benchmark Results:');
    console.table(this.map(result => ({
      name: result.name,
      opsPerSec: result.hz.toFixed(2),
      avgTime: (1000 / result.hz).toFixed(2) + 'ms'
    })));
  })
  .run({ 'async': true });
```

#### 性能驗證檢查清單

```markdown
## ✅ 性能驗證清單

### 基準測試
- [ ] 執行了性能基準測試（Benchmark）
- [ ] 記錄了修改前和修改後的數據
- [ ] 沒有明顯的性能退化（退化 > 10% 需要解釋）

### 執行速度
- [ ] 基本操作 < 1 秒（如邊界計算）
- [ ] 複雜操作 < 10 秒（如拼版 20+ 物件）
- [ ] 後台操作無明顯卡頓

### 內存使用
- [ ] 內存峰值未明顯增長
- [ ] 沒有內存洩漏（長時間運行內存穩定）
- [ ] 大批量操作內存占用在預期範圍

### 資源消耗
- [ ] CPU 占用合理（不應持續 100%）
- [ ] 磁盤 I/O 正常（無頻繁讀寫）
- [ ] 網絡流量（如有）在預期範圍

**簽核**：所有項目勾選後，進入兼容性驗證階段
```

---

### 3.2 記憶使用監控

```bash
# 在 Node.js 中監控內存使用
node --inspect test/performance.monitor.js

# 或使用 heapdump 進行內存快照
const heapdump = require('heapdump');
heapdump.writeSnapshot(); // 生成快照進行分析
```

---

## IV. Level 3：兼容性驗證

### 4.1 Illustrator 版本兼容性

**目標**：確保外掛在所有目標 Illustrator 版本上都能正確工作

#### 版本測試清單

```markdown
## ✅ Illustrator 版本相容性清單

### 支援版本
- [ ] Illustrator 2021
  - 測試環境：Windows 10
  - 功能測試：[場景 1-7 全部通過]
  - 備註：[如有已知限制，記錄]

- [ ] Illustrator 2023
  - 測試環境：Windows 10 / macOS Monterey
  - 功能測試：[場景 1-7 全部通過]
  - 備註：[如有已知限制，記錄]

- [ ] Illustrator 2026
  - 測試環境：Windows 10 / Windows 11 / macOS
  - 功能測試：[場景 1-7 全部通過]
  - 備註：[優化目標版本]

### API 相容性
- [ ] 確認使用的 API 在所有版本上都可用
- [ ] 對於版本差異，使用了版本檢測和 Fallback
  ```javascript
  if (app.version >= 2023) {
    // 使用新 API
  } else {
    // 使用舊 API
  }
  ```

### 配置相容性
- [ ] 舊版本的配置文件能被新版本識別
- [ ] 版本升級不會導致配置遺失

**簽核**：所有版本都測試通過，進入安全驗證階段
```

---

### 4.2 操作系統兼容性

```markdown
## ✅ 操作系統相容性清單

### Windows
- [ ] Windows 10 (build 19045+)
  - 功能測試：[場景 1-3]
  - 性能測試：通過
  
- [ ] Windows 11
  - 功能測試：[場景 1-3]
  - 性能測試：通過

### macOS
- [ ] macOS 11 (Big Sur)
  - 功能測試：[場景 1-3]
  - 路徑處理（/ vs \）：✓
  
- [ ] macOS 12 (Monterey)
  - 功能測試：[場景 1-3]
  - 簽名和公證：✓

### 已知兼容性問題
- [記錄任何不支援的版本或特殊情況]
```

---

## V. Level 4：安全驗證

### 5.1 代碼安全檢查

```markdown
## ✅ 代碼安全驗證清單

### 靜態分析
- [ ] 運行 ESLint 和 security 規則集
  ```bash
  npm run lint -- --ext .js --plugin security
  ```
- [ ] 沒有 warning 或已有記錄的 exception

### 依賴安全
- [ ] 運行 `npm audit` 檢查依賴的已知漏洞
  ```bash
  npm audit
  ```
- [ ] 沒有高風險漏洞，低風險已記錄

### 代碼評審
- [ ] 已由另一位開發者評審（如 Code Review）
- [ ] 評審人員確認沒有明顯安全問題

### 常見安全陷阱檢查
- [ ] 沒有 SQL 注入風險（如使用數據庫）
- [ ] 沒有路徑遍歷漏洞（文件訪問時驗證路徑）
- [ ] 沒有敏感信息洩露（API keys、密碼、用戶數據）
```

### 5.2 數據安全檢查

```markdown
## ✅ 數據安全驗證清單

### 數據傳輸
- [ ] 敏感數據使用加密傳輸（HTTPS）
- [ ] 沒有在日誌中記錄敏感信息

### 本地數據
- [ ] 用戶數據被正確隔離
- [ ] 沒有意外的文件創建或寫入
- [ ] 臨時文件被及時清理

### 隱私合規
- [ ] 收集的數據符合 GDPR/隱私政策
- [ ] 用戶同意被正確記錄
```

---

## VI. 發佈前最終檢查清單

**在所有驗證都通過後，執行最終檢查**：

```markdown
## ✅ 發佈前最終檢查

### 功能驗證完成
- [ ] Level 1：功能驗證全部通過
  - [ ] 單元測試通過，覆蓋率 > 80%
  - [ ] 集成測試通過
  - [ ] 手動功能測試 7 個場景全部通過

### 性能驗證完成
- [ ] Level 2：性能驗證全部通過
  - [ ] 執行速度無退化或有記錄的改進
  - [ ] 內存使用正常
  - [ ] 基準測試數據已記錄

### 兼容性驗證完成
- [ ] Level 3：兼容性驗證全部通過
  - [ ] 3 個 Illustrator 版本都測試通過
  - [ ] 目標操作系統都測試通過

### 安全驗證完成
- [ ] Level 4：安全驗證全部通過
  - [ ] 代碼安全檢查無問題
  - [ ] 依賴安全檢查無高風險
  - [ ] 數據安全檢查無問題

### 文檔與通信
- [ ] CHANGELOG 已更新
- [ ] 發佈說明已準備（面向用戶）
- [ ] 技術團隊已通知並 ACK
- [ ] 已確認回滾計畫和聯絡人

### 最後確認
- [ ] 所有測試在最新代碼上運行過（未過期）
- [ ] 沒有遺留的 TODO 或 FIXME 標記在新代碼中
- [ ] Git 歷史清晰，提交信息準確

✅ **全部檢查通過，可以執行 Merge & Deploy**

簽核人：_______________  日期：_______________
```

---

## VII. 事後驗證（Post-Release）

### 7.1 發佈後監控

發佈後的前 24-48 小時，持續監控以下指標：

```markdown
## ✅ 發佈後監控清單

### 關鍵指標監控
- [ ] **應用崩潰率** < 0.1%（與修改前基線對比）
- [ ] **功能失敗率** < 0.5%
- [ ] **性能指標**：
  - 執行速度無明顯退化（±5%）
  - 內存占用無異常增長
- [ ] **用戶報告** 無新增 Critical/Major Bug

### 日誌監控
- [ ] 檢查應用日誌，是否有新增異常棧跡
- [ ] 搜索 ERROR 級別日誌，確認無未預期的失敗
- [ ] 檢查性能日誌，確認無異常緩慢操作

### 告警觸發機制
- [ ] 設定告警：崩潰率 > 0.5%
- [ ] 設定告警：性能下降 > 20%
- [ ] 設定告警：錯誤率 > 5%

### 應急響應
如果任何指標異常：
- [ ] 立即組織應急會議
- [ ] 判斷是否需要立即回滾
- [ ] 執行回滾（或部分熱修復）
- [ ] 進行根因分析
```

### 7.2 用戶反饋收集

```markdown
## ✅ 用戶反饋清單

### 反饋收集渠道
- [ ] GitHub Issues（監控新增相關 Issue）
- [ ] 支援郵件（檢查新增反饋）
- [ ] Slack / 討論區（監控相關討論）

### 反饋分類和響應
- [ ] P0 Critical：立即回應，考慮立即熱修復或回滾
- [ ] P1 Major：24 小時內回應，評估是否影響其他用戶
- [ ] P2 Minor：72 小時內回應，累積到下個版本修復

### 反饋分析
- [ ] [記錄用戶報告的問題]
- [ ] [識別是否為已知限制或新缺陷]
- [ ] [評估影響範圍和優先級]
```

---

## VIII. 驗證工具和命令

### 自動化驗證腳本

```bash
#!/bin/bash
# verify-release.sh - 自動化驗證腳本

echo "🧪 開始發佈前驗證..."

# Level 1: 功能驗證
echo "運行單元測試..."
npm test || exit 1

echo "運行集成測試..."
npm run test:integration || exit 1

# Level 2: 性能驗證
echo "運行性能基準測試..."
npm run benchmark || exit 1

# Level 3: 兼容性驗證
echo "檢查代碼風格..."
npm run lint || exit 1

# Level 4: 安全驗證
echo "掃描依賴安全..."
npm audit || echo "⚠️  有安全警告，請手動評估"

# 最後：顯示檢查清單
echo "✅ 所有自動化驗證通過！"
echo "📋 請完成手動驗證清單（見 VERIFICATION_CHECKLIST.md）"
```

### Illustrator 版本測試腳本

```javascript
// test/version-compat.jsx
// 在 Illustrator 中執行，測試版本兼容性

if (parseInt(app.version) >= 2026) {
  alert("Illustrator 2026 - 使用新 API");
} else if (parseInt(app.version) >= 2023) {
  alert("Illustrator 2023 - 使用兼容 API");
} else {
  alert("Illustrator 2021 - 使用舊版 API");
}

// 執行基本功能測試
testNestingFunction();
testBoundsCalculation();
testRotationHandling();

alert("版本相容性測試完成");
```

---

## IX. 常見問題與決策樹

### Q1: 「如果某個測試失敗怎麼辦」？

```
測試失敗
  ├─ 是代碼 Bug 嗎？
  │   ├─ 是 → 回到修改階段，修復代碼
  │   └─ 否 → 是測試本身有問題嗎？
  │       ├─ 是 → 更新測試（確保測試正確）
  │       └─ 否 → 是已知的技術債嗎？
  │           ├─ 是 → 記錄到技術債清單，考慮後續優化
  │           └─ 否 → 需要 Architect 評審
  └─ → 所有測試通過後，才能進入發佈
```

### Q2: 「性能略微退化了 8%，是否應該發佈」？

```
性能退化評估
  ├─ 退化原因
  │   ├─ 算法優化導致（如支援更多物件）→ 可以接受
  │   ├─ 新增功能的代價 → 可以接受（記錄原因）
  │   └─ 代碼不夠高效 → 需要優化
  ├─ 影響範圍
  │   ├─ 只在邊界情況（如 100+ 物件）→ 低優先級
  │   └─ 常見操作（< 10 物件）→ 需要優化
  └─ → 決策：允許 5% 的無法避免退化，> 10% 需要優化
```

### Q3: 「版本相容性測試中發現舊版本不支援某個 API」？

```
API 不支援
  ├─ 該功能對此版本至關重要嗎？
  │   ├─ 是 → 該版本無法發佈，需要 Fallback 實現
  │   └─ 否 → 可以降級功能，或在該版本提示不可用
  ├─ 實現 Fallback
  │   └─ 測試 Fallback 版本與新版本的一致性
  └─ → 所有支援版本都能使用（可能功能有差異）
```

---

## X. 集成到 CI/CD Pipeline

```yaml
# .github/workflows/verify.yml
name: Verification Pipeline

on: [push, pull_request]

jobs:
  verify:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node-version: [16.x, 18.x]
    
    steps:
      # Level 1: 功能驗證
      - name: Run Unit Tests
        run: npm test
        
      - name: Run Integration Tests
        run: npm run test:integration
      
      # Level 2: 性能驗證
      - name: Run Benchmarks
        run: npm run benchmark
      
      # Level 3: 兼容性驗證
      - name: Lint Code
        run: npm run lint
      
      # Level 4: 安全驗證
      - name: Security Audit
        run: npm audit
      
      # 最終簽核
      - name: Generate Report
        run: npm run verify:report
      
      - name: Upload Report
        uses: actions/upload-artifact@v2
        with:
          name: verification-report-${{ matrix.os }}
          path: reports/
```

---

**文檔完成**：2026-04-11  
**相關角色**：[QA Tester](05_QA_TESTER.md) 負責執行此驗證流程
