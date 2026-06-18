<template>
  <div class="filter-panel">
    <a-button v-if="hasAnySelection" size="small" @click="clearAll"> 清除全部 </a-button>
    <a-collapse v-model:activeKey="activeKeys" :bordered="false" ghost>
      <a-collapse-panel key="priority" header="优先级">
        <a-checkbox-group v-model:value="selectedPriorities" @change="emitFilters">
          <a-space direction="vertical">
            <a-checkbox
              v-for="priority in priorities"
              :key="priority.value"
              :value="priority.value"
            >
              <span class="priority-dot" :class="priority.value" />
              {{ priority.label }}
            </a-checkbox>
          </a-space>
        </a-checkbox-group>
      </a-collapse-panel>
      <a-collapse-panel key="due" header="截止日期">
        <a-checkbox-group v-model:value="selectedDue" @change="emitFilters">
          <a-space direction="vertical">
            <a-checkbox v-for="due in dueOptions" :key="due.value" :value="due.value">
              {{ due.label }}
            </a-checkbox>
          </a-space>
        </a-checkbox-group>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  (e: 'filter', filters: FilterState): void
  (e: 'clear-all'): void
}>()

interface FilterState {
  priorities: string[]
  due: string[]
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
const activeKeys = ref<string[]>([])

const hasAnySelection = computed(() => {
  return selectedPriorities.value.length > 0 || selectedDue.value.length > 0
})

function clearAll() {
  selectedPriorities.value = []
  selectedDue.value = []
  emitFilters()
  emit('clear-all')
}

function emitFilters() {
  emit('filter', {
    priorities: selectedPriorities.value,
    due: selectedDue.value,
  })
}
</script>

<style scoped>
.filter-panel {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: var(--ant-color-bg-container);
  border: 1px solid var(--ant-color-border);
  border-radius: var(--ant-border-radius-lg);
  align-items: flex-start;
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 4px;
}

.priority-dot.low {
  background: var(--ant-color-success);
}

.priority-dot.medium {
  background: var(--ant-color-warning);
}

.priority-dot.high {
  background: var(--ant-color-error);
}
</style>
