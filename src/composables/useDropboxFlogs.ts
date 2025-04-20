import { ref, Ref, watch } from "vue"
import type { IFlog } from "@/modules/Flog"
import { IFlogStatus, IFlogSourceType, deserializeFlog, serializeFlog } from "@/modules/Flog"
import { useDropboxFiles } from "@/composables/useDropboxFiles"
import { IDropboxFile } from "@/composables/useDropboxFiles";

// Re-export these for convenience
export type { IFlog as IFlog }
export { IFlogStatus as IFlogStatus };
export interface IDropboxFlog extends IFlog {
    rev?: string;
}

export interface IDropboxFlogs {
    // pass through from useDropboxFiles
    launchConnectFlow: () => void;
    // pass through from useDropboxFiles
    // eslint-disable-next-line
    connectionPopupWindow: Ref<any>;
    openDbxPopup: () => void;
    // pass through from useDropboxFiles
    hasConnection: Ref<boolean>;
    // pass through from useDropboxFiles
    clearConnection: () => void;
    // map availableFiles from from useDropboxFiles to flogs
    availableFlogs: Ref<IDropboxFlog[]>;
    // map availableRepoFiles from from useDropboxFiles to flogs
    availableRepoFlogs: Ref<IDropboxFlog[]>;
    // makes use of loadFileContent from useDropboxFiles
    loadFlogEntries: (flog: IDropboxFlog) => void;
    // makes use of ... from useDropboxFiles
    saveFlogEntries: (flog: IDropboxFlog) => void;
    addFlog: (flog: IDropboxFlog) => void;
    deleteFlog: (flog: IDropboxFlog) => void;
    accountOwner: Ref<string | null>;
}

// Using a list of repoFiles (paths and contents using interface IDropboxFile) 
// as default files to save to a user's Dropbox app folder.
const repoFiles = ref<IDropboxFile[]>([]);

// In clientside code, we must get the list of paths from the env vars, 
// but then do clientside fetches to get file contents. 
// The files must be in the public static folder, or serviced via an application route.

// Get the list of paths from the import.meta env vars
// @ts-expect-error - Unsure why glob isn't in the type definition for import.meta 
const repoFilesGlob = import.meta.glob("../../public/repo_template/**/*"); // maybe should use "../../public/repo_template/**/*.flogger.txt"
// 
// Git repo files are at            
//             [Git repo root]/public/repo_template/**/*
// And so import.meta.glob returns paths relative to this file that look like this...     
//             ../../public/repo_template/**/*
//                                        ^^^^
// 
// Dropbox files are saved at       
//             [User's Dropbox app folder]/**/*
//                                         ^^^^
// 
// So we remove the '../../public/repo_template/' part to get the list of files with Dropbox paths
//                   ---------------------------
// 
// But the frontend gets the files from the static URLs at...
//             [URL domain]/repo_template/**/*
//                                        ^^^^
// 
// So when the frontend does fetch calls, it will add the '/repo_template/' part back.
// 
for (const propName in repoFilesGlob) {
    if (Object.prototype.hasOwnProperty.call(repoFilesGlob, propName)) {
        const globPathValue = propName
        repoFiles.value.push(
            { path: globPathValue.replace("../../public/repo_template/", "") } //IDropboxFlog
        );
    }
}
// console.log("repoFiles.value", repoFiles.value);

