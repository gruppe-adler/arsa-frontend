import { ref, watch } from 'vue'

const STORAGE_KEY = 'arsa-theme'

export type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')

function initTheme() {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  theme.value = stored || (prefersDark ? 'dark' : 'light')
  applyTheme(theme.value)
}

function applyTheme(newTheme: Theme) {
  document.documentElement.setAttribute('data-theme', newTheme)
}

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

watch(theme, (newTheme) => {
  localStorage.setItem(STORAGE_KEY, newTheme)
  applyTheme(newTheme)
})

export function useTheme() {
  return {
    theme,
    toggleTheme,
    initTheme
  }
}
