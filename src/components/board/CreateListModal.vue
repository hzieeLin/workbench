<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h3>新建列表</h3>
      <form @submit.prevent="handleSubmit">
        <input v-model="name" placeholder="列表名称" required />
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
import { useListStore } from '@/stores/list'

const props = defineProps<{
  boardId: number
}>()

const emit = defineEmits<{
  close: []
}>()

const listStore = useListStore()
const name = ref('')

async function handleSubmit() {
  await listStore.createList(props.boardId, name.value)
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

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.modal-actions button {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions button[type='submit'] {
  background: #4a90d9;
  color: white;
  border: none;
}
</style>
