import { ref, toValue, watch } from "vue"
import type { Ref } from "vue"
import type { IFlog } from "@/modules/Flog"
import type { IEntry } from '@/modules/EntryData'
import { useFlogSource, IFlogSourceType } from "@/composables/useFlogSource"
import { useOfflineStorage } from "@/composables/useOfflineStorage"
import { usePWA } from "@/composables/usePWA"

/**
 * Enhanced flog composable with offline support
 */
interface IUseFlogWithOffline {
  /**
   * The flog ref
   */
  flog: Ref<IFlog>;
  
  /**
   * Whether the flog is currently offline
   */
  isOffline: Ref<boolean>;
  
  /**
   * Whether the flog has unsaved changes
   */
  hasUnsavedChanges: Ref<boolean>;
  
  /**
   * Updates the flog's pretext and saves the flog to source or offline storage
   */
  updatePretext: (pretext: string) => void;
  
  /**
   * Adds the input entry to the flog's array of entries
   */
  addEntry: (entry: IEntry) => void;
  
  /**
   * Updates the input entry and saves the flog to source or offline storage
   */
  editEntry: (entry: IEntry) => void;
  
  /**
   * Deletes the input entry and saves the flog to source or offline storage
   */
  deleteEntry: (entry: IEntry) => void;
  
  /**
   * Manually sync offline changes
   */
  syncOfflineChanges: () => Promise<void>;
  
  /**
   * Save flog to offline storage
   */
  saveToOffline: () => void;
}

/**
 * Enhanced composable function that manages a single flog with offline support
 */
export const useFlogWithOffline = (inFlog: IFlog | Ref<IFlog>): IUseFlogWithOffline => {
  const { isOnline } = usePWA()
  const { saveFlogToSource } = useFlogSource(IFlogSourceType.dropbox)
  const {
    saveFlogOffline,
    syncOfflineChanges: syncOffline,
    hasOfflineChanges
  } = useOfflineStorage()

  // Use toValue here to make sure we're not chaining a ref
  const flog = ref<IFlog>(toValue(inFlog))
  
  // State
  const isOffline = ref(!isOnline.value)
  const hasUnsavedChanges = ref(false)

  /**
   * Shows the input message in a UI element with class 'message'
   */
  const showMessage = (msg: string) => {
    const el = document.querySelector('.message') as HTMLDivElement;
    if (el) {
      el.textContent = msg;
      el.style.opacity = '1';
      setTimeout(() => {
        el.style.opacity = '0';
      }, 3000);
    }
  };

  /**
   * Save flog to appropriate storage (online or offline)
   */
  const saveFlog = () => {
    if (isOnline.value) {
      try {
        saveFlogToSource(flog.value);
        showMessage('Saved to cloud');
        hasUnsavedChanges.value = false;
      } catch (error) {
        console.error('Failed to save to cloud, saving offline:', error);
        saveFlogOffline(flog.value);
        showMessage('Saved offline');
        hasUnsavedChanges.value = true;
      }
    } else {
      saveFlogOffline(flog.value);
      showMessage('Saved offline');
      hasUnsavedChanges.value = true;
    }
  };

  /**
   * Update pretext with offline support
   */
  const updatePretext = (pretext: string) => {
    flog.value.pretext = pretext;
    hasUnsavedChanges.value = true;
    saveFlog();
  };

  /**
   * Add entry with offline support
   */
  const addEntry = (entry: IEntry) => {
    flog.value.loadedEntries.unshift(entry);
    hasUnsavedChanges.value = true;
    saveFlog();
  };

  /**
   * Edit entry with offline support
   */
  const editEntry = (entry: IEntry) => {
    if (!flog.value || !Array.isArray(flog.value.loadedEntries)) {
      console.error(`EditFlog or flog.value.loadedEntries is undefined or not an array: ${flog.value}`);
      return;
    }
    
    const editEntryIndex = flog.value.loadedEntries.findIndex(flogEntry => flogEntry.id === entry.id);
    if (editEntryIndex !== -1) {
      flog.value.loadedEntries[editEntryIndex] = { ...flog.value.loadedEntries[editEntryIndex], ...entry };
      hasUnsavedChanges.value = true;
      saveFlog();
      showMessage('Entry updated');
    } else {
      console.error('Entry not found in flog.value.loadedEntries');
    }
  };

  /**
   * Delete entry with offline support
   */
  const deleteEntry = (entry: IEntry) => {
    if (!flog.value || !Array.isArray(flog.value.loadedEntries)) {
      console.error('EditFlog.value or flog.value.loadedEntries is undefined or not an array');
      return;
    }
    
    const deleteEntryIndex = flog.value.loadedEntries.findIndex(flogEntry => flogEntry.id === entry.id);
    if (deleteEntryIndex !== -1) {
      flog.value.loadedEntries.splice(deleteEntryIndex, 1);
      hasUnsavedChanges.value = true;
      saveFlog();
      showMessage('Entry deleted');
    } else {
      console.error('Entry not found in flog.value.loadedEntries');
    }
  };

  /**
   * Save flog to offline storage
   */
  const saveToOffline = () => {
    saveFlogOffline(flog.value);
    showMessage('Saved offline');
    hasUnsavedChanges.value = true;
  };

  /**
   * Sync offline changes
   */
  const syncOfflineChanges = async () => {
    if (!isOnline.value) {
      showMessage('Cannot sync while offline');
      return;
    }
    
    try {
      await syncOffline();
      showMessage('Sync completed');
      hasUnsavedChanges.value = false;
    } catch (error) {
      console.error('Sync failed:', error);
      showMessage('Sync failed');
    }
  };

  // Watch for online status changes
  watch(isOnline, (newIsOnline) => {
    isOffline.value = !newIsOnline;
    
    if (newIsOnline && hasUnsavedChanges.value) {
      // Auto-sync when coming back online
      setTimeout(() => {
        syncOfflineChanges();
      }, 1000);
    }
  });

  // Watch for offline changes
  watch(hasOfflineChanges, (newHasOfflineChanges) => {
    if (newHasOfflineChanges && isOnline.value) {
      // Auto-sync when there are offline changes and we're online
      setTimeout(() => {
        syncOfflineChanges();
      }, 2000);
    }
  });

  return {
    flog,
    isOffline,
    hasUnsavedChanges,
    updatePretext,
    addEntry,
    editEntry,
    deleteEntry,
    syncOfflineChanges,
    saveToOffline
  };
}; 