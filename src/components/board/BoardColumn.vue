<template>
  <a-card
    class="board-column"
    :class="{ 'drag-over': isDragOver }"
    size="small"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
  >
    <template #title>
      <div class="column-title-group">
        <span class="column-bullet" />
        <span>{{ list.name }}</span>
        <a-badge :count="cards.length" :number-style="{ backgroundColor: 'var(--ant-color-text-secondary)' }" />
      </div>
    </template>
    <template #extra>
      <a-dropdown :trigger="['click']">
        <a-button type="text" size="small">
          <template #icon><MoreOutlined /></template>
        </a-button>
        <template #overlay>
          <a-menu>
            <a-menu-item key="delete" danger @click="handleDeleteList">删除列表</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </template>

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
          :class="{ 'drop-before': isDragOver && dropIndex === index }"
          draggable="true"
          @dragstart="handleDragStart($event, card)"
          @click="emit('select-card', card)"
        />
      </TransitionGroup>
    </div>
    <a-button block dashed @click="showCreateCard = true">
      <template #icon><PlusOutlined /></template>
      添加卡片
    </a-button>

    <CreateCardModal v-if="showCreateCard" :list-id="list.id" @close="showCreateCard = false" />
  </a-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { List } from '@/database/entities/List'
import { Card } from '@/database/entities/Card'
import { useCardStore } from '@/stores/card'
import { useListStore } from '@/stores/list'
import TaskCard from './TaskCard.vue'
import CreateCardModal from './CreateCardModal.vue'
import { MoreOutlined, PlusOutlined } from '@ant-design/icons-vue'

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
const columnCardsRef = ref<HTMLElement | null>(null)
const isDragOver = ref(false)
const dropIndex = ref(0)
let dragEnterCounter = 0

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

function handleDrop(event: DragEvent) {
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
  cardStore.moveCard(card.id, props.list.id, targetPosition)
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
}
</script>

<style scoped>
.board-column {
  min-width: 292px;
  max-width: 292px;
  height: 100%;
  min-height: 0;
  transition: border-color 0.2s ease;
}

.board-column:hover {
  border-color: var(--ant-color-border-hover, #40a9ff);
}

.column-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-bullet {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: var(--ant-color-primary, #FF6B4A);
  flex-shrink: 0;
  opacity: 0.6;
}

.column-cards {
  min-height: 40px;
  max-height: calc(100vh - 300px);
  overflow-y: auto;
  margin-bottom: 10px;
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
  background: var(--ant-color-primary, #FF6B4A);
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(255, 107, 74, 0.5);
  z-index: 2;
  animation: indicatorPulse 1.2s ease-in-out infinite;
}

.column-cards.has-drop-after::after {
  content: '';
  display: block;
  height: 3px;
  background: var(--ant-color-primary, #FF6B4A);
  border-radius: 2px;
  margin: 2px 6px 0;
  box-shadow: 0 0 10px rgba(255, 107, 74, 0.5);
  animation: indicatorPulse 1.2s ease-in-out infinite;
}

.board-column.drag-over {
  border-color: var(--ant-color-primary, #FF6B4A);
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
</style>
