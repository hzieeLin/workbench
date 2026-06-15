<template>
  <div class="list-view">
    <table class="card-table">
      <thead>
        <tr>
          <th class="checkbox-col">
            <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" />
          </th>
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
        <tr
          v-for="card in paginatedCards"
          :key="card.id"
          class="card-row"
          :class="{ selected: selectedIds.has(card.id) }"
          @click="toggleSelect(card.id)"
        >
          <td class="checkbox-col" @click.stop>
            <input type="checkbox" :checked="selectedIds.has(card.id)" @change="toggleSelect(card.id)" />
          </td>
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
            <button @click.stop="$emit('edit', card)" class="btn-icon">编辑</button>
            <button @click.stop="$emit('delete', card.id)" class="btn-icon danger">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="pagination" v-if="totalPages > 1">
      <button @click="currentPage--" :disabled="currentPage === 1" class="page-btn">
        上一页
      </button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button @click="currentPage++" :disabled="currentPage === totalPages" class="page-btn">
        下一页
      </button>
    </div>
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
  (e: 'select', ids: number[]): void
}>()

const sortField = ref<string>('created_at')
const sortDirection = ref<'asc' | 'desc'>('desc')
const currentPage = ref(1)
const pageSize = 20
const selectedIds = ref<Set<number>>(new Set())

const allSelected = computed(() => {
  return paginatedCards.value.length > 0 && paginatedCards.value.every(c => selectedIds.value.has(c.id))
})

const sortedCards = computed(() => {
  return [...props.cards].sort((a, b) => {
    let comparison = 0
    const aVal = a[sortField.value as keyof Card]
    const bVal = b[sortField.value as keyof Card]
    
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1
    
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

const totalPages = computed(() => Math.ceil(sortedCards.value.length / pageSize))

const paginatedCards = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return sortedCards.value.slice(start, start + pageSize)
})

function sortBy(field: string) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

function toggleSelect(id: number) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
  selectedIds.value = new Set(selectedIds.value)
  emit('select', Array.from(selectedIds.value))
}

function toggleSelectAll() {
  if (allSelected.value) {
    paginatedCards.value.forEach(c => selectedIds.value.delete(c.id))
  } else {
    paginatedCards.value.forEach(c => selectedIds.value.add(c.id))
  }
  selectedIds.value = new Set(selectedIds.value)
  emit('select', Array.from(selectedIds.value))
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

.checkbox-col {
  width: 40px;
  text-align: center;
}

.checkbox-col input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: var(--color-accent);
}

.card-row {
  cursor: pointer;
  transition: background 0.15s;
}

.card-row:hover {
  background: var(--color-surface-hover);
}

.card-row.selected {
  background: var(--color-accent-soft);
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px;
}

.page-btn {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-size: 12px;
}

.page-btn:hover:not(:disabled) {
  background: var(--color-surface-hover);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 12px;
  color: var(--color-text-tertiary);
}
</style>
