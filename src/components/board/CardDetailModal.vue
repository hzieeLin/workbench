<template>
  <a-modal
    v-model:open="visible"
    :title="card.title"
    width="960px"
    @cancel="$emit('close')"
    @ok="handleSave"
    ok-text="保存"
    cancel-text="取消"
  >
    <a-row :gutter="24">
      <a-col :span="16">
        <a-form layout="vertical">
          <a-form-item label="标题">
            <a-input v-model:value="editTitle" />
          </a-form-item>
          <a-form-item label="描述">
            <a-textarea v-model:value="editDescription" placeholder="添加描述..." :rows="4" />
          </a-form-item>
          <TodoList :card-id="card.id" />
          <a-row :gutter="12">
            <a-col :span="12">
              <a-form-item label="优先级">
                <div class="priority-picker">
                  <button
                    v-for="p in priorities"
                    :key="p.value"
                    class="priority-swatch"
                    :class="[`swatch-${p.value}`, { active: editPriority === p.value }]"
                    :title="p.label"
                    @click="editPriority = p.value"
                  />
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="截止日期">
                <a-date-picker v-model:value="editDueDate" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-col>
      <a-col :span="8">
        <CommentSection :card-id="card.id" />
      </a-col>
    </a-row>
    <template #footer>
      <a-space>
        <a-button :loading="focusSaving" @click="emit('toggle-focus', card.id)">
          {{ focused ? '移出今日聚焦' : '加入今日聚焦' }}
        </a-button>
        <a-button danger @click="handleDelete">
          <template #icon><DeleteOutlined /></template>
          删除
        </a-button>
        <a-button @click="$emit('close')">取消</a-button>
        <a-button type="primary" @click="handleSave">保存</a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Card } from '@/database/entities/Card'
import { useCardStore } from '@/stores/card'
import CommentSection from './CommentSection.vue'
import TodoList from './TodoList.vue'
import { DeleteOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

const props = defineProps<{
  card: Card
  focused?: boolean
  focusSaving?: boolean
}>()

const emit = defineEmits<{
  close: []
  saved: []
  deleted: []
  'toggle-focus': [cardId: number]
}>()

const cardStore = useCardStore()
const visible = ref(true)

const priorities = [
  { value: 'low' as const, label: '低' },
  { value: 'medium' as const, label: '中' },
  { value: 'high' as const, label: '高' },
]

const editTitle = ref(props.card.title)
const editDescription = ref(props.card.description || '')
const editPriority = ref(props.card.priority)
const editDueDate = ref(props.card.due_date ? dayjs(props.card.due_date) : null)

async function handleSave() {
  await cardStore.updateCard(props.card.id, {
    title: editTitle.value,
    description: editDescription.value || undefined,
    priority: editPriority.value,
    due_date: editDueDate.value ? editDueDate.value.toDate() : undefined,
  })
  emit('saved')
  emit('close')
}

async function handleDelete() {
  await cardStore.deleteCard(props.card.id)
  emit('deleted')
  emit('close')
}
</script>

<style scoped>
.priority-picker {
  display: flex;
  gap: 8px;
}

.priority-swatch {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.priority-swatch:hover {
  transform: scale(1.1);
}

.priority-swatch.active {
  border-color: var(--color-text);
  box-shadow:
    0 0 0 2px var(--color-surface),
    0 0 0 4px var(--color-text);
}

.swatch-low {
  background: #4cdf8b;
}

.swatch-medium {
  background: #ffc043;
}

.swatch-high {
  background: #ff5e5e;
}
</style>
