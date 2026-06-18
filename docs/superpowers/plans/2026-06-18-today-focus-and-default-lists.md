# Today Focus and Default Lists Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create every new board with a three-column workflow and add a persistent, date-aware “今日聚焦” workflow to the board.

**Architecture:** Board creation uses a TypeORM transaction so the board and default lists are atomic. A new daily override table stores only per-day include/exclude decisions, while a focused backend service derives automatic items from cards, due dates, and lists named `已完成`. A dedicated Pinia store and focused Vue components keep this optional surface isolated from core board loading.

**Tech Stack:** Vue 3, TypeScript, Pinia, Ant Design Vue, Express 5, TypeORM, SQL.js, Jest, Vue Test Utils, Supertest, Playwright

## Global Constraints

- Existing boards must not receive default lists automatically.
- Default list names and positions are exactly `待开始` (1), `进行中` (2), `已完成` (3).
- “已完成” matching trims surrounding whitespace and does not introduce a list status field.
- Manual focus decisions apply only to one local calendar date in `YYYY-MM-DD` form.
- More than three focus items shows advice but never blocks an action.
- No desktop notifications, recurring tasks, timers, generic automation, batch operations, or new complex filters.
- Focus failures must not block the core board.
- Preserve unrelated working-tree changes and commit only files belonging to each task.

---

## File Structure

- `server/routes/boards.ts`: make new-board creation atomic and seed the default lists.
- `src/database/entities/DailyFocusOverride.ts`: define the persisted daily include/exclude decision.
- `src/database/migrations/AddDailyFocusOverridesTable.ts`: create the focus override table, unique key, and foreign key.
- `server/data-source.ts`: register the new entity and migration.
- `server/focus.ts`: own date validation, completed-list matching, focus derivation, and sorting.
- `server/routes/focus.ts`: expose board focus reads and per-card focus writes.
- `server/app.ts`: mount focus routes.
- `src/services/api.ts`: add the missing typed `PUT` helper.
- `src/stores/focus.ts`: own focus API state and mutations.
- `src/components/board/TodayFocusBar.vue`: render loading, error, empty, compact items, overflow advice, and task selection.
- `src/components/board/TaskCard.vue`: expose a hover focus toggle without changing card navigation.
- `src/components/board/CardDetailModal.vue`: expose the stable focus toggle in task details.
- `src/views/BoardView.vue`: load and refresh focus, render the bar, and connect component events.
- `tests/server/default-board-lists.test.ts`: verify atomic board initialization.
- `tests/server/focus.test.ts`: verify focus rules and API validation.
- `tests/unit/stores/focus.test.ts`: verify store transitions and errors.
- `tests/components/TodayFocusBar.test.ts`: verify focus presentation and actions.
- `tests/components/TaskCard.test.ts`: verify focus toggle event isolation.
- `tests/integration/kanban-enhancements.test.ts`: verify BoardView integration.
- `tests/e2e/board.spec.ts`: verify the main user journey.

### Task 1: Atomic Default Lists

**Files:**
- Modify: `server/routes/boards.ts`
- Create: `tests/server/default-board-lists.test.ts`

**Interfaces:**
- Consumes: TypeORM `DataSource.transaction(runInTransaction)` and repositories for `Board` and `List`.
- Produces: unchanged `POST /api/boards` request/response contract, with three lists persisted before the 201 response.

- [ ] **Step 1: Write the failing API tests**

Create tests that use a transaction-aware fake manager and assert both the success and rollback paths:

```ts
expect(boardRepo.rows).toHaveLength(1)
expect(listRepo.rows.map(({ name, position }) => ({ name, position }))).toEqual([
  { name: '待开始', position: 1 },
  { name: '进行中', position: 2 },
  { name: '已完成', position: 3 },
])
expect(dataSource.transaction).toHaveBeenCalledTimes(1)
```

