<template>
  <div class="comment-item">
    <div class="comment-header">
      <div class="comment-author">
        <div class="author-avatar">{{ comment.author.charAt(0) }}</div>
        <span class="author-name">{{ comment.author }}</span>
      </div>
      <div class="comment-meta">
        <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
        <button v-if="comment.author === '用户'" @click="handleDelete" class="delete-btn">
          删除
        </button>
      </div>
    </div>
    <div class="comment-content">{{ comment.content }}</div>
  </div>
</template>

<script setup lang="ts">
import type { Comment } from '@/database/entities/Comment'

const props = defineProps<{
  comment: Comment
}>()

const emit = defineEmits<{
  (e: 'delete', id: number): void
}>()

function formatTime(date: Date) {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return new Date(date).toLocaleDateString()
}

function handleDelete() {
  if (confirm('确定要删除这条评论吗？')) {
    emit('delete', props.comment.id)
  }
}
</script>

<style scoped>
.comment-item {
  padding: 12px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.author-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-time {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.delete-btn {
  padding: 2px 6px;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  font-size: 12px;
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.delete-btn:hover {
  background: var(--color-red-soft);
  color: var(--color-red);
}

.comment-content {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text);
  white-space: pre-wrap;
}
</style>
