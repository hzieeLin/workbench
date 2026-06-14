<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h3>创建时间块</h3>
      <form @submit.prevent="handleSubmit">
        <input v-model="title" placeholder="时间块标题" required />
        <div class="time-inputs">
          <label>
            开始时间
            <input type="datetime-local" v-model="startTime" required />
          </label>
          <label>
            结束时间
            <input type="datetime-local" v-model="endTime" required />
          </label>
        </div>
        <div class="modal-actions">
          <button type="button" class="secondary" @click="$emit('close')">取消</button>
          <button type="submit" class="primary">创建</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTimeBlockStore } from '@/stores/timeBlock'

const props = defineProps<{
  startTime: Date
  endTime: Date
}>()

const emit = defineEmits<{
  close: []
}>()

const timeBlockStore = useTimeBlockStore()

const title = ref('')
const startTime = ref(formatDateTime(props.startTime))
const endTime = ref(formatDateTime(props.endTime))

function formatDateTime(date: Date): string {
  return date.toISOString().slice(0, 16)
}

async function handleSubmit() {
  await timeBlockStore.createTimeBlock({
    title: title.value,
    start_time: new Date(startTime.value),
    end_time: new Date(endTime.value),
  })
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: rgba(33, 50, 60, 0.24);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
}

.modal {
  width: 420px;
  padding: 24px;
  border: 1px solid var(--color-border-soft);
  border-radius: 8px;
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
}

.modal h3 {
  margin-bottom: 16px;
  color: var(--color-text);
}

.modal input {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  outline: none;
  background: white;
  color: var(--color-text);
}

.modal input:focus {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.time-inputs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.time-inputs label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--color-muted);
  font-size: 13px;
  font-weight: 700;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.modal-actions button {
  min-height: 36px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}

.secondary {
  border: 1px solid var(--color-border);
  background: white;
  color: var(--color-muted);
}

.primary {
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: white;
}
</style>
