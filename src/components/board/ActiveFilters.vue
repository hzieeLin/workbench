<template>
  <div class="active-filters" v-if="hasFilters">
    <span class="filters-label">当前筛选：</span>
    <a-space :size="[4, 4]" wrap>
      <a-tag
        v-for="filter in activeFilterTags"
        :key="filter.key"
        closable
        @close="removeFilter(filter)"
      >
        {{ filter.label }}
      </a-tag>
    </a-space>
    <a-button type="link" size="small" @click="clearAll">清除所有</a-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface FilterState {
  priorities: string[]
  due: string[]
}

const props = defineProps<{
  filters: FilterState
}>()

const emit = defineEmits<{
  (e: 'update:filters', filters: FilterState): void
}>()

const hasFilters = computed(() => {
  return props.filters.priorities.length > 0 || props.filters.due.length > 0
})

const activeFilterTags = computed(() => {
  const tags: { key: string; type: string; value: string | number; label: string }[] = []

  props.filters.priorities.forEach((p) => {
    const labels: Record<string, string> = { low: '低优先级', medium: '中优先级', high: '高优先级' }
    tags.push({ key: `priority-${p}`, type: 'priorities', value: p, label: labels[p] })
  })

  props.filters.due.forEach((d) => {
    const labels: Record<string, string> = {
      today: '今天',
      week: '本周',
      overdue: '已过期',
      none: '未设置',
    }
    tags.push({ key: `due-${d}`, type: 'due', value: d, label: labels[d] })
  })

  return tags
})

function removeFilter(filter: { type: string; value: string | number }) {
  const newFilters = { ...props.filters }
  const arr = newFilters[filter.type as keyof FilterState] as (string | number)[]
  const index = arr.indexOf(filter.value as never)
  if (index > -1) arr.splice(index, 1)
  emit('update:filters', newFilters)
}

function clearAll() {
  emit('update:filters', { priorities: [], due: [] })
}
</script>

<style scoped>
.active-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--ant-color-primary-bg);
  border-radius: var(--ant-border-radius-lg);
}

.filters-label {
  font-size: 12px;
  color: var(--ant-color-text-secondary);
  white-space: nowrap;
}
</style>