The failure test makes `listRepo.save` reject on the second list and expects status 500 plus no committed board or lists.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm test -- --runInBand tests/server/default-board-lists.test.ts`

Expected: FAIL because `POST /api/boards` does not call `dataSource.transaction` and no lists are created.

- [ ] **Step 3: Implement atomic initialization**

Replace the create body with this transaction shape:

```ts
const board = await dataSource.transaction(async (manager) => {
  const boardRepository = manager.getRepository(Board)
  const listRepository = manager.getRepository(List)
  const savedBoard = await boardRepository.save(
    boardRepository.create({ name, description: req.body.description })
  )
  await listRepository.save(
    [
      ['待开始', 1],
      ['进行中', 2],
      ['已完成', 3],
    ].map(([listName, position]) =>
      listRepository.create({
        board_id: savedBoard.id,
        name: String(listName),
        position: Number(position),
      })
    )
  )
  return savedBoard
})
res.status(201).json(board)
```

- [ ] **Step 4: Run default-list and existing server tests**

Run: `npm test -- --runInBand tests/server/default-board-lists.test.ts tests/server/task-workflow.test.ts`

Expected: PASS. Update the existing transaction fake only as required to preserve its original assertions.

- [ ] **Step 5: Commit the atomic board slice**

```powershell
git add -- server/routes/boards.ts tests/server/default-board-lists.test.ts tests/server/task-workflow.test.ts
git commit -m "feat: seed default lists for new boards"
```

### Task 2: Focus Persistence and Derivation API

**Files:**
- Create: `src/database/entities/DailyFocusOverride.ts`
- Create: `src/database/migrations/AddDailyFocusOverridesTable.ts`
- Create: `server/focus.ts`
- Create: `server/routes/focus.ts`
- Create: `tests/server/focus.test.ts`
- Modify: `src/database/entities/Card.ts`
- Modify: `server/data-source.ts`
- Modify: `server/app.ts`
- Modify: `server/routes/cards.ts`

**Interfaces:**
- Produces: `FocusMode = 'include' | 'exclude'`, `FocusItem`, `FocusResponse`, `isValidLocalDate(date)`, `deriveFocusItems(cards, lists, overrides, date)`.
- Produces: `GET /api/boards/:boardId/focus?date=YYYY-MM-DD` and `PUT /api/cards/:cardId/focus`.
- Consumes: `DailyFocusOverride` through a unique `(card_id, focus_date)` row.

- [ ] **Step 1: Write failing pure-rule and route tests**

Cover automatic overdue/today inclusion, future exclusion, explicit include/exclude precedence, trimmed completed-list names, overdue-first sorting, malformed date/mode 400 responses, missing board/card 404 responses, and upsert behavior:

```ts
expect(deriveFocusItems(cards, lists, overrides, '2026-06-18').map((item) => item.card.id))
  .toEqual([1, 2, 4])
await request(app).get('/api/boards/1/focus?date=18-06-2026').expect(400)
await request(app).put('/api/cards/1/focus').send({ date: '2026-06-18', mode: 'later' }).expect(400)
```

- [ ] **Step 2: Run the focus tests and verify failure**

Run: `npm test -- --runInBand tests/server/focus.test.ts`

Expected: FAIL because the entity, derivation function, and routes do not exist.

- [ ] **Step 3: Add the entity and migration**

Define the entity with exact fields and index:

```ts
@Entity('daily_focus_overrides')
@Index(['card_id', 'focus_date'], { unique: true })
export class DailyFocusOverride {
  @PrimaryGeneratedColumn() id!: number
  @Column() card_id!: number
  @Column({ type: 'date' }) focus_date!: string
  @Column({ type: 'text' }) mode!: 'include' | 'exclude'
  @CreateDateColumn({ type: 'datetime' }) created_at!: Date
  @UpdateDateColumn({ type: 'datetime' }) updated_at!: Date
}
```

The migration creates the table, a unique index on `(card_id, focus_date)`, and an `ON DELETE CASCADE` foreign key to `cards(id)`. Register both entity and migration in `server/data-source.ts`.

- [ ] **Step 4: Implement deterministic focus derivation**

In `server/focus.ts`, validate with `/^\d{4}-\d{2}-\d{2}$/` plus a round-trip calendar check. Compare due dates using a local date formatter. Build a list-id map, discard cards in `list.name.trim() === '已完成'`, apply `exclude`, then `include`, then `dueDate <= date`, and sort overdue automatic items before today items before manual-only items.

- [ ] **Step 5: Implement and mount the focus router**

The GET handler verifies the board, loads its lists, loads cards for those list IDs, loads overrides for the requested date, derives items, and returns:

```ts
{
  date,
  items,
  total: items.length,
  overdueCount: items.filter((item) => item.overdue).length,
}
```

The PUT handler validates card, date, and mode, then updates an existing row or saves a new one. Mount `createFocusRouter(dataSource)` under `/api`. Ensure card deletion removes overrides explicitly in repository-based test fakes even though the real schema also cascades.

- [ ] **Step 6: Run focused server tests**

Run: `npm test -- --runInBand tests/server/focus.test.ts tests/server/task-workflow.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit the backend focus slice**

