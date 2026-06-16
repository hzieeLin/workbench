<template>
  <div class="calendar-view">
    <div class="calendar-toolbar">
      <div class="calendar-header">
        <button @click="navigatePrev" class="nav-btn">←</button>
        <h3>{{ headerTitle }}</h3>
        <button @click="navigateNext" class="nav-btn">→</button>
      </div>
      <div class="view-toggle">
        <button
          :class="['toggle-btn', { active: viewMode === 'month' }]"
          @click="viewMode = 'month'"
        >
          月
        </button>
        <button :class="['toggle-btn', { active: viewMode === 'week' }]" @click="viewMode = 'week'">
          周
        </button>
      </div>
    </div>

    <!-- Month View -->
    <div v-if="viewMode === 'month'" class="calendar-grid">
      <div
        v-for="day in monthDays"
        :key="day.dateStr"
        class="calendar-day"
        :class="{ today: day.isToday, 'other-month': day.isOtherMonth }"
      >
        <span class="day-number">{{ day.day }}</span>
        <div
          class="day-cards"
          @dragover.prevent="onDragOver($event, day.dateStr)"
          @drop.prevent="onDrop($event, day.dateStr)"
        >
          <div
            v-for="card in day.cards"
            :key="card.id"
            class="day-card"
            draggable="true"
            @dragstart="onDragStart($event, card)"
            @click="$emit('edit', card)"
          >
            {{ card.title }}
          </div>
        </div>
      </div>
    </div>

    <!-- Week View -->
    <div v-else class="week-view">
      <div class="week-header">
        <div
          v-for="day in weekDays"
          :key="day.dateStr"
          class="week-day-header"
          :class="{ today: day.isToday }"
        >
          <span class="week-day-name">{{ day.dayName }}</span>
          <span class="week-day-number">{{ day.day }}</span>
        </div>
      </div>
      <div class="week-body">
        <div v-for="day in weekDays" :key="'body-' + day.dateStr" class="week-day-col">
          <div
            class="week-day-cards"
            @dragover.prevent="onDragOver($event, day.dateStr)"
            @drop.prevent="onDrop($event, day.dateStr)"
          >
            <div
              v-for="card in day.cards"
              :key="card.id"
              class="week-card"
              draggable="true"
              @dragstart="onDragStart($event, card)"
              @click="$emit('edit', card)"
            >
              {{ card.title }}
            </div>
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
  (e: 'update', card: Card, newDate: string): void
}>()

const currentDate = ref(new Date())
const viewMode = ref<'month' | 'week'>('month')
const draggedCard = ref<Card | null>(null)

const headerTitle = computed(() => {
  if (viewMode.value === 'month') {
    return currentDate.value.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
  }
  const weekStart = getWeekStart(currentDate.value)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const startStr = weekStart.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  const endStr = weekEnd.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  return `${startStr} – ${endStr}`
})

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  return d
}

function getCardsForDate(dateStr: string): Card[] {
  return props.cards.filter((card) => {
    if (!card.due_date) return false
    return new Date(card.due_date).toISOString().slice(0, 10) === dateStr
  })
}

const monthDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const today = new Date()
  const days = []

  // fill leading empty days
  for (let i = 0; i < firstDay.getDay(); i++) {
    const d = new Date(year, month, 1 - firstDay.getDay() + i)
    days.push({
      dateStr: d.toISOString().slice(0, 10),
      day: d.getDate(),
      isToday: false,
      isOtherMonth: true,
      cards: getCardsForDate(d.toISOString().slice(0, 10)),
    })
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    const dateStr = date.toISOString().slice(0, 10)
    days.push({
      dateStr,
      day: d,
      isToday: date.toDateString() === today.toDateString(),
      isOtherMonth: false,
      cards: getCardsForDate(dateStr),
    })
  }

  return days
})

const weekDays = computed(() => {
  const start = getWeekStart(currentDate.value)
  const today = new Date()
  const dayNames = ['日', '一', '二', '三', '四', '五', '六']
  const days = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().slice(0, 10)
    days.push({
      dateStr,
      day: date.getDate(),
      dayName: dayNames[i],
      isToday: date.toDateString() === today.toDateString(),
      cards: getCardsForDate(dateStr),
    })
  }

  return days
})

function navigatePrev() {
  if (viewMode.value === 'month') {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
  } else {
    const d = new Date(currentDate.value)
    d.setDate(d.getDate() - 7)
    currentDate.value = d
  }
}

function navigateNext() {
  if (viewMode.value === 'month') {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
  } else {
    const d = new Date(currentDate.value)
    d.setDate(d.getDate() + 7)
    currentDate.value = d
  }
}

function onDragStart(event: DragEvent, card: Card) {
  draggedCard.value = card
  event.dataTransfer!.effectAllowed = 'move'
  event.dataTransfer!.setData('text/plain', String(card.id))
}

function onDragOver(event: DragEvent, _dateStr: string) {
  event.dataTransfer!.dropEffect = 'move'
}

function onDrop(_event: DragEvent, dateStr: string) {
  if (draggedCard.value) {
    emit('update', draggedCard.value, dateStr)
    draggedCard.value = null
  }
}
</script>

<style scoped>
.calendar-view {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
}

.calendar-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.calendar-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.calendar-header h3 {
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text);
  min-width: 200px;
  text-align: center;
}

.view-toggle {
  display: flex;
  gap: 4px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 2px;
}

.toggle-btn {
  padding: 6px 14px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-size: 13px;
}

.toggle-btn.active {
  background: var(--color-accent);
  color: white;
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
  cursor: grab;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.day-card:hover {
  background: var(--color-accent-soft);
}

.day-card:active {
  cursor: grabbing;
}

/* Week View */
.week-view {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.week-day-header {
  padding: 12px;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.week-day-header.today {
  color: var(--color-accent);
}

.week-day-name {
  display: block;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.week-day-number {
  display: block;
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text);
}

.week-day-header.today .week-day-number {
  color: var(--color-accent);
}

.week-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  min-height: 400px;
}

.week-day-col {
  border-right: 1px solid var(--color-border);
  background: var(--color-surface);
}

.week-day-col:last-child {
  border-right: none;
}

.week-day-cards {
  padding: 8px;
}

.week-card {
  font-size: 12px;
  padding: 4px 8px;
  background: var(--color-surface-elevated);
  border-radius: var(--radius-sm);
  margin-bottom: 4px;
  cursor: grab;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.week-card:hover {
  background: var(--color-accent-soft);
}

.week-card:active {
  cursor: grabbing;
}
</style>
