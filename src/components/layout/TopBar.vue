<template>
  <header class="topbar">
    <div class="search-box">
      <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="5.25" stroke="currentColor" stroke-width="1.5" />
        <path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <input type="text" placeholder="搜索任务..." v-model="searchQuery" />
      <kbd class="search-hint">⌘K</kbd>
    </div>
    <div class="actions">
      <button class="btn-icon" title="通知">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 1.5a5 5 0 00-5 5v2.5l-1 2.5h12l-1-2.5V6.5a5 5 0 00-5-5z"
            stroke="currentColor"
            stroke-width="1.4"
          />
          <path
            d="M6 13a2 2 0 004 0"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <button class="btn-icon" title="设置">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="2.25" stroke="currentColor" stroke-width="1.5" />
          <path
            d="M8 1v2M8 13v2M1 8h2M13 8h2M2.5 2.5l1.5 1.5M12 12l1.5 1.5M2.5 13.5l1.5-1.5M12 4l1.5-1.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </button>
      <div class="avatar">U</div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')
</script>

<style scoped>
.topbar {
  height: 60px;
  background: var(--color-surface-glass);
  backdrop-filter: var(--blur-md);
  -webkit-backdrop-filter: var(--blur-md);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  gap: 16px;
}

.search-box {
  position: relative;
  width: min(380px, 40vw);
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.search-box input {
  width: 100%;
  height: 38px;
  padding: 8px 16px 8px 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 13.5px;
  transition: all 0.2s ease;
}

.search-box input::placeholder {
  color: var(--color-text-tertiary);
}

.search-box input:focus {
  border-color: var(--color-accent);
  box-shadow: var(--focus-ring);
  background: var(--color-surface-elevated);
}

.search-hint {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-tertiary);
  font-family: inherit;
  line-height: 1.4;
}

.actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: var(--radius-md);
  color: var(--color-text-tertiary);
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--color-accent);
  color: var(--color-text-inverse);
  font-size: 12px;
  font-weight: 700;
  display: grid;
  place-items: center;
  margin-left: 4px;
}
</style>
