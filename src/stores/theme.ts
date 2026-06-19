import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { theme } from 'ant-design-vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('theme') === 'dark')

  function toggleTheme() {
    isDark.value = !isDark.value
  }

  function getAlgorithm() {
    return isDark.value ? theme.darkAlgorithm : theme.defaultAlgorithm
  }

  function getThemeConfig() {
    return {
      algorithm: getAlgorithm(),
      token: {
        colorPrimary: '#FF6B4A',
        borderRadius: 10,
        fontFamily: "'DM Sans', 'Noto Sans CJK SC', 'PingFang SC', sans-serif",
        colorBgContainer: isDark.value ? '#1a1a2e' : '#ffffff',
        colorBgLayout: isDark.value ? '#0f0f23' : '#f0f1f3',
        colorBgElevated: isDark.value ? '#252540' : '#ffffff',
        colorBorder: isDark.value ? 'rgba(255, 255, 255, 0.12)' : '#e0e0e4',
        colorText: isDark.value ? '#e8e8e8' : '#1a1a2e',
        colorTextSecondary: isDark.value ? '#a0a0b0' : '#5a5a72',
      },
    }
  }

  watch(
    isDark,
    (val) => {
      localStorage.setItem('theme', val ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', val)
    },
    { immediate: true }
  )

  return { isDark, toggleTheme, getAlgorithm, getThemeConfig }
})
