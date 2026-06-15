<template>
  <div class="task-card" :class="{ 'high-priority': card.priority === 'high' }">
    <div class="card-labels">
      <LabelBadge v-if="cardLabels.length" :labels="cardLabels" />
    </div>
    <h4 class="card-title">{{ card.title }}</h4>
    <div class="card-meta">
      <span v-if="card.due_date" class="due-date">日程 {{ formatDate(card.due_date) }}</span>
      <span class="priority" :class="card.priority">
        {{ priorityText }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card } from '@/database/entities/Card'
import { Label } from '@/database/entities/Label'
import LabelBadge from './LabelBadge.vue'

const props = defineProps<{
  card: Card
}>()

const cardLabels = computed((): Label[] => {
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
  position: relative;
  background: var(--color-surface);
  border: 1px solid var(--color-border-soft);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  box-shadow: 0 1px 0 rgba(33, 50, 60, 0.04);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease;
}

.task-card:hover {
  transform: translateY(-1px);
  border-color: rgba(36, 120, 106, 0.28);
  box-shadow: var(--shadow-card);
}

.task-card.high-priority {
  border-left: 4px solid var(--color-red);
}

.card-labels {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.card-title {
  font-size: 14px;
  margin-bottom: 10px;
  line-height: 1.45;
  color: var(--color-text);
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-muted);
}

.due-date {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.priority {
  min-width: 28px;
  padding: 3px 8px;
  border-radius: 999px;
  text-align: center;
  font-weight: 800;
}

.priority.low {
  background: var(--color-green-soft);
  color: var(--color-green);
}

.priority.medium {
  background: var(--color-amber-soft);
  color: var(--color-amber);
}

.priority.high {
  background: var(--color-red-soft);
  color: var(--color-red);
}
</style>
