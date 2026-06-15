import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Comment } from '@/database/entities/Comment'
import { apiClient } from '@/services/api'

export const useCommentStore = defineStore('comment', () => {
  const comments = ref<Comment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchComments(cardId: number) {
    loading.value = true
    error.value = null
    try {
      comments.value = await apiClient.get<Comment[]>(`/cards/${cardId}/comments`)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function createComment(cardId: number, content: string, author: string = '用户') {
    error.value = null
    try {
      const comment = await apiClient.post<Comment>(`/cards/${cardId}/comments`, {
        content,
        author
      })
      comments.value.push(comment)
      return comment
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function deleteComment(id: number) {
    error.value = null
    try {
      await apiClient.delete(`/comments/${id}`)
      comments.value = comments.value.filter((c) => c.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  return { comments, loading, error, fetchComments, createComment, deleteComment }
})
