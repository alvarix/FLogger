import { ref, watch } from "vue"
import type { IFlog } from "@/modules/Flog"
import { IFlogStatus } from "@/modules/Flog"
import { IEntry } from '@/modules/EntryData'
import { useDropboxFlogs, IDropboxFlog } from "@/composables/useDropboxFlogs";

// Re-export these for convenience
export type { IFlog as IFlog }
export { IFlogStatus as IFlogStatus }

const {
    saveFlogEntries: saveFlogEntries_dropbox,
    addFlog: addFlog_dropbox,
    availableFlogs: availableFlogs_dropbox
} = useDropboxFlogs();


// Using module-scoped state can cause problems with SSR. See 
// https://vuejs.org/guide/scaling-up/state-management#simple-state-management-with-reactivity-api
const openFlogs = ref<IFlog[]>([])

watch(availableFlogs_dropbox, () => {
    // if availableFlogs changes, filter out any openFlogs 
    // that are no longer in availableFlogs
    if (openFlogs.value.length > 0) {
        const newOpenFlogs = openFlogs.value.filter(flog => {
            return availableFlogs_dropbox.value.reduce((p, c) => {
                return p || ((c.sourceType == flog.sourceType) && (c.url == flog.url))
            }, false);
        });
        openFlogs.value = newOpenFlogs;
    }
})

export const useFlogs = () => {

    const openFlog = (newFlog: IFlog,) => {
        if (!openFlogs.value.includes(newFlog)) {
            openFlogs.value.unshift(newFlog)
        }
    }


    const closeFlog = (flog: IFlog) => {
        if (openFlogs.value.includes(flog)) {
            openFlogs.value = openFlogs.value.filter(flogItem => flog != flogItem)
        }
    }

    const addEntryToFlog = (entry: IEntry, flog: IFlog) => {
        flog.loadedEntries.unshift(entry)
    }

    const updatePretext = (pretext: string, flog: IFlog) => {
        flog.pretext = pretext
    }

    const deleteEntryFromFlog = (flog: IFlog, entry: IEntry) => {
        if (!flog || !Array.isArray(flog.loadedEntries)) {
            console.error('Flog or flog.loadedEntries is undefined or not an array');
            return;
        }
        // Find the index of the entry to delete
        const deleteEntryIndex = flog.loadedEntries.findIndex(flogEntry => flogEntry.id === entry.id);
        if (deleteEntryIndex !== -1) {
            // Remove the entry
            flog.loadedEntries.splice(deleteEntryIndex, 1);

            // Save the updated flog to the source to persist the changes
            saveFlogToSource(flog);
        } else {
            console.error('Entry not found in flog.loadedEntries');
        }
    };

    const editEntryFromFlog = (flog: IFlog, entry: IEntry) => {
        if (!flog || !Array.isArray(flog.loadedEntries)) {
            console.error(`Flog or flog.loadedEntries is undefined or not an array: ${flog}`);
            return;
        }
        // Find the index of the entry to delete
        const editEntryIndex = flog.loadedEntries.findIndex(flogEntry => flogEntry.id === entry.id);
        if (editEntryIndex !== -1) {
            // Update the entry at the found index
            flog.loadedEntries[editEntryIndex] = { ...flog.loadedEntries[editEntryIndex], ...entry };
            // Save the updated flog to the source to persist the changes
            saveFlogToSource(flog);
        } else {
            console.error('Entry not found in flog.loadedEntries');
        }
    }

    const saveFlogToSource = (flog: IFlog) => {
        switch (flog.sourceType) {
            case 'dropbox':
                saveFlogEntries_dropbox(flog as IDropboxFlog)
                break;
            default:
        }
    }

    const addFlogToSource = (flog: IFlog) => {
        switch (flog.sourceType) {
            case 'dropbox':
                addFlog_dropbox(flog as IDropboxFlog)
                break;
            default:
        }
    }

    return {
        openFlogs,
        openFlog,
        closeFlog,
        addEntryToFlog,
        updatePretext,
        saveFlogToSource,
        deleteEntryFromFlog,
        editEntryFromFlog,
        addFlogToSource
    }
}
