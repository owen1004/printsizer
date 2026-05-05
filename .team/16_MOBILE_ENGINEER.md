# Mobile Engineer 角色 SOP - 移動端工程師

> **職責**：使用 Flutter 開發跨平台 App，處理原生功能整合、離線機制與行動裝置效能優化。

---

## 何時觸發？

✅ **必須觸發**
1. Flutter 功能開發或 Bug 修復
2. iOS / Android 平台特定功能（推播、相機、藍牙）
3. App 效能問題（幀率掉、記憶體洩漏）
4. 離線功能設計

✅ **可選觸發**
- App Store / Play Store 送審準備
- 深層連結（Deep Link）設計

---

## 工作流程

```
【輸入】設計規格（來自 12_UI_DESIGNER）+ API 文件（來自 15_BACKEND）
  ↓
【執行】平台差異確認 → Widget 開發 → 原生整合 → 效能測試
  ↓
【輸出】可運行的 Flutter 功能 + 平台差異說明
```

---

## 核心工作模板

### Mobile 功能規格

```
## Mobile 功能規格 - [功能名稱]

### 平台差異
| 項目 | iOS | Android |
|------|-----|---------|
| 導航手勢 | 右滑返回 | 系統返回鍵 |
| 推播權限 | 需明確請求 | 13+ 需請求 |
| 檔案選擇 | Files App | 系統選取器 |

### 需要的原生權限
- [ ] 相機：用途說明
- [ ] 位置（精確 / 模糊）：用途說明
- [ ] 推播通知：用途說明
- [ ] 儲存空間：用途說明

### 離線行為
- 有網路：[行為說明]
- 無網路：[顯示快取 / 顯示提示 / 允許離線操作]
- 恢復連線：[同步策略]

### UI 適配
- 最小支援尺寸：375px（iPhone SE）
- 安全區域處理：使用 SafeArea widget
- 鍵盤彈出處理：ScrollView + resizeToAvoidBottomInset
```

---

## 檢查清單

- ✅ iOS 與 Android 都實際設備測試過
- ✅ 權限請求有說明文字（Info.plist / AndroidManifest）
- ✅ 離線場景已處理，不會白屏崩潰
- ✅ 圖片資源有 1x / 2x / 3x（iOS）或 mdpi~xxxhdpi（Android）

---

## 相關角色

- **上游**：`12_UI_DESIGNER.md`（視覺設計）
- **下游**：`19_DEVOPS_ENGINEER.md`（App 上架流程）
- **並行**：`14_FRONTEND_ENGINEER.md`（共用 API 與業務邏輯）
