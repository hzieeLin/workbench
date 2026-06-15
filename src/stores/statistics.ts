import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Board } from '@/database/entities/Board'
import type { List } from '@/database/entities/List'
import type { Card } from '@/database/entities/Card'
import type { TimeBlock } from '@/database/entities/TimeBlock'
import { apiClient } from '@/services/api'

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

  async function loadSnapshot() {
    const boards: Board[] = await apiClient.get<Board[]>('/boards')

    const listPromises = boards.map((board) => apiClient.get<List[]>(`/boards/${board.id}/lists`))
    const listResults = await Promise.all(listPromises)
    const lists: List[] = listResults.flat()

    const cardPromises = lists.map((list) => apiClient.get<Card[]>(`/lists/${list.id}/cards`))
    const cardResults = await Promise.all(cardPromises)
    const cards: Card[] = cardResults.flat()

    return { boards, lists, cards, timeBlocks: [] as TimeBlock[] }
  }

  function getCompletedListIds(lists: List[]) {
    return new Set(lists.filter((list) => list.name === '已完成').map((list) => list.id))
  }

  async function fetchStats() {
    loading.value = true
    error.value = null
    try {
      const { boards, lists, cards } = await loadSnapshot()
      const completedListIds = getCompletedListIds(lists)
      const now = new Date().getTime()

      const completedCards = cards.filter((card) => completedListIds.has(card.list_id)).length
      const overdueCards = cards.filter((card) => {
        return card.due_date && new Date(card.due_date).getTime() < now
      }).length

      stats.value = {
        totalBoards: boards.length,
        totalLists: lists.length,
        totalCards: cards.length,
        completedCards,
        overdueCards,
        cardsByPriority: {
          low: cards.filter((card) => card.priority === 'low').length,
          medium: cards.filter((card) => card.priority === 'medium').length,
          high: cards.filter((card) => card.priority === 'high').length,
        },
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchStatistics() {
    loading.value = true
    error.value = null
    try {
      const { boards, lists, cards, timeBlocks } = await loadSnapshot()
      const completedListIds = getCompletedListIds(lists)
      const completedCards = cards.filter((card) => completedListIds.has(card.list_id)).length

      completionData.value = {
        completed: completedCards,
        pending: cards.length - completedCards,
        total: cards.length,
      }

      stats.value = {
        totalBoards: boards.length,
        totalLists: lists.length,
        totalCards: cards.length,
        completedCards,
        overdueCards: cards.filter((card) => {
          return card.due_date && new Date(card.due_date).getTime() < Date.now()
        }).length,
        cardsByPriority: {
          low: cards.filter((card) => card.priority === 'low').length,
          medium: cards.filter((card) => card.priority === 'medium').length,
          high: cards.filter((card) => card.priority === 'high').length,
        },
      }

      const timeDistributionLabels: string[] = []
      const timeDistributionData: number[] = []

      for (const board of boards) {
        const boardListIds = new Set(
          lists.filter((list) => list.board_id === board.id).map((list) => list.id)
        )
        const boardCardIds = new Set(
          cards.filter((card) => boardListIds.has(card.list_id)).map((card) => card.id)
        )
        const totalMinutes = timeBlocks
          .filter((block) => block.card_id && boardCardIds.has(block.card_id))
          .reduce((sum, block) => {
            const diff = new Date(block.end_time).getTime() - new Date(block.start_time).getTime()
            return sum + Math.max(0, Math.round(diff / 60000))
          }, 0)

        timeDistributionLabels.push(board.name)
        timeDistributionData.push(totalMinutes)
      }

      timeData.value = {
        labels: timeDistributionLabels,
        datasets: [
          {
            label: '工作时间（分钟）',
            data: timeDistributionData,
            backgroundColor: '#24786a',
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
        const start = dayStart.getTime()
        const end = dayEnd.getTime()

        const createdCount = cards.filter((card) => {
          const createdAt = new Date(card.created_at).getTime()
          return createdAt >= start && createdAt <= end
        }).length

        const completedCount = cards.filter((card) => {
          const updatedAt = new Date(card.updated_at).getTime()
          return completedListIds.has(card.list_id) && updatedAt >= start && updatedAt <= end
        }).length

        trendCreatedData.push(createdCount)
        trendCompletedData.push(completedCount)
      }

      trendData.value = {
        labels: trendLabels,
        datasets: [
          {
            label: '新建任务',
            data: trendCreatedData,
            borderColor: '#24786a',
            tension: 0.3,
          },
          {
            label: '完成任务',
            data: trendCompletedData,
            borderColor: '#2f7d4b',
            tension: 0.3,
          },
        ],
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
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
