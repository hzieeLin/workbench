<template>
  <div class="statistics-view">
    <div class="stats-header">
      <div>
        <p>统计分析</p>
        <h2>效率概览</h2>
      </div>
      <ExportButton @export="handleExport" />
    </div>
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
  height: 100%;
}

.stats-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.stats-header p {
  margin-bottom: 6px;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 800;
}

.stats-header h2 {
  color: var(--color-text);
  font-size: 26px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.stat-card {
  background: rgba(255, 253, 248, 0.86);
  border: 1px solid var(--color-border-soft);
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-soft);
}

.stat-card h3 {
  margin-bottom: 16px;
  color: var(--color-text);
  font-size: 16px;
}

.stat-card.full-width {
  grid-column: span 2;
}
</style>
