# Offline Editing Features

Flogger now supports offline editing with automatic synchronization when back online. This allows you to continue editing your flogs even when you don't have an internet connection.

## Features

### Offline Storage
- **localStorage-based storage**: All flog content is stored locally in the browser's localStorage
- **Automatic saving**: Changes are automatically saved to offline storage
- **Persistent data**: Offline data persists across browser sessions

### Offline Editing
- **Seamless editing**: Edit flogs normally - the app automatically detects online/offline status
- **Real-time indicators**: Visual indicators show when you're offline or have unsaved changes
- **No data loss**: All changes are preserved locally until sync

### Automatic Synchronization
- **Background sync**: Changes are automatically synced when connection is restored
- **Queue management**: Failed sync operations are queued and retried
- **Conflict resolution**: Handles sync conflicts gracefully

### Visual Indicators
- **Online/Offline status**: Clear indication of connection status
- **Sync progress**: Shows when synchronization is in progress
- **Pending changes**: Indicates when there are unsaved offline changes

## How It Works

### When Online
1. Changes are saved directly to Dropbox
2. If save fails, changes are stored offline
3. Offline changes are queued for sync

### When Offline
1. All changes are saved to localStorage
2. Visual indicators show offline status
3. Changes are queued for sync when back online

### When Coming Back Online
1. Automatic sync of queued changes
2. Visual feedback during sync process
3. Confirmation when sync completes

## Components Added

### `useOfflineStorage` Composable
- Manages localStorage for flog data
- Handles sync queue and retry logic
- Provides offline/online state management

### `useFlogWithOffline` Composable
- Enhanced version of `useFlog` with offline support
- Automatically saves to appropriate storage (online/offline)
- Provides offline status indicators

### `OfflineStatus` Component
- Shows online/offline status
- Displays sync progress and pending changes
- Provides manual sync button
- Shows last sync time

## Usage

### For Users
1. **Normal editing**: Just edit flogs as usual - the app handles offline/online automatically
2. **Manual sync**: Click "Sync Now" button in the offline status panel if needed
3. **Clear offline data**: Use the "Clear" button to remove all offline data

### For Developers
```typescript
// Use the enhanced flog composable
import { useFlogWithOffline } from '@/composables/useFlogWithOffline'

const { 
  flog, 
  isOffline, 
  hasUnsavedChanges, 
  syncOfflineChanges 
} = useFlogWithOffline(flogData)

// Check offline status
if (isOffline.value) {
  console.log('Currently offline')
}

// Manual sync
await syncOfflineChanges()
```

## Storage Structure

### localStorage Keys
- `flogger_offline_flogs`: Stores flog content and metadata
- `flogger_sync_queue`: Stores pending sync operations
- `flogger_last_sync`: Stores timestamp of last successful sync

### Data Format
```typescript
interface IOfflineFlog {
  url: string
  sourceType: IFlogSourceType
  content: string
  lastModified: number
  isDirty: boolean
  originalRev?: string
}

interface ISyncQueueItem {
  id: string
  flogUrl: string
  operation: 'save' | 'delete' | 'add'
  data?: unknown
  timestamp: number
  retryCount: number
}
```

## Error Handling

### Network Failures
- Failed operations are queued for retry
- Maximum 3 retry attempts per operation
- Failed operations are logged for debugging

### Storage Failures
- localStorage errors are caught and logged
- Graceful degradation when storage is unavailable
- User is notified of storage issues

### Sync Conflicts
- Last-write-wins strategy for conflicts
- Offline changes take precedence
- Conflicts are logged for review

## Browser Support

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 11.3+)
- **Mobile browsers**: Varies by platform

## Limitations

- **Storage limits**: localStorage has size limits (typically 5-10MB)
- **Single device**: Offline data is device-specific
- **No real-time sync**: Changes are synced when connection is restored
- **No conflict resolution UI**: Conflicts are resolved automatically

## Future Enhancements

- **IndexedDB support**: For larger offline storage
- **Multi-device sync**: Sync across multiple devices
- **Conflict resolution UI**: Manual conflict resolution
- **Offline-first architecture**: Optimize for offline usage
- **Background sync API**: Use service worker for background sync

## Testing

### Offline Testing
1. Open browser dev tools
2. Go to Network tab
3. Check "Offline" checkbox
4. Make changes to flogs
5. Verify changes are saved offline
6. Uncheck "Offline" to test sync

### Sync Testing
1. Make changes while offline
2. Come back online
3. Verify changes sync automatically
4. Check sync queue is cleared

### Storage Testing
1. Fill localStorage with data
2. Try to save new flogs
3. Verify error handling
4. Test storage cleanup

## Troubleshooting

### Sync Not Working
- Check network connection
- Verify Dropbox authentication
- Check browser console for errors
- Try manual sync button

### Offline Data Missing
- Check localStorage in dev tools
- Verify no storage errors
- Check if data was cleared manually

### Performance Issues
- Clear old offline data
- Check localStorage size
- Monitor sync queue size
- Restart browser if needed 