# Log 寫入標準 - Logging Standards

> **用途**：統一所有 Illustrator 外掛的日誌格式，便於快速追蹤和分析
> **應用**：所有外掛代碼都應遵循此標準寫入日誌
> **目標**：結構化日誌 → 快速定位問題

---

## 📋 Log 格式規範

### 基礎格式

```
[HH:MM:SS] [LEVEL] [MODULE] [Function] Message

範例：
[10:23:45] [INFO] CoordTransform toVisual() Coordinate transform: (100,100) → (100,900)
[10:23:46] [DEBUG] NestingAlgo nest() Algorithm iteration 1, placed 3 shapes
[10:23:47] [ERROR] BoundsCheck GetArtBounds() Failed to get bounds for object ID=5
[10:23:48] [WARNING] Performance nest() Execution time exceeded 2s: 2.3s
```

### 格式詳解

| 部分 | 說明 | 範例 |
|------|------|------|
| **[HH:MM:SS]** | 時間戳（秒級） | [10:23:45] |
| **[LEVEL]** | 日誌級別 | [INFO] / [DEBUG] / [ERROR] / [WARNING] |
| **[MODULE]** | 所屬模組 | [CoordTransform] / [NestingAlgo] |
| **[Function]** | 函式名 | toVisual() / nest() |
| **Message** | 詳細訊息 | 實際輸出的信息 |

---

## 📊 日誌級別定義

### Level 4 層級

| 級別 | 符號 | 何時使用 | 顏色 | 例子 |
|------|------|---------|------|------|
| **INFO** | ℹ️ | 重要的程序流程 | 綠 | 「排版開始」、「完成」 |
| **DEBUG** | 🐞 | 詳細調試信息 | 藍 | 變數值、座標、計算中間值 |
| **WARNING** | ⚠️ | 潛在問題（非致命） | 黃 | 性能下降、異常輸入 |
| **ERROR** | ❌ | 致命錯誤、異常 | 紅 | crash、無法處理的情況 |

---

## 💻 C++ 實現：Logger 類

### 基礎 Logger 實現

```cpp
// Logger.h
#pragma once
#include <fstream>
#include <string>
#include <chrono>
#include <iomanip>
#include <sstream>

class Logger {
private:
  std::ofstream logFile;
  std::string moduleName;
  
public:
  Logger(const std::string& logPath, const std::string& module)
    : moduleName(module) {
    logFile.open(logPath, std::ios::app);  // 追加模式
  }
  
  ~Logger() {
    if (logFile.is_open()) {
      logFile.close();
    }
  }
  
  // 獲取時間戳
  std::string getTimestamp() {
    auto now = std::chrono::system_clock::now();
    auto time = std::chrono::system_clock::to_time_t(now);
    
    std::stringstream ss;
    ss << std::put_time(std::localtime(&time), "%H:%M:%S");
    return ss.str();
  }
  
  // 通用 log 函式
  void log(const std::string& level, 
           const std::string& function,
           const std::string& message) {
    std::string logLine = "[" + getTimestamp() + "] [" + level + "] [" 
                        + moduleName + "] " + function + " " + message;
    
    logFile << logLine << std::endl;
    logFile.flush();  // 🔑 即時寫入，monitor 才能立即看到
    
    // 同時輸出到控制台（調試時看 Debug Output）
    #ifdef _DEBUG
      OutputDebugStringA((logLine + "\n").c_str());
    #endif
  }
  
  // 便利函式
  void info(const std::string& function, const std::string& message) {
    log("INFO", function, message);
  }
  
  void debug(const std::string& function, const std::string& message) {
    log("DEBUG", function, message);
  }
  
  void warning(const std::string& function, const std::string& message) {
    log("WARNING", function, message);
  }
  
  void error(const std::string& function, const std::string& message) {
    log("ERROR", function, message);
  }
};

// 全局 Logger 實例
extern Logger g_logger;
```

---

### Logger 使用範例

