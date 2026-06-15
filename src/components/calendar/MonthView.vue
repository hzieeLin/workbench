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
  if (block.card_id) return 'var(--color-accent)'
  return 'var(--color-text-tertiary)'
}
</script>

<style scoped>
.month-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface-glass);
  backdrop-filter: var(--blur-sm);
}

.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--color-surface);
  color: var(--color-text-tertiary);
  font-size: 12px;
  font-weight: 600;
  border-bottom: 1px solid var(--color-border);
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
  border-bottom: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  padding: 8px;
  cursor: pointer;
  background: rgba(20, 21, 23, 0.3);
  transition: background 0.2s ease;
}

.day-cell:nth-child(7n) {
  border-right: none;
}

.day-cell:hover {
  background: var(--color-surface-hover);
}

.day-cell.other-month {
  background: rgba(20, 21, 23, 0.15);
}

.day-cell.other-month .day-number {
  color: var(--color-text-tertiary);
  opacity: 0.4;
}

.day-cell.today {
  background: rgba(255, 107, 74, 0.06);
}

.day-number {
  display: inline-grid;
  min-width: 26px;
  height: 26px;
  place-items: center;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.today .day-number {
  background: var(--color-accent);
  color: var(--color-text-inverse);
  font-weight: 700;
}

.day-events {
  margin-top: 6px;
}

.event-block {
  font-size: 11px;
  padding: 3px 6px;
  margin-bottom: 3px;
  border-radius: var(--radius-sm);
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}
</style>
