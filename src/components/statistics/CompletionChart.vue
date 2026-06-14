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
      <div class="stat">
        <span class="value">{{ percentage }}%</span>
        <span class="label">完成率</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
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

const percentage = computed(() => {
  if (props.data.total === 0) return 0
  return Math.round((props.data.completed / props.data.total) * 100)
})

onMounted(() => {
  if (chartCanvas.value) {
    new Chart(chartCanvas.value, {
      type: 'doughnut',
      data: {
        labels: ['已完成', '待处理'],
        datasets: [
          {
            data: [props.data.completed, props.data.pending],
            backgroundColor: ['#2f7d4b', '#b7791f'],
            borderColor: '#fffdf8',
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
              color: '#718087',
            },
          },
        },
      },
    })
  }
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
  gap: 18px;
}

.stat {
  min-width: 76px;
  padding: 10px;
  border: 1px solid var(--color-border-soft);
  border-radius: 8px;
  background: var(--color-surface-soft);
  text-align: center;
}

.stat .value {
  display: block;
  font-size: 24px;
  font-weight: 800;
  color: var(--color-text);
}

.stat .label {
  font-size: 12px;
  color: var(--color-muted);
}
</style>
