<template>
  <div class="comment-section">
    <h4>评论 ({{ comments.length }})</h4>

    <CommentForm @submit="addComment" />

    <a-list :data-source="reversedComments" size="small" class="comment-list">
      <template #renderItem="{ item: comment }">
        <CommentItem :comment="comment" @delete="deleteComment" />
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCommentStore } from '@/stores/comment'
import CommentItem from './CommentItem.vue'
import CommentForm from './CommentForm.vue'

const props = defineProps<{
  cardId: number
}>()

const commentStore = useCommentStore()
const comments = ref(commentStore.comments)

const reversedComments = computed(() => [...comments.value].reverse())

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
  display: flex;
  flex-direction: column;
  height: 100%;
}

.comment-section h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--ant-color-text-secondary, rgba(0,0,0,0.45));
}

.comment-list {
  background: transparent;
}
</style>
