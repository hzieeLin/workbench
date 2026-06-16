# Ant Design Vue Integration Plan

> [!NOTE]
> This document may not reflect the current implementation.
> See the final report for up-to-date state:
> [Final Report](../reports/ant-design-vue-integration.md)

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all hand-written UI components with Ant Design Vue 4.x, add Chinese localization, and implement light/dark theme switching.

**Architecture:** Install Ant Design Vue with ConfigProvider for theme management. Create a Pinia store for theme state. Replace all custom components (Modal, Button, Input, Select, Table, etc.) with Ant Design equivalents. Remove the existing CSS variable system.

**Tech Stack:** Vue 3, Ant Design Vue 4.x, @ant-design/icons-vue, Pinia

---

## File Structure

| File | Responsibility |
|------|----------------|
| `package.json` | Add antd + @ant-design/icons-vue dependencies |
| `src/main.ts` | Register Ant Design Vue plugin |
| `src/stores/theme.ts` | Theme state management (light/dark) |
| `src/App.vue` | ConfigProvider wrapper with theme + locale |
| `src/components/layout/Sidebar.vue` | Replace with Menu, Button, Input |
| `src/components/layout/TopBar.vue` | Replace with Input.Search, Avatar, Badge |
| `src/components/layout/StatusBar.vue` | Simplify layout |
| `src/components/board/TaskCard.vue` | Replace with Card, Tag |
| `src/components/board/BoardColumn.vue` | Replace with Card, Button, Dropdown |
| `src/components/board/CardDetailModal.vue` | Replace with Modal, Form, Input, Select, DatePicker |
| `src/components/board/CreateCardModal.vue` | Replace with Modal, Form, Input |
| `src/components/board/CreateListModal.vue` | Replace with Modal, Form, Input |
| `src/components/board/CommentSection.vue` | Replace with List, Comment |
| `src/components/board/CommentForm.vue` | Replace with Input.TextArea, Button |
| `src/components/board/CommentItem.vue` | Replace with Comment, Avatar |
| `src/components/board/FilterPanel.vue` | Replace with Checkbox, Collapse |
| `src/components/board/SearchBar.vue` | Replace with Input.Search |
| `src/components/board/SortSelector.vue` | Replace with Select, Button |
| `src/components/board/ViewSwitcher.vue` | Replace with Segmented or Radio.Group |
| `src/components/board/ListView.vue` | Replace with Table, Pagination, Checkbox |
| `src/components/board/CalendarView.vue` | Replace with Calendar |
| `src/components/board/ActiveFilters.vue` | Replace with Tag |
| `src/components/calendar/CalendarHeader.vue` | Replace with Button, Radio.Group |
| `src/components/calendar/DayView.vue` | Keep custom (time grid) |
| `src/components/calendar/WeekView.vue` | Keep custom (time grid) |
| `src/components/calendar/MonthView.vue` | Replace with Calendar |
| `src/components/calendar/TimeBlockModal.vue` | Replace with Modal, Form, DatePicker |
| `src/components/statistics/CompletionChart.vue` | Keep Chart.js (chart library) |
| `src/components/statistics/TimeDistribution.vue` | Keep Chart.js |
| `src/components/statistics/ProductivityTrends.vue` | Keep Chart.js |
| `src/components/statistics/ExportButton.vue` | Replace with Dropdown, Button |
| `src/views/BoardView.vue` | Update imports, remove old CSS |
| `src/views/CalendarView.vue` | Update imports |
| `src/views/StatisticsView.vue` | Update imports |

---

## Task 1: Install Dependencies

**Covers:** None (scaffolding)

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Ant Design Vue and icons**

Run:
```bash
npm install antd @ant-design/icons-vue
```

- [ ] **Step 2: Verify installation**

Run:
```bash
npm ls antd @ant-design/icons-vue
```

Expected: Both packages listed with version numbers.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install antd and @ant-design/icons-vue"
```

---

## Task 2: Create Theme Store

**Covers:** Theme switching requirement

**Files:**
- Create: `src/stores/theme.ts`

- [ ] **Step 1: Create theme store**

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { theme } from 'ant-design-vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(true)

  function toggleTheme() {
    isDark.value = !isDark.value
  }

  function getAlgorithm() {
    return isDark.value ? theme.darkAlgorithm : theme.defaultAlgorithm
  }

  return { isDark, toggleTheme, getAlgorithm }
})
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/theme.ts
git commit -m "feat: add theme store for light/dark switching"
```

---

## Task 3: Configure Main.ts

**Covers:** None (scaffolding)

**Files:**
- Modify: `src/main.ts`

- [ ] **Step 1: Update main.ts to register Ant Design**

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import App from './App.vue'
import router from './router'
import 'ant-design-vue/dist/reset.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd)

app.mount('#app')
```

- [ ] **Step 2: Commit**

```bash
git add src/main.ts
git commit -m "feat: register Ant Design Vue in main.ts"
```

---

## Task 4: Update App.vue with ConfigProvider

**Covers:** Theme switching, Chinese locale

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: Update App.vue**

```vue
<template>
  <a-config-provider :theme="themeConfig" :locale="zhCN">
    <AppLayout>
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </AppLayout>
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppLayout from './components/layout/AppLayout.vue'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'
import { useThemeStore } from './stores/theme'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

const themeStore = useThemeStore()

const themeConfig = computed(() => ({
  algorithm: themeStore.getAlgorithm(),
  token: {
    colorPrimary: '#FF6B4A',
    borderRadius: 10,
    fontFamily: "'DM Sans', 'Noto Sans CJK SC', 'PingFang SC', sans-serif",
  },
}))

useKeyboardShortcuts()
</script>

<style>
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 15px;
}

body {
  min-width: 960px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  line-height: 1.5;
}

::selection {
  background: rgba(255, 107, 74, 0.25);
  color: #ff6b4a;
}

.page-enter-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}

