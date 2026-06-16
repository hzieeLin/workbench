<template>
  <a-comment>
    <template #author>
      <span>{{ comment.author }}</span>
    </template>
    <template #avatar>
      <a-avatar size="small" style="background-color: var(--ant-color-primary)">
        {{ comment.author.charAt(0) }}
      </a-avatar>
    </template>
    <template #datetime>
      <span>{{ formatTime(comment.created_at) }}</span>
    </template>
    <template #content>
      <p>{{ comment.content }}</p>
    </template>
    <template #actions>
      <span v-if="comment.author === '用户'" key="delete" @click="handleDelete">
        删除
      </span>
    </template>
  </a-comment>
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
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return new Date(date).toLocaleDateString()
}

function handleDelete() {
  emit('delete', props.comment.id)
}
</script>
