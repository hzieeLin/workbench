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
          <button type="button" @click="$emit('close')">取消</button>
          <button type="submit">创建</button>
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
    end_time: new Date(endTime.value)
  })
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
}

.modal h3 {
  margin-bottom: 16px;
}

.modal input {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.time-inputs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.time-inputs label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.modal-actions button {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions button[type="submit"] {
  background: #4a90d9;
  color: white;
  border: none;
}
</style>
