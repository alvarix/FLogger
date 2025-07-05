import { ref, watch, computed } from 'vue'
import type { Ref } from 'vue'
import type { IFlog } from '@/modules/Flog'
import { serializeFlog, deserializeFlog, IFlogSourceType } from '@/modules/Flog'
import { usePWA } from './usePWA'

export interface IOfflineFlog {
  url: string
  sourceType: IFlogSourceType
  content: string
  lastModified: number
  isDirty: boolean
  originalRev?: string
}

export interface ISyncQueueItem {
  id: string
  flogUrl: string
  operation: 'save' | 'delete' | 'add'
  data?: unknown
  timestamp: number
  retryCount: number
}

export interface IUseOfflineStorage {
  // State
  offlineFlogs: Ref<Map<string, IOfflineFlog>>
  syncQueue: Ref<ISyncQueueItem[]>
  isSyncing: Ref<boolean>
  lastSyncTime: Ref<number | null>
  
  // Computed
  hasOfflineChanges: Ref<boolean>
  offlineFlogsList: Ref<IFlog[]>
  
  // Methods
  saveFlogOffline: (flog: IFlog) => void
  loadFlogFromOffline: (url: string) => IFlog | null
  deleteFlogOffline: (url: string) => void
  markFlogDirty: (url: string) => void
  syncOfflineChanges: () => Promise<void>
  clearOfflineData: () => void
  getOfflineFlog: (url: string) => IOfflineFlog | null
}

const STORAGE_KEYS = {
  OFFLINE_FLOGS: 'flogger_offline_flogs',
  SYNC_QUEUE: 'flogger_sync_queue',
  LAST_SYNC: 'flogger_last_sync'
}

const MAX_RETRY_COUNT = 3
const SYNC_DELAY = 1000 // 1 second between retries

