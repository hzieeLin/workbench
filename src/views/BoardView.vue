<template>
  <div class="board-view">
    <div class="board-header">
      <h2>{{ currentBoard?.name || '选择一个看板' }}</h2>
      <div class="board-actions">
        <button @click="showCreateList = true">+ 新建列表</button>
      </div>
    </div>
    <div class="board-columns" v-if="currentBoard">
      <BoardColumn
        v-for="list in lists"
        :key="list.id"
        :list="list"
        @select-card="openCardDetail"
      />
    </div>
    <div v-else class="empty-state">
      <p>请从左侧选择一个看板，或创建新看板</p>
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
import { ref, computed, watch } from 'vue'
import { useBoardStore } from '@/stores/board'
import { useListStore } from '@/stores/list'
import { Card } from '@/database/entities/Card'
import BoardColumn from '@/components/board/BoardColumn.vue'
import CreateListModal from '@/components/board/CreateListModal.vue'
import CardDetailModal from '@/components/board/CardDetailModal.vue'

const boardStore = useBoardStore()
const listStore = useListStore()

const showCreateList = ref(false)
const selectedCard = ref<Card | null>(null)

const currentBoard = computed(() => boardStore.currentBoard)
const lists = computed(() => listStore.lists)

watch(currentBoard, async (board) => {
  if (board) {
    await listStore.fetchLists(board.id)
  }
})

function openCardDetail(card: Card) {
  selectedCard.value = card
}
</script>

<style scoped>
.board-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.board-columns {
  flex: 1;
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
}
</style>
