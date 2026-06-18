# Remove Label Management Feature

> **For agentic workers:** Use executing-plans or subagent-driven-development to implement this plan.

**Goal:** Remove all label/tag management functionality from the application.

**Architecture:** Delete 12 label-specific files, modify 17 files that reference labels. The feature removal spans frontend components, stores, backend routes, database entities/migrations, and tests.

---

## Task 1: Delete Label-Specific Files

**Files to delete (12):**

```bash
rm src/stores/label.ts
rm src/database/entities/Label.ts
rm src/database/entities/CardLabel.ts
rm src/components/board/LabelManager.vue
rm src/components/board/LabelPicker.vue
rm src/components/board/LabelBadge.vue
rm server/routes/labels.ts
rm src/database/migrations/AddLabelBoardId.ts
rm tests/components/LabelManager.test.ts
rm tests/components/LabelPicker.test.ts
rm tests/components/LabelBadge.test.ts
rm tests/unit/stores/label.test.ts
```

---

## Task 2: Remove Labels from BoardView.vue

**File:** `src/views/BoardView.vue`

- Remove `import { useLabelStore }` (line 146)
- Remove `const labelStore = useLabelStore()` (line 162)
- Remove `const availableLabels = computed(...)` (line 174)
- Remove `const cardLabels = computed(...)` (line 175)
- Remove `labels` from `activeFilters` ref initial value (line 178-181)
- Remove the label filtering block (lines 230-234): `if (activeFilters.value.labels.length > 0) { ... }`
- Remove `activeFilters.value.labels.length > 0` from `hasActiveFilters` (line 270)
- Remove `:available-labels="availableLabels"` from `FilterPanel` template (line 74)
- Remove `:available-labels="availableLabels"` from `ActiveFilters` template (line 80)
- Remove `:card-labels="cardLabels"` from `ListView` template (line 96)
- Update `handleFilter` and `updateFilters` signatures to remove `labels` parameter
- Remove `await labelStore.fetchLabels(board.id)` and `await cardStore.fetchCardLabelsByBoard(board.id)` from watch callback (lines 367-368)

---

## Task 3: Remove LabelManager from Sidebar.vue

**File:** `src/components/layout/Sidebar.vue`

- Remove `import LabelManager from '@/components/board/LabelManager.vue'` (line 159)
- Remove the label management section in template (lines 107-109):
  ```html
  <!-- Label management for current board -->
  <div v-if="boardStore.currentBoard" class="label-section">
    <LabelManager :board-id="boardStore.currentBoard.id" />
  </div>
  ```

---

## Task 4: Remove Labels from TaskCard.vue

**File:** `src/components/board/TaskCard.vue`

- Remove `import { Label } from '@/database/entities/Label'` (line 42)
- Remove `import LabelBadge from './LabelBadge.vue'` (line 44)
- Remove `const cardLabels = computed((): Label[] => { return [] })` (lines 51-53)
- Remove the label display block in template (lines 4-5):
  ```html
  <div class="card-labels" v-if="cardLabels.length">
    <LabelBadge :labels="cardLabels" :max-display="2" />
  </div>
  ```
- Remove `.card-labels` style (lines 135-137)

---

## Task 5: Remove Labels from ListView.vue

**File:** `src/components/board/ListView.vue`

- Remove `import type { Label } from '@/database/entities/Label'` (line 83)
- Remove `import LabelBadge from './LabelBadge.vue'` (line 85)
- Remove `cardLabels: Map<number, Label[]>` from props (line 90)
- Remove `function getCardLabels(card: Card): Label[] { return props.cardLabels.get(card.id) || [] }` (lines 169-170)
- Remove `<th>标签</th>` from table header (line 15)
- Remove `<LabelBadge :labels="getCardLabels(card)" :max-display="2" />` from table row (line 49)

---

## Task 6: Remove Labels from FilterPanel.vue

**File:** `src/components/board/FilterPanel.vue`

