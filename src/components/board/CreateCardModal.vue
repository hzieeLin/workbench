<template>
  <a-modal
    v-model:open="visible"
    title="新建卡片"
    @cancel="$emit('close')"
    @ok="handleSubmit"
    ok-text="创建"
    cancel-text="取消"
  >
    <a-form layout="vertical">
      <a-form-item label="标题" required>
        <a-input v-model:value="title" placeholder="卡片标题" />
      </a-form-item>
      <a-form-item label="描述">
        <a-textarea v-model:value="description" placeholder="描述（可选）" :rows="4" />
      </a-form-item>
    </a-form>
  </a-modal>
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
const visible = ref(true)

async function handleSubmit() {
  await cardStore.createCard(props.listId, title.value, description.value || undefined)
  emit('close')
}
</script>
