import { ref, watch } from "vue"
import type { Ref } from "vue"
import type { IFlog } from "@/modules/Flog"
import { IFlogStatus, IFlogSourceType, deserializeFlog, serializeFlog } from "@/modules/Flog"
import { useDropboxFiles } from "@/composables/useDropboxFiles"
import type { IDropboxFile, ILoadFileContentCallbackSuccess, ILoadFileContentCallbackError } from "@/composables/useDropboxFiles";
import { useTags, type ITagsComposable, type TagMap } from "./useTags"
import type { TagIndex, Tag } from "@/modules/Tag"
import type { IEntry } from "@/modules/EntryData"

// Re-export these for convenience
export type { IFlog as IFlog }
export { IFlogStatus as IFlogStatus }; //enum, not a type
export type { ITagsComposable as ITagsComposable }
export type { TagIndex as TagIndex }
export type { TagMap as TagMap }
export type { Tag as Tag }
export interface IDropboxFlog extends IFlog {
    rev?: string;
}

export interface IDropboxFlogs {
    // pass through from useDropboxFiles
    launchConnectFlow: (targetWindow: Window) => void;
    // pass through from useDropboxFiles
    // eslint-disable-next-line
    connectionPopupWindow: Ref<any>;
    openDbxPopup: (targetWindow: Window) => void;
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
    // makes use of ... from useDropboxFiles
    addFlog: (flog: IDropboxFlog) => void;
    // makes use of ... from useDropboxFiles
    deleteFlog: (flog: IDropboxFlog) => void;
    // pass through from useDropboxFiles
    accountOwner: Ref<string | null>;
    // manages the tags index for all flogs in the user's dropbox source
    tagIndex: Ref<TagIndex | undefined>;
    getFlogTags: ITagsComposable['getFlogTags']
}

/*
 * Module-scoped: 
 * Some of the composable ref vars are managed at the module level, 
 * and therefore shared across all instances where useDropboxFlogs is used.
 *  - REPO FILES (providing)
 *  - TAGS INDEX (using useTags)
 *  - useDropboxFiles (and the parts of its interface that are returned by useDropboxFlogs )
 *  - AVAILABLE FLOGS
 */

/*
 * Module-scoped: REPO FILES
 */

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

/*
 * Module-scoped: useDropboxFiles 
 * (and the parts of its interface that are returned by useDropboxFlogs )
 * 
 * Some of these are passed through, meaning they are returned directly by useDropboxFlogs:
 *  - launchConnectFlow
 *  - connectionPopupWindow
 *  - openDbxPopup
 *  - hasConnection
 * The rest are used within useDropboxFlogs-specific methods
*/

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

/*
 * Module-scoped: TAGS INDEX
 */

const tagIndexFileName = "flogger.tag-index.json"
const tagIndexFilePath = "/" + tagIndexFileName
const { tagIndex: tagIndex_useTags, setTagsIndex, getFlogTags } = useTags({ file: tagIndexFilePath, rev: undefined })

const tagIndex = ref(tagIndex_useTags)
watch(
    tagIndex_useTags,
    () => {
        // console.log("TAGS watch tagIndex_useTags")
        tagIndex.value = tagIndex_useTags.value
    }
    ,
    { immediate: true }
)

watch(
    hasConnection,
    () => {
        if (hasConnection.value) {
            // First try to load the file from Dropbox
            loadFileContent(
                { path: tagIndexFilePath },
                handleTagIndexFileLoad
            )
        }
    },
    { immediate: true })

function handleTagIndexFileLoad(result: ILoadFileContentCallbackSuccess | ILoadFileContentCallbackError) {
    // console.log("TAGS loadFileContent callback", result)
    const { rev, content, error } = result
    if (error) {
        if (error == "file not found") {
            // If loading content fails because the file doesn't exist, create the file
            addFile({ path: tagIndexFileName, content: JSON.stringify([]) }, (result) => {
                // Once the file is created, set the index in useTags
                // console.log("TAGS addFile callback", result)
                setTagsIndex({
                    file: tagIndexFilePath,
                    rev: result.rev,
                    tagMap: [],
                })
            })
        }
        else {
            // Otherwise report the error
            console.log("TAGS Error creating tag index file for DropboxFlogs:", error)
        }
    } else {
        // If loaded, set the index for useTags
        let parsedTags = [];
        try {
            parsedTags = JSON.parse(content || '')
        } catch (error) {
            console.log("TAGS Error parsing tag index:", error)
        }
        setTagsIndex({
            file: tagIndexFilePath,
            rev,
            tagMap: [...parsedTags],
        })
        // console.log("TAGS tagIndex", { ...unref(ref(tagIndex)), setTagsIndex: undefined })
    }
}

/*
 * Module-scoped: AVAILABLE FLOGS
 */

