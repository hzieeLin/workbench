import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { theme } from 'ant-design-vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('theme') !== 'light')

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
        colorBgContainer: isDark.value ? '#1a1a2e' : undefined,
        colorBgLayout: isDark.value ? '#0f0f23' : undefined,
        colorBgElevated: isDark.value ? '#252540' : undefined,
        colorBorder: isDark.value ? 'rgba(255, 255, 255, 0.12)' : undefined,
        colorText: isDark.value ? '#e8e8e8' : undefined,
        colorTextSecondary: isDark.value ? '#a0a0b0' : undefined,
      },
    }
  }

  watch(isDark, (val) => {
    localStorage.setItem('theme', val ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', val)
  }, { immediate: true })

  return { isDark, toggleTheme, getAlgorithm, getThemeConfig }
})
