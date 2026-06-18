<template>
  <a-segmented v-model:value="currentValue" :options="viewOptions" @change="handleChange" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AppstoreOutlined, UnorderedListOutlined, CalendarOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  currentView: string
}>()

const emit = defineEmits<{
  (e: 'change', view: string): void
}>()

const currentValue = computed({
  get: () => props.currentView,
  set: (val) => emit('change', val),
})

const viewOptions = [
  { label: '看板', value: 'board', icon: AppstoreOutlined },
  { label: '列表', value: 'list', icon: UnorderedListOutlined },
  { label: '日历', value: 'calendar', icon: CalendarOutlined },
]

function handleChange(val: string) {
  emit('change', val)
}
</script>
