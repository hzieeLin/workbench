<template>
  <div class="app-layout">
    <div class="bg-glow" />
    <div class="bg-noise" />
    <Sidebar />
    <div class="main-area">
      <TopBar />
      <main class="content">
        <slot />
      </main>
      <StatusBar />
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import TopBar from './TopBar.vue'
import StatusBar from './StatusBar.vue'
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: var(--color-bg);
}

.bg-glow {
  position: fixed;
  top: -40vh;
  right: -20vw;
  width: 80vw;
  height: 80vh;
  background: radial-gradient(ellipse at center, rgba(255, 107, 74, 0.06) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.bg-noise {
  position: fixed;
  inset: 0;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
  pointer-events: none;
  z-index: 0;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 24px 28px;
  min-height: 0;
}
</style>
