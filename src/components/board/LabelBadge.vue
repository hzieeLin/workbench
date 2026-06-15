<template>
  <div class="label-badges" v-if="labels.length">
    <span 
      v-for="label in displayLabels" 
      :key="label.id" 
      class="label-badge"
      :style="{ backgroundColor: label.color }"
    >
      {{ label.name }}
    </span>
    <span v-if="overflowCount > 0" class="label-badge overflow">
      +{{ overflowCount }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Label } from '@/database/entities/Label'

const props = defineProps<{
  labels: Label[]
  maxDisplay?: number
}>()

const maxDisplay = computed(() => props.maxDisplay || 3)

const displayLabels = computed(() => {
  return props.labels.slice(0, maxDisplay.value)
})

const overflowCount = computed(() => {
  return Math.max(0, props.labels.length - maxDisplay.value)
})
</script>

<style scoped>
.label-badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.label-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 999px;
  color: white;
  font-weight: 600;
}

.label-badge.overflow {
  background: var(--color-surface);
  color: var(--color-text-tertiary);
}
</style>