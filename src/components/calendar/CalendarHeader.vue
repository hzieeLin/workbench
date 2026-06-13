<template>
  <div class="calendar-header">
    <div class="header-left">
      <h2>{{ title }}</h2>
    </div>
    <div class="header-center">
      <button @click="$emit('prev')">‹</button>
      <button @click="$emit('today')">今天</button>
      <button @click="$emit('next')">›</button>
    </div>
    <div class="header-right">
      <div class="view-toggle">
        <button
          :class="{ active: viewMode === 'month' }"
          @click="$emit('change-view', 'month')"
        >
          月
        </button>
        <button
          :class="{ active: viewMode === 'week' }"
          @click="$emit('change-view', 'week')"
        >
          周
        </button>
        <button
          :class="{ active: viewMode === 'day' }"
          @click="$emit('change-view', 'day')"
        >
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
  } else if (props.viewMode === 'week') {
    const start = new Date(date)
    start.setDate(date.getDate() - date.getDay())
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`
  } else {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }
})
</script>

<style scoped>
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.header-center {
  display: flex;
  gap: 8px;
}

.header-center button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.header-center button:hover {
  background: #f5f5f5;
}

.view-toggle {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.view-toggle button {
  padding: 8px 16px;
  border: none;
  background: white;
  cursor: pointer;
}

.view-toggle button.active {
  background: #4a90d9;
  color: white;
}
</style>
