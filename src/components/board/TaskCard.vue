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
