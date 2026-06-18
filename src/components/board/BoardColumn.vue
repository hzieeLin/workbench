<template>
  <div
    class="board-column"
    :class="{ 'drag-over': isDragOver }"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
  >
    <div class="column-header">
      <div class="column-title-group">
        <input
          v-show="editingTitle"
          ref="titleInput"
          v-model="editingTitleValue"
          class="column-title-input"
          @blur="saveTitle"
          @keydown.enter="saveTitle"
          @keydown.escape="cancelEdit"
        />
        <span v-show="!editingTitle" class="column-title" @dblclick="startEditTitle">{{
          list.name
        }}</span>
        <span class="column-count">{{ cards.length }}</span>
      </div>
      <a-dropdown :trigger="['click']">
        <button class="column-menu-btn" @click.stop>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="3" r="1.2" fill="currentColor" />
            <circle cx="7" cy="7" r="1.2" fill="currentColor" />
            <circle cx="7" cy="11" r="1.2" fill="currentColor" />
          </svg>
        </button>
        <template #overlay>
          <a-menu>
            <a-menu-item key="delete" danger @click="handleDeleteList">删除列表</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
    <div class="column-divider" />

    <div
      class="column-cards"
      ref="columnCardsRef"
      :class="{ 'has-drop-after': isDragOver && dropIndex === cards.length }"
      @dragover.prevent="handleDragOver"
      @drop.prevent="handleDrop"
    >
      <TransitionGroup name="card-list">
        <TaskCard
          v-for="(card, index) in cards"
          :key="card.id"
          :card="card"
          :focused="focusedCardIds?.includes(card.id)"
          :focus-saving="focusSavingIds?.includes(card.id)"
          :class="{ 'drop-before': isDragOver && dropIndex === index }"
          draggable="true"
          @dragstart="handleDragStart($event, card)"
          @click="emit('select-card', card)"
          @toggle-focus="emit('toggle-focus', $event)"
        />
      </TransitionGroup>
    </div>

    <button class="add-card-btn" @click="showCreateCard = true">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <span>添加卡片</span>
    </button>

    <CreateCardModal v-if="showCreateCard" :list-id="list.id" @close="showCreateCard = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { List } from '@/database/entities/List'
import { Card } from '@/database/entities/Card'
import { useCardStore } from '@/stores/card'
import { useListStore } from '@/stores/list'
import TaskCard from './TaskCard.vue'
import CreateCardModal from './CreateCardModal.vue'

const props = defineProps<{
  list: List
  filteredCards?: Card[]
  focusedCardIds?: number[]
  focusSavingIds?: number[]
}>()

const emit = defineEmits<{
  (e: 'select-card', card: Card): void
  (e: 'toggle-focus', cardId: number): void
  (e: 'cards-changed'): void
  (e: 'list-changed'): void
}>()

const cardStore = useCardStore()
const listStore = useListStore()
const showCreateCard = ref(false)
const columnCardsRef = ref<HTMLElement | null>(null)
const isDragOver = ref(false)
const dropIndex = ref(0)
let dragEnterCounter = 0

const editingTitle = ref(false)
const editingTitleValue = ref('')
const titleInput = ref<HTMLInputElement | null>(null)

function startEditTitle() {
  editingTitle.value = true
  editingTitleValue.value = props.list.name
  setTimeout(() => titleInput.value?.focus(), 0)
}

function cancelEdit() {
  editingTitle.value = false
}

async function saveTitle() {
  if (!editingTitle.value) return
  editingTitle.value = false
  const name = editingTitleValue.value.trim()
  if (!name || name === props.list.name) return
  await listStore.updateList(props.list.id, { name })
  emit('list-changed')
}

const cards = computed(
  () => props.filteredCards ?? cardStore.cards.filter((c) => c.list_id === props.list.id)
)

onMounted(async () => {
  await cardStore.fetchCards(props.list.id)
})