```cpp
// main.cpp
#include "Logger.h"

// 全局 Logger 實例（在外掛初始化時建立）
Logger g_logger("X:\\Illustrator-AINest\\AINest_debug.log", "AINest");

// ============================================
// 例子 1：座標轉換
// ============================================
class CoordinateTransformer {
public:
  AIRealPoint toVisual(const Point& algoPoint) {
    g_logger.debug("toVisual()", 
      "Converting algorithm coordinates: (" + 
      std::to_string(algoPoint.x) + "," + 
      std::to_string(algoPoint.y) + ")");
    
    AIRealPoint visualPoint;
    visualPoint.h = algoPoint.x;
    visualPoint.v = 1000 - algoPoint.y;  // Y 軸翻轉
    
    g_logger.debug("toVisual()", 
      "Result: (" + std::to_string(visualPoint.h) + "," + 
      std::to_string(visualPoint.v) + ")");
    
    return visualPoint;
  }
};

// ============================================
// 例子 2：排版演算法
// ============================================
class NestingAlgorithm {
public:
  NestingResult nest(const std::vector<Shape>& shapes) {
    g_logger.info("nest()", 
      "Nesting started with " + std::to_string(shapes.size()) + " shapes");
    
    int placedCount = 0;
    auto startTime = std::chrono::high_resolution_clock::now();
    
    for (int i = 0; i < shapes.size(); ++i) {
      bool placed = placeShape(shapes[i]);
      if (placed) {
        placedCount++;
        g_logger.debug("nest()", 
          "Shape " + std::to_string(i) + " placed successfully");
      } else {
        g_logger.warning("nest()", 
          "Shape " + std::to_string(i) + " could not be placed");
      }
    }
    
    auto endTime = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(
      endTime - startTime).count();
    
    // 性能檢查
    if (duration > 2000) {
      g_logger.warning("nest()", 
        "Performance warning: execution time " + 
        std::to_string(duration) + "ms (target: < 2000ms)");
    }
    
    g_logger.info("nest()", 
      "Nesting completed: " + std::to_string(placedCount) + "/" + 
      std::to_string(shapes.size()) + " shapes placed in " + 
      std::to_string(duration) + "ms");
    
    return {placedCount == shapes.size(), placedCount, duration};
  }
  
private:
  bool placeShape(const Shape& shape) {
    g_logger.debug("placeShape()", 
      "Attempting to place shape with bounds: (" + 
      std::to_string(shape.width) + "x" + std::to_string(shape.height) + ")");
    
    try {
      // 放置邏輯...
      return true;
    } catch (const std::exception& e) {
      g_logger.error("placeShape()", 
        "Exception: " + std::string(e.what()));
      return false;
    }
  }
};

// ============================================
// 例子 3：錯誤處理
// ============================================
void processSelection() {
  AIDocumentHandle docHandle = sAIDocument->GetDocumentHandle();
  if (!docHandle) {
    g_logger.error("processSelection()", 
      "Failed to get document handle");
    return;
  }
  
  g_logger.info("processSelection()", "Document handle obtained");
  
  int selectionCount = getSelectionCount(docHandle);
  g_logger.debug("processSelection()", 
    "Selection count: " + std::to_string(selectionCount));
  
  if (selectionCount < 2) {
    g_logger.warning("processSelection()", 
      "Invalid selection: at least 2 objects required");
    return;
  }
  
  g_logger.info("processSelection()", "Processing selection");
  // 處理邏輯...
}
```

---

## 📝 常見日誌場景

### 場景 1：函式入口/出口

```cpp
void myFunction(int param1, const std::string& param2) {
  // 入口
  g_logger.debug("myFunction()", 
    "Entry with param1=" + std::to_string(param1) + 
    ", param2=" + param2);
  
  // ... 函式邏輯 ...
  
  // 出口
  g_logger.debug("myFunction()", "Exit");
}
```

---

### 場景 2：條件分支

```cpp
if (condition) {
  g_logger.debug("processLogic()", "Condition A: true, executing path A");
  // Path A...
} else {
  g_logger.debug("processLogic()", "Condition A: false, executing path B");
  // Path B...
}
```

---

### 場景 3：迴圈中的進度

```cpp
for (int i = 0; i < items.size(); ++i) {
  g_logger.debug("processItems()", 
    "Processing item " + std::to_string(i+1) + "/" + 
    std::to_string(items.size()));
  
  // 每 10 個物件輸出一次進度（避免日誌爆炸）
  if (i % 10 == 0) {
    g_logger.info("processItems()", 
      "Progress: " + std::to_string(i) + " items processed");
  }
}
```

