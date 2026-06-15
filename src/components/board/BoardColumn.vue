<template>
  <div class="board-column" :class="{ 'drag-over': isDragOver }">
    <div class="column-header">
      <div class="column-title-group">
        <span class="column-bullet" />
        <h3>{{ list.name }}</h3>
        <span class="card-count">{{ cards.length }}</span>
      </div>
      <div class="menu-wrapper">
        <button class="btn-icon" @click="showMenu = !showMenu">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="4" r="1.5" fill="currentColor" />
            <circle cx="8" cy="8" r="1.5" fill="currentColor" />
            <circle cx="8" cy="12" r="1.5" fill="currentColor" />
          </svg>
        </button>
        <div v-if="showMenu" class="dropdown-menu" @click.stop>
          <button class="dropdown-item danger" @click="handleDeleteList">删除列表</button>
        </div>
      </div>
    </div>
    <div
      class="column-cards"
      ref="columnCardsRef"
      :class="{ 'has-drop-after': isDragOver && dropIndex === cards.length }"
      @dragenter="handleDragEnter"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <TransitionGroup name="card-list">
        <TaskCard
          v-for="(card, index) in cards"
          :key="card.id"
          :card="card"
          :class="{ 'drop-before': isDragOver && dropIndex === index }"
          draggable="true"
          @dragstart="handleDragStart(card)"
          @click="emit('select-card', card)"
        />
      </TransitionGroup>
    </div>
    <button class="add-card-btn" @click="showCreateCard = true">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      </svg>
      <span>添加卡片</span>
    </button>

    <CreateCardModal v-if="showCreateCard" :list-id="list.id" @close="showCreateCard = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { List } from '@/database/entities/List'
import { Card } from '@/database/entities/Card'
import { useCardStore } from '@/stores/card'
import { useListStore } from '@/stores/list'
import TaskCard from './TaskCard.vue'
import CreateCardModal from './CreateCardModal.vue'

const props = defineProps<{
  list: List
  filteredCards?: Card[]
}>()

const emit = defineEmits<{
  (e: 'select-card', card: Card): void
}>()

const cardStore = useCardStore()
const listStore = useListStore()
const showCreateCard = ref(false)
const showMenu = ref(false)
const columnCardsRef = ref<HTMLElement | null>(null)
const isDragOver = ref(false)
const dropIndex = ref(0)
let dragEnterCounter = 0

const cards = computed(
  () => props.filteredCards ?? cardStore.cards.filter((c) => c.list_id === props.list.id)
)

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.menu-wrapper')) {
    showMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

onMounted(async () => {
  await cardStore.fetchCards(props.list.id)
})

function handleDragStart(card: Card) {
  localStorage.setItem('draggedCard', JSON.stringify(card))
}

function handleDrop(_event: DragEvent) {
  isDragOver.value = false
  dragEnterCounter = 0
  const cardData = localStorage.getItem('draggedCard')
  if (cardData) {
    const card: Card = JSON.parse(cardData)
    let targetPosition = dropIndex.value + 1
    if (card.list_id === props.list.id) {
      const currentIndex = cards.value.findIndex((c) => c.id === card.id)
      if (currentIndex !== -1 && dropIndex.value > currentIndex) {
        targetPosition = dropIndex.value
      }
    }
    cardStore.moveCard(card.id, props.list.id, targetPosition)
    localStorage.removeItem('draggedCard')
  }
}

function handleDragEnter() {
  dragEnterCounter++
  isDragOver.value = true
}

function handleDragOver(event: DragEvent) {
  const container = columnCardsRef.value
  if (!container) return

  const cardElements = container.querySelectorAll('.task-card')
  let idx = cardElements.length

  for (let i = 0; i < cardElements.length; i++) {
    const rect = cardElements[i].getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    if (event.clientY < midY) {
      idx = i
      break
    }
  }

  dropIndex.value = idx
}

function handleDragLeave() {
  dragEnterCounter--
  if (dragEnterCounter <= 0) {
    isDragOver.value = false
    dragEnterCounter = 0
  }
}

async function handleDeleteList() {
  showMenu.value = false
  if (confirm(`确定要删除列表「${props.list.name}」及其所有卡片吗？`)) {
    await listStore.deleteList(props.list.id)
    cardStore.removeCardsByList(props.list.id)
  }
}
</script>

<style scoped>
.board-column {
  min-width: 292px;
  max-width: 292px;
  background: var(--color-surface-glass);
  backdrop-filter: var(--blur-sm);
  -webkit-backdrop-filter: var(--blur-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  max-height: 100%;
  transition: border-color 0.2s ease;
}

.board-column:hover {
  border-color: var(--color-border-hover);
}

.column-header {
  padding: 16px 14px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.column-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.column-bullet {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: var(--color-accent);
  flex-shrink: 0;
  opacity: 0.6;
}

.column-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-count {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  background: var(--color-surface);
  padding: 1px 7px;
  border-radius: 999px;
  flex-shrink: 0;
}

.btn-icon {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: var(--radius-sm);
  color: var(--color-text-tertiary);
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
}

.menu-wrapper {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 10;
  min-width: 130px;
  padding: 4px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.15s ease;
}

.dropdown-item:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.dropdown-item.danger {
  color: var(--color-red);
}

.dropdown-item.danger:hover {
  background: var(--color-red-soft);
}

.column-cards {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px;
}

.card-list-move {
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-list-enter-active,
.card-list-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-list-enter-from {
  opacity: 0;
  transform: translateY(-8px) scaleY(0.8);
}

.card-list-leave-to {
  opacity: 0;
  transform: translateY(8px) scaleY(0.8);
}

.task-card.drop-before {
  position: relative;
}

.task-card.drop-before::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 6px;
  right: 6px;
  height: 3px;
  background: var(--color-accent);
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
  z-index: 2;
  animation: indicatorPulse 1.2s ease-in-out infinite;
}

.column-cards.has-drop-after::after {
  content: '';
  display: block;
  height: 3px;
  background: var(--color-accent);
  border-radius: 2px;
  margin: 2px 6px 0;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
  animation: indicatorPulse 1.2s ease-in-out infinite;
}

.board-column.drag-over {
  border-color: var(--color-accent);
  background: rgba(99, 102, 241, 0.04);
}

@keyframes indicatorPulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.add-card-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 10px;
  min-height: 36px;
  padding: 8px;
  background: transparent;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-tertiary);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.add-card-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-soft);
}
</style>
