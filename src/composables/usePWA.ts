import { ref, onMounted, onUnmounted } from 'vue'

export function usePWA() {
  const isOnline = ref(navigator.onLine)
  const isInstalled = ref(false)
  const hasUpdate = ref(false)
  const registration = ref<ServiceWorkerRegistration | null>(null)

  // Check if app is installed as PWA
  const checkInstallation = () => {
    if ('getInstalledRelatedApps' in navigator) {
      // @ts-expect-error - TypeScript doesn't know about this API yet
      navigator.getInstalledRelatedApps().then((apps: unknown[]) => {
        isInstalled.value = apps.length > 0
      })
    }
    
    // Alternative check for standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      isInstalled.value = true
    }
  }

  // Handle online/offline status
  const handleOnline = () => {
    isOnline.value = true
  }

  const handleOffline = () => {
    isOnline.value = false
  }

  // Register service worker
  const registerSW = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js')
        registration.value = reg
        
        // Handle updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                hasUpdate.value = true
              }
            })
          }
        })
        
        return reg
      } catch (error) {
        console.error('Service worker registration failed:', error)
        return null
      }
    }
    return null
  }

  // Update service worker
  const updateSW = async () => {
    if (registration.value && registration.value.waiting) {
      registration.value.waiting.postMessage({ type: 'SKIP_WAITING' })
      hasUpdate.value = false
    }
  }

  // Cache data manually
  const cacheData = async (key: string, data: unknown) => {
    if ('caches' in window) {
      try {
        const cache = await caches.open('flogger-data-v1')
        const response = new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        })
        await cache.put(key, response)
        return true
      } catch (error) {
        console.error('Failed to cache data:', error)
        return false
      }
    }
    return false
  }

  // Get cached data
  const getCachedData = async (key: string) => {
    if ('caches' in window) {
      try {
        const cache = await caches.open('flogger-data-v1')
        const response = await cache.match(key)
        if (response) {
          return await response.json()
        }
      } catch (error) {
        console.error('Failed to get cached data:', error)
      }
    }
    return null
  }

  // Clear cache
  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
        return true
      } catch (error) {
        console.error('Failed to clear cache:', error)
        return false
      }
    }
    return false
  }

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  // Subscribe to push notifications
  const subscribeToPushNotifications = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const reg = await navigator.serviceWorker.ready
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY') // Replace with your VAPID key
        })
        return subscription
      } catch (error) {
        console.error('Failed to subscribe to push notifications:', error)
        return null
      }
    }
    return null
  }

  // Convert VAPID key to Uint8Array
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Install PWA
  const installPWA = () => {
    if ('beforeinstallprompt' in window) {
      // @ts-expect-error - TypeScript doesn't know about this API yet
      const promptEvent = window.deferredPrompt
      if (promptEvent) {
        promptEvent.prompt()
        promptEvent.userChoice.then((choiceResult: { outcome: string }) => {
          if (choiceResult.outcome === 'accepted') {
            isInstalled.value = true
          }
          // @ts-expect-error - deferredPrompt property not in TypeScript definitions
          window.deferredPrompt = null
        })
      }
    }
  }

  onMounted(() => {
    // Register service worker
    registerSW()
    
    // Check installation status
    checkInstallation()
    
    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Handle beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      // @ts-expect-error - deferredPrompt property not in TypeScript definitions
      window.deferredPrompt = e
    })
    
    // Handle appinstalled
    window.addEventListener('appinstalled', () => {
      isInstalled.value = true
    })
  })

  onUnmounted(() => {
    // Remove event listeners
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    isOnline,
    isInstalled,
    hasUpdate,
    registration,
    registerSW,
    updateSW,
    cacheData,
    getCachedData,
    clearCache,
    requestNotificationPermission,
    subscribeToPushNotifications,
    installPWA
  }
} 