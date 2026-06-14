<template>
  <div class="board-view">
    <div class="board-header">
      <div>
        <p class="eyebrow">任务看板</p>
        <h2>{{ currentBoard?.name || '请选择一个看板' }}</h2>
      </div>
      <div class="board-actions">
        <button :disabled="!currentBoard" @click="showCreateList = true">+ 新建列表</button>
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
  min-width: 0;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 18px;
}

.eyebrow {
  margin-bottom: 6px;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 800;
}

.board-header h2 {
  font-size: 26px;
  line-height: 1.2;
  color: var(--color-text);
}

.board-actions button {
  min-height: 38px;
  padding: 0 16px;
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  background: var(--color-primary);
  color: white;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(36, 120, 106, 0.18);
}

.board-actions button:hover:not(:disabled) {
  background: var(--color-primary-strong);
}

.board-actions button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.board-columns {
  flex: 1;
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 2px 2px 18px;
}

.empty-state {
  flex: 1;
  display: grid;
  place-content: center;
  text-align: center;
  color: var(--color-muted);
  background: rgba(255, 253, 248, 0.62);
  border: 1px dashed var(--color-border);
  border-radius: 8px;
}

.empty-state h3 {
  margin-bottom: 8px;
  color: var(--color-text);
  font-size: 18px;
}

.empty-state p {
  max-width: 360px;
  line-height: 1.7;
}
</style>
