import { defineStore } from 'pinia'
import { ref } from 'vue'
import { theme } from 'ant-design-vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(true)

  function toggleTheme() {
    isDark.value = !isDark.value
  }

  function getAlgorithm() {
    return isDark.value ? theme.darkAlgorithm : theme.defaultAlgorithm
  }

  return { isDark, toggleTheme, getAlgorithm }
})
