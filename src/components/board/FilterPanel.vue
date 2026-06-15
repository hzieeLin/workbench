<template>
  <div class="filter-panel">
    <div class="filter-group">
      <label>优先级</label>
      <div class="filter-options">
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
      <label>截止日期</label>
      <div class="filter-options">
        <label v-for="due in dueOptions" :key="due.value" class="filter-option">
          <input 
            type="checkbox" 
            :value="due.value"
            v-model="selectedDue"
            @change="emitFilters"
          />
          <span>{{ due.label }}</span>
        </label>
      </div>
    </div>
    
    <div class="filter-group">
      <label>标签</label>
      <div class="filter-options">
        <label v-for="label in availableLabels" :key="label.id" class="filter-option">
          <input 
            type="checkbox" 
            :value="label.id"
            v-model="selectedLabels"
            @change="emitFilters"
          />
          <span class="label-dot" :style="{ backgroundColor: label.color }" />
          <span>{{ label.name }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Label } from '@/database/entities/Label'

const props = defineProps<{
  availableLabels: Label[]
}>()

const emit = defineEmits<{
  (e: 'filter', filters: FilterState): void
}>()

interface FilterState {
  priorities: string[]
  due: string[]
  labels: number[]
}

const priorities = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' }
]

const dueOptions = [
  { value: 'today', label: '今天' },
  { value: 'week', label: '本周' },
  { value: 'overdue', label: '已过期' },
  { value: 'none', label: '未设置' }
]

const selectedPriorities = ref<string[]>([])
const selectedDue = ref<string[]>([])
const selectedLabels = ref<number[]>([])

function emitFilters() {
  emit('filter', {
    priorities: selectedPriorities.value,
    due: selectedDue.value,
    labels: selectedLabels.value
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
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
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