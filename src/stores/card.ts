import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/database/db'
import type { Card } from '@/database/entities/Card'

export const useCardStore = defineStore('card', () => {
  const cards = ref<Card[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchCards(listId: number) {
    loading.value = true
    error.value = null
    try {
      const listCards = db.cards.find(listId)
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
      const lists = db.lists.find(boardId)
      const listIds = new Set(lists.map((list) => list.id))
      cards.value = db
        .cards
        .find()
        .filter((card) => listIds.has(card.list_id))
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
      const listCards = cards.value.filter((c) => c.list_id === listId)
      const maxPosition = listCards.length > 0 ? Math.max(...listCards.map((c) => c.position)) : 0
      const card = db.cards.create({
        list_id: listId,
        title,
        description,
        position: maxPosition + 1,
      })
      cards.value.push(card)
      cards.value = [...cards.value].sort((a, b) => a.list_id - b.list_id || a.position - b.position)
      return card
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function updateCard(id: number, data: Partial<Card>) {
    error.value = null
    try {
      await db.cards.update(id, data)
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
      await db.cards.delete(id)
      cards.value = cards.value.filter((c) => c.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function moveCard(cardId: number, targetListId: number, position: number) {
    error.value = null
    try {
      await db.cards.moveCard(cardId, targetListId, position)
      cards.value = db.cards.find().sort((a, b) => a.list_id - b.list_id || a.position - b.position)
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
    moveCard,
  }
})
