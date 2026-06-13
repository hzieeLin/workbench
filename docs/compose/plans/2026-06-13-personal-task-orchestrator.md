# Personal Task Orchestrator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a simplified Trello-like desktop application for personal task orchestration with Kanban boards, time planning, and data statistics.

**Architecture:** Electron + Vue 3 + TypeScript application with modular architecture. Frontend layer (Vue 3 + Element Plus) handles UI, business layer (services) handles logic, data layer (MySQL + TypeORM) handles persistence.

**Tech Stack:** Electron, Vue 3, TypeScript, Vite, Element Plus, Pinia, TypeORM, MySQL, Jest, Playwright

---

## Task 1: Project Setup and Configuration

**Covers:** [S3.2]
**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `electron/main.ts`
- Create: `electron/preload.ts`
- Create: `.eslintrc.cjs`
- Create: `.prettierrc`
- Create: `src/main.ts`
- Create: `src/App.vue`

- [ ] **Step 1: Initialize project with Electron + Vue 3 + Vite**

```bash
npm create vite@latest . -- --template vue-ts
npm install electron electron-builder --save-dev
npm install @vitejs/plugin-vue --save-dev
```

- [ ] **Step 2: Configure Vite for Electron**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
```

- [ ] **Step 3: Configure TypeScript**

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create Electron main process**

```typescript
// electron/main.ts
import { app, BrowserWindow } from 'electron'
import { join } from 'path'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```

- [ ] **Step 5: Create preload script**

```typescript
// electron/preload.ts
import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform
})
```

- [ ] **Step 6: Configure ESLint and Prettier**

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier'
  ],
  ignorePatterns: ['dist']
}
```

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

- [ ] **Step 7: Update package.json scripts**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "electron:dev": "concurrently \"vite\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "vite build && electron-builder",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix",
    "format": "prettier --write src/"
  }
}
```

- [ ] **Step 8: Commit project setup**

```bash
git add .
git commit -m "feat: initialize Electron + Vue 3 + TypeScript project"
```

---

## Task 2: Database Setup and Configuration

**Covers:** [S3.2, S4]
**Files:**
- Create: `src/database/connection.ts`
- Create: `src/database/entities/Board.ts`
- Create: `src/database/entities/List.ts`
- Create: `src/database/entities/Card.ts`
- Create: `src/database/entities/Label.ts`
- Create: `src/database/entities/CardLabel.ts`
- Create: `src/database/entities/TimeBlock.ts`
- Create: `src/database/entities/CalendarEvent.ts`
- Create: `src/database/entities/ActivityLog.ts`
- Create: `src/database/migrations/InitialSchema.ts`

- [ ] **Step 1: Install database dependencies**

```bash
npm install typeorm reflect-metadata mysql2
npm install @types/node --save-dev
```

- [ ] **Step 2: Create database connection**

```typescript
// src/database/connection.ts
import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Board } from './entities/Board'
import { List } from './entities/List'
import { Card } from './entities/Card'
import { Label } from './entities/Label'
import { CardLabel } from './entities/CardLabel'
import { TimeBlock } from './entities/TimeBlock'
import { CalendarEvent } from './entities/CalendarEvent'
import { ActivityLog } from './entities/ActivityLog'

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'task_orchestrator',
  synchronize: true,
  logging: false,
  entities: [Board, List, Card, Label, CardLabel, TimeBlock, CalendarEvent, ActivityLog],
  migrations: [],
  subscribers: []
})

export async function initializeDatabase() {
  try {
    await AppDataSource.initialize()
    console.log('Database connection established')
  } catch (error) {
    console.error('Database connection failed:', error)
    throw error
  }
}
```

- [ ] **Step 3: Create Board entity**

```typescript
// src/database/entities/Board.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { List } from './List'

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column({ nullable: true })
  description?: string

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date

  @OneToMany(() => List, list => list.board)
  lists!: List[]
}
```

- [ ] **Step 4: Create List entity**

```typescript
// src/database/entities/List.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm'
import { Board } from './Board'
import { Card } from './Card'

@Entity('lists')
export class List {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  board_id!: number

  @Column()
  name!: string

  @Column()
  position!: number

  @CreateDateColumn()
  created_at!: Date

  @ManyToOne(() => Board, board => board.lists)
  board!: Board

  @OneToMany(() => Card, card => card.list)
  cards!: Card[]
}
```

- [ ] **Step 5: Create Card entity**

```typescript
// src/database/entities/Card.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm'
import { List } from './List'
import { CardLabel } from './CardLabel'
import { TimeBlock } from './TimeBlock'

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  list_id!: number

  @Column()
  title!: string

  @Column({ nullable: true })
  description?: string

  @Column({ type: 'enum', enum: ['low', 'medium', 'high'], default: 'medium' })
  priority!: 'low' | 'medium' | 'high'

  @Column({ type: 'datetime', nullable: true })
  due_date?: Date

  @Column()
  position!: number

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date

  @ManyToOne(() => List, list => list.cards)
  list!: List

  @OneToMany(() => CardLabel, cardLabel => cardLabel.card)
  cardLabels!: CardLabel[]

  @OneToMany(() => TimeBlock, timeBlock => timeBlock.card)
  timeBlocks!: TimeBlock[]
}
```

- [ ] **Step 6: Create remaining entities**

```typescript
// src/database/entities/Label.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { CardLabel } from './CardLabel'

@Entity('labels')
export class Label {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column()
  color!: string

  @OneToMany(() => CardLabel, cardLabel => cardLabel.label)
  cardLabels!: CardLabel[]
}
```

```typescript
// src/database/entities/CardLabel.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { Card } from './Card'
import { Label } from './Label'

@Entity('card_labels')
export class CardLabel {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  card_id!: number

  @Column()
  label_id!: number

  @ManyToOne(() => Card, card => card.cardLabels)
  card!: Card

  @ManyToOne(() => Label, label => label.cardLabels)
  label!: Label
}
```

```typescript
// src/database/entities/TimeBlock.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { Card } from './Card'

@Entity('time_blocks')
export class TimeBlock {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ nullable: true })
  card_id?: number

  @Column({ type: 'datetime' })
  start_time!: Date

  @Column({ type: 'datetime' })
  end_time!: Date

  @Column()
  title!: string

  @ManyToOne(() => Card, card => card.timeBlocks, { nullable: true })
  card?: Card
}
```

```typescript
// src/database/entities/CalendarEvent.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('calendar_events')
export class CalendarEvent {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  title!: string

  @Column({ type: 'datetime' })
  start_time!: Date

  @Column({ type: 'datetime' })
  end_time!: Date

