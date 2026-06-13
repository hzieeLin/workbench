import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AppDataSource } from '@/database/connection'
import { Card } from '@/database/entities/Card'
import { List } from '@/database/entities/List'

export const useCardStore = defineStore('card', () => {
  const cards = ref<Card[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchCards(listId: number) {
    loading.value = true
    error.value = null
    try {
      const cardRepo = AppDataSource.getRepository(Card)
      const listCards = await cardRepo.find({
        where: { list_id: listId },
        order: { position: 'ASC' },
      })
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
      const cardRepo = AppDataSource.getRepository(Card)
      const listRepo = AppDataSource.getRepository(List)
      const lists = await listRepo.find({ where: { board_id: boardId } })
      const listIds = lists.map((l) => l.id)
      if (listIds.length > 0) {
        cards.value = await cardRepo.find({
          where: { list_id: listIds } as any,
          order: { list_id: 'ASC', position: 'ASC' },
        })
      } else {
        cards.value = []
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function createCard(listId: number, title: string, description?: string) {
    error.value = null
    try {
      const cardRepo = AppDataSource.getRepository(Card)
      const listCards = cards.value.filter((c) => c.list_id === listId)
      const maxPosition = listCards.length > 0 ? Math.max(...listCards.map((c) => c.position)) : 0
      const card = cardRepo.create({
        list_id: listId,
        title,
        description,
        position: maxPosition + 1,
      })
      const saved = await cardRepo.save(card)
      cards.value.push(saved)
      return saved
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function updateCard(id: number, data: Partial<Card>) {
    error.value = null
    try {
      const cardRepo = AppDataSource.getRepository(Card)
      await cardRepo.update(id, data)
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
      const cardRepo = AppDataSource.getRepository(Card)
      await cardRepo.delete(id)
      cards.value = cards.value.filter((c) => c.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function moveCard(cardId: number, targetListId: number, position: number) {
    error.value = null
    try {
      const cardRepo = AppDataSource.getRepository(Card)
      const card = cards.value.find((c) => c.id === cardId)
      const sourceListId = card?.list_id

      if (sourceListId === targetListId) {
        const listCards = cards.value
          .filter((c) => c.list_id === targetListId && c.id !== cardId)
          .sort((a, b) => a.position - b.position)

        const clampedPosition = Math.max(1, Math.min(position, listCards.length + 1))
        listCards.splice(clampedPosition - 1, 0, { ...card!, id: cardId })

        await Promise.all(listCards.map((c, i) => cardRepo.update(c.id, { position: i + 1 })))

        cards.value = cards.value
          .filter((c) => c.list_id !== targetListId)
          .concat(
            listCards.map((c, i) => ({
              ...cards.value.find((vc) => vc.id === c.id)!,
              position: i + 1,
            }))
          )
          .sort((a, b) => a.list_id - b.list_id || a.position - b.position)
      } else {
        const sourceCards = cards.value
          .filter((c) => c.list_id === sourceListId && c.id !== cardId)
          .sort((a, b) => a.position - b.position)

        const targetCards = cards.value
          .filter((c) => c.list_id === targetListId && c.id !== cardId)
          .sort((a, b) => a.position - b.position)

        const clampedPosition = Math.max(1, Math.min(position, targetCards.length + 1))
        targetCards.splice(clampedPosition - 1, 0, { ...card!, id: cardId } as Card)

        await Promise.all([
          cardRepo.update(cardId, { list_id: targetListId, position: clampedPosition }),
          ...sourceCards.map((c, i) => cardRepo.update(c.id, { position: i + 1 })),
          ...targetCards.map((c, i) => cardRepo.update(c.id, { position: i + 1 })),
        ])

        if (card) {
          card.list_id = targetListId
          card.position = clampedPosition
        }

        sourceCards.forEach((c, i) => {
          const vc = cards.value.find((v) => v.id === c.id)
          if (vc) vc.position = i + 1
        })

        targetCards.forEach((c, i) => {
          const vc = cards.value.find((v) => v.id === c.id)
          if (vc) {
            vc.position = i + 1
            vc.list_id = targetListId
          }
        })

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
    moveCard,
  }
})
