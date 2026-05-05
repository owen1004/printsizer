# Debug & Logging 系統 - Debug And Logging System

> **用途**：建立自動化的問題追蹤系統，透過實時日誌監聽快速定位問題
> **核心工具**：monitor.bat（實時日誌監聽工具）
> **參考**：X:\Illustrator-AINest\monitor.bat

---

## 📊 Monitor.bat 原理分析

### 完整代碼

```batch
@echo off
title AINest Log Monitor — 即時除錯視窗
color 0A
echo ============================================
echo   AINest Log Monitor
echo   監聽: X:\Illustrator-AINest\AINest_debug.log
echo   開啟 Illustrator 並執行測試，此視窗會即時更新
echo ============================================
echo.
powershell -NoProfile -Command "Get-Content -Path 'X:\Illustrator-AINest\AINest_debug.log' -Wait -Tail 60"
pause
```

---

### 逐行分析

#### Line 1-2：批處理配置

```batch
@echo off
title AINest Log Monitor — 即時除錯視窗
```

- **`@echo off`**：關閉命令回顯
  - 效果：只顯示代碼輸出，不顯示執行的命令本身
  - 原因：讓控制台更乾淨、易讀

- **`title ...`**：設置窗口標題
  - 效果：任務欄顯示「AINest Log Monitor — 即時除錯視窗」
  - 好處：多個視窗時易於識別

---

#### Line 3：視覺效果

```batch
color 0A
```

- **顏色碼**：`0A` = 黑底 (0) + 綠字 (A)
  - 經典的黑客/終端風格
  - 提高可讀性，綠色表示「監聽中」

| 顏色碼 | 效果 | 用途 |
|-------|------|------|
| `0A` | 黑底綠字 | 監聽模式（正常） |
| `0C` | 黑底紅字 | 錯誤警告 |
| `0E` | 黑底黃字 | 注意事項 |

---

#### Line 4-9：信息提示

```batch
echo ============================================
echo   AINest Log Monitor
echo   監聽: X:\Illustrator-AINest\AINest_debug.log
echo   開啟 Illustrator 並執行測試，此視窗會即時更新
echo ============================================
echo.
```

- **作用**：向用戶顯示：
  - 工具名稱
  - 監聽的文件路徑
  - 使用說明
  - 空行（易讀性）

---

#### Line 10：**核心命令** ⭐

```batch
powershell -NoProfile -Command "Get-Content -Path 'X:\Illustrator-AINest\AINest_debug.log' -Wait -Tail 60"
```

這是整個工具的核心！讓我逐個參數分析：

| 參數 | 作用 | 原理 |
|------|------|------|
| `powershell` | 調用 PowerShell 引擎 | Windows 內建，無需額外安裝 |
| `-NoProfile` | 快速啟動（跳過配置加載） | 加快 PowerShell 啟動速度 |
| `-Command "..."` | 執行命令 | 傳遞 PowerShell 命令 |
| `Get-Content` | 讀取文件內容 | PowerShell 的文件讀取工具 |
| `-Path '...'` | 指定文件路徑 | 要監聽的 debug.log 檔案 |
| **`-Wait`** | **持續監聽新行** | 🔑 **關鍵參數**！ |
| **`-Tail 60`** | **只顯示最後 60 行** | 避免一次性輸出太多舊日誌 |

---

### 🔑 核心機制：`Get-Content -Wait`

```
【工作原理】

1️⃣ 程式啟動
   ↓
2️⃣ 讀取 AINest_debug.log 的最後 60 行
   ↓
3️⃣ 在控制台顯示這 60 行
   ↓
4️⃣ 進入「監聽模式」（-Wait 參數）
   ├─ 等待文件有新內容寫入
   └─ 一旦有新行 → 立即顯示
   ↓
5️⃣ 無限循環，直到用戶按 Ctrl+C 或關閉窗口
```

**比喻**：
- `Get-Content` 不帶 `-Wait` = 讀一遍就結束（cat 命令）
- `Get-Content` 帶 `-Wait` = 持續監聽（tail -f 命令）

---

#### Line 11：等待用戶退出

```batch
pause
```

- **作用**：按任意鍵退出程式
- **好處**：避免監聽窗口自動關閉，用戶可以看最後的日誌

---

## 📋 完整執行流程圖

```
【雙擊 monitor.bat】
  ↓
【批處理啟動】
  ├─ 設置窗口標題
  ├─ 設置黑底綠字
  └─ 顯示歡迎信息
  ↓
【啟動 PowerShell】
  ↓
【PowerShell 執行】：
  Get-Content -Path 'AINest_debug.log' -Wait -Tail 60
  ↓
【顯示最後 60 行】
  ├─ 讀取檔案當前內容的最後 60 行
  ├─ 一次性顯示在屏幕上
  └─ 控制台變為綠色
  ↓
【進入監聽模式】
  ├─ 當你在 Illustrator 中操作時
  ├─ AINest 外掛寫入新日誌行
  ├─ monitor 立即捕捉 → 顯示新行
  └─ 實時滾動更新
  ↓
【用戶操作】
  ├─ 問題發生 → 日誌中立即出現
  ├─ 你看屏幕 → 立即發現原因
  └─ 無需截圖或口頭說明
  ↓
【退出監聽】
  └─ 按 Ctrl+C 或關閉窗口 → 按 Enter 結束
```

---

## 🎯 為什麼這套系統效率高

### vs 傳統 Debug 方式