  @Column({ nullable: true })
  description?: string
}
```

```typescript
// src/database/entities/ActivityLog.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  card_id!: number

  @Column({ type: 'enum', enum: ['created', 'updated', 'completed', 'deleted'] })
  action!: 'created' | 'updated' | 'completed' | 'deleted'

  @Column({ type: 'datetime' })
  timestamp!: Date
}
```

- [ ] **Step 7: Commit database setup**

```bash
git add src/database/
git commit -m "feat: add database entities and configuration"
```

---

## Task 3: State Management Setup

**Covers:** [S3.2]
**Files:**
- Create: `src/stores/board.ts`
- Create: `src/stores/list.ts`
- Create: `src/stores/card.ts`
- Create: `src/stores/label.ts`
- Create: `src/stores/timeBlock.ts`
- Create: `src/stores/calendar.ts`
- Create: `src/stores/statistics.ts`

- [ ] **Step 1: Install Pinia**

```bash
npm install pinia
```

- [ ] **Step 2: Configure Pinia in main.ts**

```typescript
// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

- [ ] **Step 3: Create Board store**

```typescript
// src/stores/board.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AppDataSource } from '@/database/connection'
import { Board } from '@/database/entities/Board'

export const useBoardStore = defineStore('board', () => {
  const boards = ref<Board[]>([])
  const currentBoard = ref<Board | null>(null)
  const loading = ref(false)

  async function fetchBoards() {
    loading.value = true
    try {
      const boardRepo = AppDataSource.getRepository(Board)
      boards.value = await boardRepo.find({ order: { created_at: 'DESC' } })
    } finally {
      loading.value = false
    }
  }

  async function createBoard(name: string, description?: string) {
    const boardRepo = AppDataSource.getRepository(Board)
    const board = boardRepo.create({ name, description })
    const saved = await boardRepo.save(board)
    boards.value.unshift(saved)
    return saved
  }

  async function updateBoard(id: number, data: Partial<Board>) {
    const boardRepo = AppDataSource.getRepository(Board)
    await boardRepo.update(id, data)
    const index = boards.value.findIndex(b => b.id === id)
    if (index !== -1) {
      boards.value[index] = { ...boards.value[index], ...data }
    }
  }

  async function deleteBoard(id: number) {
    const boardRepo = AppDataSource.getRepository(Board)
    await boardRepo.delete(id)
    boards.value = boards.value.filter(b => b.id !== id)
    if (currentBoard.value?.id === id) {
      currentBoard.value = null
    }
  }

  function setCurrentBoard(board: Board | null) {
    currentBoard.value = board
  }

  return {
    boards,
    currentBoard,
    loading,
    fetchBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    setCurrentBoard
  }
})
```

- [ ] **Step 4: Create remaining stores**

```typescript
// src/stores/list.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AppDataSource } from '@/database/connection'
import { List } from '@/database/entities/List'

export const useListStore = defineStore('list', () => {
  const lists = ref<List[]>([])
  const loading = ref(false)

  async function fetchLists(boardId: number) {
    loading.value = true
    try {
      const listRepo = AppDataSource.getRepository(List)
      lists.value = await listRepo.find({
        where: { board_id: boardId },
        order: { position: 'ASC' }
      })
    } finally {
      loading.value = false
    }
  }

  async function createList(boardId: number, name: string) {
    const listRepo = AppDataSource.getRepository(List)
    const maxPosition = lists.value.length > 0
      ? Math.max(...lists.value.map(l => l.position))
      : 0
    const list = listRepo.create({ board_id: boardId, name, position: maxPosition + 1 })
    const saved = await listRepo.save(list)
    lists.value.push(saved)
    return saved
  }

  async function updateList(id: number, data: Partial<List>) {
    const listRepo = AppDataSource.getRepository(List)
    await listRepo.update(id, data)
    const index = lists.value.findIndex(l => l.id === id)
    if (index !== -1) {
      lists.value[index] = { ...lists.value[index], ...data }
    }
  }

  async function deleteList(id: number) {
    const listRepo = AppDataSource.getRepository(List)
    await listRepo.delete(id)
    lists.value = lists.value.filter(l => l.id !== id)
  }

  async function reorderLists(boardId: number, listIds: number[]) {
    const listRepo = AppDataSource.getRepository(List)
    for (let i = 0; i < listIds.length; i++) {
      await listRepo.update(listIds[i], { position: i + 1 })
    }
    await fetchLists(boardId)
  }

  return {
    lists,
    loading,
    fetchLists,
    createList,
    updateList,
    deleteList,
    reorderLists
  }
})
```

```typescript
// src/stores/card.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AppDataSource } from '@/database/connection'
import { Card } from '@/database/entities/Card'

export const useCardStore = defineStore('card', () => {
  const cards = ref<Card[]>([])
  const loading = ref(false)

  async function fetchCards(listId: number) {
    loading.value = true
    try {
      const cardRepo = AppDataSource.getRepository(Card)
      cards.value = await cardRepo.find({
        where: { list_id: listId },
        order: { position: 'ASC' }
      })
    } finally {
      loading.value = false
    }
  }

  async function createCard(listId: number, title: string, description?: string) {
    const cardRepo = AppDataSource.getRepository(Card)
    const listCards = cards.value.filter(c => c.list_id === listId)
    const maxPosition = listCards.length > 0
      ? Math.max(...listCards.map(c => c.position))
      : 0
    const card = cardRepo.create({ list_id: listId, title, description, position: maxPosition + 1 })
    const saved = await cardRepo.save(card)
    cards.value.push(saved)
    return saved
  }

  async function updateCard(id: number, data: Partial<Card>) {
    const cardRepo = AppDataSource.getRepository(Card)
    await cardRepo.update(id, data)
    const index = cards.value.findIndex(c => c.id === id)
    if (index !== -1) {
      cards.value[index] = { ...cards.value[index], ...data }
    }
  }

  async function deleteCard(id: number) {
    const cardRepo = AppDataSource.getRepository(Card)
    await cardRepo.delete(id)
    cards.value = cards.value.filter(c => c.id !== id)
  }

  async function moveCard(cardId: number, targetListId: number, position: number) {
    const cardRepo = AppDataSource.getRepository(Card)
    await cardRepo.update(cardId, { list_id: targetListId, position })
    const index = cards.value.findIndex(c => c.id === cardId)
    if (index !== -1) {
      cards.value[index].list_id = targetListId
      cards.value[index].position = position
    }
  }

  return {
    cards,
    loading,
    fetchCards,
    createCard,
    updateCard,
    deleteCard,
    moveCard
  }
})
```

