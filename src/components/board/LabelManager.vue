<template>
  <div class="label-manager">
    <h3>标签管理</h3>
    <div class="label-list">
      <div v-for="label in labels" :key="label.id" class="label-item">
        <span class="label-color" :style="{ backgroundColor: label.color }" />
        <span class="label-name">{{ label.name }}</span>
        <div class="label-actions">
          <button @click="editLabel(label)" class="btn-icon">编辑</button>
          <button @click="deleteLabel(label.id)" class="btn-icon danger">删除</button>
        </div>
      </div>
    </div>

    <div v-if="showCreate" class="create-form">
      <input v-model="newName" placeholder="标签名称" />
      <input v-model="newColor" type="color" />
      <div class="form-actions">
        <button @click="cancelCreate" class="btn-secondary">取消</button>
        <button @click="createLabel" class="btn-primary">创建</button>
      </div>
    </div>
    <button v-else @click="showCreate = true" class="create-btn">新建标签</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLabelStore } from '@/stores/label'

const props = defineProps<{
  boardId: number
}>()

const labelStore = useLabelStore()
const labels = ref(labelStore.labels)
const showCreate = ref(false)
const newName = ref('')
const newColor = ref('#4AD9D9')

onMounted(async () => {
  await labelStore.fetchLabels(props.boardId)
  labels.value = labelStore.labels
})

async function createLabel() {
  if (!newName.value.trim()) return
  await labelStore.createLabel(props.boardId, newName.value, newColor.value)
  cancelCreate()
}

function cancelCreate() {
  showCreate.value = false
  newName.value = ''
  newColor.value = '#4AD9D9'
}

async function deleteLabel(id: number) {
  if (confirm('确定要删除这个标签吗？')) {
    await labelStore.deleteLabel(id)
  }
}

function editLabel(label: any) {
  // TODO: implement edit functionality
}
</script>

<style scoped>
.label-manager {
  padding: 16px;
}

.label-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.label-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.label-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.label-name {
  flex: 1;
  font-size: 14px;
}

.label-actions {
  display: flex;
  gap: 4px;
}

.btn-icon {
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.btn-icon:hover {
  background: var(--color-surface-hover);
}

.btn-icon.danger {
  color: var(--color-red);
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.create-form input {
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.form-actions {
  display: flex;
  gap: 8px;
}

.create-btn {
  width: 100%;
  padding: 8px;
  border: 1px dashed var(--color-border);
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-md);
}

.create-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
</style>
