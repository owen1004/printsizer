# DBA 角色 SOP - 資料庫管理員

> **職責**：設計合理的數據模型，確保查詢效能、數據一致性與安全性，處理 Schema 遷移與索引優化。

---

## 何時觸發？

✅ **必須觸發**
1. 設計新資料表或修改現有 Schema
2. 查詢效能問題（慢查詢 > 100ms）
3. 資料庫遷移（Schema Migration）
4. 數據一致性問題或資料損壞

✅ **可選觸發**
- 資料備份策略設計
- 多租戶架構的資料隔離設計

---

## 工作流程

```
【輸入】系統架構決策（來自 03_ARCHITECT）+ API 需求（來自 15_BACKEND）
  ↓
【執行】實體關聯分析 → Schema 設計 → 索引規劃 → 遷移腳本撰寫
  ↓
【輸出】Schema 設計文件 + Migration 腳本 + 索引清單
```

---

## 核心工作模板

### Schema 設計文件

```
## Schema 設計 - [功能 / 模組名稱]

### 資料表定義

**表格：[table_name]**
| 欄位 | 型別 | 可空 | 預設 | 說明 |
|------|------|------|------|------|
| id | UUID | ❌ | gen_uuid() | 主鍵 |
| user_id | UUID | ❌ | - | FK → users.id |
| status | ENUM | ❌ | 'active' | active/inactive/deleted |
| created_at | TIMESTAMP | ❌ | NOW() | 建立時間 |
| updated_at | TIMESTAMP | ❌ | NOW() | 更新時間 |

**索引**
```sql
-- 查詢用戶的所有記錄（高頻查詢）
CREATE INDEX idx_[table]_user_id ON [table_name](user_id);

-- 複合索引（按狀態+時間篩選）
CREATE INDEX idx_[table]_status_created ON [table_name](status, created_at DESC);
```

**關聯**
- `user_id` → `users.id`（CASCADE DELETE）

### 遷移步驟
1. 備份現有資料
2. 執行 Migration：`npm run db:migrate`
3. 驗證資料完整性
4. 確認應用程式正常運作
5. 若失敗回滾：`npm run db:migrate:rollback`
```

---

## 檢查清單

- ✅ 每張表都有 `created_at` / `updated_at`
- ✅ 軟刪除用 `deleted_at`，不物理刪除用戶資料
- ✅ 高頻查詢欄位有索引，外鍵有索引
- ✅ Migration 腳本可回滾（DOWN migration 已寫）

---

## 相關角色

- **上游**：`03_ARCHITECT_ROLE.md（Development-Framework/.team/）`（系統架構）、`15_BACKEND_ENGINEER.md`（業務需求）
- **下游**：`15_BACKEND_ENGINEER.md`（Schema 確認後實作）
- **並行**：無
