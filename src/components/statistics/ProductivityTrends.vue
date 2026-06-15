<template>
  <div class="productivity-trends">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps<{
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      borderColor?: string
      tension?: number
    }[]
  }
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

onMounted(() => {
  if (chartCanvas.value) {
    const colors = ['#FF6B4A', '#4AD9D9', '#FFC043']
    const datasets = props.data.datasets.map((d, i) => ({
      ...d,
      borderColor: d.borderColor || colors[i % colors.length],
      backgroundColor: (d.borderColor || colors[i % colors.length]).replace('1)', '0.1)'),
      tension: d.tension ?? 0.3,
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: true,
    }))

    chartInstance = new Chart(chartCanvas.value, {
      type: 'line',
      data: { labels: props.data.labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#A09E98',
              font: { family: "'DM Sans', sans-serif", size: 11 },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#6B6A66', font: { size: 11 } },
            grid: { color: 'rgba(255,255,255,0.04)' },
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#6B6A66', font: { size: 11 } },
            grid: { color: 'rgba(255,255,255,0.04)' },
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
.productivity-trends {
  height: 300px;
}
</style>
