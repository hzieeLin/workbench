<template>
  <div class="comment-section">
    <h4>评论 ({{ comments.length }})</h4>

    <div class="comment-list">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        @delete="deleteComment"
      />
    </div>

    <CommentForm @submit="addComment" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCommentStore } from '@/stores/comment'
import CommentItem from './CommentItem.vue'
import CommentForm from './CommentForm.vue'

const props = defineProps<{
  cardId: number
}>()

const commentStore = useCommentStore()
const comments = ref(commentStore.comments)

onMounted(async () => {
  await commentStore.fetchComments(props.cardId)
  comments.value = commentStore.comments
})

async function addComment(content: string) {
  await commentStore.createComment(props.cardId, content)
  comments.value = commentStore.comments
}

async function deleteComment(id: number) {
  await commentStore.deleteComment(id)
  comments.value = commentStore.comments
}
</script>

<style scoped>
.comment-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}

.comment-section h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--color-text-secondary);
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}
</style>
