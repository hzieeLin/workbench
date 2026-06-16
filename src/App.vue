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

const themeConfig = computed(() => themeStore.getThemeConfig())

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
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

:root {
  --color-accent: #FF6B4A;
  --color-accent-soft: rgba(255, 107, 74, 0.12);
  --color-accent-strong: #e85a3a;

  --color-text: #1a1a2e;
  --color-text-secondary: #5a5a72;
  --color-text-tertiary: #8a8a9e;
  --color-text-inverse: #ffffff;

  --color-bg: #f5f5f7;
  --color-surface: #ffffff;
  --color-surface-elevated: #ffffff;
  --color-surface-glass: rgba(255, 255, 255, 0.72);
  --color-surface-hover: rgba(0, 0, 0, 0.04);

  --color-border: rgba(0, 0, 0, 0.08);
  --color-border-hover: rgba(0, 0, 0, 0.15);

  --color-red: #ef4444;
  --color-red-soft: rgba(239, 68, 68, 0.1);

  --font-display: 'Fraunces', 'Noto Sans CJK SC', serif;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;

  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-glow: 0 0 20px rgba(255, 107, 74, 0.25);

  --blur-sm: blur(12px);
  --focus-ring: 0 0 0 3px rgba(255, 107, 74, 0.2);
}

.dark {
  --color-accent: #FF6B4A;
  --color-accent-soft: rgba(255, 107, 74, 0.15);
  --color-accent-strong: #ff8066;

  --color-text: #e8e8e8;
  --color-text-secondary: #a0a0b0;
  --color-text-tertiary: #6a6a7e;
  --color-text-inverse: #ffffff;

  --color-bg: #0f0f23;
  --color-surface: #1a1a2e;
  --color-surface-elevated: #252540;
  --color-surface-glass: rgba(26, 26, 46, 0.72);
  --color-surface-hover: rgba(255, 255, 255, 0.06);

  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-hover: rgba(255, 255, 255, 0.15);

  --color-red: #f87171;
  --color-red-soft: rgba(248, 113, 113, 0.12);
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