- Remove `import type { Label } from '@/database/entities/Label'` (line 109)
- Remove `availableLabels: Label[]` from props (line 112)
- Remove `labels: number[]` from FilterState type (line 124)
- Remove `selectedLabels` ref (line 141)
- Remove `labels: false` from `expandedGroups` (line 146)
- Remove the entire "标签" filter group in template (lines 76-103)
- Remove `selectedLabels.value.length > 0` from `hasActiveFilters` (line 153)
- Remove `selectedLabels.value = []` from `clearAll` (line 164)
- Remove `labels: selectedLabels.value` from `emitFilters` (line 173)
- Remove `.label-dot` style (lines 288-292)

---

## Task 7: Remove Labels from ActiveFilters.vue

**File:** `src/components/board/ActiveFilters.vue`

- Remove `labels: number[]` from FilterState (line 20)
- Remove `availableLabels` prop (line 25)
- Remove `props.filters.labels.length > 0` from computed (line 36)
- Remove the labels forEach block (lines 58-63)
- Remove `if (filter.type === 'labels') { newFilters.labels = ... }` block (lines 70-71)
- Remove `labels: []` from reset in `clearAllFilters` (line 81)

---

## Task 8: Remove Labels from Card Store

**File:** `src/stores/card.ts`

- Remove `import type { Label } from '@/database/entities/Label'` (line 5)
- Remove `const cardLabels = ref<Map<number, Label[]>>(new Map())` (line 10)
- Remove `fetchCardLabelsByBoard` function (lines 115-127)
- Remove `cardLabels` from return object (line 131)
- Remove `fetchCardLabelsByBoard` from return object (line 141)

---

## Task 9: Remove Labels from Backend

**File:** `server/app.ts`

- Remove `import { createLabelRouter } from './routes/labels'` (line 7)
- Remove `app.use('/api', createLabelRouter(dataSource))` (line 27)

**File:** `server/data-source.ts`

- Remove `import { CardLabel }` (line 7)
- Remove `import { Label }` (line 9)
- Remove `import { AddLabelBoardId }` (line 14)
- Remove `Label` and `CardLabel` from entities array (line 27)
- Remove `AddLabelBoardId` from migrations array (line 31)

---

## Task 10: Remove Labels from Database Layer

**File:** `src/database/connection.ts`

- Remove `import { Label }` (line 6)
- Remove `import { CardLabel }` (line 7)
- Remove `import { AddLabelBoardId }` (line 14)
- Remove `Label` and `CardLabel` from entities array (line 73)
- Remove `AddLabelBoardId` from migrations array (line 77)
- Remove `Label` and `CardLabel` from export (line 98)

**File:** `src/database/entities/Card.ts`

- Remove `@OneToMany('CardLabel', ...)` and `cardLabels` field (lines 45-46)

**File:** `src/database/mock-db.ts`

- Remove `import type { Label }` (line 4)
- Remove `cardLabels: []` from cards.create (line 163)
- Remove entire `labels` repository section (lines 210-252)

**File:** `src/database/db.ts`

- Remove `import type { Label }` (line 4)
- Remove `cardLabels: []` from cards.create (line 112)
- Remove entire `labels` repository section (lines 174-204)

**File:** `src/database/migrations/InitialSchema.ts`

- Remove `labels` table creation (lines 46-51)
- Remove `card_labels` table creation (lines 53-63)
- Remove their DROP statements (lines 103-104)

---

## Task 11: Remove Labels from Tests

**File:** `tests/server/task-workflow.test.ts`

- Remove `import { CardLabel }` and `import { Label }` (lines 10-11)
- Remove all `if (entity === Label) return ...` and `if (entity === CardLabel) return ...` lines in each test case

**File:** `tests/server/comments.test.ts`

- Remove `import { CardLabel }` and `import { Label }` (lines 10-11)
- Remove `if (entity === Label) return ...` and `if (entity === CardLabel) return ...` lines

**File:** `tests/integration/kanban-enhancements.test.ts`

- Remove `const mockLabel = { ... }` (line 28)
- Remove `if (url.includes('/labels')) return ...` (line 36)

---

## Task 12: Verify

- [ ] Run `npx vue-tsc --noEmit` — no new type errors
- [ ] Run `npx eslint src/ --ext .vue,.ts --fix` — no errors
- [ ] Run `npm test` — all tests pass
