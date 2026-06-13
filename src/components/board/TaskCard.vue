<template>
  <div class="task-card" :class="{ 'high-priority': card.priority === 'high' }">
    <div class="card-labels">
      <span
        v-for="label in cardLabels"
        :key="label.id"
        class="label"
        :style="{ backgroundColor: label.color }"
      >
        {{ label.name }}
      </span>
    </div>
    <h4 class="card-title">{{ card.title }}</h4>
    <div class="card-meta">
      <span v-if="card.due_date" class="due-date"> 📅 {{ formatDate(card.due_date) }} </span>
      <span class="priority" :class="card.priority">
        {{ priorityText }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card } from '@/database/entities/Card'

const props = defineProps<{
  card: Card
}>()

import { Label } from '@/database/entities/Label'

const cardLabels = computed((): Label[] => {
  return []
})

const priorityText = computed(() => {
  const map = { low: '低', medium: '中', high: '高' }
  return map[props.card.priority]
})

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.task-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;
}

.task-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.task-card.high-priority {
  border-left: 4px solid #e74c3c;
}

.card-labels {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.label {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  color: white;
}

.card-title {
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.4;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.priority {
  padding: 2px 8px;
  border-radius: 4px;
}

.priority.low {
  background: #e8f5e9;
  color: #2e7d32;
}

.priority.medium {
  background: #fff3e0;
  color: #f57c00;
}

.priority.high {
  background: #ffebee;
  color: #c62828;
}
</style>
