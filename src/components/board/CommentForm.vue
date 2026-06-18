<template>
  <div class="comment-form">
    <a-textarea
      v-model:value="content"
      placeholder="添加评论..."
      :auto-size="{ minRows: 3, maxRows: 6 }"
      @keydown.enter.exact="handleSubmit"
    />
    <div class="form-actions">
      <span class="hint">⌘ + Enter 发送</span>
      <a-button type="primary" size="small" :disabled="!content.trim()" @click="handleSubmit">
        发送
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'submit', content: string): void
}>()

const content = ref('')

function handleSubmit() {
  if (!content.value.trim()) return
  emit('submit', content.value.trim())
  content.value = ''
}
</script>

<style scoped>
.comment-form {
  border: 1px solid var(--ant-color-border);
  border-radius: var(--ant-border-radius-lg);
  padding: 12px;
  margin-bottom: 12px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.hint {
  font-size: 12px;
  color: var(--ant-color-text-secondary);
}
</style>
