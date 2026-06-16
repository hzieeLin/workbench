<template>
  <a-dropdown>
    <a-button>
      <template #icon><DownloadOutlined /></template>
      导出数据
    </a-button>
    <template #overlay>
      <a-menu @click="handleMenuClick">
        <a-menu-item key="csv">导出为 CSV</a-menu-item>
        <a-menu-item key="json">导出为 JSON</a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { DownloadOutlined } from '@ant-design/icons-vue'

const emit = defineEmits<{
  export: [format: 'csv' | 'json']
}>()

function handleMenuClick(info: { key: string }) {
  emit('export', info.key as 'csv' | 'json')
}
</script>
