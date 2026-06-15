<template>
  <div class="calendar-view">
    <div class="calendar-header">
      <button @click="prevMonth" class="nav-btn">←</button>
      <h3>{{ currentMonthYear }}</h3>
      <button @click="nextMonth" class="nav-btn">→</button>
    </div>
    <div class="calendar-grid">
      <div v-for="day in calendarDays" :key="day.date" class="calendar-day" :class="{ today: day.isToday, 'other-month': day.isOtherMonth }">
        <span class="day-number">{{ day.day }}</span>
        <div class="day-cards">
          <div v-for="card in day.cards" :key="card.id" class="day-card" @click="$emit('edit', card)">
            {{ card.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Card } from '@/database/entities/Card'

const props = defineProps<{
  cards: Card[]
}>()

const emit = defineEmits<{
  (e: 'edit', card: Card): void
}>()

const currentDate = ref(new Date())

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const days = []
  const today = new Date()
  
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    const dayCards = props.cards.filter(card => {
      if (!card.due_date) return false
      const dueDate = new Date(card.due_date)
      return dueDate.toDateString() === date.toDateString()
    })
    
    days.push({
      date: date.toISOString(),
      day: d,
      isToday: date.toDateString() === today.toDateString(),
      isOtherMonth: false,
      cards: dayCards
    })
  }
  
  return days
})

function prevMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
}
</script>

<style scoped>
.calendar-view {
  padding: 16px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.calendar-header h3 {
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text);
}

.nav-btn {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  border-radius: var(--radius-md);
}

.nav-btn:hover {
  background: var(--color-surface-hover);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--color-border);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.calendar-day {
  min-height: 100px;
  padding: 8px;
  background: var(--color-surface);
}

.calendar-day.today {
  background: var(--color-accent-soft);
}

.calendar-day.other-month {
  opacity: 0.5;
}

.day-number {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.day-cards {
  margin-top: 4px;
}

.day-card {
  font-size: 11px;
  padding: 2px 4px;
  background: var(--color-surface-elevated);
  border-radius: 3px;
  margin-bottom: 2px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.day-card:hover {
  background: var(--color-accent-soft);
}
</style>
