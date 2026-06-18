<template>
  <div class="board-view">
    <div class="board-header">
      <div class="board-title-group">
        <p class="eyebrow">任务看板</p>
        <div class="board-title-row">
          <input
            v-if="editingTitle"
            ref="titleInput"
            v-model="editingTitleValue"
            class="board-title-input"
            @blur="saveBoardTitle"
            @keydown.enter="saveBoardTitle"
            @keydown.escape="editingTitle = false"
          />
          <h2 v-else @dblclick="startEditTitle">{{ currentBoard?.name || '请选择一个看板' }}</h2>
          <div class="board-switcher">
            <button class="btn-switch" @click="showBoardSwitcher = !showBoardSwitcher">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 5.5L7 9.5L11 5.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <div v-if="showBoardSwitcher" class="board-dropdown">
              <div
                v-for="b in boards"
                :key="b.id"
                class="board-dropdown-item"
                :class="{ active: currentBoard?.id === b.id }"
                @click="switchBoard(b)"
                @contextmenu.prevent="openContextMenu($event, b)"
              >
                <span class="board-dot" :style="{ background: boardColor(b.id) }" />
                <span>{{ b.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="board-actions">
        <ViewSwitcher :current-view="currentView" @change="currentView = $event" />
        <button :disabled="!currentBoard" @click="showCreateList = true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1v12M1 7h12"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
          <span>新建列表</span>
        </button>
      </div>
    </div>

    <TodayFocusBar
      v-if="currentBoard"
      v-model:collapsed="focusCollapsed"
      :items="focusStore.items"
      :cards="cardStore.cards"
      :completed-list-ids="completedListIds"
      :overdue-count="focusStore.overdueCount"
      :loading="focusStore.loading"
      :error="focusStore.error"
      @open-card="openCardDetail"
      @include="handleFocusInclude"
      @exclude="handleFocusExclude"
      @retry="refreshFocus"
    />

    <Teleport to="body">
      <div
        v-if="contextMenu.visible"
        class="context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        @click="contextMenu.visible = false"
      >
        <div class="context-menu-item danger" @click="handleDeleteBoard">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 4h10M5 4V2.5a1 1 0 011-1h2a1 1 0 011 1V4M11 4v7.5a1 1 0 01-1 1H4a1 1 0 01-1-1V4"
              stroke="currentColor"
              stroke-width="1.3"
              stroke-linecap="round"
            />
          </svg>
          <span>删除看板</span>
        </div>
      </div>
    </Teleport>
    <div class="board-toolbar" v-if="currentBoard">
      <SearchBar :result-count="filteredCardsCount" @search="handleSearch" />
    </div>
    <div class="board-content" v-if="currentBoard">
      <BoardColumn
        v-if="currentView === 'board'"
        v-for="list in filteredLists"
        :key="list.id"
        :list="list"
        :filtered-cards="getFilteredListCards(list.id)"
        :focused-card-ids="focusedCardIds"
        :focus-saving-ids="focusStore.savingCardIds"
        @select-card="openCardDetail"
        @toggle-focus="handleToggleFocus"
        @cards-changed="refreshFocus"
        @list-changed="refreshFocus"
      />
      <ListView
        v-else-if="currentView === 'list'"
        :cards="filteredCards"
        :lists="lists"
        @edit="openCardDetail"
        @delete="deleteCard"
      />
      <CalendarView
        v-else-if="currentView === 'calendar'"
        :cards="filteredCards"
        @edit="openCardDetail"
        @update="handleCardUpdate"
      />
    </div>
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect
            x="8"
            y="8"
            width="48"
            height="48"
            rx="8"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-dasharray="4 3"
            opacity="0.3"
          />
          <rect x="18" y="20" width="12" height="4" rx="2" fill="currentColor" opacity="0.12" />
          <rect x="18" y="28" width="28" height="4" rx="2" fill="currentColor" opacity="0.12" />
          <rect x="18" y="36" width="20" height="4" rx="2" fill="currentColor" opacity="0.08" />
          <circle cx="32" cy="54" r="3" fill="var(--color-accent)" opacity="0.3" />
        </svg>
      </div>
      <h3>还没有打开的看板</h3>
      <p>请从左侧选择一个看板，或创建新的看板开始整理任务。</p>
    </div>

    <CreateListModal
      v-if="showCreateList && currentBoard"
      @close="showCreateList = false"
      :board-id="currentBoard.id"
    />

    <CardDetailModal
      v-if="selectedCard"
      :card="selectedCard"
      :focused="focusStore.isFocused(selectedCard.id)"
      :focus-saving="focusStore.savingCardIds.includes(selectedCard.id)"
      @toggle-focus="handleToggleFocus"
      @saved="refreshFocus"
      @deleted="refreshFocus"
      @close="selectedCard = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useBoardStore } from '@/stores/board'
import { useListStore } from '@/stores/list'
import { useCardStore } from '@/stores/card'
import { localDateKey, useFocusStore } from '@/stores/focus'
import { Card } from '@/database/entities/Card'
import { Board } from '@/database/entities/Board'
import BoardColumn from '@/components/board/BoardColumn.vue'
import CreateListModal from '@/components/board/CreateListModal.vue'
import CardDetailModal from '@/components/board/CardDetailModal.vue'
import SearchBar from '@/components/board/SearchBar.vue'
import ViewSwitcher from '@/components/board/ViewSwitcher.vue'
import ListView from '@/components/board/ListView.vue'
import CalendarView from '@/components/board/CalendarView.vue'
import TodayFocusBar from '@/components/board/TodayFocusBar.vue'

const boardStore = useBoardStore()
const listStore = useListStore()
const cardStore = useCardStore()
const focusStore = useFocusStore()

const showCreateList = ref(false)
const selectedCard = ref<Card | null>(null)
const currentView = ref('board')
const showBoardSwitcher = ref(false)
const focusCollapsed = ref(localStorage.getItem('taskflow.todayFocus.collapsed') === 'true')

const editingTitle = ref(false)
const editingTitleValue = ref('')
const titleInput = ref<HTMLInputElement | null>(null)

function startEditTitle() {
  if (!currentBoard.value) return
  editingTitle.value = true
  editingTitleValue.value = currentBoard.value.name
  setTimeout(() => titleInput.value?.focus(), 0)
}

async function saveBoardTitle() {
  editingTitle.value = false
  const name = editingTitleValue.value.trim()
  if (!name || !currentBoard.value || name === currentBoard.value.name) return
  await boardStore.updateBoard(currentBoard.value.id, { name })
}

const contextMenu = ref({ visible: false, x: 0, y: 0, board: null as Board | null })

const currentBoard = computed(() => boardStore.currentBoard)
const boards = computed(() => boardStore.boards)
const lists = computed(() => listStore.lists)
const completedListIds = computed(() =>
  lists.value.filter((list) => list.name.trim() === '已完成').map((list) => list.id)
)
const focusedCardIds = computed(() => focusStore.items.map((item) => item.card.id))

const searchQuery = ref('')

const filteredCards = computed(() => {
  let result = [...cardStore.cards]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (card) =>
        card.title.toLowerCase().includes(query) ||
        (card.description && card.description.toLowerCase().includes(query))
    )
  }

  return result
})

