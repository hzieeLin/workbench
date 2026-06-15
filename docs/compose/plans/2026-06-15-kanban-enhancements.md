# Kanban Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the Kanban board with label system, comment system, search/filter, multiple view modes, and card sorting.

**Architecture:** Extend existing Vue 3 + TypeScript + Pinia codebase with new components and API endpoints. Follow established patterns for components, stores, and API routes.

**Tech Stack:** Vue 3, TypeScript, Pinia, TypeORM, Express.js, SQLite

---

## File Structure

### New Files
- `src/database/entities/Comment.ts` - Comment entity
- `src/server/routes/comments.ts` - Comment API routes
- `src/components/board/LabelManager.vue` - Label management component
- `src/components/board/LabelPicker.vue` - Label picker for cards
- `src/components/board/LabelFilter.vue` - Label filter component
- `src/components/board/LabelBadge.vue` - Label badge display
- `src/components/board/CommentSection.vue` - Comment section component
- `src/components/board/CommentItem.vue` - Single comment component
- `src/components/board/CommentForm.vue` - Comment form component
- `src/components/board/SearchBar.vue` - Search bar component
- `src/components/board/FilterPanel.vue` - Filter panel component
- `src/components/board/ActiveFilters.vue` - Active filters display
- `src/components/board/ViewSwitcher.vue` - View mode switcher
- `src/components/board/ListView.vue` - List view component
- `src/components/board/CalendarView.vue` - Calendar view component
- `src/components/board/TimelineView.vue` - Timeline view component
- `src/components/board/SortSelector.vue` - Sort selector component
- `src/stores/comment.ts` - Comment store
- `src/stores/label.ts` - Label store

### Modified Files
- `src/database/entities/Card.ts` - Add comments relation
- `src/database/entities/Label.ts` - Add board relation
- `src/server/routes/cards.ts` - Add search/filter/sort endpoints
- `src/server/routes/lists.ts` - Add label endpoints
- `src/views/BoardView.vue` - Integrate new components
- `src/components/board/BoardColumn.vue` - Update for filtering
- `src/components/board/TaskCard.vue` - Show labels
- `src/components/board/CardDetailModal.vue` - Add comments and labels
- `src/components/layout/Sidebar.vue` - Add label management

---

### Task 1: Create Comment Entity and Database Migration

**Covers:** [S4]

**Files:**
- Create: `src/database/entities/Comment.ts`
- Modify: `src/database/entities/Card.ts:45-50`
- Test: `tests/unit/entities/comment.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/entities/comment.test.ts
import { Comment } from '@/database/entities/Comment'

describe('Comment Entity', () => {
  it('should have required fields', () => {
    const comment = new Comment()
    comment.id = 1
    comment.card_id = 1
    comment.author = 'Test User'
    comment.content = 'Test comment'
    
    expect(comment.id).toBe(1)
    expect(comment.card_id).toBe(1)
    expect(comment.author).toBe('Test User')
    expect(comment.content).toBe('Test comment')
  })

  it('should have created_at timestamp', () => {
    const comment = new Comment()
    comment.created_at = new Date()
    
    expect(comment.created_at).toBeInstanceOf(Date)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/unit/entities/comment.test.ts`
Expected: FAIL with "Cannot find module '@/database/entities/Comment'"

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/database/entities/Comment.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  card_id!: number

  @Column()
  author!: string

  @Column({ type: 'text' })
  content!: string

  @CreateDateColumn()
  created_at!: Date

  @ManyToOne('Card', (card: any) => card.comments)
  @JoinColumn({ name: 'card_id' })
  card!: any
}
```

- [ ] **Step 4: Update Card entity to include comments relation**

```typescript
// src/database/entities/Card.ts:45-50
@OneToMany('Comment', (comment: any) => comment.card)
comments!: any[]
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test tests/unit/entities/comment.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/database/entities/Comment.ts src/database/entities/Card.ts tests/unit/entities/comment.test.ts
git commit -m "feat: add Comment entity with card relation"
```

---

### Task 2: Create Comment API Routes

**Covers:** [S4]

**Files:**
- Create: `src/server/routes/comments.ts`
- Modify: `src/server/app.ts:1-20`
- Test: `tests/server/comments.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/server/comments.test.ts
import request from 'supertest'
import app from '@/server/app'

