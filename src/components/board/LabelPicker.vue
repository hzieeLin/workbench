<template>
  <div class="label-picker">
    <div class="label-search">
      <input v-model="search" placeholder="搜索标签..." />
    </div>
    <div class="label-list">
      <label v-for="label in filteredLabels" :key="label.id" class="label-option">
        <input type="checkbox" :checked="isSelected(label.id)" @change="toggleLabel(label.id)" />
        <span class="label-color" :style="{ backgroundColor: label.color }" />
        <span class="label-name">{{ label.name }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Label } from '@/database/entities/Label'

const props = defineProps<{
  cardId: number
  availableLabels: Label[]
  selectedLabels: number[]
}>()

const emit = defineEmits<{
  (e: 'update:selectedLabels', labels: number[]): void
}>()

const search = ref('')

const filteredLabels = computed(() => {
  if (!search.value) return props.availableLabels
  return props.availableLabels.filter((label) =>
    label.name.toLowerCase().includes(search.value.toLowerCase())
  )
})

function isSelected(labelId: number) {
  return props.selectedLabels.includes(labelId)
}

function toggleLabel(labelId: number) {
  const newSelected = isSelected(labelId)
    ? props.selectedLabels.filter((id) => id !== labelId)
    : [...props.selectedLabels, labelId]
  emit('update:selectedLabels', newSelected)
}
</script>

<style scoped>
.label-picker {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 8px;
}

.label-search input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  margin-bottom: 8px;
}

.label-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.label-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.label-option:hover {
  background: var(--color-surface-hover);
}

.label-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.label-name {
  font-size: 13px;
}
</style>
