import { ref } from "vue"
import { IFlog } from "@/modules/Flog"
import { IEntry } from '@/modules/EntryData'
import { useDropboxFlogs, IDropboxFlog } from "@/composables/useDropboxFlogs";
import { useLocalFileFlogs, IFileFlog } from "@/composables/useLocalFileFlogs";

const {
    saveFlogEntries: saveFlogEntries_dropbox,
    addFlog: addFlog_dropbox
} = useDropboxFlogs();

const {
    saveFlogEntries: saveFlogEntries_localFiles,
    addFlog: addFlog_localFiles
} = useLocalFileFlogs(()=>{});

//   const { selectedFileFlog, launchOpenFileFlow, launchRequestPermissionsFlow } = useLocalFileFlogs();

// Using module-scoped state can cause problems with SSR. See 
// https://vuejs.org/guide/scaling-up/state-management#simple-state-management-with-reactivity-api
const openFlogs = ref<IFlog[]>([])

export const useFlogs = () => {

    const openFlog = (
        newFlog: IFlog,
    ) => {
        if (!openFlogs.value.includes(newFlog)) {
            const temp = openFlogs.value
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

    const saveFlogToSource = (flog: IFlog) => {
        const sourceType = flog.url.split(':')[0];
        switch (sourceType) {
            case 'local file':
                saveFlogEntries_localFiles(flog as IFileFlog)
                break;
            case 'dropbox':
                saveFlogEntries_dropbox(flog as IDropboxFlog)
                break;
            default:
        }
    }

    const addFlogToSource = (flog: IFlog) => {
        const sourceType = flog.url.split(':')[0];
        switch (sourceType) {
            case 'local file':
                addFlog_localFiles(flog as IFileFlog)
                break;
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
        saveFlogToSource,
        deleteEntryFromFlog,
        addFlogToSource
    }
}
