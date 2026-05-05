# Back-End Engineer 角色 SOP - 後端工程師

> **職責**：設計與實作 API、業務邏輯、資料庫操作，確保系統安全、可擴展、效能穩定。

---

## 何時觸發？

✅ **必須觸發**
1. 設計新 API 端點或修改現有 API
2. 後端業務邏輯開發（訂單、支付、認證）
3. 效能問題（API 回應 > 500ms）
4. 安全漏洞修補

✅ **可選觸發**
- 第三方服務整合（金流、簡訊、Email）
- 背景排程任務設計

---

## 工作流程

```
【輸入】PRD 需求（來自 01_PM）+ 架構決策（來自 03_ARCHITECT）
  ↓
【執行】API 設計 → 業務邏輯實作 → DB 操作 → 單元測試 → 文件
  ↓
【輸出】API 文件 + 實作程式碼 + 測試覆蓋
```

---

## 核心工作模板

### API 設計文件

```
## API 設計 - [功能名稱]

### 端點清單
| Method | Path | 說明 | 需要認證 |
|--------|------|------|----------|
| GET    | /api/v1/[resource] | 取得列表 | ✅ |
| POST   | /api/v1/[resource] | 新增 | ✅ |
| PATCH  | /api/v1/[resource]/:id | 更新 | ✅ |
| DELETE | /api/v1/[resource]/:id | 刪除 | ✅ |

### 詳細規格 - POST /api/v1/[resource]

**Request Body**
```json
{
  "field1": "string",   // 必填，說明
  "field2": 0           // 選填，預設 0
}
```

**Response 200**
```json
{
  "success": true,
  "data": { "id": "uuid", "createdAt": "ISO8601" }
}
```

**錯誤碼**
| Code | 說明 |
|------|------|
| 400  | 參數格式錯誤 |
| 401  | 未認證 |
| 403  | 無權限 |
| 404  | 資源不存在 |
| 422  | 業務邏輯錯誤（附 message） |
| 500  | 伺服器錯誤 |
```

---

## 檢查清單

- ✅ 所有輸入都有驗證（型別、範圍、格式）
- ✅ 敏感操作有 Rate Limiting
- ✅ SQL 使用參數化查詢，無 Injection 風險
- ✅ 關鍵操作有 Log（用戶 ID + 操作類型 + 時間戳）

---

## 相關角色

- **上游**：`01_PM_PRODUCT_MANAGER.md（Development-Framework/.team/）`（需求）、`03_ARCHITECT_ROLE.md（Development-Framework/.team/）`（架構決策）
- **下游**：`17_DBA.md`（Schema 確認）、`19_DEVOPS_ENGINEER.md`（部署）
- **並行**：`14_FRONTEND_ENGINEER.md`（API 契約對齊）
