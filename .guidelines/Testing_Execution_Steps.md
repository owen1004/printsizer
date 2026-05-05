# 測試執行步驟 - Testing Execution Steps

> **用途**：詳細記錄測試時的具體操作步驟  
> **更新頻率**：測試工具或流程變更時  
> **參考**：Testing_Guide.md

---

## ⚡ 快速選擇

| 你在開發... | 使用... | 位置 |
|-----------|--------|------|
| 🔵 **ExtendScript 腳本** | 自動化 .jsx 測試 | [執行 .jsx 測試](#-extendscript-jsx-腳本自動化測試執行) |
| 🟠 **C++ 編譯外掛** | TestLab 測試 | [執行 TestLab 測試](#-testlab-測試執行步驟) |
| 🟢 **都要測試** | 完整流程 | [完整測試流程](#-完整測試流程) |

---

## 🔵 ExtendScript (.jsx) 腳本自動化測試執行

### 前置條件檢查

- [ ] Illustrator 已安裝（2021 或更新版本）
- [ ] ExtendScript Toolkit 可用（菜單：File → Scripts → Show ExtendScript Toolkit）
- [ ] 測試檔案已建立
  ```
  testlab/jsx_tests/
  ├── unit/
  │   ├── test_template_unit.jsx
  │   └── test_[YourFunction].jsx
  ├── integration/
  │   ├── test_template_integration.jsx
  │   └── test_[YourIntegration].jsx
  ├── manual/
  │   └── UI_Test_Checklist.md
  └── test_runner.jsx
  ```

---

### Step 1：準備測試檔案

**複製測試範本**：

```bash
# 複製單元測試範本
cp testlab/jsx_tests/unit/test_template_unit.jsx testlab/jsx_tests/unit/test_[YourFunction].jsx

# 複製集成測試範本
cp testlab/jsx_tests/integration/test_template_integration.jsx testlab/jsx_tests/integration/test_[YourIntegration].jsx
```

**修改範本中的依賴路徑**：

```javascript
// 在 test_[YourFunction].jsx 中，確保以下路徑正確
#include "../../src/libs/Logger.jsx"
#include "../../src/libs/YourLibrary.jsx"
```

---

### Step 2：開啟 ExtendScript Toolkit

**方式 1：直接從 Illustrator 菜單**

```
1. 打開 Illustrator
2. 菜單：File → Scripts → Show ExtendScript Toolkit
3. 在打開的 Toolkit 中選擇「File」→「Open」
4. 開啟 testlab/jsx_tests/unit/test_[YourFunction].jsx
```

**方式 2：使用快捷鍵**

- Windows：`Alt + Shift + Ctrl + J`
- Mac：`Option + Shift + Command + J`

---

### Step 3：執行單元測試

**執行測試檔案**：

```
1. 在 ExtendScript Toolkit 中，點擊「執行」按鈕（綠色三角形）
   或按快捷鍵 Ctrl+Shift+E
2. 在 Output 面板查看結果
```

**預期輸出範例**：

```
✓ [通過] 日誌檔案建立
✓ [通過] 日誌寫入內容
✓ [通過] 日誌含有時間戳
✗ [失敗] 多行日誌記錄 → 異常：xxx

╔═══════════════════════════════════════╗
║ 【Logger 元件】單元測試報告           ║
╚═══════════════════════════════════════╝

【測試結果】
✓ [通過] 日誌檔案建立
✓ [通過] 日誌寫入內容
...

【統計】
總計：4 個
通過：3 個 ✓
失敗：1 個 ✗

【結論】🔴 存在失敗 - 需修復代碼
```

---

### Step 4：修復失敗的測試

**流程**：

```
❌ 測試失敗
  ↓
📖 檢查 Output 中的錯誤訊息
  ↓
🔍 定位源代碼問題（通常在測試輸出中已標出）
  ↓
✏️  修改源代碼
  ↓
🔄 重新執行測試
  ↓
✅ 確認通過（重複直到全部通過）
```

**常見失敗原因**：

| 失敗現象 | 可能原因 | 修復方法 |
|---------|---------|---------|
| `#include` 路徑錯誤 | 檔案位置不對 | 檢查相對路徑是否正確 |
| 函式未定義 | 依賴的庫未被包含 | 添加正確的 `#include` 路徑 |
| 邏輯錯誤 | 函式實現有 bug | 修改函式邏輯 |
| 拋出異常 | 邊界條件未處理 | 添加錯誤檢查和例外處理 |

---

### Step 5：執行集成測試

**重複 Step 1-4 的流程**，但使用集成測試檔案：

```javascript
// 在 ExtendScript Toolkit 中開啟
testlab/jsx_tests/integration/test_[YourIntegration].jsx

// 執行 (Ctrl+Shift+E)
// 查看輸出中的集成測試報告
```

**集成測試的輸出格式**（與單元測試類似）：

```
✓ [通過] Component1 輸出作為 Component2 輸入 (45ms)
✓ [通過] 級聯操作完整性 (120ms)
✗ [失敗] 錯誤傳播正確性 → 異常：xxx

【統計】
成功率：66%
平均耗時：82ms
```

---

### Step 6：使用 test_runner.jsx 執行完整自動化測試

**一鍵執行所有測試**：

```
1. 在 ExtendScript Toolkit 中開啟 testlab/jsx_tests/test_runner.jsx
2. 點擊執行 (Ctrl+Shift+E)
3. 等待所有單元和集成測試完成
```

**完整測試報告**：

```
╔═══════════════════════════════════════╗
║   自動化測試最終報告                  ║
╚═══════════════════════════════════════╝

【各層結果】
✓ 單元測試：12 通過 / 12 總計
✓ 集成測試：4 通過 / 4 總計

【最終統計】
成功率：100%
總耗時：68 秒

【下一步】🟢 自動化測試全部通過
  進入第三層：手動 UI 測試
  參考：testlab/jsx_tests/manual/UI_Test_Checklist.md
```

**報告存檔**：
- 報告自動存至：`Folder.userData/AUTOMATED_TEST_REPORT.txt`

---

## 📋 測試層級決策樹

```
【測試需求】
  ↓
【是否測試單一函式的邏輯？】
  ├─ YES → 【單元測試】使用 TestLab（自動化）
  └─ NO
     ↓
【是否測試多模組協作？】
  ├─ YES → 【集成測試】使用 TestLab（自動化）
  └─ NO
     ↓
【是否測試在 Illustrator 中的實際行為？】
  ├─ YES → 【E2E 測試】使用人工測試（手動）
  └─ NO → 返回上層
```

**總結**：
- **邏輯層面** → TestLab（快速、自動化、重複性高）
- **集成層面** → TestLab（多模組協作驗證）
- **實際行為** → 人工測試（UI、互動、實際環境）

---

## 🔬 TestLab 測試執行步驟

### 前置條件檢查

- [ ] Visual Studio 已安裝
- [ ] 專案配置為 Release（或 Debug + Test 配置）
- [ ] testlab/ 目錄結構已建立
  ```
  testlab/
  ├── unit_tests/
  │   ├── test_coordinate_transform.cpp
  │   ├── test_algorithm.cpp
  │   └── ...
  ├── integration_tests/
  │   ├── test_nesting_flow.cpp
  │   └── ...
  └── test_runner.exe（或用 CMake 生成）
  ```
- [ ] 測試框架已配置（如 Google Test、Catch2）

---

### Step 1：建立測試專案結構

```bash
# 在專案根目錄創建 testlab 目錄
mkdir testlab
cd testlab

# 創建子目錄
mkdir unit_tests integration_tests

# 創建 CMakeLists.txt（如使用 CMake）
```

---

### Step 2：編寫單元測試用例

**位置**：`testlab/unit_tests/test_*.cpp`

**範例結構**：

```cpp
#include <gtest/gtest.h>
#include "CoordinateTransformer.h"

// 【測試套組】座標轉換
class CoordinateTransformerTest : public ::testing::Test {
protected:
  CoordinateTransformer transformer;
  
  void SetUp() override {
    // 初始化（每個測試前執行）
    transformer = CoordinateTransformer(1000, 1000);
  }
};

// 【測試用例 1】基本座標轉換
TEST_F(CoordinateTransformerTest, BasicTransform) {
  Point algoPoint = {100, 100};
  AIRealPoint visualPoint = transformer.toVisual(algoPoint);
  
  EXPECT_EQ(visualPoint.h, 100);
  EXPECT_EQ(visualPoint.v, 900);  // 1000 - 100
}

// 【測試用例 2】邊界條件 - 原點
TEST_F(CoordinateTransformerTest, OriginPoint) {
  Point algoPoint = {0, 0};
  AIRealPoint visualPoint = transformer.toVisual(algoPoint);
  
  EXPECT_EQ(visualPoint.h, 0);
  EXPECT_EQ(visualPoint.v, 1000);
}

// 【測試用例 3】邊界條件 - 邊界
TEST_F(CoordinateTransformerTest, BoundaryPoint) {
  Point algoPoint = {1000, 1000};
  AIRealPoint visualPoint = transformer.toVisual(algoPoint);
  
  EXPECT_EQ(visualPoint.h, 1000);
  EXPECT_EQ(visualPoint.v, 0);
}

// 【測試用例 4】異常輸入 - 負數
TEST_F(CoordinateTransformerTest, NegativeCoordinate) {
  Point algoPoint = {-100, -100};
  
  // 應拋出異常或返回無效值
  EXPECT_THROW(transformer.toVisual(algoPoint), std::invalid_argument);
}
```

---

### Step 3：編寫集成測試用例

**位置**：`testlab/integration_tests/test_*.cpp`

**範例結構**：

```cpp
#include <gtest/gtest.h>
#include "NestingAlgorithm.h"
#include "CoordinateTransformer.h"

// 【集成測試套組】完整排版流程
class NestingIntegrationTest : public ::testing::Test {
protected:
  NestingAlgorithm algorithm;
  
  void SetUp() override {
    algorithm = NestingAlgorithm(1000, 1000);  // 1000×1000 的板材
  }
};

// 【集成測試 1】5 個矩形排版
TEST_F(NestingIntegrationTest, FiveRectanglesNesting) {
  std::vector<Shape> shapes = {
    Shape::Rectangle(100, 100),
    Shape::Rectangle(100, 100),
    Shape::Rectangle(100, 100),
    Shape::Rectangle(100, 100),
    Shape::Rectangle(100, 100),
  };
  
  auto result = algorithm.nest(shapes, 5);  // 5mm 邊距
  
  // 驗證結果
  EXPECT_EQ(result.success, true);
  EXPECT_EQ(result.placedCount, 5);
  EXPECT_EQ(result.hasOverlap, false);
  EXPECT_LT(result.executionTime, 2000);  // < 2 秒
}

// 【集成測試 2】邊界條件 - 無空間
TEST_F(NestingIntegrationTest, NoSpaceForAll) {
  std::vector<Shape> shapes = {
    Shape::Rectangle(600, 600),
    Shape::Rectangle(600, 600),
    Shape::Rectangle(600, 600),
  };
  
  auto result = algorithm.nest(shapes, 0);  // 不可能全部放進 1000×1000
  
  EXPECT_EQ(result.success, false);
  EXPECT_LT(result.placedCount, 3);
}

// 【集成測試 3】混合形狀
TEST_F(NestingIntegrationTest, MixedShapesNesting) {
  std::vector<Shape> shapes = {
    Shape::Rectangle(100, 100),
    Shape::Circle(50),
    Shape::Polygon({...}),
  };
  
  auto result = algorithm.nest(shapes, 5);
  
  EXPECT_EQ(result.success, true);
  EXPECT_EQ(result.hasOverlap, false);
}
```

---

### Step 4：配置編譯與執行

**方式 A：使用 CMake**

```cmake
# CMakeLists.txt
cmake_minimum_required(VERSION 3.10)
project(NestingTests)

# 包含 Google Test
include(FetchContent)
FetchContent_Declare(googletest URL https://github.com/google/googletest/archive/refs/tags/release-1.12.1.zip)
FetchContent_MakeAvailable(googletest)

# 添加單元測試目標
add_executable(unit_tests 
  testlab/unit_tests/test_coordinate_transform.cpp
  testlab/unit_tests/test_algorithm.cpp
)
target_link_libraries(unit_tests gtest_main)

# 添加集成測試目標
add_executable(integration_tests
  testlab/integration_tests/test_nesting_flow.cpp
)
target_link_libraries(integration_tests gtest_main)

# 啟用測試
enable_testing()
add_test(NAME UnitTests COMMAND unit_tests)
add_test(NAME IntegrationTests COMMAND integration_tests)
```

**編譯指令**：

```bash
# 在專案根目錄
cmake -B build -S .
cmake --build build --config Release

# 運行所有測試
ctest --output-on-failure
```

---

### Step 5：執行 TestLab 測試

```bash
# 方式 1：直接執行測試二進位檔
build/Release/unit_tests

# 輸出範例：
# [==========] Running 4 tests from 1 test suite.
# [----------] Global test environment set-up.
# [ RUN      ] CoordinateTransformerTest.BasicTransform
# [       OK ] CoordinateTransformerTest.BasicTransform (0 ms)
# [ RUN      ] CoordinateTransformerTest.OriginPoint
# [       OK ] CoordinateTransformerTest.OriginPoint (0 ms)
# [ RUN      ] CoordinateTransformerTest.NegativeCoordinate
# [       OK ] CoordinateTransformerTest.NegativeCoordinate (0 ms)
# [==========] 4 tests, 0 failures (2 ms)
```

---

### Step 6：分析 TestLab 結果

| 結果 | 含義 | 下一步 |
|------|------|-------|
| ✅ **All Pass** | 所有測試通過 | 進入人工測試 |
| ❌ **Failure** | 某些測試失敗 | 修復代碼 → 重新運行 |
| ⚠️ **Timeout** | 測試超時 | 檢查性能 / 無限迴路 |
| 💥 **Crash** | 測試進程崩潰 | 檢查記憶體管理 / 邊界條件 |

**修復流程**：

```
測試失敗
  ↓
檢查 error log → 定位代碼問題
  ↓
修改源代碼
  ↓
重新編譯 → 重新執行測試
  ↓
直到全部通過
```

---

## 👥 人工測試（Illustrator 環境）執行步驟

### 前置條件檢查

- [ ] Illustrator 已安裝（2021 或 2026）
- [ ] 外掛已編譯為 AIP 檔案
- [ ] 外掛已部署到插件目錄
  ```
  Illustrator 2021：D:\Ia\Adobe Illustrator 2021\Plug-ins\
  Illustrator 2026：S:\illustrator 2026\Adobe Illustrator 2026\Plug-ins\
  ```
- [ ] Illustrator 完全關閉（確認進程不存在）
- [ ] 測試用件已準備（.ai 或 .eps 檔案）

---

### Step 1：環境準備

```powershell
# 1️⃣ 關閉所有 Illustrator 進程
Get-Process | Where-Object {$_.ProcessName -like "*Illustrator*"} | Stop-Process -Force

# 2️⃣ 清理快取與日誌
Remove-Item -Path "$env:APPDATA\Adobe\Illustrator*\debug.log" -Force -ErrorAction SilentlyContinue

# 3️⃣ 驗證外掛檔案
Test-Path "S:\illustrator 2026\Adobe Illustrator 2026\Plug-ins\Cut_Pro.aip"
# 輸出應為 True
```

---

### Step 2：啟動 Illustrator

```powershell
# 啟動 Illustrator 2026
& "S:\illustrator 2026\Adobe Illustrator 2026\Adobe Illustrator.exe"

# 等待完全加載（通常 30-60 秒）
Start-Sleep -Seconds 60
```

---

### Step 3：驗證外掛已加載

**步驟**：
1. Illustrator 啟動後，檢查菜單是否出現
   - 點擊 **Window** → **Extensions** → 尋找你的外掛名稱
   - 或點擊 **File** / **Modify** 查看是否有新菜單項目

2. 如果外掛未出現：
   - ❌ 檢查 error log：`%APPDATA%\Adobe\Illustrator*\debug.log`
   - ❌ 確保 AIP 檔案未被鎖定
   - ❌ 重新部署外掛 → 重啟 Illustrator

**成功標誌**：✅ 外掛菜單項目可見且可點擊

---

### Step 4：人工測試執行

#### 【測試組 1】基礎功能驗證

**測試用例 1.1：基礎排版**

```
準備：
  1. 打開測試檔案：testcases/basic_5_rectangles.ai
  2. 檢查文件包含 5 個 100×100 的矩形
  
執行步驟：
  1. 在 Illustrator 中選取全部物件（Ctrl+A）
  2. 打開外掛菜單 → 點擊「排版」
  3. 設置邊距：5mm
  4. 點擊「排版」按鈕
  
驗證：
  ✅ 5 個物件排列在一起（無重疊）
  ✅ 邊距約為 5mm
  ✅ 排版完成提示出現
  ✅ UI 無凍結（< 2 秒完成）
  
失敗時記錄：
  ❌ 物件位置、重疊情況、錯誤訊息
```

**測試用例 1.2：混合形狀排版**

```
準備：
  1. 打開測試檔案：testcases/mixed_shapes.ai
  2. 檢查文件包含矩形、圓形、多邊形等
  
執行步驟：
  1. 選取全部物件（Ctrl+A）
  2. 打開外掛菜單 → 「排版」
  3. 設置邊距：5mm
  4. 點擊「排版」
  
驗證：
  ✅ 所有形狀正確排列
  ✅ 各形狀無重疊
  ✅ 排列結果合理
  
失敗時記錄：
  ❌ 哪個形狀無法正確排列、重疊情況、錯誤訊息
```

---

#### 【測試組 2】邊界條件測試

**測試用例 2.1：邊距 = 0**

```
準備：
  1. 新建 1000×1000 的文檔
  2. 添加 5 個 100×100 的矩形
  
執行步驟：
  1. 選取全部物件
  2. 打開外掛 → 「排版」
  3. 設置邊距：0mm
  4. 點擊「排版」
  
驗證：
  ✅ 物件緊靠在一起（無間距）
  ✅ 排版成功完成
  
失敗時記錄：
  ❌ 物件間距不對、錯誤訊息
```

**測試用例 2.2：單個物件**

```
準備：
  1. 新建文檔，只添加 1 個矩形
  
執行步驟：
  1. 選取該物件
  2. 打開外掛 → 「排版」
  
驗證：
  ✅ 出現提示「至少需要 2 個物件」
  ✅ 物件位置不變
  
失敗時記錄：
  ❌ 錯誤提示內容、是否發生 crash
```

**測試用例 2.3：無法排進板材**

```
準備：
  1. 新建 500×500 的文檔
  2. 添加 3 個 400×400 的矩形（總面積超過板材）
  
執行步驟：
  1. 選取全部物件
  2. 打開外掛 → 「排版」
  
驗證：
  ✅ 出現提示「物件無法排進板材」
  ✅ 外掛無 crash
  
失敗時記錄：
  ❌ 提示訊息、是否部分排版
```

---

#### 【測試組 3】性能測試

**測試用例 3.1：100 個物件排版耗時**

```
準備：
  1. 打開測試檔案：testcases/100_rectangles.ai
  
執行步驟：
  1. 選取全部物件
  2. 打開外掛 → 「排版」
  3. 啟動計時器（手錶或秒表）
  4. 點擊「排版」
  5. 記錄完成時間
  
驗證：
  ✅ 完成時間 < 2 秒
  ✅ UI 無凍結（進度條順暢或實時反饋）
  ✅ 排版結果正確
  
失敗時記錄：
  ❌ 實際耗時、UI 是否卡頓、是否超時
```

**測試用例 3.2：內存監控**

```
準備：
  1. 打開任務管理員 → 性能標籤
  2. 記錄 Illustrator 基礎內存使用（如 200 MB）
  3. 打開測試檔案：testcases/500_rectangles.ai
  
執行步驟：
  1. 選取全部物件
  2. 點擊「排版」
  3. 觀察任務管理員的內存增長
  4. 完成後記錄峰值內存
  
驗證：
  ✅ 內存增長 < 100 MB（峰值 < 300 MB）
  ✅ 完成後內存回到基礎水平（無洩漏）
  
失敗時記錄：
  ❌ 內存峰值、是否有洩漏跡象
```

---

#### 【測試組 4】相容性測試

**測試用例 4.1：Illustrator 2021 相容性**

```
準備：
  1. 關閉 Illustrator 2026
  2. 啟動 Illustrator 2021
  
執行步驟：
  1. 打開測試檔案
  2. 執行排版功能
  
驗證：
  ✅ 外掛正常加載
  ✅ 功能正常運作
  ✅ 結果符合預期
  
失敗時記錄：
  ❌ 加載失敗或功能異常的詳細訊息
```

**測試用例 4.2：不同物件類型**

```
準備：
  1. 新建文檔，添加多種物件類型：
     - 路徑 (Path)
     - 群組 (Group)
     - 光柵 (Raster Image)
     - 文字 (Text)
  
執行步驟：
  1. 選取混合的多種物件
  2. 執行排版
  
驗證：
  ✅ 大多數物件類型可正確排版
  ✅ 無支援的類型被正確跳過或提示
  
失敗時記錄：
  ❌ 哪些物件類型無法處理、錯誤訊息
```

---

### Step 5：記錄測試結果

**測試結果表格範例**：

| 測試用例 | 預期結果 | 實際結果 | 狀態 | 備註 |
|---------|--------|--------|------|------|
| 1.1 基礎排版 | 5 個物件無重疊排列 | ✅ 排列正確 | PASS | 耗時 1.2s |
| 1.2 混合形狀 | 所有形狀無重疊排列 | ✅ 排列正確 | PASS | |
| 2.1 邊距=0 | 物件緊靠 | ✅ 正確 | PASS | |
| 2.2 單個物件 | 提示「至少需要 2 個」| ✅ 提示出現 | PASS | |
| 2.3 無法排進 | 提示「無法排進」 | ✅ 提示出現 | PASS | |
| 3.1 100 物件耗時 | < 2 秒 | 1.8 秒 | PASS | ✅ |
| 3.2 內存監控 | < 100 MB 增長 | 95 MB 增長 | PASS | ✅ |
| 4.1 AI 2021 | 正常運作 | ✅ 正常 | PASS | |
| 4.2 混合物件 | 大多數可排版 | ⚠️ 光柵無法排版 | CONDITIONAL | 記錄為已知限制 |

---

### Step 6：Bug 分類與記錄

**發現 Bug 時的記錄格式**：

```
【Bug #X】[簡述]
  - 優先級：🔴 Critical / 🟡 Major / 🟢 Minor
  - 重現率：100% / 偶發 / 難以重現
  - 重現步驟：
    1. [步驟 1]
    2. [步驟 2]
    ...
  - 預期結果：[應該發生什麼]
  - 實際結果：[實際發生什麼]
  - 截圖/日誌：[附加檔案]
  - 建議修復：[分析可能原因]
```

---

## 📊 測試決策矩陣

### 何時用 TestLab 與 人工測試

| 測試類型 | TestLab | 人工測試 | 優先級 |
|---------|--------|--------|-------|
| **邏輯驗證**（座標轉換、演算法） | ✅ 推薦 | ⚠️ 可選 | P0 |
| **模組集成**（多模組協作） | ✅ 推薦 | ⚠️ 可選 | P0 |
| **UI 與交互** | ❌ 不適用 | ✅ 必須 | P0 |
| **性能基準** | ✅ 推薦 | ✅ 驗證 | P1 |
| **相容性** | ⚠️ 部分 | ✅ 推薦 | P1 |
| **邊界條件** | ✅ 推薦 | ✅ 驗證 | P0 |
| **真實環境行為** | ❌ 不適用 | ✅ 必須 | P0 |

---

## 🔄 完整測試流程

```
【開發完成】
  ↓
【Step 1】執行 TestLab（邏輯驗證）
  ├─ 編譯源代碼
  ├─ 執行單元測試
  ├─ 執行集成測試
  └─ 所有通過？
     ├─ YES → Step 2
     └─ NO → 修復代碼 → 重新執行
  ↓
【Step 2】執行人工測試（Illustrator 環境）
  ├─ 環境準備
  ├─ 啟動 Illustrator
  ├─ 驗證外掛加載
  ├─ 執行測試用例組（功能、邊界、性能、相容性）
  └─ 全部通過？
     ├─ YES → QA 通過 ✓
     └─ NO → 記錄 Bug → 進入 Bug Fix
  ↓
【Bug Fix（如有）】
  ├─ 修復代碼
  ├─ 重新執行 TestLab
  ├─ 重新執行人工測試
  └─ 全部通過？
     ├─ YES → 進入下一階段
     └─ NO → 循環
  ↓
【QA 通過】→ 進入 DevOps 部署
```

---

**最後更新：2026-04-10**
