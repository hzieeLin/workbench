<template>
  <div class="week-view">
    <div class="time-column">
      <div v-for="hour in hours" :key="hour" class="hour-label">{{ hour }}:00</div>
    </div>
    <div class="days-column">
      <div v-for="day in weekDays" :key="day.toISOString()" class="day-column">
        <div
          v-for="hour in hours"
          :key="hour"
          class="time-slot"
          @click="handleSlotClick(day, hour)"
        >
          <div
            v-for="block in getBlocksForHour(day, hour)"
            :key="block.id"
            class="time-block"
            :style="{ height: getBlockHeight(block) + 'px' }"
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

const emit = defineEmits<{
  'create-block': [start: Date, end: Date]
}>()

const hours = Array.from({ length: 24 }, (_, i) => i)

const weekDays = computed(() => {
  const start = new Date(props.currentDate)
  start.setDate(start.getDate() - start.getDay())
  const days = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    days.push(day)
  }
  return days
})

function getBlocksForHour(day: Date, hour: number): TimeBlock[] {
  return props.timeBlocks.filter((block) => {
    const blockStart = new Date(block.start_time)
    return blockStart.toDateString() === day.toDateString() && blockStart.getHours() === hour
  })
}

function getBlockHeight(block: TimeBlock): number {
  const start = new Date(block.start_time)
  const end = new Date(block.end_time)
  const minutes = (end.getTime() - start.getTime()) / 60000
  return Math.max(minutes, 30)
}

function handleSlotClick(day: Date, hour: number) {
  const start = new Date(day)
  start.setHours(hour, 0, 0, 0)
  const end = new Date(start)
  end.setHours(hour + 1, 0, 0, 0)
  emit('create-block', start, end)
}
</script>

<style scoped>
.week-view {
  display: flex;
  height: 100%;
  overflow: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface-glass);
  backdrop-filter: var(--blur-sm);
}

.time-column {
  width: 60px;
  border-right: 1px solid var(--color-border);
  background: var(--color-surface);
  flex-shrink: 0;
}

.hour-label {
  height: 60px;
  padding: 4px 8px;
  font-size: 11px;
  color: var(--color-text-tertiary);
  text-align: right;
  font-weight: 500;
}

.days-column {
  flex: 1;
  display: flex;
}

.day-column {
  flex: 1;
  border-right: 1px solid var(--color-border);
  position: relative;
}

.day-column:last-child {
  border-right: none;
}

.time-slot {
  height: 60px;
  border-bottom: 1px solid var(--color-border);
  position: relative;
  transition: background 0.15s ease;
}

.time-slot:hover {
  background: var(--color-surface-hover);
}

.time-block {
  position: absolute;
  left: 3px;
  right: 3px;
  background: var(--color-accent);
  color: var(--color-text-inverse);
  padding: 4px 6px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 1;
}
</style>
