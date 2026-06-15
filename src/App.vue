<template>
  <AppLayout>
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from './components/layout/AppLayout.vue'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'

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

:root {
  --color-bg: #141517;
  --color-bg-warm: #1a1b1e;
  --color-surface: rgba(255, 255, 255, 0.05);
  --color-surface-hover: rgba(255, 255, 255, 0.09);
  --color-surface-elevated: #222326;
  --color-surface-glass: rgba(30, 31, 34, 0.72);
  --color-border: rgba(255, 255, 255, 0.07);
  --color-border-hover: rgba(255, 255, 255, 0.14);
  --color-text: #e8e6e1;
  --color-text-secondary: #a09e98;
  --color-text-tertiary: #6b6a66;
  --color-text-inverse: #141517;
  --color-accent: #ff6b4a;
  --color-accent-soft: rgba(255, 107, 74, 0.14);
  --color-accent-strong: #e85a3a;
  --color-accent-glow: rgba(255, 107, 74, 0.25);
  --color-secondary: #4ad9d9;
  --color-secondary-soft: rgba(74, 217, 217, 0.14);
  --color-amber: #ffc043;
  --color-amber-soft: rgba(255, 192, 67, 0.14);
  --color-red: #ff5e5e;
  --color-red-soft: rgba(255, 94, 94, 0.14);
  --color-green: #4cdf8b;
  --color-green-soft: rgba(76, 223, 139, 0.14);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 4px 20px rgba(255, 107, 74, 0.25);
  --blur-sm: blur(8px);
  --blur-md: blur(16px);
  --blur-lg: blur(24px);
  --focus-ring: 0 0 0 2px rgba(255, 107, 74, 0.45);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --font-display: 'Fraunces', Georgia, serif;
  --font-ui: 'DM Sans', 'Noto Sans CJK SC', 'PingFang SC', sans-serif;
}

html {
  font-size: 15px;
}

body {
  min-width: 960px;
  color: var(--color-text);
  background: var(--color-bg);
  font-family: var(--font-ui);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  line-height: 1.5;
}

::selection {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

button,
input,
textarea,
select {
  font: inherit;
  color: inherit;
}

button {
  cursor: pointer;
  border: none;
  background: none;
}

a {
  color: inherit;
  text-decoration: none;
}

*::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
}

*::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.18);
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
