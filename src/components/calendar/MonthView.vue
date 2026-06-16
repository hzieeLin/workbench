<template>
  <a-calendar :value="currentDate" @select="handleSelect" class="month-view">
    <template #dateCell="{ current }">
      <div class="day-events">
        <div
          v-for="block in getBlocksForDay(current.toDate())"
          :key="block.id"
          class="event-block"
          :style="{ backgroundColor: getBlockColor(block) }"
        >
          {{ block.title }}
        </div>
      </div>
    </template>
  </a-calendar>
</template>

<script setup lang="ts">
import { TimeBlock } from '@/database/entities/TimeBlock'
import dayjs from 'dayjs'

const props = defineProps<{
  currentDate: Date
  timeBlocks: TimeBlock[]
}>()

const emit = defineEmits<{
  'select-date': [date: Date]
  'create-block': [start: Date, end: Date]
}>()

function handleSelect(date: dayjs.Dayjs) {
  emit('select-date', date.toDate())
}

function getBlocksForDay(date: Date): TimeBlock[] {
  return props.timeBlocks.filter((block) => {
    const blockDate = new Date(block.start_time)
    return blockDate.toDateString() === date.toDateString()
  })
}

function getBlockColor(block: TimeBlock): string {
  if (block.card_id) return 'var(--ant-color-primary, #FF6B4A)'
  return 'var(--ant-color-text-secondary, rgba(0,0,0,0.45))'
}
</script>

<style scoped>
.month-view {
  height: 100%;
}

.day-events {
  margin-top: 4px;
}

.event-block {
  font-size: 11px;
  padding: 2px 4px;
  margin-bottom: 2px;
  border-radius: 4px;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}
</style>