// Defining all ref variables at the module scope 
// (meaning at the root of this module file, 
// outside of the useComposable function that gets called by the importer),
// Creating ref variables at module scope makes them singletons shared by all composable importers.
// Otherwise, each composable importer gets its own instances of each ref variable.
// See https://vuejs.org/guide/scaling-up/state-management#simple-state-management-with-reactivity-api
// Using module-scoped state requires special handling with SSR, if we ever want SSR.
// See https://vuejs.org/guide/scaling-up/state-management#simple-state-management-with-reactivity-api
const availableFlogs = ref<IDropboxFlog[]>([]);
const availableRepoFlogs = ref<IDropboxFlog[]>([]);

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
                modified: file.modified ? new Date(file.modified) : new Date(),
                rev: undefined,
                loadedEntries: []
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
                const { rev, content } = result
                flog.rawContent = content
                flog.rev = rev;
                const { pretext, loadedEntries, status } = deserializeFlog(content || '')
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
        // First save the flog file
        saveFileContent(
            {
                path: flog.url,
                rev: flog.rev,
                content: serializeFlog(flog.loadedEntries, flog.pretext)
            } as IDropboxFile,
            (result) => {
                // Update the flog with the new rev
                flog.rev = result.rev;

                // Second, parse tags in flog and save to tagIndex

                // // Parse content of entries for tags
                function parseTagsFromEntry(entry: IEntry): string[] {
                    const headings: string[] = entry.entry.match(/(?<=^# ).*$/gm) ?? [];
                    const headingsTags = headings.map(h => parseTagsFromString(h));
                    const tags = [...new Set<string>(headingsTags.flat())]
                    return tags
                }
                function parseTagsFromString(value: string): string[] {
                    return value.split(' ')
                }

                // Grab current tagMap
                const tagMap: Map<Tag['tag'], Tag['flogs']> 
                    = new Map([...(tagIndex.value?.tagMap || [])]);
                // Build tagMap for current flog
                const thisFlogTagMap: Map<Tag['tag'], Tag['flogs']> 
                    = new Map()
                flog.loadedEntries.forEach(entry => {
                    const entryTags = parseTagsFromEntry(entry)
                    entryTags.forEach(tag => {
                        // Need to get tag-flog-entries already added in previous iterations
                        // First get the tag-flogs
                        const existingTagFlogs = new Map(thisFlogTagMap.get(tag))
                        // Then get the tag-flog-entries
                        const existingTagFlogEntries = existingTagFlogs.get(flog.url) || [];
                        // Merge this entry into tag-flog-entries and de-dupe
                        const mergedTagFlogEntries = [...new Set([...existingTagFlogEntries, entry.date])];
                        // Save merged tag-flog-entries
                        thisFlogTagMap.set(tag, [[flog.url, mergedTagFlogEntries]])
                        // Since we're building a tagMap for this flog, each tag in the map
                        // will only ever have one flog entry, 
                        // which will have 1+ tag-flog-entries
                    })
                })
                // Merge thisFlogTagMap with tagIndex tagMap
                const mergedTagMap = new Map<Tag['tag'], Tag['flogs']>()
                const allTags = [...new Set([...tagMap.keys(), ...thisFlogTagMap.keys()])]
                allTags.forEach(tag => {
                    const existingTagFlogs = new Map(tagMap.get(tag))
                    const thisFlogTagFlogs = new Map(thisFlogTagMap.get(tag))
                    const thisFlogTagFlog = thisFlogTagFlogs.get(flog.url)
                    if (existingTagFlogs && thisFlogTagFlog) {
                        // update
                        const mergedTagFlogs = new Map(existingTagFlogs)
                        mergedTagFlogs.set(flog.url, thisFlogTagFlog)
                        mergedTagMap.set(tag, [...mergedTagFlogs] as Tag['flogs'])
                    } else if (existingTagFlogs && !thisFlogTagFlog) {
                        // remove
                        const mergedTagFlogs = new Map(existingTagFlogs)
                        mergedTagFlogs.delete(flog.url)
                        if (mergedTagFlogs.size == 0)
                            // remove tag if this flog was the only one using it
                            mergedTagMap.delete(tag)
                        else
                            mergedTagMap.set(tag, [...mergedTagFlogs] as Tag['flogs'])
                    } else if (!existingTagFlogs && thisFlogTagFlog) {
                        // add
                        mergedTagMap.set(tag, [...thisFlogTagFlogs] as Tag['flogs'])
                    }
                })
                console.log("TAGS mergedTagMap", [...mergedTagMap])

                // Update and save tagIndex
                if (tagIndex.value?.file && tagIndex?.value.rev) {
                    saveFileContent(
                        {
                            path: tagIndex.value.file,
                            rev: tagIndex.value.rev,
                            // content: JSON.stringify(tagIndex.value.tags)
                            content: JSON.stringify([...mergedTagMap], null, "\t")
                        },
                        (result) => {
                            // Then update tagIndex with new rev
                            setTagsIndex({
                                ...(tagIndex.value as TagIndex),
                                tagMap: [...mergedTagMap] as TagMap,
                                rev: result.rev,
                            })
                        } // can parameterize so calling app gets notice once save is complete 
                    )
                }

            } // can parameterize so calling app gets notice once save is complete 
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
        accountOwner: accountOwner,
        tagIndex,
        getFlogTags,
    }
}
