<template>
  <div class="offline-status" :class="{ 'has-changes': hasOfflineChanges }">
    <!-- Online/Offline Indicator -->
    <div class="status-indicator" :class="{ 'offline': !isOnline }">
      <span class="status-dot"></span>
      <span class="status-text">{{ isOnline ? 'Online' : 'Offline' }}</span>
    </div>

    <!-- Offline Changes Indicator -->
    <div v-if="hasOfflineChanges" class="offline-changes">
      <span class="changes-text">
        {{ syncQueue.length > 0 ? `${syncQueue.length} pending sync` : 'Offline changes' }}
      </span>
      
      <!-- Sync Progress -->
      <div v-if="isSyncing" class="sync-progress">
        <div class="spinner"></div>
        <span>Syncing...</span>
      </div>
      
      <!-- Manual Sync Button -->
      <button 
        v-else-if="isOnline" 
        @click="syncOfflineChanges" 
        class="sync-btn"
        :disabled="isSyncing"
      >
        Sync Now
      </button>
    </div>

    <!-- Last Sync Time -->
    <div v-if="lastSyncTime" class="last-sync">
      <span class="sync-time">
        Last sync: {{ formatTime(lastSyncTime) }}
      </span>
    </div>

    <!-- Offline Storage Info -->
    <div v-if="offlineFlogs.size > 0" class="offline-storage">
      <span class="storage-text">
        {{ offlineFlogs.size }} flog{{ offlineFlogs.size !== 1 ? 's' : '' }} offline
      </span>
      <button @click="clearOfflineData" class="clear-btn">
        Clear
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOfflineStorage } from '@/composables/useOfflineStorage'
import { usePWA } from '@/composables/usePWA'

const {
  offlineFlogs,
  syncQueue,
  isSyncing,
  lastSyncTime,
  hasOfflineChanges,
  syncOfflineChanges,
  clearOfflineData
} = useOfflineStorage()

const { isOnline } = usePWA()

// Format timestamp for display
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}
</script>

<style scoped>
.offline-status {
  position: fixed;
  top: 1rem;
  left: 1rem;
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
  min-width: 200px;
  transition: all 0.3s ease;
}

.offline-status.has-changes {
  border-color: #f59e0b;
  background: rgba(255, 251, 235, 0.95);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #059669;
  font-weight: 500;
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

.offline-changes {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #f59e0b;
}

.changes-text {
  font-weight: 500;
}

.sync-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #059669;
}

.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #059669;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.sync-btn {
  background: #059669;
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sync-btn:hover:not(:disabled) {
  background: #047857;
}

.sync-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.last-sync {
  font-size: 0.75rem;
  color: #6b7280;
}

.sync-time {
  font-style: italic;
}

.offline-storage {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #374151;
}

.storage-text {
  font-weight: 500;
}

.clear-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-btn:hover {
  background: #dc2626;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .offline-status {
    top: 0.5rem;
    left: 0.5rem;
    right: 0.5rem;
    min-width: auto;
  }
}
</style> 