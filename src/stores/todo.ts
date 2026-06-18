import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Todo } from '@/database/entities/Todo'
import { apiClient } from '@/services/api'

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<Todo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTodos(cardId: number) {
    loading.value = true
    error.value = null
    try {
      todos.value = await apiClient.get<Todo[]>(`/cards/${cardId}/todos`)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function createTodo(cardId: number, text: string) {
    error.value = null
    try {
      const todo = await apiClient.post<Todo>(`/cards/${cardId}/todos`, { text })
      todos.value.push(todo)
      return todo
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function updateTodo(id: number, data: Partial<Todo>) {
    error.value = null
    try {
      await apiClient.patch(`/todos/${id}`, data)
      const index = todos.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        todos.value[index] = { ...todos.value[index], ...data }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function deleteTodo(id: number) {
    error.value = null
    try {
      await apiClient.delete(`/todos/${id}`)
      todos.value = todos.value.filter((t) => t.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  return { todos, loading, error, fetchTodos, createTodo, updateTodo, deleteTodo }
})
