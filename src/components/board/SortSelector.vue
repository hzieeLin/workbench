<template>
  <a-space>
    <a-select v-model:value="selectedSort" @change="handleSort" style="width: 140px">
      <a-select-option value="updated_at">更新时间</a-select-option>
      <a-select-option value="priority">优先级</a-select-option>
      <a-select-option value="due_date">截止日期</a-select-option>
      <a-select-option value="title">标题</a-select-option>
    </a-select>
    <a-button @click="toggleDirection">
      {{ direction === 'asc' ? '↑' : '↓' }}
    </a-button>
  </a-space>
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

watch(
  () => props.currentSort,
  (newVal) => {
    selectedSort.value = newVal
  }
)

function handleSort() {
  emit('sort', selectedSort.value, props.direction)
}

function toggleDirection() {
  const newDirection = props.direction === 'asc' ? 'desc' : 'asc'
  emit('sort', selectedSort.value, newDirection)
}
</script>
