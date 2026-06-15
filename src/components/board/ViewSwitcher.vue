<template>
  <div class="view-switcher">
    <button 
      v-for="view in views" 
      :key="view.value"
      :class="['view-btn', { active: currentView === view.value }]"
      @click="emit('change', view.value)"
      :title="view.label"
    >
      <component :is="view.icon" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'

const props = defineProps<{
  currentView: string
}>()

const emit = defineEmits<{
  (e: 'change', view: string): void
}>()

const BoardIcon = {
  render() {
    return h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none' }, [
      h('rect', { x: 1, y: 1, width: 4, height: 14, rx: 1, stroke: 'currentColor', 'stroke-width': 1.5 }),
      h('rect', { x: 6, y: 1, width: 4, height: 10, rx: 1, stroke: 'currentColor', 'stroke-width': 1.5 }),
      h('rect', { x: 11, y: 1, width: 4, height: 12, rx: 1, stroke: 'currentColor', 'stroke-width': 1.5 })
    ])
  }
}

const ListIcon = {
  render() {
    return h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none' }, [
      h('path', { d: 'M2 4h12M2 8h12M2 12h8', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round' })
    ])
  }
}

const CalendarIcon = {
  render() {
    return h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none' }, [
      h('rect', { x: 1.5, y: 3, width: 13, height: 11.5, rx: 2, stroke: 'currentColor', 'stroke-width': 1.5 }),
      h('path', { d: 'M1.5 6.5h13', stroke: 'currentColor', 'stroke-width': 1.5 }),
      h('path', { d: 'M5 1v3M11 1v3', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round' })
    ])
  }
}

const TimelineIcon = {
  render() {
    return h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none' }, [
      h('path', { d: 'M8 1v14', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round' }),
      h('circle', { cx: 8, cy: 4, r: 2, fill: 'currentColor' }),
      h('circle', { cx: 8, cy: 12, r: 2, fill: 'currentColor' })
    ])
  }
}

const views = [
  { value: 'board', label: '看板视图', icon: BoardIcon },
  { value: 'list', label: '列表视图', icon: ListIcon },
  { value: 'calendar', label: '日历视图', icon: CalendarIcon },
  { value: 'timeline', label: '时间线视图', icon: TimelineIcon }
]
</script>

<style scoped>
.view-switcher {
  display: flex;
  gap: 2px;
  padding: 2px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.view-btn {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.view-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
}

.view-btn.active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}
</style>
