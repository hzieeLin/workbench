<template>
  <div class="day-view">
    <div class="time-column">
      <div v-for="hour in hours" :key="hour" class="hour-label">{{ hour }}:00</div>
    </div>
    <div class="events-column">
      <div v-for="hour in hours" :key="hour" class="time-slot" @click="handleSlotClick(hour)">
        <div
          v-for="block in getBlocksForHour(hour)"
          :key="block.id"
          class="time-block"
          :style="{ height: getBlockHeight(block) + 'px' }"
        >
          {{ block.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TimeBlock } from '@/database/entities/TimeBlock'

const props = defineProps<{
  currentDate: Date
  timeBlocks: TimeBlock[]
}>()

const emit = defineEmits<{
  'create-block': [start: Date, end: Date]
}>()

const hours = Array.from({ length: 24 }, (_, i) => i)

function getBlocksForHour(hour: number): TimeBlock[] {
  return props.timeBlocks.filter((block) => {
    const blockStart = new Date(block.start_time)
    return (
      blockStart.toDateString() === props.currentDate.toDateString() &&
      blockStart.getHours() === hour
    )
  })
}

function getBlockHeight(block: TimeBlock): number {
  const start = new Date(block.start_time)
  const end = new Date(block.end_time)
  const minutes = (end.getTime() - start.getTime()) / 60000
  return Math.max(minutes, 30)
}

function handleSlotClick(hour: number) {
  const start = new Date(props.currentDate)
  start.setHours(hour, 0, 0, 0)
  const end = new Date(start)
  end.setHours(hour + 1, 0, 0, 0)
  emit('create-block', start, end)
}
</script>

<style scoped>
.day-view {
  display: flex;
  height: 100%;
}

.time-column {
  width: 60px;
  border-right: 1px solid #eee;
}

.hour-label {
  height: 60px;
  padding: 4px 8px;
  font-size: 12px;
  color: #666;
  text-align: right;
}

.events-column {
  flex: 1;
  position: relative;
}

.time-slot {
  height: 60px;
  border-bottom: 1px solid #eee;
  position: relative;
}

.time-slot:hover {
  background: #f5f5f5;
}

.time-block {
  position: absolute;
  left: 4px;
  right: 4px;
  background: #4a90d9;
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-size: 14px;
}
</style>
