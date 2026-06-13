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
  min-width: 280px;
  max-width: 280px;
  background: #f4f5f7;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.column-header {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.column-cards {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
}

.add-card-btn {
  margin: 12px;
  padding: 8px;
  background: none;
  border: 1px dashed #ccc;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
}

.add-card-btn:hover {
  background: #e8e8e8;
}
</style>