```powershell
git add -- src/database/entities/DailyFocusOverride.ts src/database/entities/Card.ts src/database/migrations/AddDailyFocusOverridesTable.ts server/data-source.ts server/focus.ts server/routes/focus.ts server/routes/cards.ts server/app.ts tests/server/focus.test.ts tests/server/task-workflow.test.ts
git commit -m "feat: add daily focus API"
```

### Task 3: Focus Client Store

**Files:**
- Modify: `src/services/api.ts`
- Create: `src/stores/focus.ts`
- Create: `tests/unit/stores/focus.test.ts`

**Interfaces:**
- Produces: `localDateKey(date?: Date): string`.
- Produces: `FocusItem`, `FocusResponse`, and `useFocusStore()` with `items`, `loading`, `savingCardIds`, `error`, `currentDate`, `fetchFocus(boardId, date?)`, `setFocus(cardId, mode, boardId, date?)`, `isFocused(cardId)`, and `clear()`.

- [ ] **Step 1: Write failing store tests**

Mock `apiClient.get` and `apiClient.put`. Assert date-safe paths, load success/error, save-and-refresh behavior, per-card saving state, `isFocused`, and clear:

```ts
await store.fetchFocus(7, '2026-06-18')
expect(apiClient.get).toHaveBeenCalledWith('/boards/7/focus?date=2026-06-18')
await store.setFocus(3, 'include', 7, '2026-06-18')
expect(apiClient.put).toHaveBeenCalledWith('/cards/3/focus', {
  date: '2026-06-18',
  mode: 'include',
})
```

- [ ] **Step 2: Run store tests and verify failure**

Run: `npm test -- --runInBand tests/unit/stores/focus.test.ts`

Expected: FAIL because `useFocusStore` and `apiClient.put` do not exist.

- [ ] **Step 3: Add PUT and implement the store**

Add `put<T>(path, body)` beside `post` and `patch`. The store must clear stale errors at operation start, preserve existing items when refresh fails, remove card IDs from `savingCardIds` in `finally`, and re-fetch after a successful write so server derivation remains authoritative.

- [ ] **Step 4: Run store and API client tests**

Run: `npm test -- --runInBand tests/unit/stores/focus.test.ts tests/unit/services/api.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the client state slice**

```powershell
git add -- src/services/api.ts src/stores/focus.ts tests/unit/stores/focus.test.ts tests/unit/services/api.test.ts
git commit -m "feat: add daily focus store"
```

### Task 4: Today Focus Bar

**Files:**
- Create: `src/components/board/TodayFocusBar.vue`
- Create: `tests/components/TodayFocusBar.test.ts`

**Interfaces:**
- Consumes: `FocusItem[]`, all current-board `Card[]`, `loading`, `error`, `overdueCount`, and `collapsed`.
- Produces events: `open-card(card)`, `include(cardId)`, `exclude(cardId)`, `retry()`, `update:collapsed(value)`.

- [ ] **Step 1: Write failing component tests**

Mount the component with Ant Design stubs and cover loading, retry error, empty state, counts, overflow advice, compact item click, remove action, task search, and selection:

```ts
expect(wrapper.text()).toContain('建议保留最重要的 3 项')
await wrapper.get('[data-testid="focus-remove-1"]').trigger('click')
expect(wrapper.emitted('exclude')).toEqual([[1]])
```

- [ ] **Step 2: Run component tests and verify failure**

Run: `npm test -- --runInBand tests/components/TodayFocusBar.test.ts`

Expected: FAIL because `TodayFocusBar.vue` does not exist.

- [ ] **Step 3: Implement the isolated focus bar**

Use a compact horizontal surface with `data-testid` hooks. The selector must list only cards not already focused and not in a completed list; accept `completedListIds: number[]` as a prop so the component does not reimplement naming rules. Store only the collapsed boolean in the parent. Stop propagation on remove and selector actions.

- [ ] **Step 4: Run component tests**

Run: `npm test -- --runInBand tests/components/TodayFocusBar.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the focus bar slice**

```powershell
git add -- src/components/board/TodayFocusBar.vue tests/components/TodayFocusBar.test.ts
git commit -m "feat: add today focus bar"
```

