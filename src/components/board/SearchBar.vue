<template>
  <div class="search-bar">
    <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.5" />
      <path d="M11 11l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
    <input 
      v-model="search" 
      placeholder="搜索卡片..."
      @input="handleSearch"
    />
    <button v-if="search" @click="clearSearch" class="clear-btn">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </button>
    <span v-if="resultCount !== null && resultCount !== undefined" class="result-count">
      {{ resultCount }} 条结果
    </span>
  </div>
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
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('search', search.value)
  }, 300)
}

function clearSearch() {
  search.value = ''
  emit('search', '')
}
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  min-width: 280px;
}

.search-icon {
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.search-bar input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 14px;
  outline: none;
}

.search-bar input::placeholder {
  color: var(--color-text-tertiary);
}

.clear-btn {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.clear-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.result-count {
  font-size: 12px;
  color: var(--color-text-tertiary);
  white-space: nowrap;
}
</style>