```typescript
// src/stores/label.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AppDataSource } from '@/database/connection'
import { Label } from '@/database/entities/Label'

export const useLabelStore = defineStore('label', () => {
  const labels = ref<Label[]>([])
  const loading = ref(false)

  async function fetchLabels() {
    loading.value = true
    try {
      const labelRepo = AppDataSource.getRepository(Label)
      labels.value = await labelRepo.find()
    } finally {
      loading.value = false
    }
  }

  async function createLabel(name: string, color: string) {
    const labelRepo = AppDataSource.getRepository(Label)
    const label = labelRepo.create({ name, color })
    const saved = await labelRepo.save(label)
    labels.value.push(saved)
    return saved
  }

  async function updateLabel(id: number, data: Partial<Label>) {
    const labelRepo = AppDataSource.getRepository(Label)
    await labelRepo.update(id, data)
    const index = labels.value.findIndex(l => l.id === id)
    if (index !== -1) {
      labels.value[index] = { ...labels.value[index], ...data }
    }
  }

  async function deleteLabel(id: number) {
    const labelRepo = AppDataSource.getRepository(Label)
    await labelRepo.delete(id)
    labels.value = labels.value.filter(l => l.id !== id)
  }

  return {
    labels,
    loading,
    fetchLabels,
    createLabel,
    updateLabel,
    deleteLabel
  }
})
```

- [ ] **Step 5: Commit state management**

```bash
git add src/stores/
git commit -m "feat: add Pinia stores for state management"
```

---

## Task 4: Main Layout Component

**Covers:** [S5.1]
**Files:**
- Create: `src/components/layout/AppLayout.vue`
- Create: `src/components/layout/Sidebar.vue`
- Create: `src/components/layout/TopBar.vue`
- Create: `src/components/layout/StatusBar.vue`
- Modify: `src/App.vue`

- [ ] **Step 1: Create AppLayout component**

```vue
<!-- src/components/layout/AppLayout.vue -->
<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-area">
      <TopBar />
      <main class="content">
        <slot />
      </main>
      <StatusBar />
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import TopBar from './TopBar.vue'
import StatusBar from './StatusBar.vue'
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}
</style>
```

- [ ] **Step 2: Create Sidebar component**

```vue
<!-- src/components/layout/Sidebar.vue -->
<template>
  <aside class="sidebar">
    <div class="logo">
      <h1>TaskFlow</h1>
    </div>
    <nav class="nav-menu">
      <router-link to="/" class="nav-item">
        <span class="icon">📋</span>
        <span>看板</span>
      </router-link>
      <router-link to="/calendar" class="nav-item">
        <span class="icon">📅</span>
        <span>时间规划</span>
      </router-link>
      <router-link to="/statistics" class="nav-item">
        <span class="icon">📊</span>
        <span>统计分析</span>
      </router-link>
    </nav>
    <div class="board-list">
      <h3>我的看板</h3>
      <ul>
        <li v-for="board in boards" :key="board.id" @click="selectBoard(board)">
          {{ board.name }}
        </li>
      </ul>
      <button @click="showCreateBoard = true">+ 新建看板</button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBoardStore } from '@/stores/board'
import { Board } from '@/database/entities/Board'

const boardStore = useBoardStore()
const boards = ref<Board[]>([])
const showCreateBoard = ref(false)

onMounted(async () => {
  await boardStore.fetchBoards()
  boards.value = boardStore.boards
})

function selectBoard(board: Board) {
  boardStore.setCurrentBoard(board)
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: #1a1a2e;
  color: white;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 20px;
  border-bottom: 1px solid #333;
}

.nav-menu {
  padding: 10px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  color: white;
  text-decoration: none;
  transition: background 0.2s;
}

.nav-item:hover {
  background: #16213e;
}

.board-list {
  flex: 1;
  padding: 10px 20px;
  overflow-y: auto;
}

.board-list h3 {
  margin: 10px 0;
  font-size: 14px;
  color: #888;
}

.board-list ul {
  list-style: none;
  padding: 0;
}

.board-list li {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 4px;
}

.board-list li:hover {
  background: #16213e;
}
</style>
```

- [ ] **Step 3: Create TopBar component**

```vue
<!-- src/components/layout/TopBar.vue -->
<template>
  <header class="topbar">
    <div class="search-box">
      <input type="text" placeholder="搜索任务..." v-model="searchQuery" />
    </div>
    <div class="actions">
      <button class="btn-icon" title="设置">⚙️</button>
      <button class="btn-icon" title="用户">👤</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')
</script>

<style scoped>
.topbar {
  height: 56px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.search-box input {
  width: 300px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
}

.search-box input:focus {
  border-color: #4a90d9;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
}

.btn-icon:hover {
  background: #f0f0f0;
}
</style>
```

- [ ] **Step 4: Create StatusBar component**

```vue
<!-- src/components/layout/StatusBar.vue -->
<template>
  <footer class="statusbar">
    <span>{{ currentDate }}</span>
    <span>{{ taskCount }} 个任务</span>
  </footer>
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
    weekday: 'long'
  })
})

const taskCount = computed(() => cardStore.cards.length)
</script>

<style scoped>
.statusbar {
  height: 32px;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  font-size: 12px;
  color: #666;
}
</style>
```

- [ ] **Step 5: Update App.vue**

```vue
<!-- src/App.vue -->
<template>
  <AppLayout>
    <router-view />
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from './components/layout/AppLayout.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}
</style>
```

- [ ] **Step 6: Commit layout components**

```bash
git add src/components/layout/ src/App.vue
git commit -m "feat: add main layout components"
```

---

## Task 5: Board View Component

**Covers:** [S5.2, S6.1]
**Files:**
- Create: `src/views/BoardView.vue`
- Create: `src/components/board/BoardColumn.vue`
- Create: `src/components/board/TaskCard.vue`
- Create: `src/components/board/CreateCardModal.vue`
- Create: `src/components/board/CreateListModal.vue`
- Create: `src/components/board/CardDetailModal.vue`

- [ ] **Step 1: Create BoardView component**

```vue
<!-- src/views/BoardView.vue -->
<template>
  <div class="board-view">
    <div class="board-header">
      <h2>{{ currentBoard?.name || '选择一个看板' }}</h2>
      <div class="board-actions">
        <button @click="showCreateList = true">+ 新建列表</button>
      </div>
    </div>
    <div class="board-columns" v-if="currentBoard">
      <BoardColumn
        v-for="list in lists"
        :key="list.id"
        :list="list"
        @select-card="openCardDetail"
      />
    </div>
    <div v-else class="empty-state">
      <p>请从左侧选择一个看板，或创建新看板</p>
    </div>

    <CreateListModal
      v-if="showCreateList"
      @close="showCreateList = false"
      :board-id="currentBoard?.id"
    />

    <CardDetailModal
      v-if="selectedCard"
      :card="selectedCard"
      @close="selectedCard = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBoardStore } from '@/stores/board'
import { useListStore } from '@/stores/list'
import { Card } from '@/database/entities/Card'
import BoardColumn from '@/components/board/BoardColumn.vue'
import CreateListModal from '@/components/board/CreateListModal.vue'
import CardDetailModal from '@/components/board/CardDetailModal.vue'

const boardStore = useBoardStore()
const listStore = useListStore()

const showCreateList = ref(false)
const selectedCard = ref<Card | null>(null)

const currentBoard = computed(() => boardStore.currentBoard)
const lists = computed(() => listStore.lists)

watch(currentBoard, async (board) => {
  if (board) {
    await listStore.fetchLists(board.id)
  }
})

function openCardDetail(card: Card) {
  selectedCard.value = card
}
</script>

<style scoped>
.board-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.board-columns {
  flex: 1;
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
}
</style>
```

