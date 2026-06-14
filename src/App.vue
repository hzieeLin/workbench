<template>
  <AppLayout>
    <router-view />
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from './components/layout/AppLayout.vue'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'

useKeyboardShortcuts()
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  min-width: 960px;
  color: var(--color-text);
  background: var(--color-bg);
  font-family:
    'Microsoft YaHei', 'PingFang SC', 'Noto Sans CJK SC', 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

:root {
  --color-bg: #f6f4ef;
  --color-bg-cool: #eef4f2;
  --color-surface: #fffdf8;
  --color-surface-soft: #f9faf7;
  --color-sidebar: #fbfaf5;
  --color-border: #dedbd1;
  --color-border-soft: #ece8de;
  --color-text: #21323c;
  --color-muted: #718087;
  --color-faint: #9aa5a8;
  --color-primary: #24786a;
  --color-primary-strong: #155f55;
  --color-primary-soft: #dcefeb;
  --color-amber: #b7791f;
  --color-amber-soft: #fff2d8;
  --color-red: #c34a3f;
  --color-red-soft: #fae3df;
  --color-green: #2f7d4b;
  --color-green-soft: #dff0e5;
  --shadow-soft: 0 10px 30px rgba(56, 67, 78, 0.08);
  --shadow-card: 0 8px 20px rgba(60, 70, 80, 0.08);
  --focus-ring: 0 0 0 3px rgba(36, 120, 106, 0.16);
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  color: inherit;
}

*::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background: #d5d1c6;
  border: 3px solid transparent;
  border-radius: 999px;
  background-clip: padding-box;
}

*::-webkit-scrollbar-thumb:hover {
  background: #bfb8aa;
  border: 3px solid transparent;
  background-clip: padding-box;
}
</style>
