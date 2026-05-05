# TestProject-Web

**目的**：驗證 Development-Framework 在 Next.js 項目中的可用性

**技術棧**：Next.js 14 + React 18 + TypeScript + Jest + React Testing Library

---

## 快速開始

### 1. 閱讀框架文檔（5-20 分鐘）

```bash
START_HERE.md              # 5 分鐘快速認識框架
QUICK_START.md             # 20 分鐘準備開始開發
ADAPTATION_GUIDE.md        # 如何改造框架
```

### 2. 了解八角色系統

```bash
.team/
├── 01_PM_PRODUCT_MANAGER.md          # PM 角色
├── 02_DEVELOPER_ROLE.md              # Developer 角色
├── 03_ARCHITECT_ROLE.md              # Architect 角色
├── 04_UI_UX_DESIGNER.md              # UI&UX 設計師
├── 05_QA_TESTER.md                   # QA 測試工程師
├── 06_DEVOPS_RELEASE.md              # DevOps 發佈工程師
├── 07_DOC_MANAGER.md                 # 文檔經理
└── 08_TRANSLATOR_ROLE.md             # Translator 角色
```

### 3. 開始開發工作流程

觸發特定指令開始工作：

```
@NEW_FEATURE      # 新功能開發
@ARCHITECT_REVIEW # 架構審核
@START_DEVELOPMENT # 開始開發
@QA_TESTING       # QA 測試
@CODE_REVIEW      # 代碼審查
@DEVOPS_DEPLOY    # DevOps 部署
```

---

## 代碼規範與測試

### 代碼規範

遵循 `.guidelines/Coding_Standards.md`：
- TypeScript 類型安全
- camelCase 變數名、PascalCase 元件名
- JSDoc 註釋
- ESLint + Prettier 自動格式化

### 測試指南

遵循 `.guidelines/Testing_Guide.md`：
- 單元測試（Jest + 邏輯層）
- 集成測試（React Testing Library + 多元件交互）
- UI 手動測試（視覺驗證、跨瀏覽器）

---

## 項目結構

```
src/
├── components/       # React 元件（PascalCase）
├── pages/           # Next.js 路由頁面
├── lib/             # 工具函式
├── styles/          # 全域樣式
├── types/           # TypeScript 類型定義
└── hooks/           # Custom Hooks
```

---

## 決策記錄

所有架構決策記錄在：`.project/DECISIONS.md`

格式：
```
【決策 #N】決策名稱
- 日期：[日期]
- 決策者：[角色]
- 內容：[具體決策]
- 理由：[為什麼做這個決策]
- 替代方案：[考慮過的其他方案]
```

---

## 驗證檢查清單

進度追蹤：見 `VERIFICATION_LOG.md`

---

## 相關文檔

| 文檔 | 用途 |
|------|------|
| START_HERE.md | 框架入門 |
| QUICK_START.md | 開發準備 |
| .project/PROJECT_SCOPE.md | 項目範疇 |
| .project/ARCHITECTURE.md | 架構設計 |
| .guidelines/Coding_Standards.md | 代碼規範 |
| .guidelines/Testing_Guide.md | 測試指南 |
| VERIFICATION_LOG.md | 驗證進度 |

---

**框架版本**：Development-Framework v0.1
**上次更新**：2026-04-14
