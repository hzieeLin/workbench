import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AppDataSource } from '@/database/connection'
import { Board } from '@/database/entities/Board'
import { List } from '@/database/entities/List'
import { Card } from '@/database/entities/Card'
import { TimeBlock } from '@/database/entities/TimeBlock'

export interface DashboardStats {
  totalBoards: number
  totalLists: number
  totalCards: number
  completedCards: number
  overdueCards: number
  cardsByPriority: {
    low: number
    medium: number
    high: number
  }
}

export interface CompletionData {
  completed: number
  pending: number
  total: number
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string
  borderColor?: string
  tension?: number
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export const useStatisticsStore = defineStore('statistics', () => {
  const stats = ref<DashboardStats>({
    totalBoards: 0,
    totalLists: 0,
    totalCards: 0,
    completedCards: 0,
    overdueCards: 0,
    cardsByPriority: {
      low: 0,
      medium: 0,
      high: 0,
    },
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const completionData = ref<CompletionData>({
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

  const completionRate = computed(() => {
    if (stats.value.totalCards === 0) return 0
    return Math.round((stats.value.completedCards / stats.value.totalCards) * 100)
  })

  async function fetchStats() {
    loading.value = true
    error.value = null
    try {
      const boardRepo = AppDataSource.getRepository(Board)
      const listRepo = AppDataSource.getRepository(List)
      const cardRepo = AppDataSource.getRepository(Card)

      const totalBoards = await boardRepo.count()
      const totalLists = await listRepo.count()
      const totalCards = await cardRepo.count()

      const now = new Date()
      const overdueCards = await cardRepo
        .createQueryBuilder('card')
        .where('card.due_date < :now', { now })
        .getCount()

      const cardsByPriority = {
        low: await cardRepo.count({ where: { priority: 'low' } }),
        medium: await cardRepo.count({ where: { priority: 'medium' } }),
        high: await cardRepo.count({ where: { priority: 'high' } }),
      }

      const completedCards = await cardRepo.count({
        where: { priority: 'medium' },
      })

      stats.value = {
        totalBoards,
        totalLists,
        totalCards,
        completedCards,
        overdueCards,
        cardsByPriority,
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchStatistics() {
    await fetchStats()

    const cardRepo = AppDataSource.getRepository(Card)
    const timeBlockRepo = AppDataSource.getRepository(TimeBlock)

    const totalCards = await cardRepo.count()

    const completedCards = await cardRepo
      .createQueryBuilder('card')
      .innerJoin('card.list', 'list')
      .where('list.name = :name', { name: '已完成' })
      .getCount()

    completionData.value = {
      completed: completedCards,
      pending: totalCards - completedCards,
      total: totalCards,
    }

    const boards = await AppDataSource.getRepository(Board).find()

    const timeDistributionLabels: string[] = []
    const timeDistributionData: number[] = []

    for (const board of boards) {
      const timeBlocks = await timeBlockRepo
        .createQueryBuilder('tb')
        .innerJoin('tb.card', 'card')
        .innerJoin('card.list', 'list')
        .innerJoin('list.board', 'board')
        .where('board.id = :boardId', { boardId: board.id })
        .getMany()

      let totalMinutes = 0
      for (const block of timeBlocks) {
        const diff = new Date(block.end_time).getTime() - new Date(block.start_time).getTime()
        totalMinutes += Math.round(diff / 60000)
      }

      timeDistributionLabels.push(board.name)
      timeDistributionData.push(totalMinutes)
    }

    timeData.value = {
      labels: timeDistributionLabels,
      datasets: [
        {
          label: '工作时间 (分钟)',
          data: timeDistributionData,
          backgroundColor: '#4a90d9',
        },
      ],
    }

    const now = new Date()
    const trendLabels: string[] = []
    const trendCompletedData: number[] = []
    const trendCreatedData: number[] = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
      trendLabels.push(dateStr)

      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const createdCount = await cardRepo
        .createQueryBuilder('card')
        .where('card.created_at BETWEEN :start AND :end', {
          start: dayStart,
          end: dayEnd,
        })
        .getCount()

      const completedCount = await cardRepo
        .createQueryBuilder('card')
        .innerJoin('card.list', 'list')
        .where('list.name = :name', { name: '已完成' })
        .andWhere('card.updated_at BETWEEN :start AND :end', {
          start: dayStart,
          end: dayEnd,
        })
        .getCount()

      trendCreatedData.push(createdCount)
      trendCompletedData.push(completedCount)
    }

    trendData.value = {
      labels: trendLabels,
      datasets: [
        {
          label: '新建任务',
          data: trendCreatedData,
          borderColor: '#4a90d9',
          tension: 0.3,
        },
        {
          label: '完成任务',
          data: trendCompletedData,
          borderColor: '#4caf50',
          tension: 0.3,
        },
      ],
    }
  }

  function exportData(format: 'csv' | 'json') {
    const exportContent = {
      completion: completionData.value,
      timeDistribution: timeData.value,
      productivityTrends: trendData.value,
      exportedAt: new Date().toISOString(),
    }

    let content: string
    let mimeType: string
    let filename: string

    if (format === 'json') {
      content = JSON.stringify(exportContent, null, 2)
      mimeType = 'application/json'
      filename = `statistics_${Date.now()}.json`
    } else {
      const rows: string[] = []

      rows.push('类型,标签,值')
      rows.push(`完成统计,已完成,${exportContent.completion.completed}`)
      rows.push(`完成统计,待处理,${exportContent.completion.pending}`)
      rows.push(`完成统计,总计,${exportContent.completion.total}`)

      if (timeData.value.labels.length > 0) {
        for (let i = 0; i < timeData.value.labels.length; i++) {
          rows.push(
            `时间分布,${timeData.value.labels[i]},${timeData.value.datasets[0]?.data[i] || 0}`
          )
        }
      }

      content = rows.join('\n')
      mimeType = 'text/csv'
      filename = `statistics_${Date.now()}.csv`
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return {
    stats,
    loading,
    error,
    completionRate,
    completionData,
    timeData,
    trendData,
    fetchStats,
    fetchStatistics,
    exportData,
  }
})
