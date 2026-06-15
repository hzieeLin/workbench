<template>
  <div class="board-view">
    <div class="board-header">
      <div>
        <p class="eyebrow">任务看板</p>
        <h2>{{ currentBoard?.name || '请选择一个看板' }}</h2>
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
    <div class="board-toolbar" v-if="currentBoard">
      <SearchBar :result-count="filteredCardsCount" @search="handleSearch" />
      <FilterPanel :available-labels="availableLabels" @filter="handleFilter" />
      <SortSelector :current-sort="sortField" :direction="sortDirection" @sort="handleSort" />
    </div>
    <ActiveFilters
      v-if="hasActiveFilters"
      :filters="activeFilters"
      :available-labels="availableLabels"
      @update:filters="updateFilters"
    />
    <div class="board-content" v-if="currentBoard">
      <BoardColumn
        v-if="currentView === 'board'"
        v-for="list in filteredLists"
        :key="list.id"
        :list="list"
        :filtered-cards="getFilteredListCards(list.id)"
        @select-card="openCardDetail"
      />
      <ListView
        v-else-if="currentView === 'list'"
        :cards="filteredCards"
        :lists="lists"
        :card-labels="cardLabels"
        @edit="openCardDetail"
        @delete="deleteCard"
      />
      <CalendarView
        v-else-if="currentView === 'calendar'"
        :cards="filteredCards"
        @edit="openCardDetail"
        @update="handleCardUpdate"
      />
      <TimelineView
        v-else-if="currentView === 'timeline'"
        :cards="filteredCards"
        @edit="openCardDetail"
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

    <CardDetailModal v-if="selectedCard" :card="selectedCard" @close="selectedCard = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useBoardStore } from '@/stores/board'
import { useListStore } from '@/stores/list'
import { useCardStore } from '@/stores/card'
import { useLabelStore } from '@/stores/label'
import { Card } from '@/database/entities/Card'
import BoardColumn from '@/components/board/BoardColumn.vue'
import CreateListModal from '@/components/board/CreateListModal.vue'
import CardDetailModal from '@/components/board/CardDetailModal.vue'
import SearchBar from '@/components/board/SearchBar.vue'
import FilterPanel from '@/components/board/FilterPanel.vue'
import ActiveFilters from '@/components/board/ActiveFilters.vue'
import SortSelector from '@/components/board/SortSelector.vue'
import ViewSwitcher from '@/components/board/ViewSwitcher.vue'
import ListView from '@/components/board/ListView.vue'
import CalendarView from '@/components/board/CalendarView.vue'
import TimelineView from '@/components/board/TimelineView.vue'

const boardStore = useBoardStore()
const listStore = useListStore()
const cardStore = useCardStore()
const labelStore = useLabelStore()

const showCreateList = ref(false)
const selectedCard = ref<Card | null>(null)
const currentView = ref('board')

const currentBoard = computed(() => boardStore.currentBoard)
const lists = computed(() => listStore.lists)
const availableLabels = computed(() => labelStore.labels)
const cardLabels = computed(() => cardStore.cardLabels)

const searchQuery = ref('')
const activeFilters = ref<{ priorities: string[]; due: string[]; labels: number[] }>({
  priorities: [],
  due: [],
  labels: [],
})
const sortField = ref<'created_at' | 'updated_at' | 'priority' | 'due_date' | 'title'>('created_at')
const sortDirection = ref<'asc' | 'desc'>('desc')

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

  if (activeFilters.value.priorities.length > 0) {
    result = result.filter((card) => activeFilters.value.priorities.includes(card.priority))
  }

  if (activeFilters.value.due.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekEnd = new Date(today)
    weekEnd.setDate(weekEnd.getDate() + 7)

    result = result.filter((card) => {
      if (activeFilters.value.due.includes('none') && !card.due_date) return true
      if (!card.due_date) return false

      const dueDate = new Date(card.due_date)

      if (activeFilters.value.due.includes('today')) {
        if (dueDate.toDateString() === today.toDateString()) return true
      }

      if (activeFilters.value.due.includes('week')) {
        if (dueDate >= today && dueDate <= weekEnd) return true
      }

      if (activeFilters.value.due.includes('overdue')) {
        if (dueDate < today) return true
      }

      return false
    })
  }

  if (activeFilters.value.labels.length > 0) {
    result = result.filter((card) => {
      const labels = cardLabels.value.get(card.id)
      if (!labels || labels.length === 0) return false
      return activeFilters.value.labels.some((labelId) =>
        labels.some((l) => l.id === labelId)
      )
    })
  }

  const field = sortField.value
  const dir = sortDirection.value === 'asc' ? 1 : -1

  result.sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]

    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1

    if (field === 'priority') {
      const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
      return ((priorityOrder[bVal as string] ?? 4) - (priorityOrder[aVal as string] ?? 4)) * dir
    }

    if (field === 'due_date' || field === 'created_at' || field === 'updated_at') {
      return (new Date(aVal).getTime() - new Date(bVal).getTime()) * dir
    }

    return String(aVal).localeCompare(String(bVal)) * dir
  })

  return result
})

const filteredCardsCount = computed(() => filteredCards.value.length)

const hasActiveFilters = computed(() => {
  return (
    activeFilters.value.priorities.length > 0 ||
    activeFilters.value.due.length > 0 ||
    activeFilters.value.labels.length > 0
  )
})

const filteredLists = computed(() => {
  if (!hasActiveFilters.value && !searchQuery.value) return lists.value
  return lists.value.filter((list) => {
    const listCards = filteredCards.value.filter((card) => card.list_id === list.id)
    return listCards.length > 0
  })
})

function getFilteredListCards(listId: number) {
  return filteredCards.value.filter((card) => card.list_id === listId)
}

onMounted(() => {
  const savedSortField = localStorage.getItem('sortField')
  const savedSortDirection = localStorage.getItem('sortDirection')
  if (savedSortField) sortField.value = savedSortField as typeof sortField.value
  if (savedSortDirection) sortDirection.value = savedSortDirection as typeof sortDirection.value
})

function handleSearch(query: string) {
  searchQuery.value = query
}

function handleFilter(filters: { priorities: string[]; due: string[]; labels: number[] }) {
  activeFilters.value = filters
}

function updateFilters(filters: { priorities: string[]; due: string[]; labels: number[] }) {
  activeFilters.value = filters
}

function handleSort(field: string, direction: string) {
  sortField.value = field as typeof sortField.value
  sortDirection.value = direction as typeof sortDirection.value
  localStorage.setItem('sortField', field)
  localStorage.setItem('sortDirection', direction)
}

watch(currentBoard, async (board) => {
  if (board) {
    await listStore.fetchLists(board.id)
    await cardStore.fetchCardsByBoard(board.id)
    await labelStore.fetchLabels(board.id)
    await cardStore.fetchCardLabelsByBoard(board.id)
  }
})

function openCardDetail(card: Card) {
  selectedCard.value = card
}

function deleteCard(id: number) {
  cardStore.deleteCard(id)
}

async function handleCardUpdate(card: Card, newDate: string) {
  await cardStore.updateCard(card.id, { due_date: new Date(newDate) })
}
</script>

<style scoped>
.board-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
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
