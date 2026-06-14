<template>
  <div class="export-button">
    <button @click="showDropdown = !showDropdown">导出数据</button>
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
  min-height: 38px;
  padding: 0 16px;
  background: var(--color-primary);
  color: white;
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(36, 120, 106, 0.18);
}

.export-button > button:hover {
  background: var(--color-primary-strong);
}

.dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 10;
  min-width: 150px;
  padding: 6px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-soft);
  border-radius: 8px;
  box-shadow: var(--shadow-soft);
}

.dropdown button {
  display: block;
  width: 100%;
  padding: 9px 10px;
  background: none;
  border: none;
  border-radius: 7px;
  text-align: left;
  cursor: pointer;
  color: var(--color-muted);
}

.dropdown button:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
}
</style>