- [ ] **Step 2: Create BoardColumn component**

```vue
<!-- src/components/board/BoardColumn.vue -->
<template>
  <div class="board-column" @dragover.prevent @drop="handleDrop">
    <div class="column-header">
      <h3>{{ list.name }}</h3>
      <button class="btn-icon" @click="showMenu = !showMenu">⋯</button>
    </div>
    <div class="column-cards">
      <TaskCard
        v-for="card in cards"
        :key="card.id"
        :card="card"
        draggable="true"
        @dragstart="handleDragStart(card)"
        @click="$emit('select-card', card)"
      />
    </div>
    <button class="add-card-btn" @click="showCreateCard = true">
      + 添加卡片
    </button>

    <CreateCardModal
      v-if="showCreateCard"
      :list-id="list.id"
      @close="showCreateCard = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { List } from '@/database/entities/List'
import { Card } from '@/database/entities/Card'
import { useCardStore } from '@/stores/card'
import TaskCard from './TaskCard.vue'
import CreateCardModal from './CreateCardModal.vue'

const props = defineProps<{
  list: List
}>()

defineEmits<{
  select-card: [card: Card]
}>()

const cardStore = useCardStore()
const showCreateCard = ref(false)
const showMenu = ref(false)

const cards = computed(() => cardStore.cards.filter(c => c.list_id === props.list.id))

onMounted(async () => {
  await cardStore.fetchCards(props.list.id)
})

function handleDragStart(card: Card) {
  // Store card data for drag and drop
  localStorage.setItem('draggedCard', JSON.stringify(card))
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  const cardData = localStorage.getItem('draggedCard')
  if (cardData) {
    const card: Card = JSON.parse(cardData)
    cardStore.moveCard(card.id, props.list.id, cards.value.length + 1)
    localStorage.removeItem('draggedCard')
  }
}
</script>

<style scoped>
.board-column {
  min-width: 280px;
  max-width: 280px;
  background: #f4f5f7;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.column-header {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.column-cards {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
}

.add-card-btn {
  margin: 12px;
  padding: 8px;
  background: none;
  border: 1px dashed #ccc;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
}

.add-card-btn:hover {
  background: #e8e8e8;
}
</style>
```

- [ ] **Step 3: Create TaskCard component**

```vue
<!-- src/components/board/TaskCard.vue -->
<template>
  <div class="task-card" :class="{ 'high-priority': card.priority === 'high' }">
    <div class="card-labels">
      <span
        v-for="label in cardLabels"
        :key="label.id"
        class="label"
        :style="{ backgroundColor: label.color }"
      >
        {{ label.name }}
      </span>
    </div>
    <h4 class="card-title">{{ card.title }}</h4>
    <div class="card-meta">
      <span v-if="card.due_date" class="due-date">
        📅 {{ formatDate(card.due_date) }}
      </span>
      <span class="priority" :class="card.priority">
        {{ priorityText }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card } from '@/database/entities/Card'

const props = defineProps<{
  card: Card
}>()

const cardLabels = computed(() => {
  // This would fetch labels from cardLabels relation
  return []
})

const priorityText = computed(() => {
  const map = { low: '低', medium: '中', high: '高' }
  return map[props.card.priority]
})

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.task-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;
}

.task-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.task-card.high-priority {
  border-left: 4px solid #e74c3c;
}

.card-labels {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.label {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  color: white;
}

.card-title {
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.4;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.priority {
  padding: 2px 8px;
  border-radius: 4px;
}

.priority.low {
  background: #e8f5e9;
  color: #2e7d32;
}

.priority.medium {
  background: #fff3e0;
  color: #f57c00;
}

.priority.high {
  background: #ffebee;
  color: #c62828;
}
</style>
```

- [ ] **Step 4: Create modal components**

```vue
<!-- src/components/board/CreateCardModal.vue -->
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h3>新建卡片</h3>
      <form @submit.prevent="handleSubmit">
        <input v-model="title" placeholder="卡片标题" required />
        <textarea v-model="description" placeholder="描述（可选）"></textarea>
        <div class="modal-actions">
          <button type="button" @click="$emit('close')">取消</button>
          <button type="submit">创建</button>
        </div>
      </form>
    </div>
  </div>
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

async function handleSubmit() {
  await cardStore.createCard(props.listId, title.value, description.value || undefined)
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
}

.modal h3 {
  margin-bottom: 16px;
}

.modal input,
.modal textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal textarea {
  height: 100px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.modal-actions button {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions button[type="submit"] {
  background: #4a90d9;
  color: white;
  border: none;
}
</style>
```

```vue
<!-- src/components/board/CreateListModal.vue -->
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h3>新建列表</h3>
      <form @submit.prevent="handleSubmit">
        <input v-model="name" placeholder="列表名称" required />
        <div class="modal-actions">
          <button type="button" @click="$emit('close')">取消</button>
          <button type="submit">创建</button>
        </div>
      </form>
    </div>
  </div>
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

async function handleSubmit() {
  await listStore.createList(props.boardId, name.value)
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
}

.modal h3 {
  margin-bottom: 16px;
}

.modal input {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.modal-actions button {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions button[type="submit"] {
  background: #4a90d9;
  color: white;
  border: none;
}
</style>
```

```vue
<!-- src/components/board/CardDetailModal.vue -->
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal large">
      <div class="modal-header">
        <h3>{{ card.title }}</h3>
        <button class="btn-icon" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>标题</label>
          <input v-model="editTitle" />
        </div>
        <div class="form-group">
          <label>描述</label>
          <textarea v-model="editDescription"></textarea>
        </div>
        <div class="form-group">
          <label>优先级</label>
          <select v-model="editPriority">
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
        </div>
        <div class="form-group">
          <label>截止日期</label>
          <input type="date" v-model="editDueDate" />
        </div>
      </div>
      <div class="modal-footer">
        <button @click="handleSave">保存</button>
        <button @click="handleDelete" class="danger">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Card } from '@/database/entities/Card'
import { useCardStore } from '@/stores/card'

const props = defineProps<{
  card: Card
}>()

const emit = defineEmits<{
  close: []
}>()

const cardStore = useCardStore()

const editTitle = ref(props.card.title)
const editDescription = ref(props.card.description || '')
const editPriority = ref(props.card.priority)
const editDueDate = ref(props.card.due_date ? new Date(props.card.due_date).toISOString().split('T')[0] : '')

async function handleSave() {
  await cardStore.updateCard(props.card.id, {
    title: editTitle.value,
    description: editDescription.value || undefined,
    priority: editPriority.value,
    due_date: editDueDate.value ? new Date(editDueDate.value) : undefined
  })
  emit('close')
}

async function handleDelete() {
  if (confirm('确定要删除这个卡片吗？')) {
    await cardStore.deleteCard(props.card.id)
    emit('close')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal.large {
  width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  height: 120px;
  resize: vertical;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
}

.modal-footer button {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.modal-footer button.danger {
  background: #e74c3c;
  color: white;
  border: none;
}
</style>
```

