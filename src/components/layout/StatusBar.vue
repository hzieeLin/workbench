<template>
  <footer class="statusbar">
    <span>{{ currentDate }}</span>
    <span>{{ taskCount }} 个任务</span>
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
  height: 34px;
  background: rgba(255, 253, 248, 0.88);
  border-top: 1px solid var(--color-border-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  font-size: 12px;
  color: var(--color-muted);
}
</style>
