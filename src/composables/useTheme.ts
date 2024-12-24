// useTheme.ts
import { ref, onMounted, onUnmounted, watch } from 'vue'

export function useTheme() {
  const isDark = ref(false)
  const isSystemTheme = ref(true)
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const updateThemeFromSystem = (event?: MediaQueryListEvent | MediaQueryList) => {
    const systemPrefersDark = event?.matches ?? mediaQuery.matches;
    if (isSystemTheme.value) {
      isDark.value = systemPrefersDark;
      document.documentElement.style.colorScheme = systemPrefersDark ? 'dark' : 'light';
    }
  }

  const toggleTheme = () => {
    isSystemTheme.value = false
    isDark.value = !isDark.value
    savePreference()
  }

  const resetToSystem = () => {
    isSystemTheme.value = true
    isDark.value = mediaQuery.matches
    localStorage.removeItem('theme-preference')
    localStorage.removeItem('theme-mode')
  }

  const savePreference = () => {
    localStorage.setItem('theme-mode', isSystemTheme.value ? 'system' : 'manual')
    if (!isSystemTheme.value) {
      localStorage.setItem('theme-preference', isDark.value ? 'dark' : 'light')
    }
  }

  const loadSavedPreference = () => {
    const savedMode = localStorage.getItem('theme-mode')
    if (savedMode === 'manual') {
      isSystemTheme.value = false
      isDark.value = localStorage.getItem('theme-preference') === 'dark'
    } else {
      resetToSystem()
    }
  }

  onMounted(() => {
    loadSavedPreference()
    mediaQuery.addEventListener('change', updateThemeFromSystem)
  })

  onUnmounted(() => {
    mediaQuery.removeEventListener('change', updateThemeFromSystem)
  })

  watch(isDark, () => {
    document.documentElement.style.colorScheme = isDark.value ? 'dark' : 'light'
  })

  return {
    isDark,
    isSystemTheme,
    toggleTheme,
    resetToSystem
  }
}