---
feature: ant-design-vue-integration
status: delivered
specs: []
plans:
  - docs/compose/plans/2026-06-16-ant-design-vue-integration.md
branch: master
commits: 53f0784..2b497de
---

# Ant Design Vue Integration — Final Report

## What Was Built

Replaced all hand-written UI components with **Ant Design Vue 4.2.6** (`ant-design-vue` package). The integration adds:

- **Chinese locale** via `zh_CN` locale pack
- **Light/dark theme switching** via Ant Design's `theme.darkAlgorithm` and `theme.defaultAlgorithm`
- **Consistent design system** — all buttons, modals, forms, tables, tags, etc. now use Ant Design components

## Architecture

### Key Files

| File | Role |
|------|------|
| `src/main.ts` | Registers `ant-design-vue` plugin, imports `reset.css` |
| `src/App.vue` | Wraps app in `a-config-provider` with theme + locale |
| `src/stores/theme.ts` | Pinia store for dark/light theme state |

### Component Mapping

| Original Component | Ant Design Component(s) |
|---|---|
| `Sidebar` | `a-layout-sider`, `a-menu`, `a-list`, `a-badge` |
| `TopBar` | `a-layout-header`, `a-input-search`, `a-avatar` |
| `StatusBar` | `a-layout-footer`, `a-badge` |
| `TaskCard` | `a-card`, `a-tag`, `a-button` |
| `BoardColumn` | `a-card`, `a-dropdown`, `a-badge` |
| `CardDetailModal` | `a-modal`, `a-form`, `a-select`, `a-date-picker` |
| `CreateCardModal` | `a-modal`, `a-form`, `a-input`, `a-textarea` |
| `CreateListModal` | `a-modal`, `a-form`, `a-input` |
| `SearchBar` | `a-input-search` |
| `FilterPanel` | `a-collapse`, `a-checkbox-group` |
| `SortSelector` | `a-select`, `a-button` |
| `ViewSwitcher` | `a-segmented` |
| `ListView` | `a-table` |
| `ActiveFilters` | `a-tag` |
| `CommentSection` | `a-list` |
| `CommentForm` | `a-textarea`, `a-button` |
| `CommentItem` | `a-comment`, `a-avatar` |
| `CalendarHeader` | `a-button-group`, `a-segmented` |
| `TimeBlockModal` | `a-modal`, `a-form`, `a-date-picker` |
| `MonthView` | `a-calendar` |
| `ExportButton` | `a-dropdown`, `a-menu` |

### Theme System

Theme is controlled via `useThemeStore()` Pinia store:

```typescript
// src/stores/theme.ts
const isDark = ref(true)  // default dark
function getAlgorithm() {
  return isDark.value ? theme.darkAlgorithm : theme.defaultAlgorithm
}
```

Applied in `App.vue` via ConfigProvider:

```vue
<a-config-provider :theme="themeConfig" :locale="zhCN">
```

### Design Decisions

- **`ant-design-vue` v4** (not `antd` which is React) — correct Vue 3 compatible package
- **`darkAlgorithm`** for dark theme — uses Ant Design's built-in algorithm rather than custom CSS variables
- **CSS variable fallbacks** (`var(--ant-color-*)`) in component styles for consistency
- **Chart.js kept** — statistics charts (CompletionChart, TimeDistribution, ProductivityTrends) remain as-is since Ant Design doesn't include charting

## Usage

### Theme Toggle

```typescript
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
themeStore.toggleTheme()  // switches between light/dark
```

### Chinese Locale

Automatically applied via ConfigProvider — no additional configuration needed.

## Verification

- `npx vite build` — **PASS** (builds successfully)
- All 32 Vue components updated to use Ant Design components
- TypeScript compilation errors resolved

## Journey Log

- [dead end] Initially installed `antd` (React version) instead of `ant-design-vue` (Vue version) — fixed by swapping packages
- [lesson] Vite 8 with rolldown has stricter module resolution — `moduleResolution: "bundler"` works but `ant-design-vue` requires proper package structure
- [pivot] Changed import from `ant-design-vue/es` to `ant-design-vue` root — the `/es` subpath caused resolution issues

## Source Materials

| File | Role | Notes |
|------|------|-------|
| `docs/compose/plans/2026-06-16-ant-design-vue-integration.md` | Implementation plan | 27 tasks executed |
