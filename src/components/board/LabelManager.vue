<template>
  <div class="label-manager">
    <h3>标签管理</h3>
    <div class="label-list">
      <div v-for="label in labels" :key="label.id" class="label-item">
        <template v-if="editingId === label.id">
          <input v-model="editName" placeholder="标签名称" class="edit-input" />
          <div class="color-picker-group">
            <input v-model="editColor" type="color" class="color-input" />
            <div class="color-swatches">
              <span
                v-for="color in presetColors"
                :key="color"
                class="color-swatch"
                :class="{ active: editColor === color }"
                :style="{ backgroundColor: color }"
                @click="editColor = color"
              />
            </div>
          </div>
          <div class="label-actions">
            <button @click="saveEdit(label.id)" class="btn-icon primary">保存</button>
            <button @click="cancelEdit" class="btn-icon">取消</button>
          </div>
        </template>
        <template v-else>
          <span class="label-color" :style="{ backgroundColor: label.color }" />
          <span class="label-name">{{ label.name }}</span>
          <div class="label-actions">
            <button @click="startEdit(label)" class="btn-icon">编辑</button>
            <button @click="deleteLabel(label.id)" class="btn-icon danger">删除</button>
          </div>
        </template>
      </div>
    </div>

    <div v-if="showCreate" class="create-form">
      <input v-model="newName" placeholder="标签名称" />
      <div class="color-picker-group">
        <input v-model="newColor" type="color" class="color-input" />
        <div class="color-swatches">
          <span
            v-for="color in presetColors"
            :key="color"
            class="color-swatch"
            :class="{ active: newColor === color }"
            :style="{ backgroundColor: color }"
            @click="newColor = color"
          />
        </div>
      </div>
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
import type { Label } from '@/database/entities/Label'

const props = defineProps<{
  boardId: number
}>()

const labelStore = useLabelStore()
const labels = ref<Label[]>([])
const showCreate = ref(false)
const newName = ref('')
const newColor = ref('#4AD9D9')
const editingId = ref<number | null>(null)
const editName = ref('')
const editColor = ref('')

const presetColors = [
  '#4AD9D9', '#F5A623', '#7ED321', '#4A90D9', '#BD10E0',
  '#D0021B', '#F8E71C', '#50E3C2', '#B8E986', '#9B9B9B'
]

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

function startEdit(label: Label) {
  editingId.value = label.id
  editName.value = label.name
  editColor.value = label.color
}

function cancelEdit() {
  editingId.value = null
  editName.value = ''
  editColor.value = ''
}

async function saveEdit(id: number) {
  if (!editName.value.trim()) return
  await labelStore.updateLabel(id, { name: editName.value, color: editColor.value })
  cancelEdit()
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

.create-form input,
.edit-input {
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.color-picker-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-input {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.color-swatches {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.15s;
}

.color-swatch:hover {
  opacity: 0.8;
}

.color-swatch.active {
  border-color: var(--color-text-primary);
}

.btn-icon.primary {
  color: var(--color-accent);
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
