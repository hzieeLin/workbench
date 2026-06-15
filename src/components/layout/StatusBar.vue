<template>
  <footer class="statusbar">
    <div class="status-left">
      <span class="status-indicator" />
      <span>{{ taskCount }} 个任务</span>
    </div>
    <span>{{ currentDate }}</span>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCardStore } from '@/stores/card'

const cardStore = useCardStore()

const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
})

const taskCount = computed(() => cardStore.cards.length)
</script>

<style scoped>
.statusbar {
  height: 32px;
  background: var(--color-surface-glass);
  backdrop-filter: var(--blur-sm);
  -webkit-backdrop-filter: var(--blur-sm);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  font-size: 12px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-green);
  opacity: 0.8;
}
</style>