function handleDragStart(event: DragEvent, card: Card) {
  localStorage.setItem('draggedCard', JSON.stringify(card))
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

async function handleDrop(event: DragEvent) {
  isDragOver.value = false
  dragEnterCounter = 0

  const cardData = localStorage.getItem('draggedCard')
  if (!cardData) return

  const container = columnCardsRef.value
  let dropIdx = dropIndex.value
  if (container) {
    const els = container.querySelectorAll('.task-card')
    let idx = els.length
    for (let i = 0; i < els.length; i++) {
      const rect = els[i].getBoundingClientRect()
      if (event.clientY < rect.top + rect.height / 2) {
        idx = i
        break
      }
    }
    dropIdx = idx
  }

  const card: Card = JSON.parse(cardData)
  let targetPosition = dropIdx + 1
  if (card.list_id === props.list.id) {
    const currentIndex = cards.value.findIndex((c) => c.id === card.id)
    if (currentIndex !== -1 && dropIdx > currentIndex) {
      targetPosition = dropIdx
    }
  }
  await cardStore.moveCard(card.id, props.list.id, targetPosition)
  emit('cards-changed')
  localStorage.removeItem('draggedCard')
}

function handleDragEnter() {
  dragEnterCounter++
  isDragOver.value = true
}

function handleDragOver(event: DragEvent) {
  const container = columnCardsRef.value
  if (!container) return

  const scrollZone = 40
  const scrollSpeed = 6
  const containerRect = container.getBoundingClientRect()
  if (event.clientY < containerRect.top + scrollZone) {
    container.scrollTop -= scrollSpeed
  } else if (event.clientY > containerRect.bottom - scrollZone) {
    container.scrollTop += scrollSpeed
  }

  const cardElements = container.querySelectorAll('.task-card')
  let idx = cards.value.length

  for (let i = 0; i < cardElements.length; i++) {
    const rect = cardElements[i].getBoundingClientRect()
    if (event.clientY < rect.top + rect.height / 2) {
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
  await listStore.deleteList(props.list.id)
  cardStore.removeCardsByList(props.list.id)
  emit('list-changed')
}
</script>

<style scoped>
.board-column {
  min-width: 280px;
  max-width: 280px;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px 12px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.board-column:hover {
  border-color: var(--color-border-hover);
}

.board-column.drag-over {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-soft);
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 12px;
}

.column-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-title {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: 0.02em;
  cursor: default;
}

.column-title-input {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: 0.02em;
  padding: 2px 6px;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  outline: none;
  box-shadow: var(--focus-ring);
  min-width: 80px;
}

.column-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  background: var(--color-surface-hover);
  padding: 1px 6px;
  border-radius: 10px;
  line-height: 1.5;
}

.column-menu-btn {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all 0.15s ease;
  opacity: 0;
}

.column-header:hover .column-menu-btn {
  opacity: 1;
}

.column-menu-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.column-divider {
  height: 1px;
  background: var(--color-border);
  margin: 0 0 12px;
}

.column-cards {
  flex: 1;
  min-height: 40px;
  max-height: calc(100vh - 340px);
  overflow-y: auto;
  padding: 0;
}

.card-list-move {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-list-enter-active,
.card-list-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-list-enter-from {
  opacity: 0;
  transform: translateY(-6px) scaleY(0.95);
}

.card-list-leave-to {
  opacity: 0;
  transform: translateY(6px) scaleY(0.95);
}

.task-card.drop-before {
  position: relative;
}

.task-card.drop-before::after {
  content: '';
  position: absolute;
  top: -5px;
  left: 8px;
  right: 8px;
  height: 2px;
  background: var(--color-accent);
  border-radius: 1px;
  z-index: 2;
  animation: dropPulse 1.2s ease-in-out infinite;
}

.column-cards.has-drop-after::after {
  content: '';
  display: block;
  height: 2px;
  background: var(--color-accent);
  border-radius: 1px;
  margin: 4px 8px 0;
  animation: dropPulse 1.2s ease-in-out infinite;
}

@keyframes dropPulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}

.add-card-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 4px;
  margin-top: 8px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-tertiary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.add-card-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
}
</style>
