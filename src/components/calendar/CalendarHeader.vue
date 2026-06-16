<template>
  <div class="calendar-header">
    <div class="header-left">
      <p class="eyebrow">时间规划</p>
      <h2>{{ title }}</h2>
    </div>
    <div class="header-center">
      <a-button-group>
        <a-button @click="$emit('prev')">
          <template #icon><LeftOutlined /></template>
        </a-button>
        <a-button @click="$emit('today')">今天</a-button>
        <a-button @click="$emit('next')">
          <template #icon><RightOutlined /></template>
        </a-button>
      </a-button-group>
    </div>
    <div class="header-right">
      <a-segmented
        :value="viewMode"
        :options="viewOptions"
        @change="(val: string) => $emit('change-view', val as 'month' | 'week' | 'day')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  currentDate: Date
  viewMode: 'month' | 'week' | 'day'
}>()

defineEmits<{
  prev: []
  next: []
  today: []
  'change-view': [mode: 'month' | 'week' | 'day']
}>()

const title = computed(() => {
  const date = props.currentDate
  if (props.viewMode === 'month') {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`
  }
  if (props.viewMode === 'week') {
    const start = new Date(date)
    start.setDate(date.getDate() - date.getDay())
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
})

const viewOptions = [
  { label: '月', value: 'month' },
  { label: '周', value: 'week' },
  { label: '日', value: 'day' },
]
</script>

<style scoped>
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 0 0 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--ant-color-border, #f0f0f0);
}

.header-left .eyebrow {
  margin-bottom: 4px;
  color: var(--ant-color-primary, #FF6B4A);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.header-left h2 {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 500;
}
</style>
