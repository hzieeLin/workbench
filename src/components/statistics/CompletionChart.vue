<template>
  <div class="completion-chart">
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
    <div class="stats-summary">
      <div class="stat">
        <span class="value">{{ data.completed }}</span>
        <span class="label">已完成</span>
      </div>
      <div class="stat">
        <span class="value">{{ data.pending }}</span>
        <span class="label">待处理</span>
      </div>
      <div class="stat accent">
        <span class="value">{{ percentage }}%</span>
        <span class="label">完成率</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps<{
  data: {
    completed: number
    pending: number
    total: number
  }
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const percentage = computed(() => {
  if (props.data.total === 0) return 0
  return Math.round((props.data.completed / props.data.total) * 100)
})

function getChartColors() {
  const isDark = true
  return {
    completed: '#4CDF8B',
    pending: '#FFC043',
    border: isDark ? '#222326' : '#fffdf8',
    text: isDark ? '#A09E98' : '#718087',
  }
}

onMounted(() => {
  if (chartCanvas.value) {
    const colors = getChartColors()
    chartInstance = new Chart(chartCanvas.value, {
      type: 'doughnut',
      data: {
        labels: ['已完成', '待处理'],
        datasets: [
          {
            data: [props.data.completed, props.data.pending],
            backgroundColor: [colors.completed, colors.pending],
            borderColor: colors.border,
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: colors.text,
              font: { family: "'DM Sans', sans-serif", size: 12 },
            },
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
.completion-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-container {
  width: 200px;
  height: 200px;
  margin-bottom: 20px;
}

.stats-summary {
  display: flex;
  gap: 12px;
}

.stat {
  min-width: 72px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  text-align: center;
}

.stat .value {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.3;
}

.stat .label {
  font-size: 11px;
  color: var(--color-text-tertiary);
  font-weight: 500;
}

.stat.accent .value {
  color: var(--color-accent);
}
</style>
