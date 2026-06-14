<template>
  <header class="topbar">
    <div class="search-box">
      <span class="search-icon">⌕</span>
      <input type="text" placeholder="搜索任务..." v-model="searchQuery" />
    </div>
    <div class="actions">
      <button class="btn-icon" title="设置">⚙</button>
      <button class="btn-icon" title="用户">人</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')
</script>

<style scoped>
.topbar {
  height: 62px;
  background: rgba(255, 253, 248, 0.86);
  border-bottom: 1px solid var(--color-border-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  backdrop-filter: blur(14px);
}

.search-box {
  position: relative;
  width: min(420px, 42vw);
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  color: var(--color-faint);
  font-size: 18px;
}

.search-box input {
  width: 100%;
  height: 38px;
  padding: 8px 16px 8px 40px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  outline: none;
  background: var(--color-surface);
  color: var(--color-text);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-box input::placeholder {
  color: var(--color-faint);
}

.search-box input:focus {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border-soft);
  border-radius: 8px;
  cursor: pointer;
  color: var(--color-muted);
  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.btn-icon:hover {
  background: var(--color-primary-soft);
  border-color: rgba(36, 120, 106, 0.18);
  color: var(--color-primary-strong);
}
</style>
