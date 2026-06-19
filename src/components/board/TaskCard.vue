<template>
  <div class="task-card" :class="[`priority-${card.priority}`, { 'is-overdue': isOverdue }]">
    <button
      class="focus-toggle"
      data-testid="task-focus-toggle"
      type="button"
      :class="{ active: focused }"
      :disabled="focusSaving"
      :title="focused ? '移出今日聚焦' : '加入今日聚焦'"
      :aria-pressed="focused"
      @click.stop="emit('toggle-focus', card.id)"
    >
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.3" />
        <circle cx="7" cy="7" r="1.5" fill="currentColor" />
      </svg>
    </button>
    <div class="card-title">{{ card.title }}</div>
    <div class="card-meta">
      <span v-if="card.due_date" class="meta-item" :class="{ 'meta-overdue': isOverdue }">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.2" />
          <path
            d="M6 3.5V6.5L8 7.5"
            stroke="currentColor"
            stroke-width="1.2"
            stroke-linecap="round"
          />
        </svg>
        {{ formatDate(card.due_date) }}
      </span>
      <span
        v-if="totalTodos > 0"
        class="meta-item"
        :class="{ 'meta-done': completedTodos === totalTodos }"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <rect
            x="1"
            y="1"
            width="10"
            height="10"
            rx="2"
            stroke="currentColor"
            stroke-width="1.2"
          />
          <path
            d="M3.5 6L5.5 8L8.5 4"
            stroke="currentColor"
            stroke-width="1.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ completedTodos }}/{{ totalTodos }}
      </span>
      <span class="priority-dot" :class="`dot-${card.priority}`" :title="priorityText" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { Card } from '@/database/entities/Card'
import { apiClient } from '@/services/api'

const props = defineProps<{
  card: Card
  focused?: boolean
  focusSaving?: boolean
}>()

const emit = defineEmits<{
  'toggle-focus': [cardId: number]
}>()

const totalTodos = ref(0)
const completedTodos = ref(0)

async function fetchTodoCount() {
  try {
    const todos = await apiClient.get<{ completed: boolean }[]>(`/cards/${props.card.id}/todos`)
    totalTodos.value = todos.length
    completedTodos.value = todos.filter((t) => t.completed).length
  } catch {
    // ignore
  }
}

function handleTodosChanged(e: Event) {
  const { cardId } = (e as CustomEvent).detail
  if (cardId === props.card.id) fetchTodoCount()
}

onMounted(() => {
  fetchTodoCount()
  window.addEventListener('todos-changed', handleTodosChanged)
})

onUnmounted(() => {
  window.removeEventListener('todos-changed', handleTodosChanged)
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
</script>

<style scoped>
.task-card {
  position: relative;
  padding: 14px 16px 12px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  margin-bottom: 8px;
}

.task-card:last-child {
  margin-bottom: 0;
}

.focus-toggle {
  position: absolute;
  top: 8px;
  right: 8px;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  padding: 0;
  color: var(--color-text-tertiary);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  opacity: 0;
  cursor: pointer;
  transition: opacity 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.task-card:hover .focus-toggle,
.focus-toggle:focus-visible,
.focus-toggle.active {
  opacity: 1;
}

.focus-toggle:hover,
.focus-toggle.active {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.focus-toggle:disabled {
  opacity: 0.45;
  cursor: wait;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-hover);
}

/* Priority bar — the signature element */
.task-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: var(--color-border);
  transition:
    width 0.2s ease,
    background 0.2s ease;
}

.task-card:hover::before {
  width: 4px;
}

.task-card.priority-high::before {
  background: var(--color-red);
}

.task-card.priority-medium::before {
  background: #f59e0b;
}

.task-card.priority-low::before {
  background: #10b981;
}

.task-card.priority-high:hover::before {
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
}

.task-card.priority-medium:hover::before {
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
}

.task-card.priority-low:hover::before {
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 26px 0 8px;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  padding-left: 8px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--color-text-tertiary);
  line-height: 1;
}

.meta-item.meta-overdue {
  color: var(--color-red);
}

.meta-item.meta-done {
  color: #10b981;
}

.priority-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-left: auto;
  flex-shrink: 0;
}

.priority-dot.dot-high {
  background: var(--color-red);
}

.priority-dot.dot-medium {
  background: #f59e0b;
}

.priority-dot.dot-low {
  background: #10b981;
}
</style>
