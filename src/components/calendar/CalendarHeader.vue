<template>
  <div class="calendar-header">
    <div class="header-left">
      <p>时间规划</p>
      <h2>{{ title }}</h2>
    </div>
    <div class="header-center">
      <button @click="$emit('prev')">‹</button>
      <button @click="$emit('today')">今天</button>
      <button @click="$emit('next')">›</button>
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
  border-bottom: 1px solid var(--color-border-soft);
}

.header-left p {
  margin-bottom: 4px;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 800;
}

.header-left h2 {
  color: var(--color-text);
  font-size: 24px;
}

.header-center {
  display: flex;
  gap: 8px;
}

.header-center button,
.view-toggle button {
  min-width: 38px;
  height: 36px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 8px;
  cursor: pointer;
  color: var(--color-muted);
  font-weight: 700;
}

.header-center button:hover,
.view-toggle button:hover {
  border-color: rgba(36, 120, 106, 0.25);
  color: var(--color-primary-strong);
}

.view-toggle {
  display: flex;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--color-border-soft);
  border-radius: 8px;
  background: rgba(255, 253, 248, 0.72);
}

.view-toggle button {
  border-color: transparent;
  background: transparent;
}

.view-toggle button.active {
  background: var(--color-primary);
  color: white;
}
</style>