describe('Comment API', () => {
  let card_id: number

  beforeAll(async () => {
    // Create a test card first
    const listRes = await request(app)
      .post('/api/boards/1/lists')
      .send({ name: 'Test List' })
    
    const cardRes = await request(app)
      .post(`/api/lists/${listRes.body.id}/cards`)
      .send({ title: 'Test Card' })
    
    card_id = cardRes.body.id
  })

  it('should create a comment', async () => {
    const res = await request(app)
      .post(`/api/cards/${card_id}/comments`)
      .send({ author: 'Test User', content: 'Test comment' })
    
    expect(res.status).toBe(201)
    expect(res.body.content).toBe('Test comment')
    expect(res.body.author).toBe('Test User')
  })

  it('should get comments for a card', async () => {
    const res = await request(app)
      .get(`/api/cards/${card_id}/comments`)
    
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('should delete a comment', async () => {
    const createRes = await request(app)
      .post(`/api/cards/${card_id}/comments`)
      .send({ author: 'Test User', content: 'To delete' })
    
    const deleteRes = await request(app)
      .delete(`/api/comments/${createRes.body.id}`)
    
    expect(deleteRes.status).toBe(200)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/server/comments.test.ts`
Expected: FAIL with "Cannot find module '@/server/routes/comments'"

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/server/routes/comments.ts
import { Router } from 'express'
import { AppDataSource } from '../data-source'
import { Comment } from '../entities/Comment'

const router = Router()

// Get comments for a card
router.get('/cards/:cardId/comments', async (req, res) => {
  const commentRepo = AppDataSource.getRepository(Comment)
  const comments = await commentRepo.find({
    where: { card_id: parseInt(req.params.cardId) },
    order: { created_at: 'ASC' }
  })
  res.json(comments)
})

// Create a comment
router.post('/cards/:cardId/comments', async (req, res) => {
  const commentRepo = AppDataSource.getRepository(Comment)
  const comment = commentRepo.create({
    card_id: parseInt(req.params.cardId),
    author: req.body.author || '用户',
    content: req.body.content
  })
  const saved = await commentRepo.save(comment)
  res.status(201).json(saved)
})

// Delete a comment
router.delete('/comments/:id', async (req, res) => {
  const commentRepo = AppDataSource.getRepository(Comment)
  await commentRepo.delete(parseInt(req.params.id))
  res.json({ success: true })
})

export default router
```

- [ ] **Step 4: Update app.ts to include comment routes**

```typescript
// src/server/app.ts
import commentRoutes from './routes/comments'
app.use('/api', commentRoutes)
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test tests/server/comments.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/server/routes/comments.ts src/server/app.ts tests/server/comments.test.ts
git commit -m "feat: add comment API routes"
```

---

### Task 3: Create Label Store and API

**Covers:** [S3]

**Files:**
- Create: `src/stores/label.ts`
- Modify: `src/server/routes/lists.ts:1-50`
- Test: `tests/unit/stores/label.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/stores/label.test.ts
import { setActivePinia, createPinia } from 'pinia'
import { useLabelStore } from '@/stores/label'

describe('Label Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should fetch labels', async () => {
    const store = useLabelStore()
    await store.fetchLabels(1)
    expect(Array.isArray(store.labels)).toBe(true)
  })

  it('should create a label', async () => {
    const store = useLabelStore()
    const label = await store.createLabel(1, 'Test Label', '#FF0000')
    expect(label.name).toBe('Test Label')
    expect(label.color).toBe('#FF0000')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/unit/stores/label.test.ts`
Expected: FAIL with "Cannot find module '@/stores/label'"

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/stores/label.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Label } from '@/database/entities/Label'
import { apiClient } from '@/services/api'

export const useLabelStore = defineStore('label', () => {
  const labels = ref<Label[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchLabels(boardId: number) {
    loading.value = true
    error.value = null
    try {
      labels.value = await apiClient.get<Label[]>(`/boards/${boardId}/labels`)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function createLabel(boardId: number, name: string, color: string) {
    error.value = null
    try {
      const label = await apiClient.post<Label>(`/boards/${boardId}/labels`, { name, color })
      labels.value.push(label)
      return label
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function updateLabel(id: number, data: Partial<Label>) {
    error.value = null
    try {
      await apiClient.patch(`/labels/${id}`, data as Record<string, unknown>)
      const index = labels.value.findIndex((l) => l.id === id)
      if (index !== -1) {
        labels.value[index] = { ...labels.value[index], ...data }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function deleteLabel(id: number) {
    error.value = null
    try {
      await apiClient.delete(`/labels/${id}`)
      labels.value = labels.value.filter((l) => l.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  return { labels, loading, error, fetchLabels, createLabel, updateLabel, deleteLabel }
})
```

- [ ] **Step 4: Add label API routes to lists.ts**

```typescript
// src/server/routes/lists.ts
// Add these routes

// Get labels for a board
router.get('/boards/:boardId/labels', async (req, res) => {
  const labelRepo = AppDataSource.getRepository(Label)
  const labels = await labelRepo.find({
    where: { board_id: parseInt(req.params.boardId) }
  })
  res.json(labels)
})

// Create a label
router.post('/boards/:boardId/labels', async (req, res) => {
  const labelRepo = AppDataSource.getRepository(Label)
  const label = labelRepo.create({
    board_id: parseInt(req.params.boardId),
    name: req.body.name,
    color: req.body.color
  })
  const saved = await labelRepo.save(label)
  res.status(201).json(saved)
})

// Update a label
router.patch('/labels/:id', async (req, res) => {
  const labelRepo = AppDataSource.getRepository(Label)
  await labelRepo.update(parseInt(req.params.id), req.body)
  res.json({ success: true })
})

// Delete a label
router.delete('/labels/:id', async (req, res) => {
  const labelRepo = AppDataSource.getRepository(Label)
  await labelRepo.delete(parseInt(req.params.id))
  res.json({ success: true })
})
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test tests/unit/stores/label.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/stores/label.ts src/server/routes/lists.ts tests/unit/stores/label.test.ts
git commit -m "feat: add label store and API routes"
```

---

### Task 4: Create LabelManager Component

**Covers:** [S3]

**Files:**
- Create: `src/components/board/LabelManager.vue`
- Modify: `src/components/layout/Sidebar.vue:88-124`
- Test: `tests/components/LabelManager.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/components/LabelManager.test.ts
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LabelManager from '@/components/board/LabelManager.vue'

describe('LabelManager', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders label list', () => {
    const wrapper = mount(LabelManager, {
      props: { boardId: 1 }
    })
    expect(wrapper.find('.label-list').exists()).toBe(true)
  })

  it('shows create form when button clicked', async () => {
    const wrapper = mount(LabelManager, {
      props: { boardId: 1 }
    })
    await wrapper.find('.create-btn').trigger('click')
    expect(wrapper.find('.create-form').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/components/LabelManager.test.ts`
Expected: FAIL with "Cannot find module '@/components/board/LabelManager'"

- [ ] **Step 3: Write minimal implementation**

```vue
<!-- src/components/board/LabelManager.vue -->
<template>
  <div class="label-manager">
    <h3>标签管理</h3>
    <div class="label-list">
      <div v-for="label in labels" :key="label.id" class="label-item">
        <span class="label-color" :style="{ backgroundColor: label.color }" />
        <span class="label-name">{{ label.name }}</span>
        <div class="label-actions">
          <button @click="editLabel(label)" class="btn-icon">编辑</button>
          <button @click="deleteLabel(label.id)" class="btn-icon danger">删除</button>
        </div>
      </div>
    </div>
    
    <div v-if="showCreate" class="create-form">
      <input v-model="newName" placeholder="标签名称" />
      <input v-model="newColor" type="color" />
      <div class="form-actions">
        <button @click="cancelCreate" class="btn-secondary">取消</button>
        <button @click="createLabel" class="btn-primary">创建</button>
      </div>
    </div>
    <button v-else @click="showCreate = true" class="create-btn">新建标签</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLabelStore } from '@/stores/label'

const props = defineProps<{
  boardId: number
}>()

const labelStore = useLabelStore()
const labels = ref(labelStore.labels)
const showCreate = ref(false)
const newName = ref('')
const newColor = ref('#4AD9D9')

onMounted(async () => {
  await labelStore.fetchLabels(props.boardId)
  labels.value = labelStore.labels
})

async function createLabel() {
  if (!newName.value.trim()) return
  await labelStore.createLabel(props.boardId, newName.value, newColor.value)
  cancelCreate()
}

function cancelCreate() {
  showCreate.value = false
  newName.value = ''
  newColor.value = '#4AD9D9'
}

async function deleteLabel(id: number) {
  if (confirm('确定要删除这个标签吗？')) {
    await labelStore.deleteLabel(id)
  }
}

function editLabel(label: any) {
  // TODO: implement edit functionality
}
</script>

<style scoped>
.label-manager {
  padding: 16px;
}

.label-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.label-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.label-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.label-name {
  flex: 1;
  font-size: 14px;
}

.label-actions {
  display: flex;
  gap: 4px;
}

.btn-icon {
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.btn-icon:hover {
  background: var(--color-surface-hover);
}

.btn-icon.danger {
  color: var(--color-red);
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.create-form input {
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.form-actions {
  display: flex;
  gap: 8px;
}

.create-btn {
  width: 100%;
  padding: 8px;
  border: 1px dashed var(--color-border);
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-md);
}

.create-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
</style>
```

- [ ] **Step 4: Add LabelManager to Sidebar**

```vue
<!-- src/components/layout/Sidebar.vue:88-124 -->
<!-- Add label management section -->
<div class="board-section">
  <div class="board-section-header">
    <h3>我的看板</h3>
    <span class="board-count">{{ boards.length }}</span>
  </div>
  <!-- ... existing board list ... -->
  
  <!-- Add label management for current board -->
  <div v-if="boardStore.currentBoard" class="label-section">
    <LabelManager :board-id="boardStore.currentBoard.id" />
  </div>
</div>
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test tests/components/LabelManager.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/board/LabelManager.vue src/components/layout/Sidebar.vue tests/components/LabelManager.test.ts
git commit -m "feat: add LabelManager component"
```

---

### Task 5: Create LabelPicker and LabelBadge Components

**Covers:** [S3]

**Files:**
- Create: `src/components/board/LabelPicker.vue`
- Create: `src/components/board/LabelBadge.vue`
- Modify: `src/components/board/TaskCard.vue:4-13`
- Test: `tests/components/LabelPicker.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/components/LabelPicker.test.ts
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LabelPicker from '@/components/board/LabelPicker.vue'

describe('LabelPicker', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders label options', () => {
    const wrapper = mount(LabelPicker, {
      props: { 
        cardId: 1,
        availableLabels: [
          { id: 1, name: 'Bug', color: '#FF0000' },
          { id: 2, name: 'Feature', color: '#00FF00' }
        ],
        selectedLabels: []
      }
    })
    expect(wrapper.findAll('.label-option').length).toBe(2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/components/LabelPicker.test.ts`
Expected: FAIL with "Cannot find module '@/components/board/LabelPicker'"

- [ ] **Step 3: Write LabelPicker implementation**

```vue
<!-- src/components/board/LabelPicker.vue -->
<template>
  <div class="label-picker">
    <div class="label-search">
      <input v-model="search" placeholder="搜索标签..." />
    </div>
    <div class="label-list">
      <label 
        v-for="label in filteredLabels" 
        :key="label.id" 
        class="label-option"
      >
        <input 
          type="checkbox" 
          :checked="isSelected(label.id)"
          @change="toggleLabel(label.id)"
        />
        <span class="label-color" :style="{ backgroundColor: label.color }" />
        <span class="label-name">{{ label.name }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Label } from '@/database/entities/Label'

const props = defineProps<{
  cardId: number
  availableLabels: Label[]
  selectedLabels: number[]
}>()

const emit = defineEmits<{
  (e: 'update:selectedLabels', labels: number[]): void
}>()

const search = ref('')

const filteredLabels = computed(() => {
  if (!search.value) return props.availableLabels
  return props.availableLabels.filter(label => 
    label.name.toLowerCase().includes(search.value.toLowerCase())
  )
})

function isSelected(labelId: number) {
  return props.selectedLabels.includes(labelId)
}

function toggleLabel(labelId: number) {
  const newSelected = isSelected(labelId)
    ? props.selectedLabels.filter(id => id !== labelId)
    : [...props.selectedLabels, labelId]
  emit('update:selectedLabels', newSelected)
}
</script>

<style scoped>
.label-picker {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 8px;
}

.label-search input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  margin-bottom: 8px;
}

.label-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.label-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.label-option:hover {
  background: var(--color-surface-hover);
}

.label-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.label-name {
  font-size: 13px;
}
</style>
```

- [ ] **Step 4: Write LabelBadge implementation**

```vue
<!-- src/components/board/LabelBadge.vue -->
<template>
  <div class="label-badges" v-if="labels.length">
    <span 
      v-for="label in displayLabels" 
      :key="label.id" 
      class="label-badge"
      :style="{ backgroundColor: label.color }"
    >
      {{ label.name }}
    </span>
    <span v-if="overflowCount > 0" class="label-badge overflow">
      +{{ overflowCount }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Label } from '@/database/entities/Label'

const props = defineProps<{
  labels: Label[]
  maxDisplay?: number
}>()

const maxDisplay = computed(() => props.maxDisplay || 3)

const displayLabels = computed(() => {
  return props.labels.slice(0, maxDisplay.value)
})

const overflowCount = computed(() => {
  return Math.max(0, props.labels.length - maxDisplay.value)
})
</script>

<style scoped>
.label-badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.label-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 999px;
  color: white;
  font-weight: 600;
}

.label-badge.overflow {
  background: var(--color-surface);
  color: var(--color-text-tertiary);
}
</style>
```

- [ ] **Step 5: Update TaskCard to show labels**

```vue
<!-- src/components/board/TaskCard.vue:4-13 -->
<!-- Update card-labels section -->
<div class="card-labels" v-if="cardLabels.length">
  <LabelBadge :labels="cardLabels" :max-display="2" />
</div>
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test tests/components/LabelPicker.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/board/LabelPicker.vue src/components/board/LabelBadge.vue src/components/board/TaskCard.vue tests/components/LabelPicker.test.ts
git commit -m "feat: add LabelPicker and LabelBadge components"
```

---

### Task 6: Create Comment Components

**Covers:** [S4]

**Files:**
- Create: `src/components/board/CommentSection.vue`
- Create: `src/components/board/CommentItem.vue`
- Create: `src/components/board/CommentForm.vue`
- Create: `src/stores/comment.ts`
- Modify: `src/components/board/CardDetailModal.vue:19-52`
- Test: `tests/components/CommentSection.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/components/CommentSection.test.ts
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CommentSection from '@/components/board/CommentSection.vue'

describe('CommentSection', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders comment list', () => {
    const wrapper = mount(CommentSection, {
      props: { cardId: 1 }
    })
    expect(wrapper.find('.comment-section').exists()).toBe(true)
  })

  it('shows comment form', () => {
    const wrapper = mount(CommentSection, {
      props: { cardId: 1 }
    })
    expect(wrapper.find('.comment-form').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/components/CommentSection.test.ts`
Expected: FAIL with "Cannot find module '@/components/board/CommentSection'"

- [ ] **Step 3: Create comment store**

```typescript
// src/stores/comment.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Comment } from '@/database/entities/Comment'
import { apiClient } from '@/services/api'

export const useCommentStore = defineStore('comment', () => {
  const comments = ref<Comment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchComments(cardId: number) {
    loading.value = true
    error.value = null
    try {
      comments.value = await apiClient.get<Comment[]>(`/cards/${cardId}/comments`)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function createComment(cardId: number, content: string, author: string = '用户') {
    error.value = null
    try {
      const comment = await apiClient.post<Comment>(`/cards/${cardId}/comments`, {
        content,
        author
      })
      comments.value.push(comment)
      return comment
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function deleteComment(id: number) {
    error.value = null
    try {
      await apiClient.delete(`/comments/${id}`)
      comments.value = comments.value.filter((c) => c.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  return { comments, loading, error, fetchComments, createComment, deleteComment }
})
```

- [ ] **Step 4: Write CommentSection implementation**

```vue
<!-- src/components/board/CommentSection.vue -->
<template>
  <div class="comment-section">
    <h4>评论 ({{ comments.length }})</h4>
    
    <div class="comment-list">
      <CommentItem 
        v-for="comment in comments" 
        :key="comment.id" 
        :comment="comment"
        @delete="deleteComment"
      />
    </div>
    
    <CommentForm @submit="addComment" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCommentStore } from '@/stores/comment'
import CommentItem from './CommentItem.vue'
import CommentForm from './CommentForm.vue'

const props = defineProps<{
  cardId: number
}>()

const commentStore = useCommentStore()
const comments = ref(commentStore.comments)

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
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}

.comment-section h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--color-text-secondary);
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}
</style>
```

- [ ] **Step 5: Write CommentItem implementation**

```vue
<!-- src/components/board/CommentItem.vue -->
<template>
  <div class="comment-item">
    <div class="comment-header">
      <div class="comment-author">
        <div class="author-avatar">{{ comment.author.charAt(0) }}</div>
        <span class="author-name">{{ comment.author }}</span>
      </div>
      <div class="comment-meta">
        <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
        <button v-if="comment.author === '用户'" @click="handleDelete" class="delete-btn">
          删除
        </button>
      </div>
    </div>
    <div class="comment-content">{{ comment.content }}</div>
  </div>
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
  if (days < 7) return `${days}天前`
  return new Date(date).toLocaleDateString()
}

function handleDelete() {
  if (confirm('确定要删除这条评论吗？')) {
    emit('delete', props.comment.id)
  }
}
</script>

<style scoped>
.comment-item {
  padding: 12px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.author-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-time {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.delete-btn {
  padding: 2px 6px;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  font-size: 12px;
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.delete-btn:hover {
  background: var(--color-red-soft);
  color: var(--color-red);
}

.comment-content {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text);
  white-space: pre-wrap;
}
</style>
```

- [ ] **Step 6: Write CommentForm implementation**

```vue
<!-- src/components/board/CommentForm.vue -->
<template>
  <div class="comment-form">
    <textarea 
      v-model="content" 
      placeholder="添加评论..."
      @keydown.enter.meta="handleSubmit"
      @keydown.enter.ctrl="handleSubmit"
    />
    <div class="form-actions">
      <span class="hint">⌘ + Enter 发送</span>
      <button @click="handleSubmit" :disabled="!content.trim()" class="btn-primary">
        发送
      </button>
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
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px;
}

.comment-form textarea {
  width: 100%;
  min-height: 80px;
  padding: 8px;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 14px;
  resize: vertical;
  outline: none;
}

.comment-form textarea::placeholder {
  color: var(--color-text-tertiary);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.hint {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.btn-primary {
  padding: 6px 12px;
  border: 1px solid var(--color-accent);
  background: var(--color-accent);
  color: white;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-accent-strong);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

- [ ] **Step 7: Update CardDetailModal to include comments**

```vue
<!-- src/components/board/CardDetailModal.vue:19-52 -->
<!-- Add CommentSection after form-grid -->
<div class="form-grid">
  <!-- existing form groups -->
</div>

<CommentSection :card-id="card.id" />
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test tests/components/CommentSection.test.ts`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/components/board/CommentSection.vue src/components/board/CommentItem.vue src/components/board/CommentForm.vue src/stores/comment.ts src/components/board/CardDetailModal.vue tests/components/CommentSection.test.ts
git commit -m "feat: add comment system components"
```

---

### Task 7: Create SearchBar and FilterPanel Components

**Covers:** [S5]

**Files:**
- Create: `src/components/board/SearchBar.vue`
- Create: `src/components/board/FilterPanel.vue`
- Create: `src/components/board/ActiveFilters.vue`
- Modify: `src/views/BoardView.vue:22-29`
- Test: `tests/components/SearchBar.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/components/SearchBar.test.ts
import { mount } from '@vue/test-utils'
import SearchBar from '@/components/board/SearchBar.vue'

describe('SearchBar', () => {
  it('emits search event on input', async () => {
    const wrapper = mount(SearchBar)
    await wrapper.find('input').setValue('test')
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')![0]).toEqual(['test'])
  })

  it('clears search on button click', async () => {
    const wrapper = mount(SearchBar)
    await wrapper.find('input').setValue('test')
    await wrapper.find('.clear-btn').trigger('click')
    expect(wrapper.find('input').element.value).toBe('')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/components/SearchBar.test.ts`
Expected: FAIL with "Cannot find module '@/components/board/SearchBar'"

- [ ] **Step 3: Write SearchBar implementation**

```vue
<!-- src/components/board/SearchBar.vue -->
<template>
  <div class="search-bar">
    <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.5" />
      <path d="M11 11l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
    <input 
      v-model="search" 
      placeholder="搜索卡片..."
      @input="handleSearch"
    />
    <button v-if="search" @click="clearSearch" class="clear-btn">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </button>
    <span v-if="resultCount !== null" class="result-count">
      {{ resultCount }} 条结果
    </span>
  </div>
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
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('search', search.value)
  }, 300)
}

function clearSearch() {
  search.value = ''
  emit('search', '')
}
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  min-width: 280px;
}

.search-icon {
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.search-bar input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 14px;
  outline: none;
}

.search-bar input::placeholder {
  color: var(--color-text-tertiary);
}

.clear-btn {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.clear-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.result-count {
  font-size: 12px;
  color: var(--color-text-tertiary);
  white-space: nowrap;
}
</style>
```

- [ ] **Step 4: Write FilterPanel implementation**

```vue
<!-- src/components/board/FilterPanel.vue -->
<template>
  <div class="filter-panel">
    <div class="filter-group">
      <label>优先级</label>
      <div class="filter-options">
        <label v-for="priority in priorities" :key="priority.value" class="filter-option">
          <input 
            type="checkbox" 
            :value="priority.value"
            v-model="selectedPriorities"
            @change="emitFilters"
          />
          <span class="priority-dot" :class="priority.value" />
          <span>{{ priority.label }}</span>
        </label>
      </div>
    </div>
    
    <div class="filter-group">
      <label>截止日期</label>
      <div class="filter-options">
        <label v-for="due in dueOptions" :key="due.value" class="filter-option">
          <input 
            type="checkbox" 
            :value="due.value"
            v-model="selectedDue"
            @change="emitFilters"
          />
          <span>{{ due.label }}</span>
        </label>
      </div>
    </div>
    
    <div class="filter-group">
      <label>标签</label>
      <div class="filter-options">
        <label v-for="label in availableLabels" :key="label.id" class="filter-option">
          <input 
            type="checkbox" 
            :value="label.id"
            v-model="selectedLabels"
            @change="emitFilters"
          />
          <span class="label-dot" :style="{ backgroundColor: label.color }" />
          <span>{{ label.name }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Label } from '@/database/entities/Label'

const props = defineProps<{
  availableLabels: Label[]
}>()

const emit = defineEmits<{
  (e: 'filter', filters: FilterState): void
}>()

interface FilterState {
  priorities: string[]
  due: string[]
  labels: number[]
}

const priorities = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' }
]

const dueOptions = [
  { value: 'today', label: '今天' },
  { value: 'week', label: '本周' },
  { value: 'overdue', label: '已过期' },
  { value: 'none', label: '未设置' }
]

const selectedPriorities = ref<string[]>([])
const selectedDue = ref<string[]>([])
const selectedLabels = ref<number[]>([])

function emitFilters() {
  emit('filter', {
    priorities: selectedPriorities.value,
    due: selectedDue.value,
    labels: selectedLabels.value
  })
}
</script>

<style scoped>
.filter-panel {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.filter-option:hover {
  color: var(--color-text);
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.priority-dot.low {
  background: var(--color-green);
}

.priority-dot.medium {
  background: var(--color-amber);
}

.priority-dot.high {
  background: var(--color-red);
}

.label-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
```

- [ ] **Step 5: Write ActiveFilters implementation**

```vue
<!-- src/components/board/ActiveFilters.vue -->
<template>
  <div class="active-filters" v-if="hasFilters">
    <span class="filters-label">当前筛选：</span>
    <div class="filter-tags">
      <span v-for="filter in activeFilterTags" :key="filter.key" class="filter-tag">
        {{ filter.label }}
        <button @click="removeFilter(filter)" class="remove-btn">×</button>
      </span>
    </div>
    <button @click="clearAll" class="clear-all-btn">清除所有</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface FilterState {
  priorities: string[]
  due: string[]
  labels: number[]
}

const props = defineProps<{
  filters: FilterState
  availableLabels: { id: number; name: string }[]
}>()

const emit = defineEmits<{
  (e: 'update:filters', filters: FilterState): void
}>()

const hasFilters = computed(() => {
  return props.filters.priorities.length > 0 ||
         props.filters.due.length > 0 ||
         props.filters.labels.length > 0
})

const activeFilterTags = computed(() => {
  const tags: { key: string; type: string; value: string | number; label: string }[] = []
  
  props.filters.priorities.forEach(p => {
    const labels: Record<string, string> = { low: '低优先级', medium: '中优先级', high: '高优先级' }
    tags.push({ key: `priority-${p}`, type: 'priorities', value: p, label: labels[p] })
  })
  
  props.filters.due.forEach(d => {
    const labels: Record<string, string> = { today: '今天', week: '本周', overdue: '已过期', none: '未设置' }
    tags.push({ key: `due-${d}`, type: 'due', value: d, label: labels[d] })
  })
  
  props.filters.labels.forEach(l => {
    const label = props.availableLabels.find(al => al.id === l)
    if (label) {
      tags.push({ key: `label-${l}`, type: 'labels', value: l, label: label.name })
    }
  })
  
  return tags
})

function removeFilter(filter: { type: string; value: string | number }) {
  const newFilters = { ...props.filters }
  if (filter.type === 'labels') {
    newFilters.labels = newFilters.labels.filter(l => l !== filter.value)
  } else {
    const arr = newFilters[filter.type as keyof FilterState] as (string | number)[]
    const index = arr.indexOf(filter.value as never)
    if (index > -1) arr.splice(index, 1)
  }
  emit('update:filters', newFilters)
}

function clearAll() {
  emit('update:filters', { priorities: [], due: [], labels: [] })
}
</script>

<style scoped>
.active-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-accent-soft);
  border-radius: var(--radius-md);
}

.filters-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.filter-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.remove-btn {
  display: grid;
  place-items: center;
  width: 14px;
  height: 14px;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}

.remove-btn:hover {
  color: var(--color-red);
}

.clear-all-btn {
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: var(--color-accent);
  font-size: 12px;
  cursor: pointer;
}

.clear-all-btn:hover {
  text-decoration: underline;
}
</style>
```

- [ ] **Step 6: Update BoardView to integrate search and filter**

```vue
<!-- src/views/BoardView.vue:22-29 -->
<!-- Add search and filter bar -->
<div class="board-toolbar" v-if="currentBoard">
  <SearchBar 
    :result-count="filteredCardsCount" 
    @search="handleSearch" 
  />
  <FilterPanel 
    :available-labels="availableLabels" 
    @filter="handleFilter" 
  />
  <ActiveFilters 
    v-if="hasActiveFilters"
    :filters="activeFilters" 
    :available-labels="availableLabels"
    @update:filters="updateFilters"
  />
</div>
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test tests/components/SearchBar.test.ts`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/components/board/SearchBar.vue src/components/board/FilterPanel.vue src/components/board/ActiveFilters.vue src/views/BoardView.vue tests/components/SearchBar.test.ts
git commit -m "feat: add search and filter components"
```

---

### Task 8: Create ViewSwitcher and View Components

**Covers:** [S6]

**Files:**
- Create: `src/components/board/ViewSwitcher.vue`
- Create: `src/components/board/ListView.vue`
- Create: `src/components/board/CalendarView.vue`
- Create: `src/components/board/TimelineView.vue`
- Modify: `src/views/BoardView.vue:22-29`
- Test: `tests/components/ViewSwitcher.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/components/ViewSwitcher.test.ts
import { mount } from '@vue/test-utils'
import ViewSwitcher from '@/components/board/ViewSwitcher.vue'

describe('ViewSwitcher', () => {
  it('renders view options', () => {
    const wrapper = mount(ViewSwitcher, {
      props: { currentView: 'board' }
    })
    expect(wrapper.findAll('.view-btn').length).toBe(4)
  })

  it('emits change event on click', async () => {
    const wrapper = mount(ViewSwitcher, {
      props: { currentView: 'board' }
    })
    await wrapper.findAll('.view-btn')[1].trigger('click')
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('change')![0]).toEqual(['list'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/components/ViewSwitcher.test.ts`
Expected: FAIL with "Cannot find module '@/components/board/ViewSwitcher'"

- [ ] **Step 3: Write ViewSwitcher implementation**

```vue
<!-- src/components/board/ViewSwitcher.vue -->
<template>
  <div class="view-switcher">
    <button 
      v-for="view in views" 
      :key="view.value"
      :class="['view-btn', { active: currentView === view.value }]"
      @click="emit('change', view.value)"
      :title="view.label"
    >
      <component :is="view.icon" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'

const props = defineProps<{
  currentView: string
}>()

const emit = defineEmits<{
  (e: 'change', view: string): void
}>()

const BoardIcon = {
  render() {
    return h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none' }, [
      h('rect', { x: 1, y: 1, width: 4, height: 14, rx: 1, stroke: 'currentColor', 'stroke-width': 1.5 }),
      h('rect', { x: 6, y: 1, width: 4, height: 10, rx: 1, stroke: 'currentColor', 'stroke-width': 1.5 }),
      h('rect', { x: 11, y: 1, width: 4, height: 12, rx: 1, stroke: 'currentColor', 'stroke-width': 1.5 })
    ])
  }
}

const ListIcon = {
  render() {
    return h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none' }, [
      h('path', { d: 'M2 4h12M2 8h12M2 12h8', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round' })
    ])
  }
}

const CalendarIcon = {
  render() {
    return h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none' }, [
      h('rect', { x: 1.5, y: 3, width: 13, height: 11.5, rx: 2, stroke: 'currentColor', 'stroke-width': 1.5 }),
      h('path', { d: 'M1.5 6.5h13', stroke: 'currentColor', 'stroke-width': 1.5 }),
      h('path', { d: 'M5 1v3M11 1v3', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round' })
    ])
  }
}

const TimelineIcon = {
  render() {
    return h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none' }, [
      h('path', { d: 'M8 1v14', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round' }),
      h('circle', { cx: 8, cy: 4, r: 2, fill: 'currentColor' }),
      h('circle', { cx: 8, cy: 12, r: 2, fill: 'currentColor' })
    ])
  }
}

const views = [
  { value: 'board', label: '看板视图', icon: BoardIcon },
  { value: 'list', label: '列表视图', icon: ListIcon },
  { value: 'calendar', label: '日历视图', icon: CalendarIcon },
  { value: 'timeline', label: '时间线视图', icon: TimelineIcon }
]
</script>

<style scoped>
.view-switcher {
  display: flex;
  gap: 2px;
  padding: 2px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.view-btn {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.view-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
}

.view-btn.active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}
</style>
```

- [ ] **Step 4: Write ListView implementation**

```vue
<!-- src/components/board/ListView.vue -->
<template>
  <div class="list-view">
    <table class="card-table">
      <thead>
        <tr>
          <th @click="sortBy('title')" class="sortable">
            标题
            <span v-if="sortField === 'title'" class="sort-indicator">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th>标签</th>
          <th @click="sortBy('priority')" class="sortable">
            优先级
            <span v-if="sortField === 'priority'" class="sort-indicator">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="sortBy('due_date')" class="sortable">
            截止日期
            <span v-if="sortField === 'due_date'" class="sort-indicator">
              {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th>所属列表</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="card in sortedCards" :key="card.id" class="card-row">
          <td class="card-title">{{ card.title }}</td>
          <td class="card-labels">
            <LabelBadge :labels="getCardLabels(card)" :max-display="2" />
          </td>
          <td class="card-priority">
            <span :class="['priority-badge', card.priority]">
              {{ priorityText(card.priority) }}
            </span>
          </td>
          <td class="card-due">
            <span v-if="card.due_date" :class="{ overdue: isOverdue(card.due_date) }">
              {{ formatDate(card.due_date) }}
            </span>
            <span v-else class="no-date">-</span>
          </td>
          <td class="card-list">{{ getListName(card.list_id) }}</td>
          <td class="card-actions">
            <button @click="$emit('edit', card)" class="btn-icon">编辑</button>
            <button @click="$emit('delete', card.id)" class="btn-icon danger">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Card } from '@/database/entities/Card'
import type { Label } from '@/database/entities/Label'
import type { List } from '@/database/entities/List'
import LabelBadge from './LabelBadge.vue'

const props = defineProps<{
  cards: Card[]
  lists: List[]
  cardLabels: Map<number, Label[]>
}>()

const emit = defineEmits<{
  (e: 'edit', card: Card): void
  (e: 'delete', id: number): void
}>()

const sortField = ref<string>('created_at')
const sortDirection = ref<'asc' | 'desc'>('desc')

const sortedCards = computed(() => {
  return [...props.cards].sort((a, b) => {
    let comparison = 0
    const aVal = a[sortField.value as keyof Card]
    const bVal = b[sortField.value as keyof Card]
    
    if (aVal === null) return 1
    if (bVal === null) return -1
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.localeCompare(bVal)
    } else if (aVal instanceof Date && bVal instanceof Date) {
      comparison = aVal.getTime() - bVal.getTime()
    } else {
      comparison = String(aVal).localeCompare(String(bVal))
    }
    
    return sortDirection.value === 'asc' ? comparison : -comparison
  })
})

function sortBy(field: string) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

function getCardLabels(card: Card): Label[] {
  return props.cardLabels.get(card.id) || []
}

function getListName(listId: number): string {
  const list = props.lists.find(l => l.id === listId)
  return list?.name || ''
}

function priorityText(priority: string): string {
  const map: Record<string, string> = { low: '低', medium: '中', high: '高' }
  return map[priority] || priority
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString()
}

function isOverdue(date: Date): boolean {
  return new Date(date) < new Date()
}
</script>

<style scoped>
.list-view {
  overflow-x: auto;
}

.card-table {
  width: 100%;
  border-collapse: collapse;
}

.card-table th,
.card-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.card-table th {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.card-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.card-table th.sortable:hover {
  color: var(--color-text-secondary);
}

.sort-indicator {
  margin-left: 4px;
  color: var(--color-accent);
}

.card-row:hover {
  background: var(--color-surface-hover);
}

.card-title {
  font-weight: 500;
  color: var(--color-text);
}

.priority-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
}

.priority-badge.low {
  background: var(--color-green-soft);
  color: var(--color-green);
}

.priority-badge.medium {
  background: var(--color-amber-soft);
  color: var(--color-amber);
}

.priority-badge.high {
  background: var(--color-red-soft);
  color: var(--color-red);
}

.overdue {
  color: var(--color-red);
}

.no-date {
  color: var(--color-text-tertiary);
}

.btn-icon {
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-size: 12px;
}

.btn-icon:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
}

.btn-icon.danger:hover {
  background: var(--color-red-soft);
  color: var(--color-red);
}
</style>
```

- [ ] **Step 5: Write CalendarView and TimelineView stubs**

```vue
<!-- src/components/board/CalendarView.vue -->
<template>
  <div class="calendar-view">
    <div class="calendar-header">
      <button @click="prevMonth" class="nav-btn">←</button>
      <h3>{{ currentMonthYear }}</h3>
      <button @click="nextMonth" class="nav-btn">→</button>
    </div>
    <div class="calendar-grid">
      <div v-for="day in calendarDays" :key="day.date" class="calendar-day" :class="{ today: day.isToday, 'other-month': day.isOtherMonth }">
        <span class="day-number">{{ day.day }}</span>
        <div class="day-cards">
          <div v-for="card in day.cards" :key="card.id" class="day-card" @click="$emit('edit', card)">
            {{ card.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Card } from '@/database/entities/Card'

const props = defineProps<{
  cards: Card[]
}>()

const emit = defineEmits<{
  (e: 'edit', card: Card): void
}>()

const currentDate = ref(new Date())

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
})

const calendarDays = computed(() => {
  // Simplified calendar logic
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const days = []
  const today = new Date()
  
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    const dayCards = props.cards.filter(card => {
      if (!card.due_date) return false
      const dueDate = new Date(card.due_date)
      return dueDate.toDateString() === date.toDateString()
    })
    
    days.push({
      date: date.toISOString(),
      day: d,
      isToday: date.toDateString() === today.toDateString(),
      isOtherMonth: false,
      cards: dayCards
    })
  }
  
  return days
})

function prevMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
}
</script>

<style scoped>
.calendar-view {
  padding: 16px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.nav-btn {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  border-radius: var(--radius-md);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--color-border);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.calendar-day {
  min-height: 100px;
  padding: 8px;
  background: var(--color-surface);
}

.calendar-day.today {
  background: var(--color-accent-soft);
}

.calendar-day.other-month {
  opacity: 0.5;
}

.day-number {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.day-cards {
  margin-top: 4px;
}

.day-card {
  font-size: 11px;
  padding: 2px 4px;
  background: var(--color-surface-elevated);
  border-radius: 3px;
  margin-bottom: 2px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.day-card:hover {
  background: var(--color-accent-soft);
}
</style>
```

```vue
<!-- src/components/board/TimelineView.vue -->
<template>
  <div class="timeline-view">
    <div class="timeline">
      <div v-for="card in sortedCards" :key="card.id" class="timeline-item" @click="$emit('edit', card)">
        <div class="timeline-marker" :class="card.priority" />
        <div class="timeline-content">
          <h4>{{ card.title }}</h4>
          <div class="timeline-meta">
            <span v-if="card.due_date" class="due-date">
              截止: {{ formatDate(card.due_date) }}
            </span>
            <span :class="['priority-badge', card.priority]">
              {{ priorityText(card.priority) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Card } from '@/database/entities/Card'

const props = defineProps<{
  cards: Card[]
}>()

const emit = defineEmits<{
  (e: 'edit', card: Card): void
}>()

const sortedCards = computed(() => {
  return [...props.cards].sort((a, b) => {
    const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity
    const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity
    return aDate - bDate
  })
})

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString()
}

function priorityText(priority: string): string {
  const map: Record<string, string> = { low: '低', medium: '中', high: '高' }
  return map[priority] || priority
}
</script>

<style scoped>
.timeline-view {
  padding: 24px;
}

.timeline {
  position: relative;
  padding-left: 24px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-border);
}

.timeline-item {
  position: relative;
  padding: 12px 0;
  cursor: pointer;
}

.timeline-item:hover {
  background: var(--color-surface-hover);
  border-radius: var(--radius-md);
}

.timeline-marker {
  position: absolute;
  left: -20px;
  top: 16px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
}

.timeline-marker.high {
  border-color: var(--color-red);
  background: var(--color-red);
}

.timeline-marker.medium {
  border-color: var(--color-amber);
  background: var(--color-amber);
}

.timeline-marker.low {
  border-color: var(--color-green);
  background: var(--color-green);
}

.timeline-content {
  padding-left: 16px;
}

.timeline-content h4 {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.timeline-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.priority-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 999px;
}

.priority-badge.low {
  background: var(--color-green-soft);
  color: var(--color-green);
}

.priority-badge.medium {
  background: var(--color-amber-soft);
  color: var(--color-amber);
}

.priority-badge.high {
  background: var(--color-red-soft);
  color: var(--color-red);
}
</style>
```

- [ ] **Step 6: Update BoardView to integrate view switcher**

```vue
<!-- src/views/BoardView.vue:22-29 -->
<!-- Add view switcher to board header -->
<div class="board-header">
  <div>
    <p class="eyebrow">任务看板</p>
    <h2>{{ currentBoard?.name || '请选择一个看板' }}</h2>
  </div>
  <div class="board-actions">
    <ViewSwitcher :current-view="currentView" @change="currentView = $event" />
    <button :disabled="!currentBoard" @click="showCreateList = true">
      <!-- existing button content -->
    </button>
  </div>
</div>
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test tests/components/ViewSwitcher.test.ts`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/components/board/ViewSwitcher.vue src/components/board/ListView.vue src/components/board/CalendarView.vue src/components/board/TimelineView.vue src/views/BoardView.vue tests/components/ViewSwitcher.test.ts
git commit -m "feat: add view switcher and view components"
```

---

### Task 9: Create SortSelector Component

**Covers:** [S7]

**Files:**
- Create: `src/components/board/SortSelector.vue`
- Modify: `src/views/BoardView.vue:22-29`
- Test: `tests/components/SortSelector.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/components/SortSelector.test.ts
import { mount } from '@vue/test-utils'
import SortSelector from '@/components/board/SortSelector.vue'

describe('SortSelector', () => {
  it('renders sort options', () => {
    const wrapper = mount(SortSelector, {
      props: { currentSort: 'created_at', direction: 'desc' }
    })
    expect(wrapper.find('select').exists()).toBe(true)
  })

  it('emits sort change on selection', async () => {
    const wrapper = mount(SortSelector, {
      props: { currentSort: 'created_at', direction: 'desc' }
    })
    await wrapper.find('select').setValue('priority')
    expect(wrapper.emitted('sort')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/components/SortSelector.test.ts`
Expected: FAIL with "Cannot find module '@/components/board/SortSelector'"

- [ ] **Step 3: Write SortSelector implementation**

```vue
<!-- src/components/board/SortSelector.vue -->
<template>
  <div class="sort-selector">
    <select v-model="selectedSort" @change="emitSort">
      <option value="created_at">创建时间</option>
      <option value="updated_at">更新时间</option>
      <option value="priority">优先级</option>
      <option value="due_date">截止日期</option>
      <option value="title">标题</option>
    </select>
    <button @click="toggleDirection" class="direction-btn" :title="direction === 'asc' ? '升序' : '降序'">
      {{ direction === 'asc' ? '↑' : '↓' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  currentSort: string
  direction: string
}>()

const emit = defineEmits<{
  (e: 'sort', field: string, direction: string): void
}>()

const selectedSort = ref(props.currentSort)

watch(() => props.currentSort, (newVal) => {
  selectedSort.value = newVal
})

function emitSort() {
  emit('sort', selectedSort.value, props.direction)
}

function toggleDirection() {
  const newDirection = props.direction === 'asc' ? 'desc' : 'asc'
  emit('sort', selectedSort.value, newDirection)
}
</script>

<style scoped>
.sort-selector {
  display: flex;
  gap: 4px;
}

.sort-selector select {
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 13px;
  cursor: pointer;
}

.direction-btn {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-md);
}

.direction-btn:hover {
  background: var(--color-surface-hover);
}
</style>
```

- [ ] **Step 4: Update BoardView to integrate sort selector**

```vue
<!-- src/views/BoardView.vue:22-29 -->
<!-- Add sort selector to board toolbar -->
<div class="board-toolbar" v-if="currentBoard">
  <SearchBar :result-count="filteredCardsCount" @search="handleSearch" />
  <FilterPanel :available-labels="availableLabels" @filter="handleFilter" />
  <SortSelector 
    :current-sort="sortField" 
    :direction="sortDirection" 
    @sort="handleSort" 
  />
  <!-- ... -->
</div>
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test tests/components/SortSelector.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/board/SortSelector.vue src/views/BoardView.vue tests/components/SortSelector.test.ts
git commit -m "feat: add SortSelector component"
```

---

### Task 10: Integration and Final Testing

**Covers:** [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10]

**Files:**
- Modify: `src/views/BoardView.vue` (complete integration)
- Modify: `src/components/board/BoardColumn.vue` (filtering support)
- Test: `tests/integration/kanban-enhancements.test.ts`

- [ ] **Step 1: Write integration test**

```typescript
// tests/integration/kanban-enhancements.test.ts
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BoardView from '@/views/BoardView.vue'

describe('Kanban Enhancements Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders all enhancement components', () => {
    const wrapper = mount(BoardView)
    expect(wrapper.find('.search-bar').exists()).toBe(true)
    expect(wrapper.find('.filter-panel').exists()).toBe(true)
    expect(wrapper.find('.view-switcher').exists()).toBe(true)
    expect(wrapper.find('.sort-selector').exists()).toBe(true)
  })

  it('switches between views', async () => {
    const wrapper = mount(BoardView)
    const viewBtns = wrapper.findAll('.view-btn')
    await viewBtns[1].trigger('click')
    expect(wrapper.find('.list-view').exists()).toBe(true)
  })

  it('filters cards correctly', async () => {
    const wrapper = mount(BoardView)
    // Test filtering logic
  })
})
```

- [ ] **Step 2: Run integration test**

Run: `npm test tests/integration/kanban-enhancements.test.ts`
Expected: PASS

- [ ] **Step 3: Update BoardView with complete integration**

```vue
<!-- src/views/BoardView.vue -->
<!-- Complete integration of all components -->
<template>
  <div class="board-view">
    <div class="board-header">
      <div>
        <p class="eyebrow">任务看板</p>
        <h2>{{ currentBoard?.name || '请选择一个看板' }}</h2>
      </div>
      <div class="board-actions">
        <ViewSwitcher :current-view="currentView" @change="currentView = $event" />
        <button :disabled="!currentBoard" @click="showCreateList = true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          <span>新建列表</span>
        </button>
      </div>
    </div>
    
    <div class="board-toolbar" v-if="currentBoard">
      <SearchBar :result-count="filteredCardsCount" @search="handleSearch" />
      <FilterPanel :available-labels="availableLabels" @filter="handleFilter" />
      <SortSelector 
        :current-sort="sortField" 
        :direction="sortDirection" 
        @sort="handleSort" 
      />
    </div>
    
    <ActiveFilters 
      v-if="hasActiveFilters"
      :filters="activeFilters" 
      :available-labels="availableLabels"
      @update:filters="updateFilters"
    />
    
    <!-- View content -->
    <div class="board-content" v-if="currentBoard">
      <BoardColumn 
        v-if="currentView === 'board'"
        v-for="list in filteredLists" 
        :key="list.id" 
        :list="list"
        :filtered-cards="getFilteredListCards(list.id)"
        @select-card="openCardDetail"
      />
      
      <ListView 
        v-else-if="currentView === 'list'"
        :cards="filteredCards"
        :lists="lists"
        :card-labels="cardLabels"
        @edit="openCardDetail"
        @delete="deleteCard"
      />
      
      <CalendarView 
        v-else-if="currentView === 'calendar'"
        :cards="filteredCards"
        @edit="openCardDetail"
      />
      
      <TimelineView 
        v-else-if="currentView === 'timeline'"
        :cards="filteredCards"
        @edit="openCardDetail"
      />
    </div>
    
    <!-- Empty state -->
    <div v-else class="empty-state">
      <!-- existing empty state -->
    </div>
    
    <!-- Modals -->
    <CreateListModal v-if="showCreateList && currentBoard" @close="showCreateList = false" :board-id="currentBoard.id" />
    <CardDetailModal v-if="selectedCard" :card="selectedCard" @close="selectedCard = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBoardStore } from '@/stores/board'
import { useListStore } from '@/stores/list'
import { useCardStore } from '@/stores/card'
import { useLabelStore } from '@/stores/label'
import { Card } from '@/database/entities/Card'
import BoardColumn from '@/components/board/BoardColumn.vue'
import CreateListModal from '@/components/board/CreateListModal.vue'
import CardDetailModal from '@/components/board/CardDetailModal.vue'
import SearchBar from '@/components/board/SearchBar.vue'
import FilterPanel from '@/components/board/FilterPanel.vue'
import ActiveFilters from '@/components/board/ActiveFilters.vue'
import ViewSwitcher from '@/components/board/ViewSwitcher.vue'
import SortSelector from '@/components/board/SortSelector.vue'
import ListView from '@/components/board/ListView.vue'
import CalendarView from '@/components/board/CalendarView.vue'
import TimelineView from '@/components/board/TimelineView.vue'

const boardStore = useBoardStore()
const listStore = useListStore()
const cardStore = useCardStore()
const labelStore = useLabelStore()

const showCreateList = ref(false)
const selectedCard = ref<Card | null>(null)
const currentView = ref('board')
const searchQuery = ref('')
const sortField = ref('created_at')
const sortDirection = ref<'asc' | 'desc'>('desc')
const activeFilters = ref({
  priorities: [] as string[],
  due: [] as string[],
  labels: [] as number[]
})

const currentBoard = computed(() => boardStore.currentBoard)
const lists = computed(() => listStore.lists)
const cards = computed(() => cardStore.cards)
const availableLabels = computed(() => labelStore.labels)

const filteredCards = computed(() => {
  let result = [...cards.value]
  
  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(card => 
      card.title.toLowerCase().includes(query) ||
      (card.description && card.description.toLowerCase().includes(query))
    )
  }
  
  // Priority filter
  if (activeFilters.value.priorities.length > 0) {
    result = result.filter(card => 
      activeFilters.value.priorities.includes(card.priority)
    )
  }
  
  // Due date filter
  if (activeFilters.value.due.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekEnd = new Date(today)
    weekEnd.setDate(weekEnd.getDate() + 7)
    
    result = result.filter(card => {
      if (activeFilters.value.due.includes('none') && !card.due_date) return true
      if (!card.due_date) return false
      
      const dueDate = new Date(card.due_date)
      
      if (activeFilters.value.due.includes('today')) {
        if (dueDate.toDateString() === today.toDateString()) return true
      }
      
      if (activeFilters.value.due.includes('week')) {
        if (dueDate >= today && dueDate <= weekEnd) return true
      }
      
      if (activeFilters.value.due.includes('overdue')) {
        if (dueDate < today) return true
      }
      
      return false
    })
  }
  
  // Label filter
  if (activeFilters.value.labels.length > 0) {
    result = result.filter(card => {
      const cardLabels = cardStore.getCardLabels(card.id)
      return activeFilters.value.labels.some(labelId => 
        cardLabels.some(label => label.id === labelId)
      )
    })
  }
  
  // Sort
  result.sort((a, b) => {
    let comparison = 0
    const aVal = a[sortField.value as keyof Card]
    const bVal = b[sortField.value as keyof Card]
    
    if (aVal === null) return 1
    if (bVal === null) return -1
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.localeCompare(bVal)
    } else if (aVal instanceof Date && bVal instanceof Date) {
      comparison = aVal.getTime() - bVal.getTime()
    } else {
      comparison = String(aVal).localeCompare(String(bVal))
    }
    
    return sortDirection.value === 'asc' ? comparison : -comparison
  })
  
  return result
})

const filteredCardsCount = computed(() => filteredCards.value.length)

const hasActiveFilters = computed(() => {
  return activeFilters.value.priorities.length > 0 ||
         activeFilters.value.due.length > 0 ||
         activeFilters.value.labels.length > 0
})

const filteredLists = computed(() => {
  if (!hasActiveFilters.value && !searchQuery.value) return lists.value
  
  return lists.value.filter(list => {
    const listCards = filteredCards.value.filter(card => card.list_id === list.id)
    return listCards.length > 0
  })
})

function getFilteredListCards(listId: number) {
  return filteredCards.value.filter(card => card.list_id === listId)
}

watch(currentBoard, async (board) => {
  if (board) {
    await listStore.fetchLists(board.id)
    await labelStore.fetchLabels(board.id)
  }
})

function handleSearch(query: string) {
  searchQuery.value = query
}

function handleFilter(filters: typeof activeFilters.value) {
  activeFilters.value = filters
}

function handleSort(field: string, direction: string) {
  sortField.value = field
  sortDirection.value = direction as 'asc' | 'desc'
}

function updateFilters(filters: typeof activeFilters.value) {
  activeFilters.value = filters
}

function openCardDetail(card: Card) {
  selectedCard.value = card
}

function deleteCard(id: number) {
  cardStore.deleteCard(id)
}
</script>
```

- [ ] **Step 4: Run all tests**

Run: `npm test`
Expected: All tests PASS

- [ ] **Step 5: Run lint and typecheck**

Run: `npm run lint && npm run typecheck`
Expected: No errors

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete kanban enhancements integration"
```

---

## Execution Handoff

**Preferred execution style:** Subagent (for independent tasks)

**Notes:**
- Tasks 1-3 are foundational and should be done first
- Tasks 4-9 can be parallelized after foundations are in place
- Task 10 integrates everything and should be done last
- Each task includes tests for verification
- Follow TDD approach: write test first, then implementation