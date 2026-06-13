<template>
  <div class="export-button">
    <button @click="showDropdown = !showDropdown">导出数据</button>
    <div v-if="showDropdown" class="dropdown">
      <button @click="handleExport('csv')">导出为CSV</button>
      <button @click="handleExport('json')">导出为JSON</button>
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
  padding: 10px 20px;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dropdown button {
  display: block;
  width: 100%;
  padding: 10px 20px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
}

.dropdown button:hover {
  background: #f5f5f5;
}
</style>
