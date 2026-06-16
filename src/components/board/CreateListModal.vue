<template>
  <a-modal
    v-model:open="visible"
    title="新建列表"
    @cancel="$emit('close')"
    @ok="handleSubmit"
    ok-text="创建"
    cancel-text="取消"
  >
    <a-form layout="vertical">
      <a-form-item label="列表名称" required>
        <a-input v-model:value="name" placeholder="列表名称" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useListStore } from '@/stores/list'

const props = defineProps<{
  boardId: number
}>()

const emit = defineEmits<{
  close: []
}>()

const listStore = useListStore()
const name = ref('')
const visible = ref(true)

async function handleSubmit() {
  await listStore.createList(props.boardId, name.value)
  emit('close')
}
</script>