.page-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/App.vue
git commit -m "feat: add ConfigProvider with theme and Chinese locale"
```

---

## Task 5: Update Sidebar

**Covers:** Layout navigation

**Files:**
- Modify: `src/components/layout/Sidebar.vue`

- [ ] **Step 1: Rewrite Sidebar with Ant Design components**

Replace the entire file content with:

```vue
<template>
  <a-layout-sider class="sidebar" :width="256">
    <div class="logo">
      <span class="logo-mark">✦</span>
      <h1>TaskFlow</h1>
    </div>

    <a-menu mode="inline" :selected-keys="selectedKeys" class="nav-menu">
      <a-menu-item key="/" @click="$router.push('/')">
        <template #icon><AppstoreOutlined /></template>
        看板
      </a-menu-item>
      <a-menu-item key="/calendar" @click="$router.push('/calendar')">
        <template #icon><CalendarOutlined /></template>
        时间规划
      </a-menu-item>
      <a-menu-item key="/statistics" @click="$router.push('/statistics')">
        <template #icon><BarChartOutlined /></template>
        统计分析
      </a-menu-item>
    </a-menu>

    <div class="board-section">
      <div class="board-section-header">
        <span>我的看板</span>
        <a-badge :count="boards.length" :number-style="{ backgroundColor: 'var(--color-accent)' }" />
      </div>
      <a-list :data-source="boards" size="small" class="board-list">
        <template #renderItem="{ item: board }">
          <a-list-item
            class="board-item"
            :class="{ active: boardStore.currentBoard?.id === board.id }"
            @click="selectBoard(board)"
            @contextmenu.prevent="openContextMenu($event, board)"
          >
            <span class="board-dot" :style="{ background: boardColor(board.id) }" />
            <a-input
              v-if="editingBoardId === board.id"
              v-model:value="editingName"
              size="small"
              @blur="saveBoardName(board)"
              @pressEnter="saveBoardName(board)"
              @keydown.escape="cancelEdit"
              @click.stop
            />
            <span v-else class="board-name" @dblclick.stop="startEdit(board)">{{ board.name }}</span>
          </a-list-item>
        </template>
      </a-list>

      <a-form v-if="showCreateBoard" @finish="handleCreateBoard" layout="vertical" size="small">
        <a-form-item>
          <a-input v-model:value="newBoardName" placeholder="看板名称" />
        </a-form-item>
        <a-space>
          <a-button @click="cancelCreateBoard">取消</a-button>
          <a-button type="primary" html-type="submit">创建</a-button>
        </a-space>
      </a-form>
      <a-button v-else block dashed @click="showCreateBoard = true">
        <template #icon><PlusOutlined /></template>
        新建看板
      </a-button>
    </div>

    <a-dropdown :trigger="['contextmenu']" v-model:open="contextMenuVisible">
      <div />
      <template #overlay>
        <a-menu>
          <a-menu-item key="delete" danger @click="handleDeleteBoard">
            删除看板
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </a-layout-sider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBoardStore } from '@/stores/board'
import { Board } from '@/database/entities/Board'
import {
  AppstoreOutlined,
  CalendarOutlined,
  BarChartOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue'

const route = useRoute()
const boardStore = useBoardStore()
const boards = ref<Board[]>([])
const showCreateBoard = ref(false)
const newBoardName = ref('')

const editingBoardId = ref<number | null>(null)
const editingName = ref('')

const selectedKeys = computed(() => {
  if (route.path === '/calendar') return ['/calendar']
  if (route.path === '/statistics') return(['/statistics']
  return ['/']
})

function startEdit(board: Board) {
  editingBoardId.value = board.id
  editingName.value = board.name
}

async function saveBoardName(board: Board) {
  const name = editingName.value.trim()
  editingBoardId.value = null
  if (!name || name === board.name) return
  await boardStore.updateBoard(board.id, { name })
  boards.value = boardStore.boards
}

function cancelEdit() {
  editingBoardId.value = null
}

const contextMenuVisible = ref(false)
const contextMenuBoard = ref<Board | null>(null)

const boardColors = ['#FF6B4A', '#4AD9D9', '#FFC043', '#4CDF8B', '#A78BFA', '#FF5E5E']

function boardColor(id: number) {
  return boardColors[id % boardColors.length]
}

onMounted(async () => {
  await boardStore.fetchBoards()
  boards.value = boardStore.boards
  if (!boardStore.currentBoard && boards.value.length > 0) {
    boardStore.setCurrentBoard(boards.value[0])
  }
})

function selectBoard(board: Board) {
  boardStore.setCurrentBoard(board)
}

function openContextMenu(e: MouseEvent, board: Board) {
  contextMenuBoard.value = board
  contextMenuVisible.value = true
}

async function handleDeleteBoard() {
  const board = contextMenuBoard.value
  if (!board) return

  const idx = boards.value.findIndex((b) => b.id === board.id)
  const nextBoard = boards.value[idx + 1] || boards.value[idx - 1] || null

  await boardStore.deleteBoard(board.id)
  boards.value = boardStore.boards

  if (boardStore.currentBoard === null && nextBoard) {
    boardStore.setCurrentBoard(nextBoard)
  }

  contextMenuVisible.value = false
}

function cancelCreateBoard() {
  showCreateBoard.value = false
  newBoardName.value = ''
}

async function handleCreateBoard() {
  const name = newBoardName.value.trim()
  if (!name) return

  const board = await boardStore.createBoard(name)
  boards.value = boardStore.boards
  boardStore.setCurrentBoard(board)
  cancelCreateBoard()
}
</script>

<style scoped>
.sidebar {
  background: var(--ant-color-bg-container, #fff);
  border-right: 1px solid var(--ant-color-border, #f0f0f0);
}

.logo {
  padding: 22px 22px 18px;
  border-bottom: 1px solid var(--ant-color-border, #f0f0f0);
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-mark {
  font-size: 22px;
  color: var(--ant-color-primary, #FF6B4A);
}

.logo h1 {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  font-style: italic;
}

.nav-menu {
  border-right: none !important;
}

.board-section {
  padding: 8px 16px 16px;
  overflow-y: auto;
}

.board-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 8px 6px;
  margin-bottom: 2px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ant-color-text-secondary, rgba(0,0,0,0.45));
}

.board-list {
  background: transparent;
}

.board-item {
  cursor: pointer;
  transition: all 0.2s ease;
}

.board-item:hover {
  background: var(--ant-color-bg-text-hover, rgba(0,0,0,0.04));
}

.board-item.active {
  background: var(--ant-color-bg-text-hover, rgba(0,0,0,0.04));
}

.board-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.board-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Sidebar.vue
git commit -m "feat: replace Sidebar with Ant Design Menu components"
```

---

## Task 6: Update TopBar

**Covers:** Layout header

**Files:**
- Modify: `src/components/layout/TopBar.vue`

- [ ] **Step 1: Rewrite TopBar**

```vue
<template>
  <a-layout-header class="topbar">
    <a-input-search
      v-model:value="searchQuery"
      placeholder="搜索任务..."
      class="search-box"
      allow-clear
    />
    <div class="actions">
      <a-space>
        <a-button type="text" shape="circle">
          <template #icon><BellOutlined /></template>
        </a-button>
        <a-button type="text" shape="circle">
          <template #icon><SettingOutlined /></template>
        </a-button>
        <a-avatar :size="30" style="background-color: var(--ant-color-primary)">U</a-avatar>
      </a-space>
    </div>
  </a-layout-header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BellOutlined, SettingOutlined } from '@ant-design/icons-vue'

const searchQuery = ref('')
</script>

<style scoped>
.topbar {
  height: 60px;
  background: var(--ant-color-bg-container, #fff);
  border-bottom: 1px solid var(--ant-color-border, #f0f0f0);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  gap: 16px;
}

.search-box {
  width: min(380px, 40vw);
}

.actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/TopBar.vue
git commit -m "feat: replace TopBar with Ant Design Input.Search and Avatar"
```

---

## Task 7: Update StatusBar

**Covers:** Layout footer

**Files:**
- Modify: `src/components/layout/StatusBar.vue`

- [ ] **Step 1: Simplify StatusBar**

```vue
<template>
  <a-layout-footer class="statusbar">
    <div class="status-left">
      <a-badge status="success" />
      <span>{{ taskCount }} 个任务</span>
    </div>
    <span>{{ currentDate }}</span>
  </a-layout-footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCardStore } from '@/stores/card'

const cardStore = useCardStore()

const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
})

const taskCount = computed(() => cardStore.cards.length)
</script>

<style scoped>
.statusbar {
  height: 32px;
  background: var(--ant-color-bg-container, #fff);
  border-top: 1px solid var(--ant-color-border, #f0f0f0);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  font-size: 12px;
  color: var(--ant-color-text-secondary, rgba(0,0,0,0.45));
}

.status-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/StatusBar.vue
git commit -m "feat: simplify StatusBar with Ant Design Badge"
```

---

## Task 8: Update TaskCard

**Covers:** Card display

**Files:**
- Modify: `src/components/board/TaskCard.vue`

- [ ] **Step 1: Rewrite TaskCard**

```vue
<template>
  <a-card
    class="task-card"
    :class="[`priority-${card.priority}`, { 'is-overdue': isOverdue }]"
    size="small"
    hoverable
  >
    <template #title>
      <div class="card-title-row">
        <span class="card-title">{{ card.title }}</span>
        <a-button type="text" size="small" danger @click.stop="handleDelete">
          <template #icon><DeleteOutlined /></template>
        </a-button>
      </div>
    </template>
    <div class="card-meta">
      <a-space v-if="card.due_date">
        <a-tag :color="isOverdue ? 'error' : 'default'">
          <template #icon><ClockCircleOutlined /></template>
          {{ formatDate(card.due_date) }}
        </a-tag>
      </a-space>
      <a-tag :color="priorityColor">{{ priorityText }}</a-tag>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card } from '@/database/entities/Card'
import { useCardStore } from '@/stores/card'
import { DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  card: Card
}>()

const priorityText = computed(() => {
  const map: Record<string, string> = { low: '低', medium: '中', high: '高' }
  return map[props.card.priority] || props.card.priority
})

const priorityColor = computed(() => {
  const map: Record<string, string> = { low: 'success', medium: 'warning', high: 'error' }
  return map[props.card.priority] || 'default'
})

const isOverdue = computed(() => {
  if (!props.card.due_date) return false
  return new Date(props.card.due_date) < new Date()
})

function formatDate(date: Date) {
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const cardStore = useCardStore()

async function handleDelete() {
  await cardStore.deleteCard(props.card.id)
}
</script>

<style scoped>
.task-card {
  margin-bottom: 10px;
  border-radius: var(--ant-border-radius-lg, 12px);
  transition: all 0.25s ease;
  cursor: pointer;
}

.task-card:last-child {
  margin-bottom: 0;
}

.task-card:hover {
  transform: translateY(-3px);
}

.task-card.priority-high {
  border-left: 3px solid var(--ant-color-error, #ff4d4f);
}

.task-card.priority-medium {
  border-left: 3px solid var(--ant-color-warning, #faad14);
}

.task-card.priority-low {
  border-left: 3px solid var(--ant-color-success, #52c41a);
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/board/TaskCard.vue
git commit -m "feat: replace TaskCard with Ant Design Card and Tag"
```

---

## Task 9: Update CreateCardModal

**Covers:** Card creation

**Files:**
- Modify: `src/components/board/CreateCardModal.vue`

- [ ] **Step 1: Rewrite with Ant Design Modal**

```vue
<template>
  <a-modal
    v-model:open="visible"
    title="新建卡片"
    @cancel="$emit('close')"
    @ok="handleSubmit"
    ok-text="创建"
    cancel-text="取消"
  >
    <a-form layout="vertical">
      <a-form-item label="标题" required>
        <a-input v-model:value="title" placeholder="卡片标题" />
      </a-form-item>
      <a-form-item label="描述">
        <a-textarea v-model:value="description" placeholder="描述（可选）" :rows="4" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCardStore } from '@/stores/card'

const props = defineProps<{
  listId: number
}>()

const emit = defineEmits<{
  close: []
}>()

const cardStore = useCardStore()
const title = ref('')
const description = ref('')
const visible = ref(true)

async function handleSubmit() {
  await cardStore.createCard(props.listId, title.value, description.value || undefined)
  emit('close')
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/board/CreateCardModal.vue
git commit -m "feat: replace CreateCardModal with Ant Design Modal and Form"
```

---

## Task 10: Update CreateListModal

**Covers:** List creation

**Files:**
- Modify: `src/components/board/CreateListModal.vue`

- [ ] **Step 1: Rewrite with Ant Design Modal**

```vue
<template>
  <a-modal
    v-model:open="visible"
    title="新建列表"
    @cancel="$emit('close')"
    @ok="handleSubmit"
    ok-text="创建"
    cancel-text="取消"
  >
    <a-form layout="vertical">
      <a-form-item label="列表名称" required>
        <a-input v-model:value="name" placeholder="列表名称" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useListStore } from '@/stores/list'

const props = defineProps<{
  boardId: number
}>()

const emit = defineEmits<{
  close: []
}>()

const listStore = useListStore()
const name = ref('')
const visible = ref(true)

async function handleSubmit() {
  await listStore.createList(props.boardId, name.value)
  emit('close')
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/board/CreateListModal.vue
git commit -m "feat: replace CreateListModal with Ant Design Modal"
```

---

## Task 11: Update CardDetailModal

**Covers:** Card editing

**Files:**
- Modify: `src/components/board/CardDetailModal.vue`

- [ ] **Step 1: Rewrite with Ant Design components**

```vue
<template>
  <a-modal
    v-model:open="visible"
    :title="card.title"
    width="960px"
    @cancel="$emit('close')"
    @ok="handleSave"
    ok-text="保存"
    cancel-text="取消"
  >
    <a-row :gutter="24">
      <a-col :span="16">
        <a-form layout="vertical">
          <a-form-item label="标题">
            <a-input v-model:value="editTitle" />
          </a-form-item>
          <a-form-item label="描述">
            <a-textarea v-model:value="editDescription" placeholder="添加描述..." :rows="4" />
          </a-form-item>
          <a-row :gutter="12">
            <a-col :span="12">
              <a-form-item label="优先级">
                <a-select v-model:value="editPriority">
                  <a-select-option value="low">低</a-select-option>
                  <a-select-option value="medium">中</a-select-option>
                  <a-select-option value="high">高</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="截止日期">
                <a-date-picker v-model:value="editDueDate" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-col>
      <a-col :span="8">
        <CommentSection :card-id="card.id" />
      </a-col>
    </a-row>
    <template #footer>
      <a-space>
        <a-button danger @click="handleDelete">
          <template #icon><DeleteOutlined /></template>
          删除
        </a-button>
        <a-button @click="$emit('close')">取消</a-button>
        <a-button type="primary" @click="handleSave">保存</a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Card } from '@/database/entities/Card'
import { useCardStore } from '@/stores/card'
import CommentSection from './CommentSection.vue'
import { DeleteOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

const props = defineProps<{
  card: Card
}>()

const emit = defineEmits<{
  close: []
}>()

const cardStore = useCardStore()
const visible = ref(true)

const editTitle = ref(props.card.title)
const editDescription = ref(props.card.description || '')
const editPriority = ref(props.card.priority)
const editDueDate = ref(
  props.card.due_date ? dayjs(props.card.due_date) : null
)

async function handleSave() {
  await cardStore.updateCard(props.card.id, {
    title: editTitle.value,
    description: editDescription.value || undefined,
    priority: editPriority.value,
    due_date: editDueDate.value ? editDueDate.value.toDate() : undefined,
  })
  emit('close')
}

async function handleDelete() {
  await cardStore.deleteCard(props.card.id)
  emit('close')
}
</script>
```

- [ ] **Step 2: Install dayjs for DatePicker**

Run:
```bash
npm install dayjs
```

- [ ] **Step 3: Commit**

```bash
git add src/components/board/CardDetailModal.vue package.json package-lock.json
git commit -m "feat: replace CardDetailModal with Ant Design Modal, Form, Select, DatePicker"
```

---

## Task 12: Update SearchBar

**Covers:** Search functionality

**Files:**
- Modify: `src/components/board/SearchBar.vue`

- [ ] **Step 1: Rewrite with Ant Design Input.Search**

```vue
<template>
  <a-input-search
    v-model:value="search"
    placeholder="搜索卡片..."
    class="search-bar"
    allow-clear
    @search="handleSearch"
    @change="handleSearchChange"
  />
  <span v-if="resultCount !== null && resultCount !== undefined" class="result-count">
    {{ resultCount }} 条结果
  </span>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  resultCount?: number | null
}>()

const emit = defineEmits<{
  (e: 'search', query: string): void
}>()

const search = ref('')
let debounceTimer: ReturnType<typeof setTimeout>

function handleSearch() {
  emit('search', search.value)
}

function handleSearchChange() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('search', search.value)
  }, 300)
}

function highlightText(text: string, query: string): string {
  if (!query || !text) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  return text.replace(regex, '<mark class="search-highlight">$1</mark>')
}

defineExpose({ highlightText })
</script>

<style scoped>
.search-bar {
  min-width: 280px;
}

.result-count {
  font-size: 12px;
  color: var(--ant-color-text-secondary, rgba(0,0,0,0.45));
  white-space: nowrap;
  margin-left: 8px;
}
</style>

<style>
mark.search-highlight {
  background: rgba(99, 102, 241, 0.25);
  color: inherit;
  border-radius: 2px;
  padding: 0 1px;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/board/SearchBar.vue
git commit -m "feat: replace SearchBar with Ant Design Input.Search"
```

---

## Task 13: Update FilterPanel

**Covers:** Filter functionality

**Files:**
- Modify: `src/components/board/FilterPanel.vue`

- [ ] **Step 1: Rewrite with Ant Design Checkbox and Collapse**

```vue
<template>
  <div class="filter-panel">
    <a-button
      v-if="hasAnySelection"
      size="small"
      @click="clearAll"
    >
      清除全部
    </a-button>
    <a-collapse v-model:activeKey="activeKeys" :bordered="false" ghost>
      <a-collapse-panel key="priority" header="优先级">
        <a-checkbox-group v-model:value="selectedPriorities" @change="emitFilters">
          <a-space direction="vertical">
            <a-checkbox v-for="priority in priorities" :key="priority.value" :value="priority.value">
              <span class="priority-dot" :class="priority.value" />
              {{ priority.label }}
            </a-checkbox>
          </a-space>
        </a-checkbox-group>
      </a-collapse-panel>
      <a-collapse-panel key="due" header="截止日期">
        <a-checkbox-group v-model:value="selectedDue" @change="emitFilters">
          <a-space direction="vertical">
            <a-checkbox v-for="due in dueOptions" :key="due.value" :value="due.value">
              {{ due.label }}
            </a-checkbox>
          </a-space>
        </a-checkbox-group>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  (e: 'filter', filters: FilterState): void
  (e: 'clear-all'): void
}>()

interface FilterState {
  priorities: string[]
  due: string[]
}

const priorities = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
]

const dueOptions = [
  { value: 'today', label: '今天' },
  { value: 'week', label: '本周' },
  { value: 'overdue', label: '已过期' },
  { value: 'none', label: '未设置' },
]

const selectedPriorities = ref<string[]>([])
const selectedDue = ref<string[]>([])
const activeKeys = ref<string[]>([])

const hasAnySelection = computed(() => {
  return selectedPriorities.value.length > 0 || selectedDue.value.length > 0
})

function clearAll() {
  selectedPriorities.value = []
  selectedDue.value = []
  emitFilters()
  emit('clear-all')
}

function emitFilters() {
  emit('filter', {
    priorities: selectedPriorities.value,
    due: selectedDue.value,
  })
}
</script>

<style scoped>
.filter-panel {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: var(--ant-color-bg-container, #fff);
  border: 1px solid var(--ant-color-border, #f0f0f0);
  border-radius: var(--ant-border-radius-lg, 12px);
  align-items: flex-start;
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 4px;
}

.priority-dot.low {
  background: var(--ant-color-success, #52c41a);
}

.priority-dot.medium {
  background: var(--ant-color-warning, #faad14);
}

.priority-dot.high {
  background: var(--ant-color-error, #ff4d4f);
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/board/FilterPanel.vue
git commit -m "feat: replace FilterPanel with Ant Design Checkbox and Collapse"
```

---

## Task 14: Update SortSelector

**Covers:** Sort functionality

**Files:**
- Modify: `src/components/board/SortSelector.vue`

- [ ] **Step 1: Rewrite with Ant Design Select**

```vue
<template>
  <a-space>
    <a-select v-model:value="selectedSort" @change="handleSort" style="width: 140px">
      <a-select-option value="created_at">创建时间</a-select-option>
      <a-select-option value="updated_at">更新时间</a-select-option>
      <a-select-option value="priority">优先级</a-select-option>
      <a-select-option value="due_date">截止日期</a-select-option>
      <a-select-option value="title">标题</a-select-option>
    </a-select>
    <a-button @click="toggleDirection">
      {{ direction === 'asc' ? '↑' : '↓' }}
    </a-button>
  </a-space>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  currentSort: string
  direction: 'asc' | 'desc'
}>()

const emit = defineEmits<{
  (e: 'sort', field: string, direction: string): void
}>()

const selectedSort = ref(props.currentSort)

watch(
  () => props.currentSort,
  (newVal) => {
    selectedSort.value = newVal
  }
)

function handleSort() {
  emit('sort', selectedSort.value, props.direction)
}

function toggleDirection() {
  const newDirection = props.direction === 'asc' ? 'desc' : 'asc'
  emit('sort', selectedSort.value, newDirection)
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/board/SortSelector.vue
git commit -m "feat: replace SortSelector with Ant Design Select"
```

---

## Task 15: Update ViewSwitcher

**Covers:** View switching

**Files:**
- Modify: `src/components/board/ViewSwitcher.vue`

- [ ] **Step 1: Rewrite with Ant Design Segmented**

```vue
<template>
  <a-segregated
    v-model:value="currentValue"
    :options="viewOptions"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AppstoreOutlined, UnorderedListOutlined, CalendarOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  currentView: string
}>()

const emit = defineEmits<{
  (e: 'change', view: string): void
}>()

const currentValue = computed({
  get: () => props.currentView,
  set: (val) => emit('change', val),
})

const viewOptions = [
  { label: '看板', value: 'board', icon: AppstoreOutlined },
  { label: '列表', value: 'list', icon: UnorderedListOutlined },
  { label: '日历', value: 'calendar', icon: CalendarOutlined },
]

function handleChange(val: string) {
  emit('change', val)
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/board/ViewSwitcher.vue
git commit -m "feat: replace ViewSwitcher with Ant Design Segmented"
```

---

## Task 16: Update ListView

**Covers:** Table view

**Files:**
- Modify: `src/components/board/ListView.vue`

- [ ] **Step 1: Rewrite with Ant Design Table**

```vue
<template>
  <a-table
    :columns="columns"
    :data-source="cards"
    :pagination="pagination"
    row-key="id"
    :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
    @change="handleTableChange"
    size="small"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'title'">
        <span class="card-title">{{ record.title }}</span>
      </template>
      <template v-if="column.key === 'priority'">
        <a-tag :color="getPriorityColor(record.priority)">
          {{ priorityText(record.priority) }}
        </a-tag>
      </template>
      <template v-if="column.key === 'due_date'">
        <span v-if="record.due_date" :class="{ overdue: isOverdue(record.due_date) }">
          {{ formatDate(record.due_date) }}
        </span>
        <span v-else class="no-date">-</span>
      </template>
      <template v-if="column.key === 'list'">
        {{ getListName(record.list_id) }}
      </template>
      <template v-if="column.key === 'actions'">
        <a-space>
          <a-button size="small" @click.stop="$emit('edit', record)">编辑</a-button>
          <a-button size="small" danger @click.stop="$emit('delete', record.id)">删除</a-button>
        </a-space>
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Card } from '@/database/entities/Card'
import type { List } from '@/database/entities/List'

const props = defineProps<{
  cards: Card[]
  lists: List[]
}>()

const emit = defineEmits<{
  (e: 'edit', card: Card): void
  (e: 'delete', id: number): void
  (e: 'select', ids: number[]): void
}>()

const selectedRowKeys = ref<number[]>([])

const columns = [
  { title: '标题', key: 'title', dataIndex: 'title' },
  { title: '优先级', key: 'priority', dataIndex: 'priority', width: 100 },
  { title: '截止日期', key: 'due_date', dataIndex: 'due_date', width: 120 },
  { title: '所属列表', key: 'list', width: 120 },
  { title: '操作', key: 'actions', width: 120 },
]

const pagination = ref({
  current: 1,
  pageSize: 20,
  total: props.cards.length,
})

function handleTableChange(pag: any) {
  pagination.value.current = pag.current
}

function onSelectChange(keys: number[]) {
  selectedRowKeys.value = keys
  emit('select', keys)
}

function getListName(listId: number): string {
  const list = props.lists.find((l) => l.id === listId)
  return list?.name || ''
}

function priorityText(priority: string): string {
  const map: Record<string, string> = { low: '低', medium: '中', high: '高' }
  return map[priority] || priority
}

function getPriorityColor(priority: string): string {
  const map: Record<string, string> = { low: 'success', medium: 'warning', high: 'error' }
  return map[priority] || 'default'
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString()
}

function isOverdue(date: Date): boolean {
  return new Date(date) < new Date()
}
</script>

<style scoped>
.card-title {
  font-weight: 500;
}

.overdue {
  color: var(--ant-color-error, #ff4d4f);
}

.no-date {
  color: var(--ant-color-text-secondary, rgba(0,0,0,0.45));
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/board/ListView.vue
git commit -m "feat: replace ListView with Ant Design Table"
```

---

## Task 17: Update ActiveFilters

**Covers:** Filter tags display

**Files:**
- Modify: `src/components/board/ActiveFilters.vue`

- [ ] **Step 1: Rewrite with Ant Design Tag**

```vue
<template>
  <div class="active-filters" v-if="hasFilters">
    <span class="filters-label">当前筛选：</span>
    <a-space :size="[4, 4]" wrap>
      <a-tag
        v-for="filter in activeFilterTags"
        :key="filter.key"
        closable
        @close="removeFilter(filter)"
      >
        {{ filter.label }}
      </a-tag>
    </a-space>
    <a-button type="link" size="small" @click="clearAll">清除所有</a-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface FilterState {
  priorities: string[]
  due: string[]
}

const props = defineProps<{
  filters: FilterState
}>()

const emit = defineEmits<{
  (e: 'update:filters', filters: FilterState): void
}>()

const hasFilters = computed(() => {
  return props.filters.priorities.length > 0 || props.filters.due.length > 0
})

const activeFilterTags = computed(() => {
  const tags: { key: string; type: string; value: string | number; label: string }[] = []

  props.filters.priorities.forEach((p) => {
    const labels: Record<string, string> = { low: '低优先级', medium: '中优先级', high: '高优先级' }
    tags.push({ key: `priority-${p}`, type: 'priorities', value: p, label: labels[p] })
  })

  props.filters.due.forEach((d) => {
    const labels: Record<string, string> = {
      today: '今天',
      week: '本周',
      overdue: '已过期',
      none: '未设置',
    }
    tags.push({ key: `due-${d}`, type: 'due', value: d, label: labels[d] })
  })

  return tags
})

function removeFilter(filter: { type: string; value: string | number }) {
  const newFilters = { ...props.filters }
  const arr = newFilters[filter.type as keyof FilterState] as (string | number)[]
  const index = arr.indexOf(filter.value as never)
  if (index > -1) arr.splice(index, 1)
  emit('update:filters', newFilters)
}

function clearAll() {
  emit('update:filters', { priorities: [], due: [] })
}
</script>

<style scoped>
.active-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--ant-color-primary-bg, #fff2e8);
  border-radius: var(--ant-border-radius-lg, 12px);
}

.filters-label {
  font-size: 12px;
  color: var(--ant-color-text-secondary, rgba(0,0,0,0.45));
  white-space: nowrap;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/board/ActiveFilters.vue
git commit -m "feat: replace ActiveFilters with Ant Design Tag"
```

---

## Task 18: Update CommentSection

**Covers:** Comment display

**Files:**
- Modify: `src/components/board/CommentSection.vue`

- [ ] **Step 1: Simplify with Ant Design List**

```vue
<template>
  <div class="comment-section">
    <h4>评论 ({{ comments.length }})</h4>

    <CommentForm @submit="addComment" />

    <a-list :data-source="reversedComments" size="small" class="comment-list">
      <template #renderItem="{ item: comment }">
        <CommentItem :comment="comment" @delete="deleteComment" />
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCommentStore } from '@/stores/comment'
import CommentItem from './CommentItem.vue'
import CommentForm from './CommentForm.vue'

const props = defineProps<{
  cardId: number
}>()

const commentStore = useCommentStore()
const comments = ref(commentStore.comments)

const reversedComments = computed(() => [...comments.value].reverse())

onMounted(async () => {
  await commentStore.fetchComments(props.cardId)
  comments.value = commentStore.comments
})

async function addComment(content: string) {
  await commentStore.createComment(props.cardId, content)
  comments.value = commentStore.comments
}

async function deleteComment(id: number) {
  await commentStore.deleteComment(id)
  comments.value = commentStore.comments
}
</script>

<style scoped>
.comment-section {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.comment-section h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--ant-color-text-secondary, rgba(0,0,0,0.45));
}

.comment-list {
  background: transparent;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/board/CommentSection.vue
git commit -m "feat: simplify CommentSection with Ant Design List"
```

---

## Task 19: Update CommentForm

**Covers:** Comment input

**Files:**
- Modify: `src/components/board/CommentForm.vue`

- [ ] **Step 1: Rewrite with Ant Design Input.TextArea**

```vue
<template>
  <div class="comment-form">
    <a-textarea
      v-model:value="content"
      placeholder="添加评论..."
      :auto-size="{ minRows: 3, maxRows: 6 }"
      @keydown.enter.meta="handleSubmit"
      @keydown.enter.ctrl="handleSubmit"
    />
    <div class="form-actions">
      <span class="hint">⌘ + Enter 发送</span>
      <a-button type="primary" size="small" :disabled="!content.trim()" @click="handleSubmit">
        发送
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'submit', content: string): void
}>()

const content = ref('')

function handleSubmit() {
  if (!content.value.trim()) return
  emit('submit', content.value.trim())
  content.value = ''
}
</script>

<style scoped>
.comment-form {
  border: 1px solid var(--ant-color-border, #f0f0f0);
  border-radius: var(--ant-border-radius-lg, 12px);
  padding: 12px;
  margin-bottom: 12px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.hint {
  font-size: 12px;
  color: var(--ant-color-text-secondary, rgba(0,0,0,0.45));
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/board/CommentForm.vue
git commit -m "feat: replace CommentForm with Ant Design Input.TextArea"
```

---

## Task 20: Update CommentItem

**Covers:** Comment display

**Files:**
- Modify: `src/components/board/CommentItem.vue`

- [ ] **Step 1: Rewrite with Ant Design Comment**

```vue
<template>
  <a-comment>
    <template #author>
      <span>{{ comment.author }}</span>
    </template>
    <template #avatar>
      <a-avatar size="small" style="background-color: var(--ant-color-primary)">
        {{ comment.author.charAt(0) }}
      </a-avatar>
    </template>
    <template #datetime>
      <span>{{ formatTime(comment.created_at) }}</span>
    </template>
    <template #content>
      <p>{{ comment.content }}</p>
    </template>
    <template #actions>
      <span v-if="comment.author === '用户'" key="delete" @click="handleDelete">
        删除
      </span>
    </template>
  </a-comment>
</template>

<script setup lang="ts">
import type { Comment } from '@/database/entities/Comment'

const props = defineProps<{
  comment: Comment
}>()

const emit = defineEmits<{
  (e: 'delete', id: number): void
}>()

function formatTime(date: Date) {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return new Date(date).toLocaleDateString()
}

function handleDelete() {
  emit('delete', props.comment.id)
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/board/CommentItem.vue
git commit -m "feat: replace CommentItem with Ant Design Comment"
```

---

## Task 21: Update CalendarHeader

**Covers:** Calendar navigation

**Files:**
- Modify: `src/components/calendar/CalendarHeader.vue`

- [ ] **Step 1: Rewrite with Ant Design Button and Segmented**

```vue
<template>
  <div class="calendar-header">
    <div class="header-left">
      <p class="eyebrow">时间规划</p>
      <h2>{{ title }}</h2>
    </div>
    <div class="header-center">
      <a-button-group>
        <a-button @click="$emit('prev')">
          <template #icon><LeftOutlined /></template>
        </a-button>
        <a-button @click="$emit('today')">今天</a-button>
        <a-button @click="$emit('next')">
          <template #icon><RightOutlined /></template>
        </a-button>
      </a-button-group>
    </div>
    <div class="header-right">
      <a-segregated
        :value="viewMode"
        :options="viewOptions"
        @change="(val: string) => $emit('change-view', val)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  currentDate: Date
  viewMode: 'month' | 'week' | 'day'
}>()

defineEmits<{
  prev: []
  next: []
  today: []
  'change-view': [mode: 'month' | 'week' | 'day']
}>()

const title = computed(() => {
  const date = props.currentDate
  if (props.viewMode === 'month') {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`
  }
  if (props.viewMode === 'week') {
    const start = new Date(date)
    start.setDate(date.getDate() - date.getDay())
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
})

const viewOptions = [
  { label: '月', value: 'month' },
  { label: '周', value: 'week' },
  { label: '日', value: 'day' },
]
</script>

<style scoped>
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 0 0 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--ant-color-border, #f0f0f0);
}

.header-left .eyebrow {
  margin-bottom: 4px;
  color: var(--ant-color-primary, #FF6B4A);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.header-left h2 {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 500;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/calendar/CalendarHeader.vue
git commit -m "feat: replace CalendarHeader with Ant Design Button.Group and Segmented"
```

---

## Task 22: Update TimeBlockModal

**Covers:** Time block creation

**Files:**
- Modify: `src/components/calendar/TimeBlockModal.vue`

- [ ] **Step 1: Rewrite with Ant Design Modal and DatePicker**

```vue
<template>
  <a-modal
    v-model:open="visible"
    title="创建时间块"
    @cancel="$emit('close')"
    @ok="handleSubmit"
    ok-text="创建"
    cancel-text="取消"
  >
    <a-form layout="vertical">
      <a-form-item label="时间块标题" required>
        <a-input v-model:value="title" placeholder="时间块标题" />
      </a-form-item>
      <a-row :gutter="12">
        <a-col :span="12">
          <a-form-item label="开始时间" required>
            <a-date-picker
              v-model:value="startTime"
              show-time
              format="YYYY-MM-DD HH:mm"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="结束时间" required>
            <a-date-picker
              v-model:value="endTime"
              show-time
              format="YYYY-MM-DD HH:mm"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTimeBlockStore } from '@/stores/timeBlock'
import dayjs from 'dayjs'

const props = defineProps<{
  startTime: Date
  endTime: Date
}>()

const emit = defineEmits<{
  close: []
}>()

const timeBlockStore = useTimeBlockStore()

const title = ref('')
const startTime = ref(dayjs(props.startTime))
const endTime = ref(dayjs(props.endTime))
const visible = ref(true)

async function handleSubmit() {
  await timeBlockStore.createTimeBlock({
    title: title.value,
    start_time: startTime.value.toDate(),
    end_time: endTime.value.toDate(),
  })
  emit('close')
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/calendar/TimeBlockModal.vue
git commit -m "feat: replace TimeBlockModal with Ant Design Modal and DatePicker"
```

---

## Task 23: Update MonthView

**Covers:** Calendar month view

**Files:**
- Modify: `src/components/calendar/MonthView.vue`

- [ ] **Step 1: Rewrite with Ant Design Calendar**

```vue
<template>
  <a-calendar :value="currentDate" @select="handleSelect" class="month-view">
    <template #dateCell="{ current }">
      <div class="day-events">
        <div
          v-for="block in getBlocksForDay(current.toDate())"
          :key="block.id"
          class="event-block"
          :style="{ backgroundColor: getBlockColor(block) }"
        >
          {{ block.title }}
        </div>
      </div>
    </template>
  </a-calendar>
</template>

<script setup lang="ts">
import { TimeBlock } from '@/database/entities/TimeBlock'
import dayjs from 'dayjs'

const props = defineProps<{
  currentDate: Date
  timeBlocks: TimeBlock[]
}>()

const emit = defineEmits<{
  'select-date': [date: Date]
  'create-block': [start: Date, end: Date]
}>()

function handleSelect(date: dayjs.Dayjs) {
  emit('select-date', date.toDate())
}

function getBlocksForDay(date: Date): TimeBlock[] {
  return props.timeBlocks.filter((block) => {
    const blockDate = new Date(block.start_time)
    return blockDate.toDateString() === date.toDateString()
  })
}

function getBlockColor(block: TimeBlock): string {
  if (block.card_id) return 'var(--ant-color-primary, #FF6B4A)'
  return 'var(--ant-color-text-secondary, rgba(0,0,0,0.45))'
}
</script>

<style scoped>
.month-view {
  height: 100%;
}

.day-events {
  margin-top: 4px;
}

.event-block {
  font-size: 11px;
  padding: 2px 4px;
  margin-bottom: 2px;
  border-radius: 4px;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/calendar/MonthView.vue
git commit -m "feat: replace MonthView with Ant Design Calendar"
```

---

## Task 24: Update ExportButton

**Covers:** Export functionality

**Files:**
- Modify: `src/components/statistics/ExportButton.vue`

- [ ] **Step 1: Rewrite with Ant Design Dropdown**

```vue
<template>
  <a-dropdown>
    <a-button>
      <template #icon><DownloadOutlined /></template>
      导出数据
    </a-button>
    <template #overlay>
      <a-menu @click="handleMenuClick">
        <a-menu-item key="csv">导出为 CSV</a-menu-item>
        <a-menu-item key="json">导出为 JSON</a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { DownloadOutlined } from '@ant-design/icons-vue'

const emit = defineEmits<{
  export: [format: 'csv' | 'json']
}>()

function handleMenuClick(info: { key: string }) {
  emit('export', info.key as 'csv' | 'json')
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/statistics/ExportButton.vue
git commit -m "feat: replace ExportButton with Ant Design Dropdown"
```

---

## Task 25: Update BoardColumn

**Covers:** Column display and drag-drop

**Files:**
- Modify: `src/components/board/BoardColumn.vue`

- [ ] **Step 1: Rewrite with Ant Design Card and Dropdown**

```vue
<template>
  <a-card
    class="board-column"
    :class="{ 'drag-over': isDragOver }"
    size="small"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
  >
    <template #title>
      <div class="column-title-group">
        <span class="column-bullet" />
        <span>{{ list.name }}</span>
        <a-badge :count="cards.length" :number-style="{ backgroundColor: 'var(--ant-color-text-secondary)' }" />
      </div>
    </template>
    <template #extra>
      <a-dropdown :trigger="['click']">
        <a-button type="text" size="small">
          <template #icon><MoreOutlined /></template>
        </a-button>
        <template #overlay>
          <a-menu>
            <a-menu-item key="delete" danger @click="handleDeleteList">删除列表</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </template>

    <div
      class="column-cards"
      ref="columnCardsRef"
      :class="{ 'has-drop-after': isDragOver && dropIndex === cards.length }"
      @dragover.prevent="handleDragOver"
      @drop.prevent="handleDrop"
    >
      <TransitionGroup name="card-list">
        <TaskCard
          v-for="(card, index) in cards"
          :key="card.id"
          :card="card"
          :class="{ 'drop-before': isDragOver && dropIndex === index }"
          draggable="true"
          @dragstart="handleDragStart($event, card)"
          @click="emit('select-card', card)"
        />
      </TransitionGroup>
    </div>
    <a-button block dashed @click="showCreateCard = true">
      <template #icon><PlusOutlined /></template>
      添加卡片
    </a-button>

    <CreateCardModal v-if="showCreateCard" :list-id="list.id" @close="showCreateCard = false" />
  </a-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { List } from '@/database/entities/List'
import { Card } from '@/database/entities/Card'
import { useCardStore } from '@/stores/card'
import { useListStore } from '@/stores/list'
import TaskCard from './TaskCard.vue'
import CreateCardModal from './CreateCardModal.vue'
import { MoreOutlined, PlusOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  list: List
  filteredCards?: Card[]
}>()

const emit = defineEmits<{
  (e: 'select-card', card: Card): void
}>()

const cardStore = useCardStore()
const listStore = useListStore()
const showCreateCard = ref(false)
const columnCardsRef = ref<HTMLElement | null>(null)
const isDragOver = ref(false)
const dropIndex = ref(0)
let dragEnterCounter = 0

const cards = computed(
  () => props.filteredCards ?? cardStore.cards.filter((c) => c.list_id === props.list.id)
)

onMounted(async () => {
  await cardStore.fetchCards(props.list.id)
})

function handleDragStart(event: DragEvent, card: Card) {
  localStorage.setItem('draggedCard', JSON.stringify(card))
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function handleDrop(event: DragEvent) {
  isDragOver.value = false
  dragEnterCounter = 0

  const cardData = localStorage.getItem('draggedCard')
  if (!cardData) return

  const container = columnCardsRef.value
  let dropIdx = dropIndex.value
  if (container) {
    const els = container.querySelectorAll('.task-card')
    let idx = els.length
    for (let i = 0; i < els.length; i++) {
      const rect = els[i].getBoundingClientRect()
      if (event.clientY < rect.top + rect.height / 2) {
        idx = i
        break
      }
    }
    dropIdx = idx
  }

  const card: Card = JSON.parse(cardData)
  let targetPosition = dropIdx + 1
  if (card.list_id === props.list.id) {
    const currentIndex = cards.value.findIndex((c) => c.id === card.id)
    if (currentIndex !== -1 && dropIdx > currentIndex) {
      targetPosition = dropIdx
    }
  }
  cardStore.moveCard(card.id, props.list.id, targetPosition)
  localStorage.removeItem('draggedCard')
}

function handleDragEnter() {
  dragEnterCounter++
  isDragOver.value = true
}

function handleDragOver(event: DragEvent) {
  const container = columnCardsRef.value
  if (!container) return

  const scrollZone = 40
  const scrollSpeed = 6
  const containerRect = container.getBoundingClientRect()
  if (event.clientY < containerRect.top + scrollZone) {
    container.scrollTop -= scrollSpeed
  } else if (event.clientY > containerRect.bottom - scrollZone) {
    container.scrollTop += scrollSpeed
  }

  const cardElements = container.querySelectorAll('.task-card')
  let idx = cards.value.length

  for (let i = 0; i < cardElements.length; i++) {
    const rect = cardElements[i].getBoundingClientRect()
    if (event.clientY < rect.top + rect.height / 2) {
      idx = i
      break
    }
  }

  dropIndex.value = idx
}

function handleDragLeave() {
  dragEnterCounter--
  if (dragEnterCounter <= 0) {
    isDragOver.value = false
    dragEnterCounter = 0
  }
}

async function handleDeleteList() {
  await listStore.deleteList(props.list.id)
  cardStore.removeCardsByList(props.list.id)
}
</script>

<style scoped>
.board-column {
  min-width: 292px;
  max-width: 292px;
  height: 100%;
  min-height: 0;
  transition: border-color 0.2s ease;
}

.board-column:hover {
  border-color: var(--ant-color-border-hover, #40a9ff);
}

.column-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-bullet {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: var(--ant-color-primary, #FF6B4A);
  flex-shrink: 0;
  opacity: 0.6;
}

.column-cards {
  min-height: 40px;
  max-height: calc(100vh - 300px);
  overflow-y: auto;
  margin-bottom: 10px;
}

.card-list-move {
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-list-enter-active,
.card-list-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-list-enter-from {
  opacity: 0;
  transform: translateY(-8px) scaleY(0.8);
}

.card-list-leave-to {
  opacity: 0;
  transform: translateY(8px) scaleY(0.8);
}

.task-card.drop-before {
  position: relative;
}

.task-card.drop-before::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 6px;
  right: 6px;
  height: 3px;
  background: var(--ant-color-primary, #FF6B4A);
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(255, 107, 74, 0.5);
  z-index: 2;
  animation: indicatorPulse 1.2s ease-in-out infinite;
}

.column-cards.has-drop-after::after {
  content: '';
  display: block;
  height: 3px;
  background: var(--ant-color-primary, #FF6B4A);
  border-radius: 2px;
  margin: 2px 6px 0;
  box-shadow: 0 0 10px rgba(255, 107, 74, 0.5);
  animation: indicatorPulse 1.2s ease-in-out infinite;
}

.board-column.drag-over {
  border-color: var(--ant-color-primary, #FF6B4A);
}

@keyframes indicatorPulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/board/BoardColumn.vue
git commit -m "feat: replace BoardColumn with Ant Design Card and Dropdown"
```

---

## Task 26: Clean Up Old CSS Variables

**Covers:** Remove legacy styling

**Files:**
- Modify: `src/App.vue` (remove :root CSS variables if still present)

- [ ] **Step 1: Remove old CSS variables from App.vue**

The App.vue was already updated in Task 4 to remove the CSS variables. Verify no other files reference `--color-*` or `--shadow-*` variables.

Run:
```bash
grep -r "var(--color-" src/ --include="*.vue" --include="*.css"
```

- [ ] **Step 2: Update any remaining references**

If any files still reference old CSS variables, update them to use Ant Design's CSS variables (`--ant-color-*`).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove old CSS variable references"
```

---

## Task 27: Final Verification

**Covers:** All requirements

**Files:**
- None (verification only)

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify in browser**

Check:
- [ ] App loads without errors
- [ ] Dark theme is applied by default
- [ ] All components render with Ant Design styling
- [ ] Navigation works (sidebar, top bar)
- [ ] Can create/edit/delete boards, lists, cards
- [ ] Calendar view works
- [ ] Statistics view works
- [ ] Chinese text displays correctly

- [ ] **Step 3: Run tests**

```bash
npm test
```

- [ ] **Step 4: Run lint**

```bash
npm run lint
```

- [ ] **Step 5: Final commit if needed**

```bash
git add -A
git commit -m "feat: complete Ant Design Vue integration"
```
