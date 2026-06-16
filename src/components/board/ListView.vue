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
import { ref } from 'vue'
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