| 方面 | 傳統方式 | Monitor 方式 |
|------|--------|-----------|
| **信息捕捉** | 截圖（看不全） | 日誌完整記錄 |
| **實時性** | 事後報告 | 實時顯示 |
| **準確性** | 你的描述 + 截圖 | 程式自動記錄 |
| **可重現性** | 難以重現 | 日誌 = 完整證據 |
| **速度** | 截圖 + 描述 + 等我理解 | 我直接讀日誌 |
| **信息量** | 有限 | 完整堆棧跟蹤 |

---

## 💡 Monitor.bat 的延伸應用

### 1️⃣ 多窗口並行監聽

```batch
:: monitor_multi.bat - 同時監聽多個 log 檔案
@echo off
color 0A
echo 啟動多個監聽窗口...

:: 窗口 1：主 debug.log
start "AINest Debug" powershell -NoProfile -Command "Get-Content -Path 'X:\Illustrator-AINest\AINest_debug.log' -Wait -Tail 60"

:: 窗口 2：SDK debug.log
start "SDK Debug" powershell -NoProfile -Command "Get-Content -Path 'X:\Illustrator-AINest\SDK_debug.log' -Wait -Tail 60"

:: 窗口 3：Illustrator 日誌
start "Illustrator Log" powershell -NoProfile -Command "Get-Content -Path '%APPDATA%\Adobe\Illustrator\debug.log' -Wait -Tail 60"

pause
```

**效果**：3 個監聽窗口並行，一次看全部日誌

---

### 2️⃣ 帶時間戳的監聽

```batch
:: monitor_timestamp.bat - 顯示每行的時間戳
@echo off
color 0A
powershell -NoProfile -Command @"
  Get-Content -Path 'X:\Illustrator-AINest\AINest_debug.log' -Wait -Tail 60 | ForEach-Object {
    '[{0:HH:mm:ss}] {1}' -f (Get-Date), $_
  }
"@
pause
```

**效果**：每條日誌行前自動加上 `[HH:mm:ss]` 時間戳

---

### 3️⃣ 顏色過濾（ERROR 變紅）

```batch
:: monitor_color.bat - 不同級別不同顏色
@echo off
color 0A
powershell -NoProfile -Command @"
  Get-Content -Path 'X:\Illustrator-AINest\AINest_debug.log' -Wait -Tail 60 | ForEach-Object {
    if ($_ -match 'ERROR') {
      Write-Host $_ -ForegroundColor Red
    } elseif ($_ -match 'WARNING') {
      Write-Host $_ -ForegroundColor Yellow
    } else {
      Write-Host $_
    }
  }
"@
pause
```

**效果**：ERROR 紅色、WARNING 黃色、INFO 綠色

---

## 📝 配合 Debug.log 寫入規範

### 在 C++ 中寫入日誌

```cpp
// 在 Illustrator 外掛中寫入日誌
#include <fstream>
#include <chrono>

class DebugLogger {
private:
  std::ofstream logFile;
  
public:
  DebugLogger(const std::string& logPath) {
    logFile.open(logPath, std::ios::app);  // 追加模式
  }
  
  void log(const std::string& level, const std::string& message) {
    auto now = std::chrono::system_clock::now();
    auto time = std::chrono::system_clock::to_time_t(now);
    
    logFile << "[" << std::put_time(std::localtime(&time), "%H:%M:%S") << "] "
            << "[" << level << "] "
            << message << std::endl;
    logFile.flush();  // 🔑 即時寫入（monitor 才能立即看到）
  }
};

// 使用範例
DebugLogger logger("X:\\Illustrator-AINest\\AINest_debug.log");

logger.log("INFO", "外掛已加載");
logger.log("DEBUG", "座標轉換：(" + std::to_string(x) + "," + std::to_string(y) + ")");
logger.log("ERROR", "座標無效：超出邊界");
logger.log("WARNING", "性能警告：耗時 > 2 秒");
```

---

## 🔍 典型調試流程

```
【步驟 1】打開 monitor.bat
  ↓ 窗口變成綠色，開始監聽
【步驟 2】在 Illustrator 中操作
  ↓ 執行測試
【步驟 3】看日誌實時滾動
  例如：
  [10:23:45] [INFO] 排版開始
  [10:23:46] [DEBUG] 座標變換 (100, 200) → (100, 800)
  [10:23:47] [ERROR] 物件超出邊界：ID=3
  ↓ 立即知道問題在哪
【步驟 4】停止並修復
  ├─ 關閉 monitor.bat
  ├─ 修改代碼
  ├─ 重新編譯
  └─ 再次打開 monitor.bat 驗證
```

---

## ✅ Monitor.bat 的優勢總結

| 優勢 | 說明 |
|------|------|
| **實時性** | 操作的同時看到日誌，無延遲 |
| **完整性** | 日誌記錄所有細節（堆棧、變數、狀態） |
| **自動化** | 無需手動截圖或複製貼上 |
| **可視化** | 黑底綠字，易於長時間盯著看 |
| **易用性** | 雙擊即用，無複雜命令 |
| **精準定位** | 時間戳 + 日誌等級 = 快速定位 |
| **減少溝通成本** | 我直接看日誌，無需你解釋 |

---

## 🚀 下一步應用

在新的 Illustrator 工具開發中：

1. **複製 monitor.bat** 到新專案
2. **修改路徑**（改成新專案的 debug.log 路徑）
3. **建立 Debug 寫入規範**（統一日誌格式）
4. **建立 Log 分析工具**（更高級的過濾、搜尋、統計）

---

**最後更新**：2026-04-10
