import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AppDataSource } from '@/database/connection'
import { Board } from '@/database/entities/Board'
import { List } from '@/database/entities/List'
import { Card } from '@/database/entities/Card'

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

      stats.value = {
        totalBoards,
        totalLists,
        totalCards,
        completedCards: 0,
        overdueCards,
        cardsByPriority,
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    loading,
    error,
    completionRate,
    fetchStats,
  }
})
