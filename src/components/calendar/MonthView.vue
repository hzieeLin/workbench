<template>
  <div class="month-view">
    <div class="weekday-header">
      <div v-for="day in weekdays" :key="day">{{ day }}</div>
    </div>
    <div class="days-grid">
      <div
        v-for="day in calendarDays"
        :key="day.date.toISOString()"
        class="day-cell"
        :class="{ 'other-month': !day.isCurrentMonth, today: day.isToday }"
        @click="$emit('select-date', day.date)"
      >
        <span class="day-number">{{ day.date.getDate() }}</span>
        <div class="day-events">
          <div
            v-for="block in getBlocksForDay(day.date)"
            :key="block.id"
            class="event-block"
            :style="{ backgroundColor: getBlockColor(block) }"
          >
            {{ block.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TimeBlock } from '@/database/entities/TimeBlock'

const props = defineProps<{
  currentDate: Date
  timeBlocks: TimeBlock[]
}>()

defineEmits<{
  'select-date': [date: Date]
  'create-block': [start: Date, end: Date]
}>()

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const calendarDays = computed(() => {
  const year = props.currentDate.getFullYear()
  const month = props.currentDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const days = []
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  const today = new Date()

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    days.push({
      date,
      isCurrentMonth: date.getMonth() === month,
      isToday: date.toDateString() === today.toDateString(),
    })
  }

  return days
})

function getBlocksForDay(date: Date): TimeBlock[] {
  return props.timeBlocks.filter((block) => {
    const blockDate = new Date(block.start_time)
    return blockDate.toDateString() === date.toDateString()
  })
}

function getBlockColor(block: TimeBlock): string {
  if (block.card_id) return '#24786a'
  return '#8a978f'
}
</script>

<style scoped>
.month-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-border-soft);
  border-radius: 8px;
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
}

.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--color-surface-soft);
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 800;
}

.weekday-header div {
  padding: 12px;
  text-align: center;
}

.days-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(98px, 1fr);
}

.day-cell {
  border-top: 1px solid var(--color-border-soft);
  border-right: 1px solid var(--color-border-soft);
  padding: 8px;
  cursor: pointer;
  background: rgba(255, 253, 248, 0.86);
  transition: background 0.2s ease;
}

.day-cell:nth-child(7n) {
  border-right: none;
}

.day-cell:hover {
  background: var(--color-primary-soft);
}

.day-cell.other-month {
  background: #f4f2eb;
}

.day-cell.other-month .day-number {
  color: var(--color-faint);
}

.day-cell.today {
  background: #edf7f4;
}

.day-number {
  display: inline-grid;
  min-width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  color: var(--color-text);
}

.today .day-number {
  background: var(--color-primary);
  color: white;
}

.day-events {
  margin-top: 6px;
}

.event-block {
  font-size: 11px;
  padding: 3px 6px;
  margin-bottom: 3px;
  border-radius: 6px;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
