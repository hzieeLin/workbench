<template>
  <a-config-provider :theme="themeConfig" :locale="zhCN">
    <AppLayout>
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </AppLayout>
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppLayout from './components/layout/AppLayout.vue'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'
import { useThemeStore } from './stores/theme'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

const themeStore = useThemeStore()

const themeConfig = computed(() => ({
  algorithm: themeStore.getAlgorithm(),
  token: {
    colorPrimary: '#FF6B4A',
    borderRadius: 10,
    fontFamily: "'DM Sans', 'Noto Sans CJK SC', 'PingFang SC', sans-serif",
  },
}))

useKeyboardShortcuts()
</script>

<style>
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 15px;
}

body {
  min-width: 960px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  line-height: 1.5;
}

::selection {
  background: rgba(255, 107, 74, 0.25);
  color: #ff6b4a;
}

.page-enter-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}

.page-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
