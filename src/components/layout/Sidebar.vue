<template>
  <aside class="sidebar">
    <div class="logo">
      <h1>TaskFlow</h1>
    </div>
    <nav class="nav-menu">
      <router-link to="/" class="nav-item">
        <span class="icon">□</span>
        <span>看板</span>
      </router-link>
      <router-link to="/calendar" class="nav-item">
        <span class="icon">◇</span>
        <span>时间规划</span>
      </router-link>
      <router-link to="/statistics" class="nav-item">
        <span class="icon">↗</span>
        <span>统计分析</span>
      </router-link>
    </nav>
    <div class="board-list">
      <h3>我的看板</h3>
      <ul>
        <li v-for="board in boards" :key="board.id" @click="selectBoard(board)">
          {{ board.name }}
        </li>
      </ul>

      <form v-if="showCreateBoard" class="create-board-form" @submit.prevent="handleCreateBoard">
        <input v-model="newBoardName" placeholder="看板名称" required />
        <div class="create-board-actions">
          <button type="button" class="secondary" @click="cancelCreateBoard">取消</button>
          <button type="submit" class="primary">创建</button>
        </div>
      </form>
      <button v-else class="new-board-button" @click="showCreateBoard = true">+ 新建看板</button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBoardStore } from '@/stores/board'
import { Board } from '@/database/entities/Board'

const boardStore = useBoardStore()
const boards = ref<Board[]>([])
const showCreateBoard = ref(false)
const newBoardName = ref('')

onMounted(async () => {
  await boardStore.fetchBoards()
  boards.value = boardStore.boards
})

function selectBoard(board: Board) {
  boardStore.setCurrentBoard(board)
}

function cancelCreateBoard() {
  showCreateBoard.value = false
  newBoardName.value = ''
}

async function handleCreateBoard() {
  const name = newBoardName.value.trim()
  if (!name) return

  const board = await boardStore.createBoard(name)
  boards.value = boardStore.boards
  boardStore.setCurrentBoard(board)
  cancelCreateBoard()
}
</script>

<style scoped>
.sidebar {
  width: 256px;
  background: var(--color-sidebar);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-border-soft);
  box-shadow: 12px 0 30px rgba(68, 76, 84, 0.05);
}

.logo {
  padding: 22px 22px 18px;
  border-bottom: 1px solid var(--color-border-soft);
}

.logo h1 {
  font-size: 24px;
  line-height: 1;
  letter-spacing: 0;
  color: var(--color-primary-strong);
}

.nav-menu {
  padding: 14px 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 42px;
  padding: 10px 12px;
  color: var(--color-muted);
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.nav-item:hover,
.nav-item.router-link-active {
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
  box-shadow: inset 0 0 0 1px rgba(36, 120, 106, 0.12);
}

.icon {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 7px;
  background: rgba(36, 120, 106, 0.08);
  color: var(--color-primary);
  font-size: 13px;
}

.board-list {
  flex: 1;
  padding: 10px 16px 18px;
  overflow-y: auto;
}

.board-list h3 {
  margin: 10px 6px 12px;
  font-size: 12px;
  color: var(--color-faint);
  font-weight: 700;
  letter-spacing: 0;
}

.board-list ul {
  list-style: none;
  padding: 0;
}

.board-list li {
  padding: 9px 10px;
  cursor: pointer;
  border-radius: 8px;
  margin-bottom: 4px;
  color: var(--color-muted);
  font-size: 14px;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.board-list li:hover {
  background: var(--color-surface-soft);
  color: var(--color-text);
}

.new-board-button {
  width: 100%;
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px dashed rgba(36, 120, 106, 0.42);
  border-radius: 8px;
  background: rgba(36, 120, 106, 0.06);
  color: var(--color-primary-strong);
  cursor: pointer;
  font-weight: 700;
}

.new-board-button:hover {
  background: var(--color-primary-soft);
}

.create-board-form {
  margin-top: 12px;
  padding: 10px;
  border: 1px solid var(--color-border-soft);
  border-radius: 8px;
  background: var(--color-surface);
}

.create-board-form input {
  width: 100%;
  height: 34px;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  outline: none;
  color: var(--color-text);
}

.create-board-form input:focus {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.create-board-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
}

.create-board-actions button {
  min-height: 32px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}

.create-board-actions .secondary {
  border: 1px solid var(--color-border);
  background: white;
  color: var(--color-muted);
}

.create-board-actions .primary {
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: white;
}
</style>
