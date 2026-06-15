<template>
  <transition name="modal">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-handle" />
        <h3>新建卡片</h3>
        <form @submit.prevent="handleSubmit">
          <input v-model="title" placeholder="卡片标题" required />
          <textarea v-model="description" placeholder="描述（可选）"></textarea>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="$emit('close')">取消</button>
            <button type="submit" class="btn-primary">创建</button>
          </div>
        </form>
      </div>
    </div>
  </transition>
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
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.modal-enter-active {
  transition: all 0.3s ease;
}

.modal-enter-active .modal {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-leave-active .modal {
  transition: all 0.2s ease;
}

.modal-enter-from {
  opacity: 0;
}

.modal-enter-from .modal {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.modal-leave-to {
  opacity: 0;
}

.modal-leave-to .modal {
  opacity: 0;
  transform: scale(0.97) translateY(5px);
}

.modal {
  width: 420px;
  padding: 24px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface-elevated);
  box-shadow: var(--shadow-lg);
}

.modal-handle {
  width: 32px;
  height: 3px;
  border-radius: 999px;
  background: var(--color-text-tertiary);
  opacity: 0.3;
  margin: 0 auto 16px;
}

.modal h3 {
  margin-bottom: 18px;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 500;
  color: var(--color-text);
}

.modal input,
.modal textarea {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  transition: all 0.2s ease;
}

.modal input:focus,
.modal textarea:focus {
  border-color: var(--color-accent);
  box-shadow: var(--focus-ring);
  background: var(--color-surface-elevated);
}

.modal input::placeholder,
.modal textarea::placeholder {
  color: var(--color-text-tertiary);
}

.modal textarea {
  height: 112px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.modal-actions button {
  min-height: 36px;
  padding: 8px 18px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 13.5px;
  transition: all 0.2s ease;
}

.btn-secondary {
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-tertiary);
}

.btn-secondary:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
}

.btn-primary {
  border: 1px solid var(--color-accent);
  background: var(--color-accent);
  color: var(--color-text-inverse);
}

.btn-primary:hover {
  background: var(--color-accent-strong);
  border-color: var(--color-accent-strong);
  box-shadow: var(--shadow-glow);
}
</style>
