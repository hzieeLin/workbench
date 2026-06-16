<template>
  <a-layout-footer class="statusbar">
    <div class="status-left">
      <a-badge status="success" />
      <span>{{ taskCount }} 个任务</span>
    </div>
    <span>{{ currentDate }}</span>
  </a-layout-footer>
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
  background: var(--ant-color-bg-container, #fff);
  border-top: 1px solid var(--ant-color-border, #f0f0f0);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  font-size: 12px;
  color: var(--ant-color-text-secondary, rgba(0,0,0,0.45));
}

.status-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
