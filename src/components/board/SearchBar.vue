<template>
  <a-input-search
    v-model:value="search"
    placeholder="搜索卡片..."
    class="search-bar"
    allow-clear
    @search="handleSearch"
    @change="handleSearchChange"
  />
  <span v-if="resultCount !== null && resultCount !== undefined" class="result-count">
    {{ resultCount }} 条结果
  </span>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  resultCount?: number | null
}>()

const emit = defineEmits<{
  (e: 'search', query: string): void
}>()

const search = ref('')
let debounceTimer: ReturnType<typeof setTimeout>

function handleSearch() {
  emit('search', search.value)
}

function handleSearchChange() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('search', search.value)
  }, 300)
}

function highlightText(text: string, query: string): string {
  if (!query || !text) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  return text.replace(regex, '<mark class="search-highlight">$1</mark>')
}

defineExpose({ highlightText })
</script>

<style scoped>
.search-bar {
  width: 250px;
}

.result-count {
  font-size: 12px;
  color: var(--ant-color-text-secondary);
  white-space: nowrap;
  margin-left: 8px;
}
</style>

<style>
mark.search-highlight {
  background: rgba(99, 102, 241, 0.25);
  color: inherit;
  border-radius: 2px;
  padding: 0 1px;
}
</style>