- [ ] **Step 5: Commit board view components**

```bash
git add src/views/BoardView.vue src/components/board/
git commit -m "feat: add board view with columns and cards"
```

---

## Task 6: Time Planning View

**Covers:** [S5.3, S6.2]
**Files:**
- Create: `src/views/CalendarView.vue`
- Create: `src/components/calendar/CalendarHeader.vue`
- Create: `src/components/calendar/MonthView.vue`
- Create: `src/components/calendar/WeekView.vue`
- Create: `src/components/calendar/DayView.vue`
- Create: `src/components/calendar/TimeBlockModal.vue`

- [ ] **Step 1: Create CalendarView component**

```vue
<!-- src/views/CalendarView.vue -->
<template>
  <div class="calendar-view">
    <CalendarHeader
      :current-date="currentDate"
      :view-mode="viewMode"
      @prev="prevPeriod"
      @next="nextPeriod"
      @today="goToToday"
      @change-view="viewMode = $event"
    />
    <div class="calendar-content">
      <MonthView
        v-if="viewMode === 'month'"
        :current-date="currentDate"
        :time-blocks="timeBlocks"
        @select-date="selectDate"
        @create-block="openCreateBlock"
      />
      <WeekView
        v-else-if="viewMode === 'week'"
        :current-date="currentDate"
        :time-blocks="timeBlocks"
        @select-date="selectDate"
        @create-block="openCreateBlock"
      />
      <DayView
        v-else
        :current-date="currentDate"
        :time-blocks="timeBlocks"
        @create-block="openCreateBlock"
      />
    </div>

    <TimeBlockModal
      v-if="showCreateBlock"
      :start-time="selectedStartTime"
      :end-time="selectedEndTime"
      @close="showCreateBlock = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTimeBlockStore } from '@/stores/timeBlock'
import { TimeBlock } from '@/database/entities/TimeBlock'
import CalendarHeader from '@/components/calendar/CalendarHeader.vue'
import MonthView from '@/components/calendar/MonthView.vue'
import WeekView from '@/components/calendar/WeekView.vue'
import DayView from '@/components/calendar/DayView.vue'
import TimeBlockModal from '@/components/calendar/TimeBlockModal.vue'

const timeBlockStore = useTimeBlockStore()

const currentDate = ref(new Date())
const viewMode = ref<'month' | 'week' | 'day'>('month')
const showCreateBlock = ref(false)
const selectedStartTime = ref<Date>(new Date())
const selectedEndTime = ref<Date>(new Date())

const timeBlocks = computed(() => timeBlockStore.timeBlocks)

onMounted(async () => {
  await timeBlockStore.fetchTimeBlocks()
})

function prevPeriod() {
  const date = new Date(currentDate.value)
  if (viewMode.value === 'month') {
    date.setMonth(date.getMonth() - 1)
  } else if (viewMode.value === 'week') {
    date.setDate(date.getDate() - 7)
  } else {
    date.setDate(date.getDate() - 1)
  }
  currentDate.value = date
}

function nextPeriod() {
  const date = new Date(currentDate.value)
  if (viewMode.value === 'month') {
    date.setMonth(date.getMonth() + 1)
  } else if (viewMode.value === 'week') {
    date.setDate(date.getDate() + 7)
  } else {
    date.setDate(date.getDate() + 1)
  }
  currentDate.value = date
}

function goToToday() {
  currentDate.value = new Date()
}

function selectDate(date: Date) {
  currentDate.value = date
  viewMode.value = 'day'
}

function openCreateBlock(start: Date, end: Date) {
  selectedStartTime.value = start
  selectedEndTime.value = end
  showCreateBlock.value = true
}
</script>

<style scoped>
.calendar-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.calendar-content {
  flex: 1;
  overflow: auto;
}
</style>
```

- [ ] **Step 2: Create CalendarHeader component**

```vue
<!-- src/components/calendar/CalendarHeader.vue -->
<template>
  <div class="calendar-header">
    <div class="header-left">
      <h2>{{ title }}</h2>
    </div>
    <div class="header-center">
      <button @click="$emit('prev')">‹</button>
      <button @click="$emit('today')">今天</button>
      <button @click="$emit('next')">›</button>
    </div>
    <div class="header-right">
      <div class="view-toggle">
        <button
          :class="{ active: viewMode === 'month' }"
          @click="$emit('change-view', 'month')"
        >
          月
        </button>
        <button
          :class="{ active: viewMode === 'week' }"
          @click="$emit('change-view', 'week')"
        >
          周
        </button>
        <button
          :class="{ active: viewMode === 'day' }"
          @click="$emit('change-view', 'day')"
        >
          日
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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
  } else if (props.viewMode === 'week') {
    const start = new Date(date)
    start.setDate(date.getDate() - date.getDay())
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`
  } else {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }
})
</script>

<style scoped>
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.header-center {
  display: flex;
  gap: 8px;
}

.header-center button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.header-center button:hover {
  background: #f5f5f5;
}

.view-toggle {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.view-toggle button {
  padding: 8px 16px;
  border: none;
  background: white;
  cursor: pointer;
}

.view-toggle button.active {
  background: #4a90d9;
  color: white;
}
</style>
```

- [ ] **Step 3: Create MonthView component**

```vue
<!-- src/components/calendar/MonthView.vue -->
<template>
  <div class="month-view">
    <div class="weekday-header">
      <div v-for="day in weekdays" :key="day">{{ day }}</div>
    </div>
    <div class="days-grid">
      <div
        v-for="day in calendarDays"
        :key="day.date.toISOString()"
        class="day-cell"
        :class="{ 'other-month': !day.isCurrentMonth, 'today': day.isToday }"
        @click="$emit('select-date', day.date)"
      >
        <span class="day-number">{{ day.date.getDate() }}</span>
        <div class="day-events">
          <div
            v-for="block in getBlocksForDay(day.date)"
            :key="block.id"
            class="event-block"
            :style="{ backgroundColor: getBlockColor(block) }"
          >
            {{ block.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TimeBlock } from '@/database/entities/TimeBlock'

const props = defineProps<{
  currentDate: Date
  timeBlocks: TimeBlock[]
}>()

defineEmits<{
  select-date: [date: Date]
  'create-block': [start: Date, end: Date]
}>()

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const calendarDays = computed(() => {
  const year = props.currentDate.getFullYear()
  const month = props.currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const days = []
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const today = new Date()

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    days.push({
      date,
      isCurrentMonth: date.getMonth() === month,
      isToday: date.toDateString() === today.toDateString()
    })
  }

  return days
})

function getBlocksForDay(date: Date): TimeBlock[] {
  return props.timeBlocks.filter(block => {
    const blockDate = new Date(block.start_time)
    return blockDate.toDateString() === date.toDateString()
  })
}

function getBlockColor(block: TimeBlock): string {
  if (block.card_id) return '#4a90d9'
  return '#999'
}
</script>

<style scoped>
.month-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f5f5f5;
  font-weight: 600;
}

