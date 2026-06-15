<template>
  <div class="task-card" :class="[`priority-${card.priority}`, { 'is-overdue': isOverdue }]">
    <div class="card-inner">
      <div class="card-labels" v-if="cardLabels.length">
        <LabelBadge :labels="cardLabels" :max-display="2" />
      </div>
      <h4 class="card-title">{{ card.title }}</h4>
      <button class="card-delete-btn" @click.stop="handleDelete" title="删除卡片">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 2l8 8M10 2l-8 8"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </button>
      <div class="card-meta">
        <span v-if="card.due_date" class="due-date">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.2" />
            <path
              d="M6 3.5V6l2 1"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
            />
          </svg>
          <span>{{ formatDate(card.due_date) }}</span>
        </span>
        <span class="priority-badge" :class="card.priority">
          {{ priorityText }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card } from '@/database/entities/Card'
import { Label } from '@/database/entities/Label'
import { useCardStore } from '@/stores/card'
import LabelBadge from './LabelBadge.vue'

const props = defineProps<{
  card: Card
}>()

const cardLabels = computed((): Label[] => {
  return []
})

const priorityText = computed(() => {
  const map: Record<string, string> = { low: '低', medium: '中', high: '高' }
  return map[props.card.priority] || props.card.priority
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
  if (confirm('确定要删除这张卡片吗？')) {
    await cardStore.deleteCard(props.card.id)
  }
}
</script>

<style scoped>
.task-card {
  position: relative;
  margin-bottom: 10px;
  border-radius: var(--radius-md);
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
}

.task-card:last-child {
  margin-bottom: 0;
}

.task-card:hover {
  transform: translateY(-3px);
}

.card-inner {
  position: relative;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px;
  transition: all 0.25s ease;
  overflow: hidden;
}

.task-card:hover .card-inner {
  border-color: var(--color-border-hover);
  background: #2a2b2e;
}

.task-card.priority-high .card-inner {
  border-left: 3px solid var(--color-red);
}

.task-card.priority-medium .card-inner {
  border-left: 3px solid var(--color-amber);
}

.task-card.priority-low .card-inner {
  border-left: 3px solid var(--color-green);
}

.task-card.priority-high:hover {
  filter: drop-shadow(0 4px 12px rgba(255, 94, 94, 0.18));
}

.task-card.priority-medium:hover {
  filter: drop-shadow(0 4px 12px rgba(255, 192, 67, 0.12));
}

.task-card.priority-low:hover {
  filter: drop-shadow(0 4px 12px rgba(76, 223, 139, 0.1));
}

.card-labels {
  margin-bottom: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.45;
  color: var(--color-text);
  margin-bottom: 10px;
  padding-right: 20px;
}

.card-delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-tertiary);
  opacity: 0;
  transition: all 0.2s ease;
}

.task-card:hover .card-delete-btn {
  opacity: 1;
}

.card-delete-btn:hover {
  background: var(--color-red-soft);
  color: var(--color-red);
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.due-date {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.due-date svg {
  flex-shrink: 0;
}

.is-overdue .due-date {
  color: var(--color-red);
}

.priority-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  line-height: 1.4;
  flex-shrink: 0;
}

.priority-badge.high {
  background: var(--color-red-soft);
  color: var(--color-red);
}

.priority-badge.medium {
  background: var(--color-amber-soft);
  color: var(--color-amber);
}

.priority-badge.low {
  background: var(--color-green-soft);
  color: var(--color-green);
}
</style>
