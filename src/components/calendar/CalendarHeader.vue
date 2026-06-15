<template>
  <div class="calendar-header">
    <div class="header-left">
      <p class="eyebrow">时间规划</p>
      <h2>{{ title }}</h2>
    </div>
    <div class="header-center">
      <button @click="$emit('prev')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M10 3l-5 5 5 5"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
          />
        </svg>
      </button>
      <button class="btn-today" @click="$emit('today')">今天</button>
      <button @click="$emit('next')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
      </button>
    </div>
    <div class="header-right">
      <div class="view-toggle">
        <button :class="{ active: viewMode === 'month' }" @click="$emit('change-view', 'month')">
          月
        </button>
        <button :class="{ active: viewMode === 'week' }" @click="$emit('change-view', 'week')">
          周
        </button>
        <button :class="{ active: viewMode === 'day' }" @click="$emit('change-view', 'day')">
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
</script>

<style scoped>
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 0 0 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.header-left .eyebrow {
  margin-bottom: 4px;
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.header-left h2 {
  font-family: var(--font-display);
  color: var(--color-text);
  font-size: 24px;
  font-weight: 500;
}

.header-center {
  display: flex;
  gap: 6px;
  align-items: center;
}

.header-center button {
  display: grid;
  place-items: center;
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-tertiary);
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
}

.header-center button:hover {
  border-color: var(--color-border-hover);
  color: var(--color-text-secondary);
  background: var(--color-surface-hover);
}

.btn-today {
  min-width: 56px !important;
}

.view-toggle {
  display: flex;
  gap: 3px;
  padding: 3px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.view-toggle button {
  min-width: 38px;
  height: 30px;
  padding: 0 12px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text-tertiary);
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
}

.view-toggle button.active {
  background: var(--color-accent);
  color: var(--color-text-inverse);
}

.view-toggle button:not(.active):hover {
  color: var(--color-text-secondary);
  background: var(--color-surface-hover);
}
</style>
