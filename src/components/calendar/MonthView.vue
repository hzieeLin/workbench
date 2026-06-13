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
        :class="{ 'other-month': !day.isCurrentMonth, 'today': day.isToday }"
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
      isToday: date.toDateString() === today.toDateString()
    })
  }

  return days
})

function getBlocksForDay(date: Date): TimeBlock[] {
  return props.timeBlocks.filter(block => {
    const blockDate = new Date(block.start_time)
    return blockDate.toDateString() === date.toDateString()
  })
}

function getBlockColor(block: TimeBlock): string {
  if (block.card_id) return '#4a90d9'
  return '#999'
}
</script>

<style scoped>
.month-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f5f5f5;
  font-weight: 600;
}

.weekday-header div {
  padding: 12px;
  text-align: center;
}

.days-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(100px, 1fr);
}

.day-cell {
  border: 1px solid #eee;
  padding: 4px;
  cursor: pointer;
}

.day-cell:hover {
  background: #f9f9f9;
}

.day-cell.other-month {
  background: #fafafa;
}

.day-cell.other-month .day-number {
  color: #ccc;
}

.day-cell.today {
  background: #e3f2fd;
}

.day-number {
  font-size: 12px;
  font-weight: 500;
}

.day-events {
  margin-top: 4px;
}

.event-block {
  font-size: 11px;
  padding: 2px 4px;
  margin-bottom: 2px;
  border-radius: 3px;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
