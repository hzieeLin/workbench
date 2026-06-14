<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h3>新建卡片</h3>
      <form @submit.prevent="handleSubmit">
        <input v-model="title" placeholder="卡片标题" required />
        <textarea v-model="description" placeholder="描述（可选）"></textarea>
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
import { useCardStore } from '@/stores/card'

const props = defineProps<{
  listId: number
}>()

const emit = defineEmits<{
  close: []
}>()

const cardStore = useCardStore()
const title = ref('')
const description = ref('')

async function handleSubmit() {
  await cardStore.createCard(props.listId, title.value, description.value || undefined)
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

.modal input,
.modal textarea {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  outline: none;
  background: white;
  color: var(--color-text);
}

.modal input:focus,
.modal textarea:focus {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.modal textarea {
  height: 112px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
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
