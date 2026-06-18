<template>
  <section class="today-focus" :class="{ collapsed }" aria-label="今日聚焦">
    <div class="focus-heading">
      <div class="focus-orbit" aria-hidden="true"><span /></div>
      <div class="focus-title-group">
        <div class="focus-title-line">
          <h3>今日聚焦</h3>
          <span class="focus-count">{{ items.length }}</span>
          <span v-if="overdueCount" class="overdue-count">{{ overdueCount }} 项逾期</span>
        </div>
        <p v-if="!collapsed && items.length > 3" class="focus-advice">
          建议保留最重要的 3 项
        </p>
      </div>
      <button
        class="collapse-button"
        type="button"
        :aria-label="collapsed ? '展开今日聚焦' : '折叠今日聚焦'"
        @click="emit('update:collapsed', !collapsed)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M3 5.5L7 9.5L11 5.5"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <div v-if="!collapsed" class="focus-body">
      <div v-if="loading" class="focus-state">正在整理今天的任务…</div>
      <div v-else-if="error" class="focus-state error-state">
        <span>聚焦任务加载失败</span>
        <button data-testid="focus-retry" type="button" @click="emit('retry')">重新加载</button>
      </div>
      <template v-else>
        <div v-if="items.length" class="focus-track">
          <article
            v-for="item in items"
            :key="item.card.id"
            class="focus-card"
            :class="{ overdue: item.overdue }"
            :data-testid="`focus-card-${item.card.id}`"
            tabindex="0"
            @click="emit('open-card', item.card)"
            @keydown.enter="emit('open-card', item.card)"
          >
            <span class="focus-card-status" />
            <span class="focus-card-title">{{ item.card.title }}</span>
            <span v-if="item.overdue" class="overdue-label">逾期</span>
            <button
              class="remove-button"
              type="button"
              :data-testid="`focus-remove-${item.card.id}`"
              title="移出今日聚焦"
              @click.stop="emit('exclude', item.card.id)"
            >
              ×
            </button>
          </article>
        </div>
        <div v-else class="focus-state empty-state">今天还没有聚焦任务</div>

        <div class="picker-wrap">
          <button
            class="picker-toggle"
            data-testid="focus-picker-toggle"
            type="button"
            @click="pickerOpen = !pickerOpen"
          >
            <span>＋</span>选择任务
          </button>
          <div v-if="pickerOpen" class="focus-picker">
            <input v-model="query" type="search" placeholder="搜索当前看板任务" />
            <div class="picker-options">
              <button
                v-for="card in availableCards"
                :key="card.id"
                type="button"
                :data-testid="`focus-option-${card.id}`"
                @click="selectCard(card.id)"
              >
                {{ card.title }}
              </button>
              <p v-if="!availableCards.length">没有可加入的任务</p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Card } from '@/database/entities/Card'
import type { FocusItem } from '@/stores/focus'

const props = withDefaults(
  defineProps<{
    items: FocusItem[]
    cards: Card[]
    completedListIds: number[]
    overdueCount: number
    loading?: boolean
    error?: string | null
    collapsed?: boolean
  }>(),
  {
    loading: false,
    error: null,
    collapsed: false,
  }
)

const emit = defineEmits<{
  'open-card': [card: Card]
  include: [cardId: number]
  exclude: [cardId: number]
  retry: []
  'update:collapsed': [value: boolean]
}>()

const pickerOpen = ref(false)
const query = ref('')

const availableCards = computed(() => {
  const focusedIds = new Set(props.items.map((item) => item.card.id))
  const completedIds = new Set(props.completedListIds)
  const keyword = query.value.trim().toLowerCase()
  return props.cards.filter(
    (card) =>
      !focusedIds.has(card.id) &&
      !completedIds.has(card.list_id) &&
      (!keyword || card.title.toLowerCase().includes(keyword))
  )
})

function selectCard(cardId: number) {
  emit('include', cardId)
  pickerOpen.value = false
  query.value = ''
}
</script>

