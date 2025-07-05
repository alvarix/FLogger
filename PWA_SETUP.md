# PWA Setup for Flogger

This document explains the Progressive Web App (PWA) setup and data caching functionality implemented in Flogger.

## Overview

Flogger now includes comprehensive PWA functionality with:
- Service Worker for offline support
- Data caching for Dropbox API requests
- Static asset caching
- Install prompt for PWA installation
- Offline/online status detection
- Background sync capabilities
- Push notification support (ready for implementation)

## Files Added/Modified

### New Files
- `public/sw.js` - Service Worker for caching and offline functionality
- `src/sw-register.js` - Service Worker registration and management
- `src/composables/usePWA.ts` - Vue composable for PWA functionality
- `src/components/PWAStatus.vue` - UI component showing PWA status
- `PWA_SETUP.md` - This documentation file

### Modified Files
- `vite.config.js` - Added Vite PWA plugin configuration
- `src/main.js` - Added service worker registration
- `public/site.webmanifest` - Enhanced PWA manifest
- `package.json` - Added vite-plugin-pwa dependency

## Caching Strategy

### Data Caching (Network First)
- **Dropbox API requests**: Cached with Network First strategy
  - `api.dropboxapi.com` - 7 days cache, 100 entries max
  - `content.dropboxapi.com` - 30 days cache, 200 entries max
  - `api.dropbox.com` - 7 days cache, 50 entries max
- **Local API requests**: Cached with Network First strategy
- **JSON responses**: Automatically detected and cached

### Static Asset Caching (Cache First)
- **Images**: Cache First strategy, 30 days cache
- **CSS/JS files**: Stale While Revalidate strategy, 7 days cache
- **HTML files**: Cached for offline access

### Manual Caching
Use the `usePWA` composable to manually cache data:

```typescript
import { usePWA } from '@/composables/usePWA'

const { cacheData, getCachedData, clearCache } = usePWA()

// Cache data
await cacheData('my-key', { data: 'value' })

// Retrieve cached data
const data = await getCachedData('my-key')

// Clear all cache
await clearCache()
```

## Usage

### Basic PWA Status
Add the PWA status component to your app:

```vue
<template>
  <div>
    <!-- Your app content -->
    <PWAStatus />
  </div>
</template>

<script setup>
import PWAStatus from '@/components/PWAStatus.vue'
</script>
```

### Using PWA Composable
```typescript
import { usePWA } from '@/composables/usePWA'

const {
  isOnline,
  isInstalled,
  hasUpdate,
  updateSW,
  installPWA,
  cacheData,
  getCachedData,
  clearCache,
  requestNotificationPermission,
  subscribeToPushNotifications
} = usePWA()

// Check online status
console.log('Online:', isOnline.value)

// Install PWA
installPWA()

// Update service worker
updateSW()

// Request notification permission
const hasPermission = await requestNotificationPermission()
```

## Configuration

### Vite PWA Plugin
The PWA plugin is configured in `vite.config.js` with:
- Auto-update registration
- Workbox for service worker generation
- Runtime caching strategies
- Asset inclusion
- Manifest generation

### Service Worker
The service worker (`public/sw.js`) handles:
- Install/activate events
- Fetch interception
- Cache management
- Background sync
- Push notifications

## Testing

### Development
1. Run the development server: `npm run dev`
2. Open browser dev tools
3. Go to Application tab > Service Workers
4. Check that the service worker is registered
5. Test offline functionality by disabling network

### Production
1. Build the app: `npm run build`
2. Serve the built files
3. Test PWA installation
4. Test offline functionality

## Offline Functionality

### What Works Offline
- Static assets (CSS, JS, images)
- Previously cached Dropbox API responses
- App shell (basic UI structure)

### What Doesn't Work Offline
- New Dropbox API requests
- Real-time data updates
- File uploads

## Push Notifications

Push notifications are set up but require:
1. VAPID keys for your domain
2. Server-side implementation
3. Update the VAPID public key in `usePWA.ts`

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Ensure HTTPS (required for service workers)
- Clear browser cache and reload

### Caching Not Working
- Check service worker is active
- Verify cache strategies in dev tools
- Clear existing cache and test

### PWA Installation Not Working
- Ensure manifest is valid
- Check HTTPS requirement
- Verify icons are accessible

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Limited support (iOS 11.3+)
- Mobile browsers: Varies by platform

## Future Enhancements

- Background sync for offline actions
- IndexedDB for larger data storage
- Advanced caching strategies
- Push notification implementation
- Offline-first data architecture

## Security Considerations

- Service workers only work over HTTPS
- Cache data is stored locally
- API keys should not be cached
- Sensitive data should be encrypted before caching

## Performance

- Cached assets load faster
- Reduced network requests
- Better offline experience
- Improved app startup time

## Maintenance

- Monitor cache sizes
- Update cache strategies as needed
- Test offline functionality regularly
- Keep service worker up to date 