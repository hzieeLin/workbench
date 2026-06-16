<template>
  <a-layout-sider class="sidebar" :width="256">
    <div class="logo">
      <span class="logo-mark">✦</span>
      <h1>TaskFlow</h1>
    </div>

    <a-menu mode="inline" :selected-keys="selectedKeys" class="nav-menu">
      <a-menu-item key="/" @click="$router.push('/')">
        <template #icon><AppstoreOutlined /></template>
        看板
      </a-menu-item>
      <a-menu-item key="/calendar" @click="$router.push('/calendar')">
        <template #icon><CalendarOutlined /></template>
        时间规划
      </a-menu-item>
      <a-menu-item key="/statistics" @click="$router.push('/statistics')">
        <template #icon><BarChartOutlined /></template>
        统计分析
      </a-menu-item>
    </a-menu>

    <div class="board-section">
      <div class="board-section-header">
        <span>我的看板</span>
        <a-badge :count="boards.length" />
      </div>
      <a-list :data-source="boards" size="small" class="board-list" :bordered="false">
        <template #renderItem="{ item: board }">
          <a-list-item
            class="board-item"
            :class="{ active: boardStore.currentBoard?.id === board.id }"
            @click="selectBoard(board)"
            @contextmenu.prevent="openContextMenu($event, board)"
          >
            <span class="board-dot" :style="{ background: boardColor(board.id) }" />
            <a-input
              v-if="editingBoardId === board.id"
              v-model:value="editingName"
              size="small"
              @blur="saveBoardName(board)"
              @pressEnter="saveBoardName(board)"
              @keydown.escape="cancelEdit"
              @click.stop
            />
            <span v-else class="board-name" @dblclick.stop="startEdit(board)">{{ board.name }}</span>
          </a-list-item>
        </template>
      </a-list>

      <a-form v-if="showCreateBoard" @finish="handleCreateBoard" layout="vertical" size="small">
        <a-form-item>
          <a-input v-model:value="newBoardName" placeholder="看板名称" />
        </a-form-item>
        <a-space>
          <a-button @click="cancelCreateBoard">取消</a-button>
          <a-button type="primary" html-type="submit">创建</a-button>
        </a-space>
      </a-form>
      <a-button v-else block dashed @click="showCreateBoard = true">
        <template #icon><PlusOutlined /></template>
        新建看板
      </a-button>
    </div>

    <a-dropdown :trigger="['contextmenu']" v-model:open="contextMenuVisible">
      <div />
      <template #overlay>
        <a-menu>
          <a-menu-item key="delete" danger @click="handleDeleteBoard">
            删除看板
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </a-layout-sider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBoardStore } from '@/stores/board'
import { Board } from '@/database/entities/Board'
import {
  AppstoreOutlined,
  CalendarOutlined,
  BarChartOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue'

const route = useRoute()
const boardStore = useBoardStore()
const boards = ref<Board[]>([])
const showCreateBoard = ref(false)
const newBoardName = ref('')

const editingBoardId = ref<number | null>(null)
const editingName = ref('')

const selectedKeys = computed(() => {
  if (route.path === '/calendar') return ['/calendar']
  if (route.path === '/statistics') return ['/statistics']
  return ['/']
})

function startEdit(board: Board) {
  editingBoardId.value = board.id
  editingName.value = board.name
}

async function saveBoardName(board: Board) {
  const name = editingName.value.trim()
  editingBoardId.value = null
  if (!name || name === board.name) return
  await boardStore.updateBoard(board.id, { name })
  boards.value = boardStore.boards
}

function cancelEdit() {
  editingBoardId.value = null
}

const contextMenuVisible = ref(false)
const contextMenuBoard = ref<Board | null>(null)

const boardColors = ['#FF6B4A', '#4AD9D9', '#FFC043', '#4CDF8B', '#A78BFA', '#FF5E5E']

function boardColor(id: number) {
  return boardColors[id % boardColors.length]
}

onMounted(async () => {
  await boardStore.fetchBoards()
  boards.value = boardStore.boards
  if (!boardStore.currentBoard && boards.value.length > 0) {
    boardStore.setCurrentBoard(boards.value[0])
  }
})

function selectBoard(board: Board) {
  boardStore.setCurrentBoard(board)
}

function openContextMenu(e: MouseEvent, board: Board) {
  contextMenuBoard.value = board
  contextMenuVisible.value = true
}

async function handleDeleteBoard() {
  const board = contextMenuBoard.value
  if (!board) return

  const idx = boards.value.findIndex((b) => b.id === board.id)
  const nextBoard = boards.value[idx + 1] || boards.value[idx - 1] || null

  await boardStore.deleteBoard(board.id)
  boards.value = boardStore.boards

  if (boardStore.currentBoard === null && nextBoard) {
    boardStore.setCurrentBoard(nextBoard)
  }

  contextMenuVisible.value = false
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
  background: var(--ant-color-bg-container, #fff);
  border-right: 1px solid var(--ant-color-border, #f0f0f0);
}

.logo {
  padding: 22px 22px 18px;
  border-bottom: 1px solid var(--ant-color-border, #f0f0f0);
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-mark {
  font-size: 22px;
  color: var(--ant-color-primary, #FF6B4A);
}

.logo h1 {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  font-style: italic;
}

.nav-menu {
  border-right: none !important;
}

.board-section {
  padding: 8px 16px 16px;
  overflow-y: auto;
}

.board-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 8px 6px;
  margin-bottom: 2px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ant-color-text-secondary, rgba(0,0,0,0.45));
}

.board-list {
  background: transparent;
}

.board-item {
  cursor: pointer;
  transition: all 0.2s ease;
}

.board-item:hover {
  background: var(--ant-color-bg-text-hover, rgba(0,0,0,0.04));
}

.board-item.active {
  background: var(--ant-color-bg-text-hover, rgba(0,0,0,0.04));
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
</style>
