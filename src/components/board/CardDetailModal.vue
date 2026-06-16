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
          <a-row :gutter="12">
            <a-col :span="12">
              <a-form-item label="优先级">
                <a-select v-model:value="editPriority">
                  <a-select-option value="low">低</a-select-option>
                  <a-select-option value="medium">中</a-select-option>
                  <a-select-option value="high">高</a-select-option>
                </a-select>
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
import { DeleteOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

const props = defineProps<{
  card: Card
}>()

const emit = defineEmits<{
  close: []
}>()

const cardStore = useCardStore()
const visible = ref(true)

const editTitle = ref(props.card.title)
const editDescription = ref(props.card.description || '')
const editPriority = ref(props.card.priority)
const editDueDate = ref(
  props.card.due_date ? dayjs(props.card.due_date) : null
)

async function handleSave() {
  await cardStore.updateCard(props.card.id, {
    title: editTitle.value,
    description: editDescription.value || undefined,
    priority: editPriority.value,
    due_date: editDueDate.value ? editDueDate.value.toDate() : undefined,
  })
  emit('close')
}

async function handleDelete() {
  await cardStore.deleteCard(props.card.id)
  emit('close')
}
</script>