### Task 5: Board and Card Integration

**Files:**
- Modify: `src/views/BoardView.vue`
- Modify: `src/components/board/TaskCard.vue`
- Modify: `src/components/board/BoardColumn.vue`
- Modify: `src/components/board/CardDetailModal.vue`
- Modify: `tests/components/TaskCard.test.ts`
- Modify: `tests/integration/kanban-enhancements.test.ts`

**Interfaces:**
- Consumes: `useFocusStore`, `localDateKey`, and `TodayFocusBar` events.
- Produces: `TaskCard` event `toggle-focus(cardId)` and `CardDetailModal` event `toggle-focus(cardId)`.

- [ ] **Step 1: Write failing integration tests**

Verify BoardView renders the bar for a selected board, fetches `/boards/:id/focus`, persists collapsed state, opens a focus card, refreshes on window focus after a date change, and refreshes after a move. Verify the TaskCard focus button emits without emitting the card click:

```ts
await wrapper.get('[data-testid="task-focus-toggle"]').trigger('click')
expect(wrapper.emitted('toggle-focus')).toEqual([[1]])
expect(wrapper.emitted('click')).toBeUndefined()
```

- [ ] **Step 2: Run integration tests and verify failure**

Run: `npm test -- --runInBand tests/components/TaskCard.test.ts tests/integration/kanban-enhancements.test.ts`

Expected: FAIL because focus props, events, and BoardView integration are absent.

- [ ] **Step 3: Wire task-card and detail actions**

Add `focused?: boolean` and `focusSaving?: boolean` props plus `toggle-focus` emits. Render a hover button on `TaskCard` with `@click.stop`. Add a visible button in `CardDetailModal`; do not couple either component directly to the focus store.

- [ ] **Step 4: Wire BoardColumn forwarding**

Pass focused/saving state per card from BoardView through BoardColumn, and forward `toggle-focus`. Keep drag handling unchanged.

- [ ] **Step 5: Wire BoardView lifecycle and error isolation**

Render `TodayFocusBar` between header and toolbar. On board changes, load core lists/cards and focus independently. Persist collapsed state under `taskflow.todayFocus.collapsed`. On `window.focus`, compare `localDateKey()` with the store date and reload only when changed. After card moves, focus writes, or relevant detail saves, refresh focus without blocking core interactions.

- [ ] **Step 6: Run component and integration tests**

Run: `npm test -- --runInBand tests/components/TaskCard.test.ts tests/components/TodayFocusBar.test.ts tests/integration/kanban-enhancements.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit the integrated UI slice**

```powershell
git add -- src/views/BoardView.vue src/components/board/TaskCard.vue src/components/board/BoardColumn.vue src/components/board/CardDetailModal.vue tests/components/TaskCard.test.ts tests/integration/kanban-enhancements.test.ts
git commit -m "feat: integrate today focus with board"
```

### Task 6: End-to-End Verification and Polish

**Files:**
- Modify: `tests/e2e/board.spec.ts`
- Modify only if verification exposes a feature defect: files from Tasks 1–5.

**Interfaces:**
- Consumes: completed default-list and focus workflow.
- Produces: an executable regression path for the user-visible behavior.

- [ ] **Step 1: Extend the E2E journey**

Add a test that creates a uniquely named board, verifies the three list headings in order, creates a due-today task, sees it in “今日聚焦”, manually adds another task, removes one focus item, and moves a task into `已完成` to verify disappearance.

- [ ] **Step 2: Run the targeted E2E test**

Run: `npm run test:e2e -- tests/e2e/board.spec.ts`

Expected: PASS with the local frontend and API configuration used by Playwright. If the repository lacks a Playwright web-server configuration, record that limitation and verify the same flow with the integration suite instead of inventing infrastructure unrelated to the feature.

- [ ] **Step 3: Run all automated checks**

Run:

```powershell
npm test -- --runInBand
npm run server:build
npm run build
```

Expected: all Jest suites pass; server TypeScript build exits 0; Vue/Vite build exits 0.

- [ ] **Step 4: Inspect the rendered board**

Launch the app, open the board in the in-app browser, and verify the focus bar at desktop width and a narrow viewport. Confirm no horizontal overlap, selector clipping, or unreadable light/dark theme state.

- [ ] **Step 5: Commit verification-only changes**

```powershell
git add -- tests/e2e/board.spec.ts
git commit -m "test: cover today focus workflow"
```

