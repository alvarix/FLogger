import { ref } from "vue"
import { IFlog } from "@/modules/Flog"
import { IEntry } from '@/modules/EntryData'
import { useDropboxFlogs } from "@/composables/useDropboxFlogs";
// import { useLocalFileFlogs } from "@/composables/useLocalFileFlogs";

const {
    saveFlogEntries,
} = useDropboxFlogs();

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
            openFlogs.value.push(newFlog)
        }
    }

    const closeFlog = (flog: IFlog) => {
        if (openFlogs.value.includes(flog)) {
            openFlogs.value = openFlogs.value.filter(flogItem => flog != flogItem)
        }
    }

    const addEntryToFlog = (entry: IEntry, flog: IFlog) => {
        const sourceType = flog.url.split(':')[0];
        switch (sourceType) {
            case 'local file':
                break;
            case 'dropbox':
                break;
            default:
        }
    }

    const saveFlogToSource = (flog: IFlog) => {
        const sourceType = flog.url.split(':')[0];
        console.log('saveFlogToSource, sourceType = ', sourceType)
        switch (sourceType) {
            case 'local file':
                break;
            case 'dropbox':
                saveFlogEntries(flog)
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
