import { ref } from "vue"
import { IFlog } from "@/modules/Flog"
import { IEntry } from '@/modules/EntryData'
import { useDropboxFlogs, IDropboxFlog } from "@/composables/useDropboxFlogs";
import { useLocalFileFlogs, IFileFlog } from "@/composables/useLocalFileFlogs";

const {
    saveFlogEntries: saveFlogEntries_dropbox,
} = useDropboxFlogs();

const {
    saveFlogEntries: saveFlogEntries_localFiles,
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

    return {
        openFlogs,
        openFlog,
        closeFlog,
        addEntryToFlog,
        saveFlogToSource
    }
}