.weekday-header div {
  padding: 12px;
  text-align: center;
}

.days-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(100px, 1fr);
}

.day-cell {
  border: 1px solid #eee;
  padding: 4px;
  cursor: pointer;
}

.day-cell:hover {
  background: #f9f9f9;
}

.day-cell.other-month {
  background: #fafafa;
}

.day-cell.other-month .day-number {
  color: #ccc;
}

.day-cell.today {
  background: #e3f2fd;
}

.day-number {
  font-size: 12px;
  font-weight: 500;
}

.day-events {
  margin-top: 4px;
}

.event-block {
  font-size: 11px;
  padding: 2px 4px;
  margin-bottom: 2px;
  border-radius: 3px;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
```

- [ ] **Step 4: Create WeekView and DayView components**

```vue
<!-- src/components/calendar/WeekView.vue -->
<template>
  <div class="week-view">
    <div class="time-column">
      <div v-for="hour in hours" :key="hour" class="hour-label">
        {{ hour }}:00
      </div>
    </div>
    <div class="days-column">
      <div v-for="day in weekDays" :key="day.toISOString()" class="day-column">
        <div
          v-for="hour in hours"
          :key="hour"
          class="time-slot"
          @click="handleSlotClick(day, hour)"
        >
          <div
            v-for="block in getBlocksForHour(day, hour)"
            :key="block.id"
            class="time-block"
            :style="{ height: getBlockHeight(block) + 'px' }"
          >
            {{ block.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TimeBlock } from '@/database/entities/TimeBlock'

const props = defineProps<{
  currentDate: Date
  timeBlocks: TimeBlock[]
}>()

const emit = defineEmits<{
  'create-block': [start: Date, end: Date]
}>()

const hours = Array.from({ length: 24 }, (_, i) => i)

const weekDays = computed(() => {
  const start = new Date(props.currentDate)
  start.setDate(start.getDate() - start.getDay())
  const days = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    days.push(day)
  }
  return days
})

function getBlocksForHour(day: Date, hour: number): TimeBlock[] {
  return props.timeBlocks.filter(block => {
    const blockStart = new Date(block.start_time)
    return blockStart.toDateString() === day.toDateString() && blockStart.getHours() === hour
  })
}

function getBlockHeight(block: TimeBlock): number {
  const start = new Date(block.start_time)
  const end = new Date(block.end_time)
  const minutes = (end.getTime() - start.getTime()) / 60000
  return Math.max(minutes, 30)
}

function handleSlotClick(day: Date, hour: number) {
  const start = new Date(day)
  start.setHours(hour, 0, 0, 0)
  const end = new Date(start)
  end.setHours(hour + 1, 0, 0, 0)
  emit('create-block', start, end)
}
</script>

<style scoped>
.week-view {
  display: flex;
  height: 100%;
}

.time-column {
  width: 60px;
  border-right: 1px solid #eee;
}

.hour-label {
  height: 60px;
  padding: 4px 8px;
  font-size: 12px;
  color: #666;
  text-align: right;
}

.days-column {
  flex: 1;
  display: flex;
}

.day-column {
  flex: 1;
  border-right: 1px solid #eee;
  position: relative;
}

.time-slot {
  height: 60px;
  border-bottom: 1px solid #eee;
  position: relative;
}

.time-slot:hover {
  background: #f5f5f5;
}

.time-block {
  position: absolute;
  left: 2px;
  right: 2px;
  background: #4a90d9;
  color: white;
  padding: 4px;
  border-radius: 4px;
  font-size: 12px;
  overflow: hidden;
}
</style>
```

```vue
<!-- src/components/calendar/DayView.vue -->
<template>
  <div class="day-view">
    <div class="time-column">
      <div v-for="hour in hours" :key="hour" class="hour-label">
        {{ hour }}:00
      </div>
    </div>
    <div class="events-column">
      <div
        v-for="hour in hours"
        :key="hour"
        class="time-slot"
        @click="handleSlotClick(hour)"
      >
        <div
          v-for="block in getBlocksForHour(hour)"
          :key="block.id"
          class="time-block"
          :style="{ height: getBlockHeight(block) + 'px' }"
        >
          {{ block.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TimeBlock } from '@/database/entities/TimeBlock'

const props = defineProps<{
  currentDate: Date
  timeBlocks: TimeBlock[]
}>()

const emit = defineEmits<{
  'create-block': [start: Date, end: Date]
}>()

const hours = Array.from({ length: 24 }, (_, i) => i)

function getBlocksForHour(hour: number): TimeBlock[] {
  return props.timeBlocks.filter(block => {
    const blockStart = new Date(block.start_time)
    return blockStart.toDateString() === props.currentDate.toDateString() && blockStart.getHours() === hour
  })
}

function getBlockHeight(block: TimeBlock): number {
  const start = new Date(block.start_time)
  const end = new Date(block.end_time)
  const minutes = (end.getTime() - start.getTime()) / 60000
  return Math.max(minutes, 30)
}

function handleSlotClick(hour: number) {
  const start = new Date(props.currentDate)
  start.setHours(hour, 0, 0, 0)
  const end = new Date(start)
  end.setHours(hour + 1, 0, 0, 0)
  emit('create-block', start, end)
}
</script>

<style scoped>
.day-view {
  display: flex;
  height: 100%;
}

.time-column {
  width: 60px;
  border-right: 1px solid #eee;
}

.hour-label {
  height: 60px;
  padding: 4px 8px;
  font-size: 12px;
  color: #666;
  text-align: right;
}

.events-column {
  flex: 1;
  position: relative;
}

.time-slot {
  height: 60px;
  border-bottom: 1px solid #eee;
  position: relative;
}

.time-slot:hover {
  background: #f5f5f5;
}

.time-block {
  position: absolute;
  left: 4px;
  right: 4px;
  background: #4a90d9;
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-size: 14px;
}
</style>
```

- [ ] **Step 5: Create TimeBlockModal component**

```vue
<!-- src/components/calendar/TimeBlockModal.vue -->
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h3>创建时间块</h3>
      <form @submit.prevent="handleSubmit">
        <input v-model="title" placeholder="时间块标题" required />
        <div class="time-inputs">
          <label>
            开始时间
            <input type="datetime-local" v-model="startTime" required />
          </label>
          <label>
            结束时间
            <input type="datetime-local" v-model="endTime" required />
          </label>
        </div>
        <div class="modal-actions">
          <button type="button" @click="$emit('close')">取消</button>
          <button type="submit">创建</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTimeBlockStore } from '@/stores/timeBlock'

const props = defineProps<{
  startTime: Date
  endTime: Date
}>()

const emit = defineEmits<{
  close: []
}>()

const timeBlockStore = useTimeBlockStore()

const title = ref('')
const startTime = ref(formatDateTime(props.startTime))
const endTime = ref(formatDateTime(props.endTime))

function formatDateTime(date: Date): string {
  return date.toISOString().slice(0, 16)
}

async function handleSubmit() {
  await timeBlockStore.createTimeBlock({
    title: title.value,
    start_time: new Date(startTime.value),
    end_time: new Date(endTime.value)
  })
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
}

.modal h3 {
  margin-bottom: 16px;
}

.modal input {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.time-inputs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.time-inputs label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.modal-actions button {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions button[type="submit"] {
  background: #4a90d9;
  color: white;
  border: none;
}
</style>
```

- [ ] **Step 6: Commit calendar view components**

```bash
git add src/views/CalendarView.vue src/components/calendar/
git commit -m "feat: add calendar view with month/week/day views"
```

---

## Task 7: Statistics View

**Covers:** [S5.4, S6.3]
**Files:**
- Create: `src/views/StatisticsView.vue`
- Create: `src/components/statistics/CompletionChart.vue`
- Create: `src/components/statistics/TimeDistribution.vue`
- Create: `src/components/statistics/ProductivityTrends.vue`
- Create: `src/components/statistics/ExportButton.vue`

- [ ] **Step 1: Install Chart.js**

```bash
npm install chart.js vue-chartjs
```

- [ ] **Step 2: Create StatisticsView component**

```vue
<!-- src/views/StatisticsView.vue -->
<template>
  <div class="statistics-view">
    <h2>统计分析</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>任务完成率</h3>
        <CompletionChart :data="completionData" />
      </div>
      <div class="stat-card">
        <h3>时间分布</h3>
        <TimeDistribution :data="timeData" />
      </div>
      <div class="stat-card full-width">
        <h3>效率趋势</h3>
        <ProductivityTrends :data="trendData" />
      </div>
    </div>
    <div class="export-section">
      <ExportButton @export="handleExport" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStatisticsStore } from '@/stores/statistics'
import CompletionChart from '@/components/statistics/CompletionChart.vue'
import TimeDistribution from '@/components/statistics/TimeDistribution.vue'
import ProductivityTrends from '@/components/statistics/ProductivityTrends.vue'
import ExportButton from '@/components/statistics/ExportButton.vue'

const statisticsStore = useStatisticsStore()

const completionData = ref({
  completed: 0,
  pending: 0,
  total: 0
})

const timeData = ref({
  labels: [],
  datasets: []
})

const trendData = ref({
  labels: [],
  datasets: []
})

onMounted(async () => {
  await statisticsStore.fetchStatistics()
  completionData.value = statisticsStore.completionData
  timeData.value = statisticsStore.timeData
  trendData.value = statisticsStore.trendData
})

function handleExport(format: 'csv' | 'json') {
  statisticsStore.exportData(format)
}
</script>

<style scoped>
.statistics-view {
  padding: 20px;
}

h2 {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  margin-bottom: 16px;
  color: #333;
}

.stat-card.full-width {
  grid-column: span 2;
}

.export-section {
  display: flex;
  justify-content: flex-end;
}
</style>
```

- [ ] **Step 3: Create chart components**

```vue
<!-- src/components/statistics/CompletionChart.vue -->
<template>
  <div class="completion-chart">
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
    <div class="stats-summary">
      <div class="stat">
        <span class="value">{{ data.completed }}</span>
        <span class="label">已完成</span>
      </div>
      <div class="stat">
        <span class="value">{{ data.pending }}</span>
        <span class="label">待处理</span>
      </div>
      <div class="stat">
        <span class="value">{{ percentage }}%</span>
        <span class="label">完成率</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps<{
  data: {
    completed: number
    pending: number
    total: number
  }
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)

const percentage = computed(() => {
  if (props.data.total === 0) return 0
  return Math.round((props.data.completed / props.data.total) * 100)
})

onMounted(() => {
  if (chartCanvas.value) {
    new Chart(chartCanvas.value, {
      type: 'doughnut',
      data: {
        labels: ['已完成', '待处理'],
        datasets: [{
          data: [props.data.completed, props.data.pending],
          backgroundColor: ['#4caf50', '#ff9800']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    })
  }
})
</script>

<style scoped>
.completion-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-container {
  width: 200px;
  height: 200px;
  margin-bottom: 20px;
}

.stats-summary {
  display: flex;
  gap: 30px;
}

.stat {
  text-align: center;
}

.stat .value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat .label {
  font-size: 12px;
  color: #666;
}
</style>
```

```vue
<!-- src/components/statistics/TimeDistribution.vue -->
<template>
  <div class="time-distribution">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps<{
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor: string
    }[]
  }
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  if (chartCanvas.value) {
    new Chart(chartCanvas.value, {
      type: 'bar',
      data: props.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  }
})
</script>

<style scoped>
.time-distribution {
  height: 250px;
}
</style>
```

```vue
<!-- src/components/statistics/ProductivityTrends.vue -->
<template>
  <div class="productivity-trends">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps<{
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      borderColor: string
      tension: number
    }[]
  }
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  if (chartCanvas.value) {
    new Chart(chartCanvas.value, {
      type: 'line',
      data: props.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  }
})
</script>

<style scoped>
.productivity-trends {
  height: 300px;
}
</style>
```

```vue
<!-- src/components/statistics/ExportButton.vue -->
<template>
  <div class="export-button">
    <button @click="showDropdown = !showDropdown">
      导出数据
    </button>
    <div v-if="showDropdown" class="dropdown">
      <button @click="handleExport('csv')">导出为CSV</button>
      <button @click="handleExport('json')">导出为JSON</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  export: [format: 'csv' | 'json']
}>()

const showDropdown = ref(false)

function handleExport(format: 'csv' | 'json') {
  emit('export', format)
  showDropdown.value = false
}
</script>

<style scoped>
.export-button {
  position: relative;
}

.export-button > button {
  padding: 10px 20px;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dropdown button {
  display: block;
  width: 100%;
  padding: 10px 20px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
}

.dropdown button:hover {
  background: #f5f5f5;
}
</style>
```

- [ ] **Step 4: Commit statistics components**

```bash
git add src/views/StatisticsView.vue src/components/statistics/
git commit -m "feat: add statistics view with charts"
```

---

## Task 8: Router Setup

**Covers:** [S5.1]
**Files:**
- Create: `src/router/index.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Install Vue Router**

```bash
npm install vue-router
```

- [ ] **Step 2: Create router configuration**

```typescript
// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'
import BoardView from '@/views/BoardView.vue'
import CalendarView from '@/views/CalendarView.vue'
import StatisticsView from '@/views/StatisticsView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'board',
      component: BoardView
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: CalendarView
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: StatisticsView
    }
  ]
})

export default router
```

- [ ] **Step 3: Update main.ts to use router**

```typescript
// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

- [ ] **Step 4: Commit router setup**

```bash
git add src/router/ src/main.ts
git commit -m "feat: add Vue Router for navigation"
```

---

## Task 9: Keyboard Shortcuts

**Covers:** [S6.4]
**Files:**
- Create: `src/composables/useKeyboardShortcuts.ts`
- Modify: `src/App.vue`

- [ ] **Step 1: Create keyboard shortcuts composable**

```typescript
// src/composables/useKeyboardShortcuts.ts
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export function useKeyboardShortcuts() {
  const router = useRouter()

  function handleKeydown(event: KeyboardEvent) {
    // Ctrl/Cmd + N: New card
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault()
      // Emit event or call store action
      console.log('New card')
    }

    // Ctrl/Cmd + B: New board
    if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
      event.preventDefault()
      console.log('New board')
    }

    // Ctrl/Cmd + L: New list
    if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
      event.preventDefault()
      console.log('New list')
    }

    // Ctrl/Cmd + F: Focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      event.preventDefault()
      const searchInput = document.querySelector('.search-box input') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      }
    }

    // Escape: Close dialogs
    if (event.key === 'Escape') {
      // Close any open modals
      console.log('Close dialogs')
    }

    // Delete: Delete selected item
    if (event.key === 'Delete') {
      console.log('Delete selected')
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
}
```

- [ ] **Step 2: Update App.vue to use shortcuts**

```vue
<!-- src/App.vue -->
<template>
  <AppLayout>
    <router-view />
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from './components/layout/AppLayout.vue'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'

