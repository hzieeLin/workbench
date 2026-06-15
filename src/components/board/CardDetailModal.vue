<template>
  <transition name="modal">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-handle" />
          <h3>{{ card.title }}</h3>
          <button class="btn-close" @click="$emit('close')">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 2l10 10M12 2l-10 10"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>标题</label>
            <input v-model="editTitle" />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="editDescription" placeholder="添加描述..."></textarea>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>优先级</label>
              <div class="select-wrapper">
                <select v-model="editPriority">
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
                <svg class="select-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M3 5l3 3 3-3"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
            </div>
            <div class="form-group">
              <label>截止日期</label>
              <input type="date" v-model="editDueDate" />
            </div>
          </div>

          <CommentSection :card-id="card.id" />
        </div>
        <div class="modal-footer">
          <button @click="handleDelete" class="btn-danger">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 4h10M5 4V2.5a1 1 0 011-1h2a1 1 0 011 1V4M11 4v7.5a1 1 0 01-1 1H4a1 1 0 01-1-1V4"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
              />
            </svg>
            <span>删除</span>
          </button>
          <button @click="handleSave" class="btn-primary">保存</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Card } from '@/database/entities/Card'
import { useCardStore } from '@/stores/card'
import CommentSection from './CommentSection.vue'

const props = defineProps<{
  card: Card
}>()

const emit = defineEmits<{
  close: []
}>()

const cardStore = useCardStore()

const editTitle = ref(props.card.title)
const editDescription = ref(props.card.description || '')
const editPriority = ref(props.card.priority)
const editDueDate = ref(
  props.card.due_date ? new Date(props.card.due_date).toISOString().split('T')[0] : ''
)

async function handleSave() {
  await cardStore.updateCard(props.card.id, {
    title: editTitle.value,
    description: editDescription.value || undefined,
    priority: editPriority.value,
    due_date: editDueDate.value ? new Date(editDueDate.value) : undefined,
  })
  emit('close')
}

async function handleDelete() {
  if (confirm('确定要删除这张卡片吗？')) {
    await cardStore.deleteCard(props.card.id)
    emit('close')
  }
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
  width: 540px;
  max-height: 82vh;
  display: flex;
  flex-direction: column;
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
  margin: 0 auto 10px;
}

.modal-header {
  padding: 20px 24px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 500;
  color: var(--color-text);
  flex: 1;
}

.btn-close {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-sm);
  color: var(--color-text-tertiary);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-close:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--color-accent);
  box-shadow: var(--focus-ring);
  background: var(--color-surface-elevated);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--color-text-tertiary);
}

.form-group textarea {
  height: 120px;
  resize: vertical;
  line-height: 1.6;
}

.select-wrapper {
  position: relative;
}

.select-wrapper select {
  width: 100%;
  padding: 10px 32px 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-wrapper select:focus {
  border-color: var(--color-accent);
  box-shadow: var(--focus-ring);
  background: var(--color-surface-elevated);
}

.select-chevron {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.modal-footer button {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 38px;
  padding: 8px 18px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 13.5px;
  transition: all 0.2s ease;
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

.btn-danger {
  border: 1px solid transparent;
  background: var(--color-red-soft);
  color: var(--color-red);
}

.btn-danger:hover {
  background: rgba(255, 94, 94, 0.22);
}
</style>