// Clientside fetches to get file contents for each path
const repoFilesWithContents: IDropboxFile[] = []
repoFiles.value.forEach(async repoFile => {
    // console.log(repoFile.path)

    // As mentioned before...
    // ...when the frontend does fetch calls, it will add the '/repo_template/' part back.
    await fetch(`/repo_template/${repoFile.path}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text(); // Assuming the server returns JSON
        })
        .then(data => {
            // console.log('data', data)
            // folderContents.value.push(data);
            repoFilesWithContents.push({
                path: repoFile.path,
                content: data
            })
        })
        .catch(error => {
            console.error('Error loading folder contents:', error);
        });
})
repoFiles.value = repoFilesWithContents
// console.log('repoFiles.value', repoFiles.value)

const {
    launchConnectFlow,
    connectionPopupWindow,
    openDbxPopup,
    hasConnection,
    clearConnection: clearFileConnection,
    availableFiles,
    availableRepoFiles,
    loadFileContent,
    saveFileContent,
    addFile,
    deleteFile,
    accountOwner
} = useDropboxFiles(repoFiles.value)

// Defining all ref variables at the module scope 
// (meaning at the root of this module file, 
// outside of the useComposable function that gets called by the importer),
// Creating ref variables at module scope makes them singletons shared by all composable importers.
// Otherwise, each composable importer gets its own instances of each ref variable.
// See https://vuejs.org/guide/scaling-up/state-management#simple-state-management-with-reactivity-api
// Using module-scoped state requires special handling with SSR, if we ever want SSR.
// See https://vuejs.org/guide/scaling-up/state-management#simple-state-management-with-reactivity-api
const availableFlogs = ref([]);
const availableRepoFlogs = ref([]);

// Ref variables that are passed through from a specific use[SourceFilesSDK] composable
// need watchers on source variables
watch(
    availableFiles,
    // // Rather than merging the old and new values with this...
    // (newValue, oldValue) => {
    //     const removed = !oldValue ? [] : oldValue
    //         .filter((file) => newValue && !newValue.includes(file))
    //         .map<IDropboxFlog>((file) => ({ sourceType: IFlogSourceType.dropbox, url: file.path } as IDropboxFlog))
    //     const added = !newValue ? [] : newValue
    //         .filter((file) => oldValue && !oldValue.includes(file))
    //         .map<IDropboxFlog>((file) => ({ sourceType: IFlogSourceType.dropbox, url: file.path } as IDropboxFlog))
    //     const comparableAvailableFlogs = availableFlogs.value.map((flog) => ({ sourceType: flog.sourceType, url: flog.url } as IDropboxFlog))
    //     availableFlogs.value = comparableAvailableFlogs
    //         .filter((flog, i) => {
    //             const match = removed.filter((removedFlog) => removedFlog.sourceType == flog.sourceType && removedFlog.url == flog.url).length > 0
    //             return !match
    //         })
    //         .concat(added)
    // }
    // // We will just recreate availableFlogs with this...
    () => {
        availableFlogs.value = availableFiles.value.map<IDropboxFlog>(
            (file) => ({
                sourceType: IFlogSourceType.dropbox,
                url: file.path,
                modified: new Date(file.modified),
                rev: null,
                loadedEntries: null
            } as IDropboxFlog)
        )
    }
    ,
    { immediate: true }
)
watch(
    availableRepoFiles,
    () => {
        availableRepoFlogs.value = availableRepoFiles.value.map<IDropboxFlog>(
            (file) => ({ sourceType: IFlogSourceType.dropbox, url: file.path, readOnly: file.readOnly } as IDropboxFlog)
        )
    }
    ,
    { immediate: true }
)

export const useDropboxFlogs = (): IDropboxFlogs => {

    const loadFlogEntries = (flog: IDropboxFlog) => {
        // console.log('loadFlogEntries flog', flog)
        loadFileContent(
            { path: flog.url },
            (result) => {
                flog.rawContent = result.content
                flog.rev = result.rev;
                const { pretext, loadedEntries, status } = deserializeFlog(result.content)
                flog.status = status
                if (status != IFlogStatus.error) {
                    flog.pretext = pretext
                    const timestamp = Date.now()
                    flog.loadedEntries = loadedEntries.map((entry, index) => ({ ...entry, id: timestamp + '_' + index }))
                }
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
                content: serializeFlog(flog.loadedEntries, flog.pretext)
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
                content: serializeFlog(flog.loadedEntries)
            } as IDropboxFile,
            // () => { } // can parameterize so calling app gets notice once save is complete 
        )
    }

    const deleteFlog = (flog: IDropboxFlog) => {
        // console.log('addFlog flog', flog)
        deleteFile(
            {
                path: flog.url,
                rev: flog.rev
            } as IDropboxFile,
            // () => { } // can parameterize so calling app gets notice once delete is complete 
        )
    }

    const clearConnection = () => {
        clearFileConnection()
        availableFlogs.value = []
        availableRepoFlogs.value = []
    }

    return {
        launchConnectFlow,
        connectionPopupWindow,
        openDbxPopup,
        hasConnection,
        clearConnection,
        availableFlogs,
        availableRepoFlogs,
        loadFlogEntries,
        saveFlogEntries,
        addFlog,
        deleteFlog,
        accountOwner: accountOwner
    }
}
