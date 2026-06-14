<template>
  <div class="board-column" @dragover.prevent @drop="handleDrop">
    <div class="column-header">
      <h3>{{ list.name }}</h3>
      <button class="btn-icon" @click="showMenu = !showMenu">⋯</button>
    </div>
    <div class="column-cards">
      <TaskCard
        v-for="card in cards"
        :key="card.id"
        :card="card"
        draggable="true"
        @dragstart="handleDragStart(card)"
        @click="emit('select-card', card)"
      />
    </div>
    <button class="add-card-btn" @click="showCreateCard = true">+ 添加卡片</button>

    <CreateCardModal v-if="showCreateCard" :list-id="list.id" @close="showCreateCard = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { List } from '@/database/entities/List'
import { Card } from '@/database/entities/Card'
import { useCardStore } from '@/stores/card'
import TaskCard from './TaskCard.vue'
import CreateCardModal from './CreateCardModal.vue'

const props = defineProps<{
  list: List
}>()

const emit = defineEmits<{
  (e: 'select-card', card: Card): void
}>()

const cardStore = useCardStore()
const showCreateCard = ref(false)
const showMenu = ref(false)

const cards = computed(() => cardStore.cards.filter((c) => c.list_id === props.list.id))

onMounted(async () => {
  await cardStore.fetchCards(props.list.id)
})

function handleDragStart(card: Card) {
  localStorage.setItem('draggedCard', JSON.stringify(card))
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  const cardData = localStorage.getItem('draggedCard')
  if (cardData) {
    const card: Card = JSON.parse(cardData)
    cardStore.moveCard(card.id, props.list.id, cards.value.length + 1)
    localStorage.removeItem('draggedCard')
  }
}
</script>

<style scoped>
.board-column {
  min-width: 292px;
  max-width: 292px;
  background: rgba(255, 253, 248, 0.82);
  border: 1px solid var(--color-border-soft);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  box-shadow: var(--shadow-soft);
}

.column-header {
  padding: 14px 14px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.column-header h3 {
  font-size: 15px;
  color: var(--color-text);
}

.btn-icon {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
}

.btn-icon:hover {
  background: var(--color-surface-soft);
  border-color: var(--color-border-soft);
}

.column-cards {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
}

.add-card-btn {
  margin: 12px;
  min-height: 36px;
  padding: 8px;
  background: rgba(36, 120, 106, 0.05);
  border: 1px dashed rgba(36, 120, 106, 0.35);
  border-radius: 8px;
  cursor: pointer;
  color: var(--color-primary-strong);
  font-weight: 700;
}

.add-card-btn:hover {
  background: var(--color-primary-soft);
}
</style>
