import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Card } from '@/database/entities/Card'
import type { List } from '@/database/entities/List'
import { apiClient } from '@/services/api'

export const useCardStore = defineStore('card', () => {
  const cards = ref<Card[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchCards(listId: number) {
    loading.value = true
    error.value = null
    try {
      const listCards = await apiClient.get<Card[]>(`/lists/${listId}/cards`)
      const otherCards = cards.value.filter((c) => c.list_id !== listId)
      cards.value = [...otherCards, ...listCards].sort(
        (a, b) => a.list_id - b.list_id || a.position - b.position
      )
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchCardsByBoard(boardId: number) {
    loading.value = true
    error.value = null
    try {
      const lists = await apiClient.get<List[]>(`/boards/${boardId}/lists`)
      const cardGroups = await Promise.all(
        lists.map((list) => apiClient.get<Card[]>(`/lists/${list.id}/cards`))
      )
      cards.value = cardGroups
        .flat()
        .sort((a, b) => a.list_id - b.list_id || a.position - b.position)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function createCard(listId: number, title: string, description?: string) {
    error.value = null
    try {
      const card = await apiClient.post<Card>(`/lists/${listId}/cards`, {
        title,
        description,
      })
      cards.value.push(card)
      cards.value = [...cards.value].sort(
        (a, b) => a.list_id - b.list_id || a.position - b.position
      )
      return card
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function updateCard(id: number, data: Partial<Card>) {
    error.value = null
    try {
      const payload: Record<string, unknown> = { ...data }
      if ('description' in payload && payload.description === undefined) payload.description = null
      if ('due_date' in payload && payload.due_date === undefined) payload.due_date = null
      await apiClient.patch(`/cards/${id}`, payload)
      const index = cards.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        cards.value[index] = { ...cards.value[index], ...data }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function deleteCard(id: number) {
    error.value = null
    try {
      await apiClient.delete(`/cards/${id}`)
      cards.value = cards.value.filter((c) => c.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  function removeCardsByList(listId: number) {
    cards.value = cards.value.filter((c) => c.list_id !== listId)
  }

  async function moveCard(cardId: number, targetListId: number, position: number) {
    error.value = null
    try {
      await apiClient.post(`/cards/${cardId}/move`, { list_id: targetListId, position })
      const index = cards.value.findIndex((card) => card.id === cardId)
      if (index !== -1) {
        cards.value[index] = { ...cards.value[index], list_id: targetListId, position }
        cards.value = [...cards.value].sort(
          (a, b) => a.list_id - b.list_id || a.position - b.position
        )
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  return {
    cards,
    loading,
    error,
    fetchCards,
    fetchCardsByBoard,
    createCard,
    updateCard,
    deleteCard,
    removeCardsByList,
    moveCard,
  }
})
