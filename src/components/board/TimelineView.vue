<template>
  <div class="timeline-view">
    <div class="timeline-toolbar">
      <div class="zoom-controls">
        <button :class="['zoom-btn', { active: zoom === 'day' }]" @click="zoom = 'day'">日</button>
        <button :class="['zoom-btn', { active: zoom === 'week' }]" @click="zoom = 'week'">周</button>
        <button :class="['zoom-btn', { active: zoom === 'month' }]" @click="zoom = 'month'">月</button>
      </div>
    </div>
    <div class="timeline-container">
      <div class="timeline-axis">
        <div v-for="tick in timeTicks" :key="tick.label" class="time-tick" :style="{ left: tick.position + '%' }">
          <div class="tick-line" />
          <span class="tick-label">{{ tick.label }}</span>
        </div>
        <div class="today-marker" :style="{ left: todayPosition + '%' }">
          <div class="today-line" />
          <span class="today-label">今天</span>
        </div>
      </div>
      <div class="timeline-bars">
        <div v-for="card in sortedCards" :key="card.id" class="timeline-row" @click="$emit('edit', card)">
          <div class="timeline-label">{{ card.title }}</div>
          <div class="timeline-bar-track">
            <div
              class="timeline-bar"
              :class="card.priority"
              :style="getBarStyle(card)"
            >
              <span v-if="getBarWidth(card) > 10" class="bar-text">{{ card.title }}</span>
            </div>
            <span v-if="card.due_date" class="bar-end-marker" :style="{ left: getDatePercent(new Date(card.due_date)) + '%' }" />
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

const zoom = ref<'day' | 'week' | 'month'>('week')


const sortedCards = computed(() => {
  return [...props.cards]
    .filter(c => c.created_at)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
})

const timeRange = computed(() => {
  if (sortedCards.value.length === 0) {
    const now = new Date()
    const monthAgo = new Date(now)
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    const monthAhead = new Date(now)
    monthAhead.setMonth(monthAhead.getMonth() + 1)
    return { start: monthAgo, end: monthAhead }
  }

  const allDates: number[] = []
  sortedCards.value.forEach(card => {
    allDates.push(new Date(card.created_at).getTime())
    if (card.due_date) allDates.push(new Date(card.due_date).getTime())
  })

  const minTime = Math.min(...allDates)
  const maxTime = Math.max(...allDates)
  const padding = (maxTime - minTime) * 0.1 || 86400000

  return {
    start: new Date(minTime - padding),
    end: new Date(maxTime + padding)
  }
})

function getDatePercent(date: Date): number {
  const range = timeRange.value.end.getTime() - timeRange.value.start.getTime()
  if (range === 0) return 50
  return ((date.getTime() - timeRange.value.start.getTime()) / range) * 100
}

function getCreatedPercent(card: Card): number {
  return getDatePercent(new Date(card.created_at))
}

function getDuePercent(card: Card): number {
  if (!card.due_date) return 100
  return getDatePercent(new Date(card.due_date))
}

function getBarWidth(card: Card): number {
  return getDuePercent(card) - getCreatedPercent(card)
}

function getBarStyle(card: Card) {
  return {
    left: getCreatedPercent(card) + '%',
    width: Math.max(getBarWidth(card), 2) + '%'
  }
}

const todayPosition = computed(() => {
  return getDatePercent(new Date())
})

const timeTicks = computed(() => {
  const { start, end } = timeRange.value
  const range = end.getTime() - start.getTime()
  const ticks: { label: string; position: number }[] = []

  if (zoom.value === 'day') {
    const days = Math.ceil(range / 86400000)
    const step = Math.max(1, Math.floor(days / 12))
    for (let i = 0; i <= days; i += step) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      ticks.push({
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        position: (i / days) * 100
      })
    }
  } else if (zoom.value === 'week') {
    const weeks = Math.ceil(range / 604800000)
    for (let i = 0; i <= weeks; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i * 7)
      ticks.push({
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        position: (i / weeks) * 100
      })
    }
  } else {
    const months = Math.ceil(range / 2592000000)
    for (let i = 0; i <= months; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1)
      ticks.push({
        label: d.toLocaleDateString('zh-CN', { month: 'short' }),
        position: (i / months) * 100
      })
    }
  }

  return ticks
})
</script>

<style scoped>
.timeline-view {
  padding: 24px;
}

.timeline-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.zoom-controls {
  display: flex;
  gap: 4px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 2px;
}

.zoom-btn {
  padding: 6px 14px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-size: 13px;
}

.zoom-btn.active {
  background: var(--color-accent);
  color: white;
}

.timeline-container {
  position: relative;
  overflow-x: auto;
}

.timeline-axis {
  position: relative;
  height: 40px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 8px;
}

.time-tick {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
}

.tick-line {
  width: 1px;
  height: 12px;
  background: var(--color-border);
}

.tick-label {
  font-size: 11px;
  color: var(--color-text-tertiary);
  white-space: nowrap;
}

.today-marker {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  z-index: 1;
}

.today-line {
  width: 2px;
  height: 100%;
  background: var(--color-red);
}

.today-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-red);
  white-space: nowrap;
  display: block;
  text-align: center;
}

.timeline-bars {
  position: relative;
}

.timeline-row {
  display: flex;
  align-items: center;
  padding: 6px 0;
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.timeline-row:hover {
  background: var(--color-surface-hover);
}

.timeline-label {
  width: 160px;
  min-width: 160px;
  font-size: 12px;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 12px;
}

.timeline-bar-track {
  flex: 1;
  position: relative;
  height: 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.timeline-bar {
  position: absolute;
  top: 2px;
  bottom: 2px;
  border-radius: 3px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  overflow: hidden;
}

.timeline-bar.high {
  background: var(--color-red-soft);
  border-color: var(--color-red);
}

.timeline-bar.medium {
  background: var(--color-amber-soft);
  border-color: var(--color-amber);
}

.timeline-bar.low {
  background: var(--color-green-soft);
  border-color: var(--color-green);
}

.bar-text {
  font-size: 11px;
  color: var(--color-text);
  padding: 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-end-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent);
  border: 2px solid var(--color-surface);
}
</style>
