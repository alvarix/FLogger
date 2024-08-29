import { ref, Ref, watch } from "vue"
import { IFlog, deserializeEntries } from "@/modules/Flog"
import { useDropboxFiles } from "@/composables/useDropboxFiles"

export interface IDropboxFlog extends IFlog {}

export interface IDropboxFlogs {
    // pass through from useDropboxFiles
    launchConnectFlow: () => void; 
    // pass through from useDropboxFiles
    hasConnection: Ref<boolean>; 
    // pass through from useDropboxFiles
    clearConnection: () => void; 
    // map availableFiles from from useDropboxFiles to flogs
    availableFlogs: Ref<IDropboxFlog[]>; 
    // makes use of loadFileContent from useDropboxFiles
    loadFlogEntries: (flog: IDropboxFlog) => void; 
}

const {
    launchConnectFlow,
    hasConnection,
    clearConnection: clearFileConnection,
    availableFiles,
    loadFileContent,
} = useDropboxFiles()

const filePathToFlogUrl = (path: string): string => {
    return 'dropbox: ' + path
}

const flogUrlToFilePath = (url: string): string => {
    return url.replace(/^dropbox: /, '')
}

export const useDropboxFlogs = (): IDropboxFlogs => {

    const availableFlogs = ref([]);

    watch(
        availableFiles,
        (availableFiles, oldValue) => {
            const removed = !oldValue ? [] : oldValue
                .filter((file) => availableFiles && !availableFiles.includes(file))
                .map<IDropboxFlog>((file) => ({ url: filePathToFlogUrl(file.path) } as IDropboxFlog))
            const added = !availableFiles ? [] : availableFiles
                .filter((file) => oldValue && !oldValue.includes(file))
                .map<IDropboxFlog>((file) => ({ url: filePathToFlogUrl(file.path) } as IDropboxFlog))
            availableFlogs.value = availableFlogs.value
                .filter((flog) => !removed.includes(flog))
                .concat(added)
        },
        { immediate: true }
    )

    const loadFlogEntries = (flog: IDropboxFlog) => {
        console.log('loadFlogEntries flog', flog)
        loadFileContent(
            { path: flogUrlToFilePath(flog.url) },
            (content) => { flog.loadedEntries = deserializeEntries(content) }
        )
    }

    const clearConnection = () => {
        clearFileConnection()
        availableFlogs.value = []
    }

    return {
        launchConnectFlow,
        hasConnection,
        clearConnection,
        availableFlogs,
        loadFlogEntries,
    }
}