useKeyboardShortcuts()
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}
</style>
```

- [ ] **Step 3: Commit keyboard shortcuts**

```bash
git add src/composables/ src/App.vue
git commit -m "feat: add keyboard shortcuts"
```

---

## Task 10: Testing Setup

**Covers:** [S8]
**Files:**
- Create: `jest.config.js`
- Create: `tests/unit/stores/board.test.ts`
- Create: `tests/unit/stores/card.test.ts`
- Create: `tests/components/TaskCard.test.ts`
- Create: `tests/e2e/board.spec.ts`

- [ ] **Step 1: Install testing dependencies**

```bash
npm install --save-dev jest @vue/test-utils vue-jest ts-jest @types/jest
npm install --save-dev @playwright/test
```

- [ ] **Step 2: Configure Jest**

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '^.+\\.ts$': 'ts-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: ['**/tests/unit/**/*.test.ts']
}
```

- [ ] **Step 3: Create unit test for Board store**

```typescript
// tests/unit/stores/board.test.ts
import { setActivePinia, createPinia } from 'pinia'
import { useBoardStore } from '@/stores/board'

describe('Board Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with empty boards', () => {
    const store = useBoardStore()
    expect(store.boards).toEqual([])
    expect(store.currentBoard).toBeNull()
  })

  it('sets current board', () => {
    const store = useBoardStore()
    const board = { id: 1, name: 'Test Board', created_at: new Date(), updated_at: new Date() }
    store.setCurrentBoard(board)
    expect(store.currentBoard).toEqual(board)
  })
})
```

