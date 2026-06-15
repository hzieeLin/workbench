<template>
  <aside class="sidebar">
    <div class="logo">
      <span class="logo-mark">✦</span>
      <h1>TaskFlow</h1>
    </div>

    <nav class="nav-menu">
      <router-link to="/" class="nav-item" exact-active-class="active">
        <span class="nav-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect
              x="1"
              y="1"
              width="6"
              height="6"
              rx="1.5"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <rect
              x="9"
              y="1"
              width="6"
              height="6"
              rx="1.5"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <rect
              x="1"
              y="9"
              width="6"
              height="6"
              rx="1.5"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <rect
              x="9"
              y="9"
              width="6"
              height="6"
              rx="1.5"
              stroke="currentColor"
              stroke-width="1.5"
            />
          </svg>
        </span>
        <span>看板</span>
      </router-link>
      <router-link to="/calendar" class="nav-item" active-class="active">
        <span class="nav-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect
              x="1.5"
              y="3"
              width="13"
              height="11.5"
              rx="2"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <path d="M1.5 6.5h13" stroke="currentColor" stroke-width="1.5" />
            <path
              d="M5 1v3M11 1v3"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </span>
        <span>时间规划</span>
      </router-link>
      <router-link to="/statistics" class="nav-item" active-class="active">
        <span class="nav-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M1 14h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <rect x="3" y="8" width="2.5" height="6" rx="1" fill="currentColor" opacity="0.4" />
            <rect x="6.75" y="5" width="2.5" height="9" rx="1" fill="currentColor" opacity="0.6" />
            <rect x="10.5" y="2" width="2.5" height="12" rx="1" fill="currentColor" />
          </svg>
        </span>
        <span>统计分析</span>
      </router-link>
    </nav>

    <div class="board-section">
      <div class="board-section-header">
        <h3>我的看板</h3>
        <span class="board-count">{{ boards.length }}</span>
      </div>
      <ul class="board-list">
        <li
          v-for="board in boards"
          :key="board.id"
          class="board-item"
          :class="{ active: boardStore.currentBoard?.id === board.id }"
          @click="selectBoard(board)"
        >
          <span class="board-dot" :style="{ background: boardColor(board.id) }" />
          <span class="board-name">{{ board.name }}</span>
        </li>
      </ul>

      <!-- Label management for current board -->
      <div v-if="boardStore.currentBoard" class="label-section">
        <LabelManager :board-id="boardStore.currentBoard.id" />
      </div>

      <form v-if="showCreateBoard" class="create-board-form" @submit.prevent="handleCreateBoard">
        <input v-model="newBoardName" placeholder="看板名称" required />
        <div class="create-board-actions">
          <button type="button" class="btn-secondary" @click="cancelCreateBoard">取消</button>
          <button type="submit" class="btn-primary">创建</button>
        </div>
      </form>
      <button v-else class="new-board-btn" @click="showCreateBoard = true">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 1v12M1 7h12"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
        <span>新建看板</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBoardStore } from '@/stores/board'
import { Board } from '@/database/entities/Board'
import LabelManager from '@/components/board/LabelManager.vue'

const boardStore = useBoardStore()
const boards = ref<Board[]>([])
const showCreateBoard = ref(false)
const newBoardName = ref('')

const boardColors = ['#FF6B4A', '#4AD9D9', '#FFC043', '#4CDF8B', '#A78BFA', '#FF5E5E']

function boardColor(id: number) {
  return boardColors[id % boardColors.length]
}

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
  background: var(--color-surface-glass);
  backdrop-filter: var(--blur-lg);
  -webkit-backdrop-filter: var(--blur-lg);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
}

.logo {
  padding: 22px 22px 18px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-mark {
  font-size: 22px;
  color: var(--color-accent);
  line-height: 1;
}

.logo h1 {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  font-style: italic;
  color: var(--color-text);
  letter-spacing: -0.02em;
}

.nav-menu {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 8px 12px;
  color: var(--color-text-tertiary);
  text-decoration: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
}

.nav-item.active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.nav-icon {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  flex-shrink: 0;
}

.board-section {
  flex: 1;
  padding: 8px 16px 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.board-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 8px 6px;
  margin-bottom: 2px;
}

.board-section-header h3 {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-tertiary);
}

.board-count {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  background: var(--color-surface);
  padding: 1px 7px;
  border-radius: 999px;
}

.board-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.board-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  cursor: pointer;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 450;
  transition: all 0.2s ease;
}

.board-item:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.board-item.active {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.board-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.board-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.new-board-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-top: 10px;
  padding: 9px 12px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-tertiary);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.new-board-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-soft);
}

.create-board-form {
  margin-top: 10px;
}

.create-board-form input {
  width: 100%;
  height: 36px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-elevated);
  outline: none;
  color: var(--color-text);
  font-size: 13px;
  transition: border-color 0.2s ease;
}

.create-board-form input:focus {
  border-color: var(--color-accent);
  box-shadow: var(--focus-ring);
}

.create-board-form input::placeholder {
  color: var(--color-text-tertiary);
}

.create-board-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 8px;
}

.create-board-actions button {
  min-height: 32px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
  transition: all 0.2s ease;
}

.btn-secondary {
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-tertiary);
}

.btn-secondary:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
}

.btn-primary {
  border: 1px solid var(--color-accent);
  background: var(--color-accent);
  color: var(--color-text-inverse);
}

.btn-primary:hover {
  background: var(--color-accent-strong);
  border-color: var(--color-accent-strong);
}
</style>
