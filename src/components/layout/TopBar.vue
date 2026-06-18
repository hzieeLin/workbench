<template>
  <a-layout-header class="topbar">
    <a-input-search
      v-model:value="searchQuery"
      placeholder="搜索任务..."
      class="search-box"
      allow-clear
    />
    <div class="actions">
      <a-space>
        <a-button
          type="text"
          shape="circle"
          @click="themeStore.toggleTheme()"
          :title="themeStore.isDark ? '切换到浅色主题' : '切换到深色主题'"
        >
          <template #icon>
            <BulbFilled v-if="themeStore.isDark" />
            <BulbOutlined v-else />
          </template>
        </a-button>
        <a-button type="text" shape="circle">
          <template #icon><BellOutlined /></template>
        </a-button>
        <a-button type="text" shape="circle">
          <template #icon><SettingOutlined /></template>
        </a-button>
        <a-avatar :size="30" style="background-color: var(--ant-color-primary)">U</a-avatar>
      </a-space>
    </div>
  </a-layout-header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BellOutlined, SettingOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons-vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const searchQuery = ref('')
</script>

<style scoped>
.topbar {
  height: 60px;
  background: var(--ant-color-bg-container);
  border-bottom: 1px solid var(--ant-color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  gap: 16px;
}

.search-box {
  width: min(380px, 40vw);
}

.actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
