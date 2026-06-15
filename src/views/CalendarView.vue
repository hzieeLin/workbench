<template>
  <div class="calendar-view">
    <CalendarHeader
      :current-date="currentDate"
      :view-mode="viewMode"
      @prev="prevPeriod"
      @next="nextPeriod"
      @today="goToToday"
      @change-view="viewMode = $event"
    />
    <div class="calendar-content">
      <MonthView
        v-if="viewMode === 'month'"
        :current-date="currentDate"
        :time-blocks="timeBlocks"
        @select-date="selectDate"
        @create-block="openCreateBlock"
      />
      <WeekView
        v-else-if="viewMode === 'week'"
        :current-date="currentDate"
        :time-blocks="timeBlocks"
        @select-date="selectDate"
        @create-block="openCreateBlock"
      />
      <DayView
        v-else
        :current-date="currentDate"
        :time-blocks="timeBlocks"
        @create-block="openCreateBlock"
      />
    </div>

    <TimeBlockModal
      v-if="showCreateBlock"
      :start-time="selectedStartTime"
      :end-time="selectedEndTime"
      @close="showCreateBlock = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTimeBlockStore } from '@/stores/timeBlock'
import CalendarHeader from '@/components/calendar/CalendarHeader.vue'
import MonthView from '@/components/calendar/MonthView.vue'
import WeekView from '@/components/calendar/WeekView.vue'
import DayView from '@/components/calendar/DayView.vue'
import TimeBlockModal from '@/components/calendar/TimeBlockModal.vue'

const timeBlockStore = useTimeBlockStore()

const currentDate = ref(new Date())
const viewMode = ref<'month' | 'week' | 'day'>('month')
const showCreateBlock = ref(false)
const selectedStartTime = ref<Date>(new Date())
const selectedEndTime = ref<Date>(new Date())

const timeBlocks = computed(() => timeBlockStore.timeBlocks)

onMounted(async () => {
  await timeBlockStore.fetchTimeBlocks()
})

function prevPeriod() {
  const date = new Date(currentDate.value)
  if (viewMode.value === 'month') {
    date.setMonth(date.getMonth() - 1)
  } else if (viewMode.value === 'week') {
    date.setDate(date.getDate() - 7)
  } else {
    date.setDate(date.getDate() - 1)
  }
  currentDate.value = date
}

function nextPeriod() {
  const date = new Date(currentDate.value)
  if (viewMode.value === 'month') {
    date.setMonth(date.getMonth() + 1)
  } else if (viewMode.value === 'week') {
    date.setDate(date.getDate() + 7)
  } else {
    date.setDate(date.getDate() + 1)
  }
  currentDate.value = date
}

function goToToday() {
  currentDate.value = new Date()
}

function selectDate(date: Date) {
  currentDate.value = date
  viewMode.value = 'day'
}

function openCreateBlock(start: Date, end: Date) {
  selectedStartTime.value = start
  selectedEndTime.value = end
  showCreateBlock.value = true
}
</script>

<style scoped>
.calendar-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.calendar-content {
  flex: 1;
  overflow: auto;
}
</style>