const filteredCardsCount = computed(() => filteredCards.value.length)

const filteredLists = computed(() => {
  if (!searchQuery.value) return lists.value
  return lists.value.filter((list) => {
    const listCards = filteredCards.value.filter((card) => card.list_id === list.id)
    return listCards.length > 0
  })
})

function getFilteredListCards(listId: number) {
  return filteredCards.value.filter((card) => card.list_id === listId)
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('click', closeContextMenu)
  window.addEventListener('focus', handleWindowFocus)
})

function handleClickOutside(e: MouseEvent) {
  if (!(e.target as HTMLElement).closest('.board-switcher')) {
    showBoardSwitcher.value = false
  }
}

function closeContextMenu() {
  contextMenu.value = { visible: false, x: 0, y: 0, board: null }
}

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('click', closeContextMenu)
  window.removeEventListener('focus', handleWindowFocus)
})

watch(focusCollapsed, (value) => {
  localStorage.setItem('taskflow.todayFocus.collapsed', String(value))
})

const boardColors = ['#FF6B4A', '#4AD9D9', '#FFC043', '#4CDF8B', '#A78BFA', '#FF5E5E']

function boardColor(id: number) {
  return boardColors[id % boardColors.length]
}

function switchBoard(board: Board) {
  listStore.lists = []
  cardStore.cards = []
  boardStore.setCurrentBoard(board)
  showBoardSwitcher.value = false
}

function openContextMenu(e: MouseEvent, board: Board) {
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY, board }
}

