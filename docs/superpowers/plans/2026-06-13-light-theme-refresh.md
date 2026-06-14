# Light Theme Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved clean light workspace theme and repair visible mojibake Chinese UI copy.

**Architecture:** Keep the existing Vue single-file component structure. Add shared global CSS variables in `src/App.vue`, then restyle scoped component CSS and replace broken visible strings in touched components.

**Tech Stack:** Vue 3, Vite, Pinia, Chart.js, scoped CSS.

---

### Task 1: Global Theme Tokens

**Files:**
- Modify: `src/App.vue`
- Modify: `src/components/layout/AppLayout.vue`

- [ ] Add CSS custom properties for light background, panels, borders, text, muted text, teal action color, amber/red/green priority colors, focus ring, and shadows.
- [ ] Set global body/app font, background, text color, smoothing, and scrollbar colors.
- [ ] Give the main layout a soft workspace background and content padding.

### Task 2: Layout Shell Copy And Styling

**Files:**
- Modify: `src/components/layout/Sidebar.vue`
- Modify: `src/components/layout/TopBar.vue`
- Modify: `src/components/layout/StatusBar.vue`

- [ ] Replace garbled navigation, search, button titles, and task count copy with normal Chinese.
- [ ] Convert the sidebar from dark chrome to a light navigation surface with active route styling.
- [ ] Restyle top/search/status surfaces with subtle borders, teal focus, and compact desktop-tool spacing.

### Task 3: Board Surface

**Files:**
- Modify: `src/views/BoardView.vue`
- Modify: `src/components/board/BoardColumn.vue`
- Modify: `src/components/board/TaskCard.vue`

- [ ] Replace garbled board, list, card, due-date, priority, and empty-state copy.
- [ ] Restyle board columns as near-white work lanes on the soft background.
- [ ] Restyle task cards with subtle borders, high-priority accent, label chips, hover lift, and priority chips.

### Task 4: Dialogs And Calendar

**Files:**
- Modify: `src/components/board/CreateCardModal.vue`
- Modify: `src/components/board/CreateListModal.vue`
- Modify: `src/components/board/CardDetailModal.vue`
- Modify: `src/components/calendar/CalendarHeader.vue`
- Modify: `src/components/calendar/MonthView.vue`
- Modify: `src/components/calendar/WeekView.vue`
- Modify: `src/components/calendar/DayView.vue`
- Modify: `src/components/calendar/TimeBlockModal.vue`

- [ ] Replace garbled modal and calendar copy.
- [ ] Repair broken calendar title formatting and time block modal markup.
- [ ] Restyle modal overlays, inputs, controls, month grid, week/day slots, and time blocks with the shared light palette.

### Task 5: Statistics Surface

**Files:**
- Modify: `src/views/StatisticsView.vue`
- Modify: `src/components/statistics/CompletionChart.vue`
- Modify: `src/components/statistics/ExportButton.vue`

- [ ] Replace garbled statistics and export copy.
- [ ] Restyle stat panels, summary counters, and export dropdown.
- [ ] Keep existing Chart.js behavior unchanged.

### Task 6: Verification

**Files:**
- Inspect git diff for touched files.

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Start the Vite dev server and visually inspect the primary screen in a browser if possible.
