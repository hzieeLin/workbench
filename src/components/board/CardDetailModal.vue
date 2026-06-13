<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal large">
      <div class="modal-header">
        <h3>{{ card.title }}</h3>
        <button class="btn-icon" @click="$emit('close')">✕</button>
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
      <div class="modal-footer">
        <button @click="handleSave">保存</button>
        <button @click="handleDelete" class="danger">删除</button>
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
  if (confirm('确定要删除这个卡片吗？')) {
    await cardStore.deleteCard(props.card.id)
    emit('close')
  }
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
  border-radius: 8px;
  width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal.large {
  width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  height: 120px;
  resize: vertical;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
}

.modal-footer button {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.modal-footer button.danger {
  background: #e74c3c;
  color: white;
  border: none;
}
</style>
