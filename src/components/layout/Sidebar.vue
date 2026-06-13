<template>
  <aside class="sidebar">
    <div class="logo">
      <h1>TaskFlow</h1>
    </div>
    <nav class="nav-menu">
      <router-link to="/" class="nav-item">
        <span class="icon">📋</span>
        <span>看板</span>
      </router-link>
      <router-link to="/calendar" class="nav-item">
        <span class="icon">📅</span>
        <span>时间规划</span>
      </router-link>
      <router-link to="/statistics" class="nav-item">
        <span class="icon">📊</span>
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
      <button @click="showCreateBoard = true">+ 新建看板</button>
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

onMounted(async () => {
  await boardStore.fetchBoards()
  boards.value = boardStore.boards
})

function selectBoard(board: Board) {
  boardStore.setCurrentBoard(board)
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: #1a1a2e;
  color: white;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 20px;
  border-bottom: 1px solid #333;
}

.nav-menu {
  padding: 10px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  color: white;
  text-decoration: none;
  transition: background 0.2s;
}

.nav-item:hover {
  background: #16213e;
}

.board-list {
  flex: 1;
  padding: 10px 20px;
  overflow-y: auto;
}

.board-list h3 {
  margin: 10px 0;
  font-size: 14px;
  color: #888;
}

.board-list ul {
  list-style: none;
  padding: 0;
}

.board-list li {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 4px;
}

.board-list li:hover {
  background: #16213e;
}
</style>
