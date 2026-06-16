<template>
  <div class="time-distribution">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useThemeStore } from '@/stores/theme'

Chart.register(...registerables)

const props = defineProps<{
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor?: string
    }[]
  }
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const themeStore = useThemeStore()

onMounted(() => {
  if (chartCanvas.value) {
    const isDark = themeStore.isDark
    const colors = [
      'rgba(255, 107, 74, 0.7)',
      'rgba(74, 217, 217, 0.7)',
      'rgba(255, 192, 67, 0.7)',
      'rgba(76, 223, 139, 0.7)',
    ]
    const datasets = props.data.datasets.map((d, i) => ({
      ...d,
      backgroundColor: d.backgroundColor || colors[i % colors.length],
      borderColor:
        d.backgroundColor?.replace('0.7', '1') || colors[i % colors.length].replace('0.7', '1'),
      borderWidth: 1,
    }))

    chartInstance = new Chart(chartCanvas.value, {
      type: 'bar',
      data: { labels: props.data.labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: isDark ? '#a0a0b0' : '#5a5a72',
              font: { family: "'DM Sans', sans-serif", size: 11 },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: isDark ? '#6a6a7e' : '#8a8a9e', font: { size: 11 } },
            grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
          },
          y: {
            beginAtZero: true,
            ticks: { color: isDark ? '#6a6a7e' : '#8a8a9e', font: { size: 11 } },
            grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
          },
        },
      },
    })
  }
})

onUnmounted(() => {
  chartInstance?.destroy()
})
</script>

<style scoped>
.time-distribution {
  height: 250px;
}
</style>
