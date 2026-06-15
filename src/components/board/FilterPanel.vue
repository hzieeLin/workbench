<template>
  <div class="filter-panel">
    <button class="clear-all-btn" v-if="hasAnySelection" @click="clearAll">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M2 2l8 8M10 2l-8 8"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
      清除全部
    </button>
    <div class="filter-group">
      <button class="filter-group-header" @click="toggleGroup('priority')">
        <label>优先级</label>
        <svg
          class="expand-icon"
          :class="{ expanded: expandedGroups.priority }"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M4 3l4 3-4 3"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <div class="filter-options" v-show="expandedGroups.priority">
        <label v-for="priority in priorities" :key="priority.value" class="filter-option">
          <input
            type="checkbox"
            :value="priority.value"
            v-model="selectedPriorities"
            @change="emitFilters"
          />
          <span class="priority-dot" :class="priority.value" />
          <span>{{ priority.label }}</span>
        </label>
      </div>
    </div>

    <div class="filter-group">
      <button class="filter-group-header" @click="toggleGroup('due')">
        <label>截止日期</label>
        <svg
          class="expand-icon"
          :class="{ expanded: expandedGroups.due }"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M4 3l4 3-4 3"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <div class="filter-options" v-show="expandedGroups.due">
        <label v-for="due in dueOptions" :key="due.value" class="filter-option">
          <input type="checkbox" :value="due.value" v-model="selectedDue" @change="emitFilters" />
          <span>{{ due.label }}</span>
        </label>
      </div>
    </div>

    <div class="filter-group">
      <button class="filter-group-header" @click="toggleGroup('labels')">
        <label>标签</label>
        <svg
          class="expand-icon"
          :class="{ expanded: expandedGroups.labels }"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M4 3l4 3-4 3"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <div class="filter-options" v-show="expandedGroups.labels">
        <label v-for="label in availableLabels" :key="label.id" class="filter-option">
          <input type="checkbox" :value="label.id" v-model="selectedLabels" @change="emitFilters" />
          <span class="label-dot" :style="{ backgroundColor: label.color }" />
          <span>{{ label.name }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Label } from '@/database/entities/Label'

const props = defineProps<{
  availableLabels: Label[]
}>()

const emit = defineEmits<{
  (e: 'filter', filters: FilterState): void
  (e: 'clear-all'): void
}>()

interface FilterState {
  priorities: string[]
  due: string[]
  labels: number[]
}

const priorities = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
]

const dueOptions = [
  { value: 'today', label: '今天' },
  { value: 'week', label: '本周' },
  { value: 'overdue', label: '已过期' },
  { value: 'none', label: '未设置' },
]

const selectedPriorities = ref<string[]>([])
const selectedDue = ref<string[]>([])
const selectedLabels = ref<number[]>([])

const expandedGroups = ref<Record<string, boolean>>({
  priority: true,
  due: true,
  labels: true,
})

const hasAnySelection = computed(() => {
  return (
    selectedPriorities.value.length > 0 ||
    selectedDue.value.length > 0 ||
    selectedLabels.value.length > 0
  )
})

function toggleGroup(group: string) {
  expandedGroups.value[group] = !expandedGroups.value[group]
}

function clearAll() {
  selectedPriorities.value = []
  selectedDue.value = []
  selectedLabels.value = []
  emitFilters()
  emit('clear-all')
}

function emitFilters() {
  emit('filter', {
    priorities: selectedPriorities.value,
    due: selectedDue.value,
    labels: selectedLabels.value,
  })
}
</script>

<style scoped>
.filter-panel {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  align-items: flex-start;
}

.clear-all-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-tertiary);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
  margin-left: auto;
}

.clear-all-btn:hover {
  background: var(--color-red-soft);
  color: var(--color-red);
  border-color: var(--color-red);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group-header {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--color-text-tertiary);
  width: 100%;
}

.filter-group-header label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  cursor: pointer;
  user-select: none;
}

.filter-group-header:hover label {
  color: var(--color-text-secondary);
}

.expand-icon {
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.filter-option:hover {
  color: var(--color-text);
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.priority-dot.low {
  background: var(--color-green);
}

.priority-dot.medium {
  background: var(--color-amber);
}

.priority-dot.high {
  background: var(--color-red);
}

.label-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
