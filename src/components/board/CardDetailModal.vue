<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal large">
      <div class="modal-header">
        <h3>{{ card.title }}</h3>
        <button class="btn-icon" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>标题</label>
          <input v-model="editTitle" />
        </div>
        <div class="form-group">
          <label>描述</label>
          <textarea v-model="editDescription"></textarea>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>优先级</label>
            <select v-model="editPriority">
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
          <div class="form-group">
            <label>截止日期</label>
            <input type="date" v-model="editDueDate" />
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="handleDelete" class="danger">删除</button>
        <button @click="handleSave" class="primary">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Card } from '@/database/entities/Card'
import { useCardStore } from '@/stores/card'

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
  background: rgba(33, 50, 60, 0.24);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
}

.modal {
  width: 500px;
  max-height: 82vh;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border-soft);
  border-radius: 8px;
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
}

.modal.large {
  width: 620px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid var(--color-border-soft);
}

.modal-header h3 {
  color: var(--color-text);
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border-soft);
  border-radius: 8px;
  background: white;
  cursor: pointer;
  color: var(--color-muted);
}

.modal-body {
  padding: 20px;
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
  color: var(--color-muted);
  font-size: 13px;
  font-weight: 700;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  outline: none;
  background: white;
  color: var(--color-text);
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.form-group textarea {
  height: 128px;
  resize: vertical;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--color-border-soft);
  display: flex;
  justify-content: space-between;
}

.modal-footer button {
  min-height: 36px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}

.primary {
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: white;
}

.danger {
  border: 1px solid var(--color-red-soft);
  background: var(--color-red-soft);
  color: var(--color-red);
}
</style>
