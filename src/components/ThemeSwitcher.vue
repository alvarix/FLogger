// ThemeSwitcher.vue
<template>
    <button class="small" @click="toggleTheme">
      {{ isDark ? '🌙 Dark' : '☀️ Light' }}
    </button>
    <button v-if="!isSystemTheme" class="small" @click="resetToSystem">
      Reset to System
    </button>
    <span v-if="isSystemTheme" class="system-indicator">
     (Following System) 
      
    </span>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme'

const { isDark, isSystemTheme, toggleTheme, resetToSystem } = useTheme()
</script>

<style scoped lang="stylus">
.theme-controls {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top 0
}

.system-indicator {
  font-size: 0.8em;
  opacity: 0.7;
}

button.small 
  margin-top 0
</style>
