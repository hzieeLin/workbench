<template>
  <div class="active-filters" v-if="hasFilters">
    <span class="filters-label">当前筛选：</span>
    <div class="filter-tags">
      <span v-for="filter in activeFilterTags" :key="filter.key" class="filter-tag">
        {{ filter.label }}
        <button @click="removeFilter(filter)" class="remove-btn">×</button>
      </span>
    </div>
    <button @click="clearAll" class="clear-all-btn">清除所有</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface FilterState {
  priorities: string[]
  due: string[]
  labels: number[]
}

const props = defineProps<{
  filters: FilterState
  availableLabels: { id: number; name: string }[]
}>()

const emit = defineEmits<{
  (e: 'update:filters', filters: FilterState): void
}>()

const hasFilters = computed(() => {
  return props.filters.priorities.length > 0 ||
         props.filters.due.length > 0 ||
         props.filters.labels.length > 0
})

const activeFilterTags = computed(() => {
  const tags: { key: string; type: string; value: string | number; label: string }[] = []
  
  props.filters.priorities.forEach(p => {
    const labels: Record<string, string> = { low: '低优先级', medium: '中优先级', high: '高优先级' }
    tags.push({ key: `priority-${p}`, type: 'priorities', value: p, label: labels[p] })
  })
  
  props.filters.due.forEach(d => {
    const labels: Record<string, string> = { today: '今天', week: '本周', overdue: '已过期', none: '未设置' }
    tags.push({ key: `due-${d}`, type: 'due', value: d, label: labels[d] })
  })
  
  props.filters.labels.forEach(l => {
    const label = props.availableLabels.find(al => al.id === l)
    if (label) {
      tags.push({ key: `label-${l}`, type: 'labels', value: l, label: label.name })
    }
  })
  
  return tags
})

function removeFilter(filter: { type: string; value: string | number }) {
  const newFilters = { ...props.filters }
  if (filter.type === 'labels') {
    newFilters.labels = newFilters.labels.filter(l => l !== filter.value)
  } else {
    const arr = newFilters[filter.type as keyof FilterState] as (string | number)[]
    const index = arr.indexOf(filter.value as never)
    if (index > -1) arr.splice(index, 1)
  }
  emit('update:filters', newFilters)
}

function clearAll() {
  emit('update:filters', { priorities: [], due: [], labels: [] })
}
</script>

<style scoped>
.active-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-accent-soft);
  border-radius: var(--radius-md);
}

.filters-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.filter-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.remove-btn {
  display: grid;
  place-items: center;
  width: 14px;
  height: 14px;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}

.remove-btn:hover {
  color: var(--color-red);
}

.clear-all-btn {
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: var(--color-accent);
  font-size: 12px;
  cursor: pointer;
}

.clear-all-btn:hover {
  text-decoration: underline;
}
</style>