async function handleDeleteBoard() {
  const board = contextMenu.value.board
  if (!board) return
  if (!confirm(`确定要删除看板「${board.name}」吗？此操作不可撤销。`)) return

  const boardsList = boards.value
  const idx = boardsList.findIndex((b) => b.id === board.id)
  const nextBoard = boardsList[idx + 1] || boardsList[idx - 1] || null

  await boardStore.deleteBoard(board.id)

  if (currentBoard.value === null && nextBoard) {
    boardStore.setCurrentBoard(nextBoard)
  }

  contextMenu.value = { visible: false, x: 0, y: 0, board: null }
}

function handleSearch(query: string) {
  searchQuery.value = query
}

watch(
  currentBoard,
  async (board) => {
    if (board) {
      listStore.lists = []
      cardStore.cards = []
      focusStore.clear()
      await Promise.all([
        listStore.fetchLists(board.id),
        cardStore.fetchCardsByBoard(board.id),
        focusStore.fetchFocus(board.id),
      ])
    } else {
      listStore.lists = []
      cardStore.cards = []
      focusStore.clear()
    }
  },
  { immediate: true }
)

function openCardDetail(card: Card) {
  selectedCard.value = card
}

function deleteCard(id: number) {
  cardStore.deleteCard(id)
}

async function handleCardUpdate(card: Card, newDate: string) {
  await cardStore.updateCard(card.id, { due_date: new Date(newDate) })
  await refreshFocus()
}

async function refreshFocus() {
  if (!currentBoard.value) return
  await focusStore.fetchFocus(currentBoard.value.id)
}

async function handleToggleFocus(cardId: number) {
  if (!currentBoard.value) return
  const mode = focusStore.isFocused(cardId) ? 'exclude' : 'include'
  try {
    await focusStore.setFocus(cardId, mode, currentBoard.value.id)
  } catch {
    // The focus bar owns its non-blocking error state.
  }
}

async function handleFocusInclude(cardId: number) {
  if (!currentBoard.value) return
  try {
    await focusStore.setFocus(cardId, 'include', currentBoard.value.id)
  } catch {
    // The focus bar owns its non-blocking error state.
  }
}

async function handleFocusExclude(cardId: number) {
  if (!currentBoard.value) return
  try {
    await focusStore.setFocus(cardId, 'exclude', currentBoard.value.id)
  } catch {
    // The focus bar owns its non-blocking error state.
  }
}

function handleWindowFocus() {
  if (focusStore.currentDate && focusStore.currentDate !== localDateKey()) refreshFocus()
}
</script>

<style scoped>
.board-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  animation: boardFadeIn 0.4s ease;
}

@keyframes boardFadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 22px;
}

.eyebrow {
  margin-bottom: 6px;
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.board-header h2 {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 500;
  line-height: 1.15;
  color: var(--color-text);
}

.board-title-input {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 500;
  line-height: 1.15;
  color: var(--color-text);
  padding: 0 4px;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  background: var(--color-surface-elevated);
  outline: none;
  box-shadow: var(--focus-ring);
}

.board-title-group {
  min-width: 0;
}

.board-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.board-title-row h2 {
  margin: 0;
}

.board-switcher {
  position: relative;
}

.btn-switch {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-switch:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.board-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 100;
  min-width: 180px;
  padding: 4px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

.board-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text-secondary);
  transition: all 0.15s ease;
}

.board-dropdown-item:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.board-dropdown-item.active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.board-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.board-actions button {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 18px;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-md);
  background: var(--color-accent);
  color: var(--color-text-inverse);
  font-weight: 600;
  font-size: 13.5px;
  transition: all 0.2s ease;
}

.board-actions button:hover:not(:disabled) {
  background: var(--color-accent-strong);
  border-color: var(--color-accent-strong);
  box-shadow: var(--shadow-glow);
}

.board-actions button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.board-toolbar {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.board-content {
  flex: 1;
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding: 2px 2px 18px;
  min-height: 0;
}

.board-columns {
  display: flex;
  gap: 14px;
  overflow-x: auto;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--color-text-tertiary);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  gap: 12px;
}

.empty-icon {
  color: var(--color-text-tertiary);
  margin-bottom: 4px;
}

.empty-state h3 {
  color: var(--color-text-secondary);
  font-size: 18px;
  font-weight: 500;
}

.empty-state p {
  max-width: 360px;
  line-height: 1.7;
  font-size: 14px;
}
</style>

<style>
.context-menu {
  position: fixed;
  z-index: 1000;
  min-width: 140px;
  padding: 4px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text-secondary);
  transition: all 0.15s ease;
}

.context-menu-item:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.context-menu-item.danger {
  color: var(--color-red);
}

.context-menu-item.danger:hover {
  background: var(--color-red-soft);
}
</style>
