<template>
  <header class="topbar">
    <div class="search-box">
      <input type="text" placeholder="搜索任务..." v-model="searchQuery" />
    </div>
    <div class="actions">
      <button class="btn-icon" title="设置">⚙️</button>
      <button class="btn-icon" title="用户">👤</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')
</script>

<style scoped>
.topbar {
  height: 56px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.search-box input {
  width: 300px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
}

.search-box input:focus {
  border-color: #4a90d9;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
}

.btn-icon:hover {
  background: #f0f0f0;
}
</style>
