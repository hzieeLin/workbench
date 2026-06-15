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
  color: var(--color-text);
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