---

### 場景 4：例外處理

```cpp
try {
  // 風險代碼
  AIRealPoint point = transform(input);
  g_logger.debug("transform()", "Transform succeeded");
} catch (const std::invalid_argument& e) {
  g_logger.error("transform()", 
    "Invalid argument: " + std::string(e.what()));
} catch (const std::exception& e) {
  g_logger.error("transform()", 
    "Unexpected exception: " + std::string(e.what()));
}
```

---

### 場景 5：性能監控

```cpp
auto startTime = std::chrono::high_resolution_clock::now();

// ... 耗時操作 ...

auto endTime = std::chrono::high_resolution_clock::now();
auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(
  endTime - startTime).count();

g_logger.debug("heavyOperation()", 
  "Execution time: " + std::to_string(duration) + "ms");

if (duration > PERFORMANCE_THRESHOLD) {
  g_logger.warning("heavyOperation()", 
    "Performance threshold exceeded: " + std::to_string(duration) + 
    "ms > " + std::to_string(PERFORMANCE_THRESHOLD) + "ms");
}
```

---

## 🎯 日誌最佳實踐

### ✅ 做這些

```cpp
// ✅ 好：清晰的操作流程
g_logger.info("nest()", "Nesting started");
g_logger.info("nest()", "Nesting completed: 5/5 shapes placed");

// ✅ 好：含有上下文的錯誤信息
g_logger.error("getArtBounds()", 
  "Failed to get bounds for objectID=123, reason: object is locked");

// ✅ 好：關鍵數值記錄
g_logger.debug("calculateArea()", 
  "Area calculated: 1000.50 (width=50, height=20)");

// ✅ 好：性能指標
g_logger.info("nest()", "Execution time: 1.2s (target: < 2s) ✓");
```

---

### ❌ 避免這些

```cpp
// ❌ 差：沒有上下文的訊息
g_logger.info("", "Failed");

// ❌ 差：過於詳細，造成日誌爆炸
for (int i = 0; i < 10000; ++i) {
  g_logger.debug("", "Processing item " + std::to_string(i));  // 爆炸！
}

// ❌ 差：不清楚的錯誤訊息
g_logger.error("", "Error in AI");

// ❌ 差：含有敏感信息（密鑰、密碼）
g_logger.debug("", "API Key: " + apiKey);  // 不要！
```

---

## 📊 日誌分析技巧

### 快速掃描日誌

```
【查找錯誤】
  搜尋 "[ERROR]" → 找到所有失敗點

【追蹤時間序列】
  按時間戳排序 → 看事件發生順序

【分析性能】
  搜尋 "[WARNING] ... time" → 找慢速操作

【追蹤函式流程】
  搜尋 "Entry" + "Exit" → 看函式調用路徑
```

---

## 🔍 Monitor.bat 與 Log 的整合

**流程圖**：

```
【打開 monitor.bat】
  ↓ 監聽 debug.log 檔案
【進行 Illustrator 操作】
  ↓ 外掛寫入日誌
【monitor 實時顯示】
  例如：
  [10:23:45] [INFO] CoordTransform toVisual() Start
  [10:23:45] [DEBUG] CoordTransform toVisual() Input: (100,100)
  [10:23:45] [DEBUG] CoordTransform toVisual() Output: (100,900)
  [10:23:46] [INFO] NestingAlgo nest() 5/5 shapes placed
  ↓ 立即發現任何問題
【複製日誌給 Claude Code】
  ↓ 分析並修復
```

---

## ✅ 日誌規範檢查清單

在提交代碼前，檢查：

- [ ] 所有重要操作都有 INFO 級別日誌
- [ ] 詳細調試信息使用 DEBUG 級別
- [ ] 異常情況有 WARNING / ERROR 級別日誌
- [ ] 時間戳正確（HH:MM:SS 格式）
- [ ] 包含函式名和模組名
- [ ] 沒有敏感信息（密鑰、密碼）
- [ ] 沒有日誌爆炸（無限迴圈輸出）
- [ ] 關鍵數值都被記錄（座標、計數、時間）
- [ ] 錯誤訊息清晰且可操作

---

**最後更新**：2026-04-10
