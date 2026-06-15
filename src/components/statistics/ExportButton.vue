<template>
  <div class="export-button">
    <button @click="showDropdown = !showDropdown">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M7 1v9M3.5 6.5L7 10l3.5-3.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M1 10v2.5a.5.5 0 00.5.5h11a.5.5 0 00.5-.5V10"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
      <span>导出数据</span>
    </button>
    <div v-if="showDropdown" class="dropdown">
      <button @click="handleExport('csv')">导出为 CSV</button>
      <button @click="handleExport('json')">导出为 JSON</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  export: [format: 'csv' | 'json']
}>()

const showDropdown = ref(false)

function handleExport(format: 'csv' | 'json') {
  emit('export', format)
  showDropdown.value = false
}
</script>

<style scoped>
.export-button {
  position: relative;
}

.export-button > button {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 16px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
}

.export-button > button:hover {
  border-color: var(--color-border-hover);
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 10;
  min-width: 150px;
  padding: 4px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

.dropdown button {
  display: block;
  width: 100%;
  padding: 9px 12px;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  text-align: left;
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: 13px;
  transition: all 0.15s ease;
}

.dropdown button:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}
</style>