export function useOfflineStorage(): IUseOfflineStorage {
  const { isOnline } = usePWA()
  
  // State
  const offlineFlogs = ref<Map<string, IOfflineFlog>>(new Map())
  const syncQueue = ref<ISyncQueueItem[]>([])
  const isSyncing = ref(false)
  const lastSyncTime = ref<number | null>(null)
  
  // Computed
  const hasOfflineChanges = computed(() => {
    return Array.from(offlineFlogs.value.values()).some(flog => flog.isDirty) ||
           syncQueue.value.length > 0
  })
  
  const offlineFlogsList = computed(() => {
    return Array.from(offlineFlogs.value.values()).map(offlineFlog => {
      const { loadedEntries, pretext, status } = deserializeFlog(offlineFlog.content)
      return {
        url: offlineFlog.url,
        sourceType: offlineFlog.sourceType,
        loadedEntries,
        pretext,
        status,
        rawContent: offlineFlog.content,
        modified: new Date(offlineFlog.lastModified),
        readOnly: false
      } as IFlog
    })
  })
  
  // Load data from localStorage on initialization
  const loadFromStorage = () => {
    try {
      const storedFlogs = localStorage.getItem(STORAGE_KEYS.OFFLINE_FLOGS)
      if (storedFlogs) {
        const parsed = JSON.parse(storedFlogs)
        offlineFlogs.value = new Map(Object.entries(parsed))
      }
      
      const storedQueue = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE)
      if (storedQueue) {
        syncQueue.value = JSON.parse(storedQueue)
      }
      
      const storedLastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC)
      if (storedLastSync) {
        lastSyncTime.value = parseInt(storedLastSync)
      }
    } catch (error) {
      console.error('Failed to load offline data from localStorage:', error)
    }
  }
  
  // Save data to localStorage
  const saveToStorage = () => {
    try {
      const flogsObject = Object.fromEntries(offlineFlogs.value)
      localStorage.setItem(STORAGE_KEYS.OFFLINE_FLOGS, JSON.stringify(flogsObject))
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(syncQueue.value))
      if (lastSyncTime.value) {
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, lastSyncTime.value.toString())
      }
    } catch (error) {
      console.error('Failed to save offline data to localStorage:', error)
    }
  }
  
  // Save flog to offline storage
  const saveFlogOffline = (flog: IFlog) => {
    const content = serializeFlog(flog.loadedEntries, flog.pretext)
    const offlineFlog: IOfflineFlog = {
      url: flog.url,
      sourceType: flog.sourceType,
      content,
      lastModified: Date.now(),
      isDirty: true,
      originalRev: (flog as { rev?: string }).rev
    }
    
    offlineFlogs.value.set(flog.url, offlineFlog)
    saveToStorage()
    
    // Add to sync queue if online
    if (isOnline.value) {
      addToSyncQueue(flog.url, 'save', { flog })
    }
  }
  
  // Load flog from offline storage
  const loadFlogFromOffline = (url: string): IFlog | null => {
    const offlineFlog = offlineFlogs.value.get(url)
    if (!offlineFlog) return null
    
    const { loadedEntries, pretext, status } = deserializeFlog(offlineFlog.content)
    return {
      url: offlineFlog.url,
      sourceType: offlineFlog.sourceType,
      loadedEntries,
      pretext,
      status,
      rawContent: offlineFlog.content,
      modified: new Date(offlineFlog.lastModified),
      readOnly: false
    } as IFlog
  }
  
  // Delete flog from offline storage
  const deleteFlogOffline = (url: string) => {
    offlineFlogs.value.delete(url)
    saveToStorage()
    
    // Add to sync queue if online
    if (isOnline.value) {
      addToSyncQueue(url, 'delete')
    }
  }
  
  // Mark flog as dirty (has unsaved changes)
  const markFlogDirty = (url: string) => {
    const offlineFlog = offlineFlogs.value.get(url)
    if (offlineFlog) {
      offlineFlog.isDirty = true
      offlineFlog.lastModified = Date.now()
      saveToStorage()
    }
  }
  
  // Add item to sync queue
  const addToSyncQueue = (flogUrl: string, operation: 'save' | 'delete' | 'add', data?: unknown) => {
    const queueItem: ISyncQueueItem = {
      id: `${Date.now()}_${Math.random()}`,
      flogUrl,
      operation,
      data,
      timestamp: Date.now(),
      retryCount: 0
    }
    
    syncQueue.value.push(queueItem)
    saveToStorage()
  }
  
  // Sync offline changes with the server
  const syncOfflineChanges = async () => {
    if (isSyncing.value || !isOnline.value || syncQueue.value.length === 0) {
      return
    }
    
    isSyncing.value = true
    
    try {
      // Process sync queue
      const itemsToProcess = [...syncQueue.value]
      
      for (const item of itemsToProcess) {
        try {
          await processSyncItem(item)
          
          // Remove successful item from queue
          syncQueue.value = syncQueue.value.filter(qItem => qItem.id !== item.id)
          
          // Mark corresponding offline flog as clean if it was a save operation
          if (item.operation === 'save') {
            const offlineFlog = offlineFlogs.value.get(item.flogUrl)
            if (offlineFlog) {
              offlineFlog.isDirty = false
            }
          }
          
          // Small delay between operations
          await new Promise(resolve => setTimeout(resolve, SYNC_DELAY))
          
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error)
          
          // Increment retry count
          item.retryCount++
          
          // Remove item if max retries exceeded
          if (item.retryCount >= MAX_RETRY_COUNT) {
            syncQueue.value = syncQueue.value.filter(qItem => qItem.id !== item.id)
            console.error(`Max retries exceeded for sync item ${item.id}`)
          }
        }
      }
      
      lastSyncTime.value = Date.now()
      saveToStorage()
      
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      isSyncing.value = false
    }
  }
  
  // Process individual sync queue item
  const processSyncItem = async (item: ISyncQueueItem) => {
    console.log(`Processing sync item: ${item.operation} for ${item.flogUrl}`)
    
    // Import the actual save operations
    const { useFlogSource } = await import('@/composables/useFlogSource')
    const { IFlogSourceType } = await import('@/modules/Flog')
    
    const flogSource = useFlogSource(IFlogSourceType.dropbox)
    
    try {
      switch (item.operation) {
        case 'save': {
          if (item.data && typeof item.data === 'object' && 'flog' in item.data) {
            flogSource.saveFlogToSource(item.data.flog as IFlog)
          }
          break
        }
        case 'delete': {
          // For delete operations, we need the full flog object
          const offlineFlog = offlineFlogs.value.get(item.flogUrl)
          if (offlineFlog) {
            const { loadedEntries, pretext, status } = deserializeFlog(offlineFlog.content)
            const flog = {
              url: offlineFlog.url,
              sourceType: offlineFlog.sourceType,
              loadedEntries,
              pretext,
              status,
              rawContent: offlineFlog.content,
              modified: new Date(offlineFlog.lastModified),
              readOnly: false
            } as IFlog
            flogSource.deleteFlogFromSource(flog)
          }
          break
        }
        case 'add': {
          if (item.data && typeof item.data === 'object' && 'flog' in item.data) {
            flogSource.addFlogToSource(item.data.flog as IFlog)
          }
          break
        }
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.error(`Failed to process sync item ${item.id}:`, error)
      throw error
    }
  }
  
  // Clear all offline data
  const clearOfflineData = () => {
    offlineFlogs.value.clear()
    syncQueue.value = []
    lastSyncTime.value = null
    
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_FLOGS)
    localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE)
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC)
  }
  
  // Get offline flog by URL
  const getOfflineFlog = (url: string): IOfflineFlog | null => {
    return offlineFlogs.value.get(url) || null
  }
  
  // Watch for online status changes and trigger sync
  watch(isOnline, (newIsOnline) => {
    if (newIsOnline && hasOfflineChanges.value) {
      // Small delay to ensure connection is stable
      setTimeout(() => {
        syncOfflineChanges()
      }, 1000)
    }
  })
  
  // Auto-save to localStorage when data changes
  watch([offlineFlogs, syncQueue], () => {
    saveToStorage()
  }, { deep: true })
  
  // Load data on initialization
  loadFromStorage()
  
  return {
    offlineFlogs,
    syncQueue,
    isSyncing,
    lastSyncTime,
    hasOfflineChanges,
    offlineFlogsList,
    saveFlogOffline,
    loadFlogFromOffline,
    deleteFlogOffline,
    markFlogDirty,
    syncOfflineChanges,
    clearOfflineData,
    getOfflineFlog
  }
} 