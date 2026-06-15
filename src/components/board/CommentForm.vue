<template>
  <div class="comment-form">
    <textarea
      v-model="content"
      placeholder="添加评论..."
      @keydown.enter.meta="handleSubmit"
      @keydown.enter.ctrl="handleSubmit"
    />
    <div class="form-actions">
      <span class="hint">⌘ + Enter 发送</span>
      <button @click="handleSubmit" :disabled="!content.trim()" class="btn-primary">发送</button>
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
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px;
}

.comment-form textarea {
  width: 100%;
  min-height: 80px;
  padding: 8px;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 14px;
  resize: vertical;
  outline: none;
}

.comment-form textarea::placeholder {
  color: var(--color-text-tertiary);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.hint {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.btn-primary {
  padding: 6px 12px;
  border: 1px solid var(--color-accent);
  background: var(--color-accent);
  color: white;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-accent-strong);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
