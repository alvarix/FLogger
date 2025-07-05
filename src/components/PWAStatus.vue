<template>
  <div class="pwa-status">
    <!-- Online/Offline Status -->
    <div class="status-indicator" :class="{ 'offline': !isOnline }">
      <span class="status-dot"></span>
      <span class="status-text">{{ isOnline ? 'Online' : 'Offline' }}</span>
    </div>

    <!-- Update Available -->
    <div v-if="hasUpdate" class="update-notification">
      <span class="update-text">Update available</span>
      <button @click="updateSW" class="update-btn">
        Update Now
      </button>
    </div>

    <!-- Install PWA -->
    <div v-if="!isInstalled && isOnline" class="install-notification">
      <span class="install-text">Install Flogger for better experience</span>
      <button @click="installPWA" class="install-btn">
        Install
      </button>
    </div>

    <!-- Cache Management -->
    <div class="cache-controls">
      <button @click="clearCache" class="cache-btn">
        Clear Cache
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePWA } from '@/composables/usePWA'

const {
  isOnline,
  isInstalled,
  hasUpdate,
  updateSW,
  installPWA,
  clearCache
} = usePWA()
</script>

<style scoped>
.pwa-status {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 0.5rem;
  padding: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #059669;
}

.status-indicator.offline {
  color: #dc2626;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.update-notification,
.install-notification {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.update-notification {
  background-color: #fef3c7;
  color: #92400e;
  border: 1px solid #f59e0b;
}

.install-notification {
  background-color: #dbeafe;
  color: #1e40af;
  border: 1px solid #3b82f6;
}

.update-btn,
.install-btn,
.cache-btn {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.update-btn {
  background-color: #f59e0b;
  color: white;
}

.update-btn:hover {
  background-color: #d97706;
}

.install-btn {
  background-color: #3b82f6;
  color: white;
}

.install-btn:hover {
  background-color: #2563eb;
}

.cache-controls {
  display: flex;
  justify-content: center;
}

.cache-btn {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.cache-btn:hover {
  background-color: #e5e7eb;
}

.status-text,
.update-text,
.install-text {
  font-weight: 500;
}

@media (max-width: 640px) {
  .pwa-status {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
    position: fixed;
  }
}
</style> 