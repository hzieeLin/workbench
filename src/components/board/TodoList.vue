<template>
  <div class="todo-section">
    <h4>待办事项 ({{ completedCount }}/{{ todos.length }})</h4>

    <div class="todo-form">
      <a-input v-model:value="newTodoText" placeholder="添加待办事项..." @press-enter="addTodo">
        <template #append>
          <a-button type="primary" @click="addTodo" :disabled="!newTodoText.trim()">
            <template #icon><PlusOutlined /></template>
          </a-button>
        </template>
      </a-input>
    </div>

    <a-list :data-source="todos" size="small" class="todo-list">
      <template #renderItem="{ item: todo }">
        <a-list-item>
          <a-checkbox
            :checked="todo.completed"
            @change="(e: any) => toggleTodo(todo, e.target.checked)"
          >
            <span :class="{ 'completed-text': todo.completed }">{{ todo.text }}</span>
          </a-checkbox>
          <template #actions>
            <a-button type="text" size="small" danger @click="deleteTodo(todo.id)">
              <template #icon><DeleteOutlined /></template>
            </a-button>
          </template>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTodoStore } from '@/stores/todo'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  cardId: number
}>()

const todoStore = useTodoStore()
const todos = ref(todoStore.todos)
const newTodoText = ref('')

const completedCount = computed(() => todos.value.filter((t) => t.completed).length)

onMounted(async () => {
  await todoStore.fetchTodos(props.cardId)
  todos.value = todoStore.todos
})

function notifyChange() {
  window.dispatchEvent(new CustomEvent('todos-changed', { detail: { cardId: props.cardId } }))
}

async function addTodo() {
  const text = newTodoText.value.trim()
  if (!text) return

  await todoStore.createTodo(props.cardId, text)
  todos.value = todoStore.todos
  newTodoText.value = ''
  notifyChange()
}

async function toggleTodo(todo: any, completed: boolean) {
  await todoStore.updateTodo(todo.id, { completed })
  todos.value = todoStore.todos
  notifyChange()
}

async function deleteTodo(id: number) {
  await todoStore.deleteTodo(id)
  todos.value = todoStore.todos
  notifyChange()
}
</script>

<style scoped>
.todo-section {
  margin-top: 16px;
}

.todo-section h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--ant-color-text-secondary);
}

.todo-form {
  margin-bottom: 12px;
}

.completed-text {
  text-decoration: line-through;
  color: var(--ant-color-text-secondary);
}

.todo-list {
  background: transparent;
}
</style>