- [ ] **Step 4: Create component test for TaskCard**

```typescript
// tests/components/TaskCard.test.ts
import { mount } from '@vue/test-utils'
import TaskCard from '@/components/board/TaskCard.vue'

describe('TaskCard', () => {
  const mockCard = {
    id: 1,
    list_id: 1,
    title: 'Test Card',
    description: 'Test description',
    priority: 'medium' as const,
    position: 1,
    created_at: new Date(),
    updated_at: new Date()
  }

  it('renders card title', () => {
    const wrapper = mount(TaskCard, {
      props: { card: mockCard }
    })
    expect(wrapper.text()).toContain('Test Card')
  })

  it('applies high-priority class for high priority', () => {
    const wrapper = mount(TaskCard, {
      props: { card: { ...mockCard, priority: 'high' } }
    })
    expect(wrapper.classes()).toContain('high-priority')
  })
})
```

- [ ] **Step 5: Create E2E test**

```typescript
// tests/e2e/board.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Board View', () => {
  test('displays board view', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h2')).toContainText('选择一个看板')
  })

  test('can create a new board', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("新建看板")')
    await page.fill('input[placeholder="看板名称"]', 'My Test Board')
    await page.click('button:has-text("创建")')
    await expect(page.locator('text=My Test Board')).toBeVisible()
  })
})
```

- [ ] **Step 6: Run tests**

```bash
npm run test
npx playwright test
```

- [ ] **Step 7: Commit tests**

```bash
git add tests/
git commit -m "feat: add unit, component, and E2E tests"
```

---

## Task 11: Build and Package

**Covers:** [S10]
**Files:**
- Modify: `package.json`
- Create: `electron-builder.yml`

- [ ] **Step 1: Configure electron-builder**

```yaml
# electron-builder.yml
appId: com.taskflow.app
productName: TaskFlow
directories:
  output: release
files:
  - dist/**/*
  - electron/**/*
win:
  target: nsis
  icon: build/icon.ico
mac:
  target: dmg
  icon: build/icon.icns
linux:
  target: AppImage
  icon: build/icon.png
```

- [ ] **Step 2: Update package.json for building**

```json
{
  "build": {
    "appId": "com.taskflow.app",
    "productName": "TaskFlow",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "win": {
      "target": "nsis"
    },
    "mac": {
      "target": "dmg"
    },
    "linux": {
      "target": "AppImage"
    }
  }
}
```

- [ ] **Step 3: Build the application**

```bash
npm run build
npm run electron:build
```

- [ ] **Step 4: Commit build configuration**

```bash
git add package.json electron-builder.yml
git commit -m "feat: configure electron-builder for packaging"
```

---

## Summary

This implementation plan covers:

1. ✅ Project setup with Electron + Vue 3 + TypeScript
2. ✅ Database setup with MySQL and TypeORM
3. ✅ State management with Pinia
4. ✅ Main layout components
5. ✅ Board view with drag-and-drop
6. ✅ Calendar view with time blocks
7. ✅ Statistics view with charts
8. ✅ Router setup
9. ✅ Keyboard shortcuts
10. ✅ Testing setup
11. ✅ Build and packaging

**Total Tasks:** 11
**Estimated Time:** 2-3 weeks for a skilled developer

**Next Steps:**
1. Review the plan
2. Choose execution approach (subagent or inline)
3. Start implementation with Task 1
