import { ref, Ref, watch, onUpdated, onActivated } from "vue"
import { IFlog, deserializeEntries, serializeEntries } from "@/modules/Flog"
import { useDropboxFiles } from "@/composables/useDropboxFiles"
import { IDropboxFile } from "@/composables/useDropboxFiles";


export interface IDropboxFlog extends IFlog {
    rev: string;
}

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
    // makes use of ... from useDropboxFiles
    saveFlogEntries: (flog: IDropboxFlog) => void;
    addFlog: (flog: IDropboxFlog) => void;
}

const {
    launchConnectFlow,
    hasConnection,
    clearConnection: clearFileConnection,
    availableFiles,
    loadFileContent,
    saveFileContent,
    addFile
} = useDropboxFiles()

export const useDropboxFlogs = (): IDropboxFlogs => {

    const availableFlogs = ref([]);

    watch(
        availableFiles,
        (newValue, oldValue) => {
            console.log('watch availableFiles (useDropboxFlogs)', availableFlogs.value, availableFiles, newValue, oldValue)
            // // Rather than merging the old and new values with this...
            // const removed = !oldValue ? [] : oldValue
            //     .filter((file) => newValue && !newValue.includes(file))
            //     .map<IDropboxFlog>((file) => ({ sourceType: 'dropbox', url: file.path } as IDropboxFlog))
            // const added = !newValue ? [] : newValue
            //     .filter((file) => oldValue && !oldValue.includes(file))
            //     .map<IDropboxFlog>((file) => ({ sourceType: 'dropbox', url: file.path } as IDropboxFlog))
            // // console.log('watching newValue', removed, added, availableFlogs)
            // const comparableAvailableFlogs = availableFlogs.value.map((flog) => ({ sourceType: flog.sourceType, url: flog.url } as IDropboxFlog))
            // availableFlogs.value = comparableAvailableFlogs
            //     .filter((flog, i) => {
            //         const match = removed.filter((removedFlog) => removedFlog.sourceType == flog.sourceType && removedFlog.url == flog.url).length > 0
            //         return !match
            //     })
            //     .concat(added)
            // // We will just recreate availableFlogs with this...
            availableFlogs.value = availableFiles.value.map<IDropboxFlog>(
                (file) => ({ sourceType: 'dropbox', url: file.path } as IDropboxFlog)
            )
            }
        ,
        { immediate: true }
    )

    const loadFlogEntries = (flog: IDropboxFlog) => {
        // console.log('loadFlogEntries flog', flog)
        loadFileContent(
            { path: flog.url },
            (result) => {
                flog.loadedEntries = deserializeEntries(result.content)
                flog.rev = result.rev;
            }
        )
    }

    const saveFlogEntries = (flog: IDropboxFlog) => {
        // console.log('saveFlogEntries flog', flog)
        saveFileContent(
            {
                path: flog.url,
                // rev is required, but I'm not 100% sure of usage. 
                // Might be required like this to ensure writing new version of current version. 
                // Or, it might allow specing a new rev to version rather than overwrite.
                rev: flog.rev,
                content: serializeEntries(flog.loadedEntries)
            } as IDropboxFile,
            (result) => { flog.rev = result.rev } // can parameterize so calling app gets notice once save is complete 
        )
    }

    const addFlog = (flog: IDropboxFlog) => {
        // console.log('addFlog flog', flog)
        addFile(
            {
                path: flog.url,
                // Is rev needed for mode add?
                // rev: flog.rev, 
                content: serializeEntries(flog.loadedEntries)
            } as IDropboxFile,
            () => { } // can parameterize so calling app gets notice once save is complete 
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
        saveFlogEntries,
        addFlog,
    }
}
