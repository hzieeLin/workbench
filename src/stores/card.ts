import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AppDataSource } from '@/database/connection'
import { Card } from '@/database/entities/Card'

export const useCardStore = defineStore('card', () => {
  const cards = ref<Card[]>([])
  const loading = ref(false)

  async function fetchCards(listId: number) {
    loading.value = true
    try {
      const cardRepo = AppDataSource.getRepository(Card)
      cards.value = await cardRepo.find({
        where: { list_id: listId },
        order: { position: 'ASC' },
      })
    } finally {
      loading.value = false
    }
  }

  async function createCard(listId: number, title: string, description?: string) {
    const cardRepo = AppDataSource.getRepository(Card)
    const listCards = cards.value.filter((c) => c.list_id === listId)
    const maxPosition = listCards.length > 0 ? Math.max(...listCards.map((c) => c.position)) : 0
    const card = cardRepo.create({ list_id: listId, title, description, position: maxPosition + 1 })
    const saved = await cardRepo.save(card)
    cards.value.push(saved)
    return saved
  }

  async function updateCard(id: number, data: Partial<Card>) {
    const cardRepo = AppDataSource.getRepository(Card)
    await cardRepo.update(id, data)
    const index = cards.value.findIndex((c) => c.id === id)
    if (index !== -1) {
      cards.value[index] = { ...cards.value[index], ...data }
    }
  }

  async function deleteCard(id: number) {
    const cardRepo = AppDataSource.getRepository(Card)
    await cardRepo.delete(id)
    cards.value = cards.value.filter((c) => c.id !== id)
  }

  async function moveCard(cardId: number, targetListId: number, position: number) {
    const cardRepo = AppDataSource.getRepository(Card)
    await cardRepo.update(cardId, { list_id: targetListId, position })
    const index = cards.value.findIndex((c) => c.id === cardId)
    if (index !== -1) {
      cards.value[index].list_id = targetListId
      cards.value[index].position = position
    }
  }

  return {
    cards,
    loading,
    fetchCards,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
  }
})