<style scoped>
.today-focus {
  position: relative;
  margin-bottom: 16px;
  padding: 13px 16px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.today-focus.collapsed {
  padding-block: 10px;
}

.focus-heading {
  display: flex;
  align-items: center;
  gap: 11px;
}

.focus-orbit {
  position: relative;
  width: 24px;
  height: 24px;
  border: 1px solid color-mix(in srgb, var(--color-accent) 44%, transparent);
  border-radius: 50%;
}

.focus-orbit::before,
.focus-orbit::after {
  position: absolute;
  left: 50%;
  width: 1px;
  height: 4px;
  content: '';
  background: var(--color-accent);
  transform: translateX(-50%);
}

.focus-orbit::before {
  top: -3px;
}

.focus-orbit::after {
  bottom: -3px;
}

.focus-orbit span {
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 10px color-mix(in srgb, var(--color-accent) 45%, transparent);
}

.focus-title-group {
  min-width: 0;
}

.focus-title-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.focus-title-line h3 {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 650;
  color: var(--color-text);
}

.focus-count,
.overdue-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
}

.focus-count {
  color: var(--color-text-tertiary);
}

.overdue-count {
  padding: 2px 6px;
  color: var(--color-red);
  background: var(--color-red-soft);
  border-radius: 999px;
}

.focus-advice {
  margin-top: 2px;
  font-size: 11px;
  color: var(--color-text-tertiary);
}

.collapse-button {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  margin-left: auto;
  color: var(--color-text-tertiary);
  background: transparent;
  border: 0;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.collapse-button:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.collapsed .collapse-button svg {
  transform: rotate(-90deg);
}

.focus-body {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding-left: 35px;
}

.focus-track {
  display: flex;
  flex: 1;
  gap: 8px;
  min-width: 0;
  overflow-x: auto;
  padding: 1px;
}

.focus-card {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 176px;
  max-width: 240px;
  padding: 8px 9px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;
}

.focus-card:hover,
.focus-card:focus-visible {
  border-color: var(--color-accent);
  outline: none;
  transform: translateY(-1px);
}

.focus-card-status {
  width: 5px;
  height: 5px;
  flex: 0 0 auto;
  background: var(--color-accent);
  border-radius: 50%;
}

.focus-card.overdue .focus-card-status {
  background: var(--color-red);
}

.focus-card-title {
  overflow: hidden;
  font-size: 12px;
  font-weight: 550;
  color: var(--color-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.overdue-label {
  margin-left: auto;
  font-size: 10px;
  color: var(--color-red);
}

.remove-button {
  width: 20px;
  height: 20px;
  padding: 0;
  color: var(--color-text-tertiary);
  background: transparent;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
}

.remove-button:hover {
  color: var(--color-red);
  background: var(--color-red-soft);
}

.focus-state {
  flex: 1;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.error-state {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-red);
}

.error-state button,
.picker-toggle {
  color: var(--color-accent);
  background: transparent;
  border: 0;
  cursor: pointer;
}

.picker-wrap {
  position: relative;
  flex: 0 0 auto;
}

.picker-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 9px;
  font-size: 12px;
  border: 1px dashed var(--color-border-hover);
  border-radius: var(--radius-md);
}

.picker-toggle:hover {
  background: var(--color-accent-soft);
  border-color: var(--color-accent);
}

.focus-picker {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 120;
  width: 240px;
  padding: 8px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

.focus-picker input {
  width: 100%;
  padding: 7px 9px;
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
}

.focus-picker input:focus {
  border-color: var(--color-accent);
  box-shadow: var(--focus-ring);
}

.picker-options {
  display: grid;
  gap: 3px;
  max-height: 220px;
  margin-top: 6px;
  overflow-y: auto;
}

.picker-options button {
  padding: 7px 8px;
  overflow: hidden;
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: transparent;
  border: 0;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.picker-options button:hover {
  color: var(--color-accent);
  background: var(--color-accent-soft);
}

.picker-options p {
  padding: 10px 8px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

@media (max-width: 760px) {
  .focus-body {
    align-items: stretch;
    flex-direction: column;
    padding-left: 0;
  }

  .focus-track {
    width: 100%;
  }

  .picker-wrap {
    align-self: flex-start;
  }

  .focus-picker {
    right: auto;
    left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .focus-card {
    transition: none;
  }
}
</style>
