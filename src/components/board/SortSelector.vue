<template>
  <div class="sort-selector">
    <select v-model="selectedSort">
      <option value="created_at">创建时间</option>
      <option value="updated_at">更新时间</option>
      <option value="priority">优先级</option>
      <option value="due_date">截止日期</option>
      <option value="title">标题</option>
    </select>
    <button @click="toggleDirection" class="direction-btn" :title="direction === 'asc' ? '升序' : '降序'">
      {{ direction === 'asc' ? '↑' : '↓' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  currentSort: string
  direction: 'asc' | 'desc'
}>()

const emit = defineEmits<{
  (e: 'sort', field: string, direction: string): void
}>()

const selectedSort = ref(props.currentSort)

watch(() => props.currentSort, (newVal) => {
  selectedSort.value = newVal
})

watch(selectedSort, (newVal) => {
  emit('sort', newVal, props.direction)
})

function toggleDirection() {
  const newDirection = props.direction === 'asc' ? 'desc' : 'asc'
  emit('sort', selectedSort.value, newDirection)
}
</script>

<style scoped>
.sort-selector {
  display: flex;
  gap: 4px;
}

.sort-selector select {
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 13px;
  cursor: pointer;
}

.direction-btn {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-md);
}

.direction-btn:hover {
  background: var(--color-surface-hover);
}
</style>
