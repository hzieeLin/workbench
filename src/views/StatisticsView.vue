<template>
  <div class="statistics-view">
    <h2>统计分析</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>任务完成率</h3>
        <CompletionChart :data="completionData" />
      </div>
      <div class="stat-card">
        <h3>时间分布</h3>
        <TimeDistribution :data="timeData" />
      </div>
      <div class="stat-card full-width">
        <h3>效率趋势</h3>
        <ProductivityTrends :data="trendData" />
      </div>
    </div>
    <div class="export-section">
      <ExportButton @export="handleExport" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStatisticsStore, type ChartData } from '@/stores/statistics'
import CompletionChart from '@/components/statistics/CompletionChart.vue'
import TimeDistribution from '@/components/statistics/TimeDistribution.vue'
import ProductivityTrends from '@/components/statistics/ProductivityTrends.vue'
import ExportButton from '@/components/statistics/ExportButton.vue'

const statisticsStore = useStatisticsStore()

const completionData = ref({
  completed: 0,
  pending: 0,
  total: 0,
})

const timeData = ref<ChartData>({
  labels: [],
  datasets: [],
})

const trendData = ref<ChartData>({
  labels: [],
  datasets: [],
})

onMounted(async () => {
  await statisticsStore.fetchStatistics()
  completionData.value = statisticsStore.completionData
  timeData.value = statisticsStore.timeData
  trendData.value = statisticsStore.trendData
})

function handleExport(format: 'csv' | 'json') {
  statisticsStore.exportData(format)
}
</script>

<style scoped>
.statistics-view {
  padding: 20px;
}

h2 {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  margin-bottom: 16px;
  color: #333;
}

.stat-card.full-width {
  grid-column: span 2;
}

.export-section {
  display: flex;
  justify-content: flex-end;
}
</style>
