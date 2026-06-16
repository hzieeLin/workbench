<template>
  <a-modal
    v-model:open="visible"
    title="创建时间块"
    @cancel="$emit('close')"
    @ok="handleSubmit"
    ok-text="创建"
    cancel-text="取消"
  >
    <a-form layout="vertical">
      <a-form-item label="时间块标题" required>
        <a-input v-model:value="title" placeholder="时间块标题" />
      </a-form-item>
      <a-row :gutter="12">
        <a-col :span="12">
          <a-form-item label="开始时间" required>
            <a-date-picker
              v-model:value="startTime"
              show-time
              format="YYYY-MM-DD HH:mm"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="结束时间" required>
            <a-date-picker
              v-model:value="endTime"
              show-time
              format="YYYY-MM-DD HH:mm"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTimeBlockStore } from '@/stores/timeBlock'
import dayjs from 'dayjs'

const props = defineProps<{
  startTime: Date
  endTime: Date
}>()

const emit = defineEmits<{
  close: []
}>()

const timeBlockStore = useTimeBlockStore()

const title = ref('')
const startTime = ref(dayjs(props.startTime))
const endTime = ref(dayjs(props.endTime))
const visible = ref(true)

async function handleSubmit() {
  await timeBlockStore.createTimeBlock({
    title: title.value,
    start_time: startTime.value.toDate(),
    end_time: endTime.value.toDate(),
  })
  emit('close')
}
</script>
