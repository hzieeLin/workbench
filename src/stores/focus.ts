import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Card } from '@/database/entities/Card'
import { apiClient } from '@/services/api'

export type FocusMode = 'include' | 'exclude'
export type FocusSource = 'automatic' | 'manual'

export interface FocusItem {
  card: Card
  source: FocusSource
  overdue: boolean
}

export interface FocusResponse {
  date: string
  items: FocusItem[]
  total: number
  overdueCount: number
}

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const useFocusStore = defineStore('focus', () => {
  const items = ref<FocusItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentDate = ref('')
  const overdueCount = ref(0)
  const savingCardIds = ref<number[]>([])

  async function fetchFocus(boardId: number, date = localDateKey()) {
    loading.value = true
    error.value = null
    currentDate.value = date
    try {
      const response = await apiClient.get<FocusResponse>(`/boards/${boardId}/focus?date=${date}`)
      items.value = response.items
      overdueCount.value = response.overdueCount
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
    } finally {
      loading.value = false
    }
  }

  async function setFocus(
    cardId: number,
    mode: FocusMode,
    boardId: number,
    date = currentDate.value || localDateKey()
  ) {
    error.value = null
    if (!savingCardIds.value.includes(cardId)) savingCardIds.value.push(cardId)
    try {
      await apiClient.put(`/cards/${cardId}/focus`, { date, mode })
      await fetchFocus(boardId, date)
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
      throw cause
    } finally {
      savingCardIds.value = savingCardIds.value.filter((id) => id !== cardId)
    }
  }

  function isFocused(cardId: number) {
    return items.value.some((item) => item.card.id === cardId)
  }

  function clear() {
    items.value = []
    loading.value = false
    error.value = null
    currentDate.value = ''
    overdueCount.value = 0
    savingCardIds.value = []
  }

  return {
    items,
    loading,
    error,
    currentDate,
    overdueCount,
    savingCardIds,
    fetchFocus,
    setFocus,
    isFocused,
    clear,
  }
})
